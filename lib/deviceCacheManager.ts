import { Device } from "./db/schema";
import { getRedisClient } from "./redis";

interface CacheDevice {
  device: Partial<Device>;
  lastSeen: Date;
  status: 'online' | 'offline';
}

const memoryCache = new Map<string, CacheDevice>();

const DEVICE_KEY_PREFIX = 'device:';
const ORG_DEVICES_KEY = 'org:devices:';
const DEVICE_TTL = 3600; // 1 hour

export class DeviceCacheManager {
  private static useRedis = true;

  private static async getClient() {
    if (!this.useRedis) return null;

    try {
      return await getRedisClient();
    } catch (error) {
      console.warn('Redis unavailable, using memory cache:', error);
      this.useRedis = false;
      return null;
    }
  }

  // Build Redis keys
  private static deviceKey(macAddress: string): string {
    return `${DEVICE_KEY_PREFIX}${macAddress}`;
  }

  private static orgDevicesKey(organizationId: string): string {
    return `${ORG_DEVICES_KEY}${organizationId}`;
  }

  // Emit socket update for device changes
  private static emitDeviceUpdate(macAddress: string, deviceData: CacheDevice) {
    if (typeof window !== 'undefined') return; // Only emit on server
    
    try {
      // Dynamically import to avoid circular dependencies
      const { emitDeviceUpdate } = require('./socketUtils');
      
      if (deviceData.device.organizationId) {
        emitDeviceUpdate('deviceUpdated', {
          deviceId: macAddress,
          name: deviceData.device.name || '',
          type: deviceData.device.type || '',
          status: deviceData.device.status || '',
          location: deviceData.device.location,
          ipAddress: deviceData.device.ipAddress,
          macAddress: macAddress,
          serialNumber: deviceData.device.serialNumber,
          firmwareVersion: deviceData.device.firmwareVersion,
          lastActive: deviceData.device.lastActive || new Date(),
          organizationId: deviceData.device.organizationId,
          lastSeen: deviceData.lastSeen,
          connectionStatus: deviceData.status,
          dbId: deviceData.device.id,
        }, deviceData.device.organizationId);
      }
    } catch (error) {
      console.warn('Failed to emit socket update:', error);
    }
  }

  // Add or update a device
  static async set(macAddress: string, deviceData: CacheDevice): Promise<void> {
    const redis = await this.getClient();

    if (redis) {
      try {
        // Store device data as JSON
        const key = this.deviceKey(macAddress);
        await redis.setEx(
          key,
          DEVICE_TTL,
          JSON.stringify({
            ...deviceData,
            lastSeen: deviceData.lastSeen.toISOString(),
          })
        );

        // Add to organization set
        if (deviceData.device.organizationId) {
          const orgKey = this.orgDevicesKey(deviceData.device.organizationId);
          await redis.sAdd(orgKey, macAddress);
          await redis.expire(orgKey, DEVICE_TTL);
        }

        // Emit socket update after successful cache update
        this.emitDeviceUpdate(macAddress, deviceData);
        return;
      } catch (error) {
        console.error('Redis set error:', error);
        this.useRedis = false;
      }
    }

    // Fallback to memory
    memoryCache.set(macAddress, deviceData);
    
    // Emit socket update for memory cache as well
    this.emitDeviceUpdate(macAddress, deviceData);
  }

  // Get a single device
  static async get(macAddress: string): Promise<CacheDevice | undefined> {
    const redis = await this.getClient();

    if (redis) {
      try {
        const key = this.deviceKey(macAddress);
        const data = await redis.get(key);

        if (data) {
          const parsed = JSON.parse(data);
          return {
            ...parsed,
            lastSeen: new Date(parsed.lastSeen),
          };
        }
        return undefined;
      } catch (error) {
        console.error('Redis get error:', error);
        this.useRedis = false;
      }
    }

    return memoryCache.get(macAddress);
  }

  static async getAll(organizationId?: string): Promise<Map<string, CacheDevice>> {
    const redis = await this.getClient();

    if (redis) {
      try {
        if (organizationId) {
          const orgKey = this.orgDevicesKey(organizationId);
          const macAddresses = await redis.sMembers(orgKey);

          const devices = new Map<string, CacheDevice>();

          for (const mac of macAddresses) {
            const device = await this.get(mac);
            if (device) {
              devices.set(mac, device);
            }
          }

          return devices;
        } else {
          const keys: string[] = [];
          let cursor = 0;

          do {
            const result = await redis.scan(cursor.toString(), {
              MATCH: `${DEVICE_KEY_PREFIX}*`,
              COUNT: 100,
            });
            cursor = parseInt(result.cursor);
            keys.push(...result.keys);
          } while (cursor !== 0);

          const devices = new Map<string, CacheDevice>();

          for (const key of keys) {
            const mac = key.replace(DEVICE_KEY_PREFIX, '');
            const device = await this.get(mac);
            if (device) {
              devices.set(mac, device);
            }
          }

          return devices;
        }
      } catch (error) {
        console.error('Redis getAll error:', error);
        this.useRedis = false;
      }
    }

    // Fallback to memory
    if (!organizationId) {
      return new Map(memoryCache);
    }

    const filtered = new Map<string, CacheDevice>();
    for (const [key, device] of memoryCache.entries()) {
      if (device.device.organizationId === organizationId) {
        filtered.set(key, device);
      }
    }
    return filtered;
  }

  // Remove a device
  static async remove(macAddress: string): Promise<boolean> {
    const redis = await this.getClient();

    if (redis) {
      try {
        const device = await this.get(macAddress);
        const key = this.deviceKey(macAddress);
        const deleted = await redis.del(key);

        // Remove from organization set
        if (device?.device.organizationId) {
          const orgKey = this.orgDevicesKey(device.device.organizationId);
          await redis.sRem(orgKey, macAddress);
        }

        return deleted > 0;
      } catch (error) {
        console.error('Redis remove error:', error);
        this.useRedis = false;
      }
    }

    // Fallback to memory
    return memoryCache.delete(macAddress);
  }

  // Clear all devices
  static async clear(): Promise<void> {
    const redis = await this.getClient();

    if (redis) {
      try {
        // Clear all device keys
        const keys: string[] = [];
        let cursor = 0;

        do {
          const result = await redis.scan(cursor.toString(), {
            MATCH: `${DEVICE_KEY_PREFIX}*`,
            COUNT: 100,
          });
          cursor = parseInt(result.cursor);
          keys.push(...result.keys);
        } while (cursor !== 0);

        if (keys.length > 0) {
          await redis.del(keys);
        }

        // Clear all org keys
        const orgKeys: string[] = [];
        cursor = 0;

        do {
          const result = await redis.scan(cursor.toString(), {
            MATCH: `${ORG_DEVICES_KEY}*`,
            COUNT: 100,
          });
          cursor = parseInt(result.cursor);
          orgKeys.push(...result.keys);
        } while (cursor !== 0);

        if (orgKeys.length > 0) {
          await redis.del(orgKeys);
        }

        return;
      } catch (error) {
        console.error('Redis clear error:', error);
        this.useRedis = false;
      }
    }

    // Fallback to memory
    memoryCache.clear();
  }

  // Get stats for an organization
  static async getStats(organizationId?: string): Promise<{
    total: number;
    online: number;
    offline: number;
    linkedToDb: number;
    cacheOnly: number;
  }> {
    const devices = Array.from((await this.getAll(organizationId)).values());

    return {
      total: devices.length,
      online: devices.filter(d => d.status === 'online').length,
      offline: devices.filter(d => d.status === 'offline').length,
      linkedToDb: devices.filter(d => d.device.id).length,
      cacheOnly: devices.filter(d => !d.device.id).length,
    };
  }

  // Mark device online/offline with socket emission
  static async markOnline(macAddress: string): Promise<boolean> {
    const device = await this.get(macAddress);
    if (device) {
      device.status = 'online';
      device.lastSeen = new Date();
      await this.set(macAddress, device); // This will emit the socket update
      return true;
    }
    return false;
  }

  static async markOffline(macAddress: string): Promise<boolean> {
    const device = await this.get(macAddress);
    if (device) {
      device.status = 'offline';
      await this.set(macAddress, device); // This will emit the socket update
      return true;
    }
    return false;
  }

  // Get cache backend info
  static async getCacheInfo() {
    const redis = await this.getClient();

    return {
      backend: redis ? 'redis' : 'memory',
      connected: !!redis,
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    };
  }
}
