import { Device } from "./db/schema";
import { emitDevicesUpdate } from "./socketUtils";
import { DeviceCacheSettingsManager } from "./deviceCacheSettings";
import Drizzle from "./db/db";
import { devices as devicesTable } from "@/drizzle/schema";

// Type definitions
interface CacheDevice {
  device: Partial<Device>;
  lastSeen: Date;
  status: 'online' | 'offline';
}

interface CacheStats {
  total: number;
  online: number;
  offline: number;
  linkedToDb: number;
  cacheOnly: number;
}

// In-memory cache for device status (use Redis in production)
export const deviceCache = new Map<string, CacheDevice>();

// Cleanup interval to mark devices as offline after inactivity
let offlineCheckInterval: NodeJS.Timeout | null = null;
let removeCheckInterval: NodeJS.Timeout | null = null;
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

function startOfflineCheck() {
  if (offlineCheckInterval) clearInterval(offlineCheckInterval);

  const settings = DeviceCacheSettingsManager.getSettings();
  offlineCheckInterval = setInterval(async () => {
    try {
      if (!isInitialized) return; // Skip if not initialized yet

      const now = new Date();
      const allDevicesMap = await DeviceCacheManager.getAllDevices();
      const changedOrgs = new Set<string>();

      for (const [macAddress, deviceData] of allDevicesMap.entries()) {
        const threshold = DeviceCacheSettingsManager.getSettings().offlineThresholdMs;
        if (now.getTime() - deviceData.lastSeen.getTime() > threshold && deviceData.status === 'online') {
          DeviceCacheManager.markOffline(macAddress);
          changedOrgs.add(deviceData.device.organizationId!);
        }
      }

      // Emit updates per organization
      for (const orgId of changedOrgs) {
        try {
          const deviceData = await DeviceCacheManager.getDevicesWithCache(orgId);
          if (deviceData) {
            emitDevicesUpdate('devicesUpdated', deviceData);
          }
        } catch (error) {
          console.warn(`Failed to emit device offline update for org ${orgId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in offline check interval:', error);
    }
  }, settings.checkIntervalMs);
}

function startRemoveCheck() {
  if (removeCheckInterval) clearInterval(removeCheckInterval);

  const settings = DeviceCacheSettingsManager.getSettings();
  removeCheckInterval = setInterval(async () => {
    try {
      if (!isInitialized) return; // Skip if not initialized yet

      const now = new Date();
      const allDevicesMap = await DeviceCacheManager.getAllDevices();
      const changedOrgs = new Set<string>();

      for (const [macAddress, deviceData] of allDevicesMap.entries()) {
        const threshold = DeviceCacheSettingsManager.getSettings().removeThresholdMs;
        const isInactive = now.getTime() - deviceData.lastSeen.getTime() > threshold;
        const isCacheOnly = !deviceData.device.id;

        // Only remove devices that are cache-only AND inactive
        if (isInactive && isCacheOnly) {
          DeviceCacheManager.removeDevice(macAddress);
          changedOrgs.add(deviceData.device.organizationId!);
        }
      }

      // Emit updates per organization
      for (const orgId of changedOrgs) {
        try {
          const deviceData = await DeviceCacheManager.getDevicesWithCache(orgId);
          if (deviceData) {
            emitDevicesUpdate('devicesUpdated', deviceData);
          }
        } catch (error) {
          console.warn(`Failed to emit device removal update for org ${orgId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in remove check interval:', error);
    }
  }, settings.checkIntervalMs);
}

// Initialize cache from database
async function initializeCacheFromDatabase() {
  if (isInitialized) return;
  if (initializationPromise) return initializationPromise;

  initializationPromise = (async () => {
    try {
      console.log("Initializing device cache from database...");
      const allDevices: Device[] = await Drizzle.select().from(devicesTable);

      for (const device of allDevices) {
        const cacheDevice: CacheDevice = {
          device: {
            id: device.id,
            name: device.name,
            organizationId: device.organizationId,
            type: device.type,
            status: device.status,
            location: device.location || undefined,
            ipAddress: device.ipAddress || undefined,
            macAddress: device.macAddress,
            serialNumber: device.serialNumber || undefined,
            firmwareVersion: device.firmwareVersion || undefined,
            lastActive: new Date(device.lastActive),
          },
          lastSeen: new Date(device.lastActive),
          status: 'offline', // Assume offline until heartbeat received
        };
        deviceCache.set(device.macAddress, cacheDevice);
      }

      isInitialized = true;
      console.log(`Device cache initialized with ${allDevices.length} devices`);

      // Start intervals after initialization
      startOfflineCheck();
      startRemoveCheck();
    } catch (error) {
      console.error("Failed to initialize device cache:", error);
      throw error;
    }
  })();

  return initializationPromise;
}

// Ensure cache is initialized before operations
async function ensureInitialized() {
  if (!isInitialized) {
    await initializeCacheFromDatabase();
  }
}

// Utility functions to manage device cache from anywhere in the app
export class DeviceCacheManager {

  static async initialize(): Promise<void> {
    await initializeCacheFromDatabase();
  }

  static async updateDevice(macAddress: string, deviceData: CacheDevice): Promise<void> {
    await ensureInitialized();
    deviceCache.set(macAddress, deviceData);
  }

  static removeDevice(macAddress: string): boolean {
    return deviceCache.delete(macAddress);
  }

  static async getAllDevices(organizationId?: string): Promise<Map<string, CacheDevice>> {
    await ensureInitialized();

    if (!organizationId) {
      return new Map(deviceCache);
    }
    console.log("Filtering devices for organization:", organizationId); 
    const filtered = new Map<string, CacheDevice>();
    for (const [key, device] of deviceCache.entries()) {
      if (device.device.organizationId === organizationId) {
        filtered.set(key, device);
      }
    }
    return filtered;
  }
  
  static markOffline(macAddress: string): boolean {
    const device = deviceCache.get(macAddress);
    if (device) {
      device.status = 'offline';
      deviceCache.set(macAddress, device);
      return true;
    }
    return false;
  }

  static markOnline(macAddress: string): boolean {
    const device = deviceCache.get(macAddress);
    if (device) {
      device.status = 'online';
      device.lastSeen = new Date();
      deviceCache.set(macAddress, device);
      return true;
    }
    return false;
  }

  static linkToDatabase(macAddress: string, dbId: string): boolean {
    const device = deviceCache.get(macAddress);
    if (device) {
      device.device.id = dbId;
      deviceCache.set(macAddress, device);
      return true;
    }
    return false;
  }

  static async getStats(organizationId?: string): Promise<CacheStats> {
    await ensureInitialized();

    const allDevices = organizationId
      ? Array.from((await DeviceCacheManager.getAllDevices(organizationId)).values())
      : Array.from(deviceCache.values());

    return {
      total: allDevices.length,
      online: allDevices.filter(d => d.status === 'online').length,
      offline: allDevices.filter(d => d.status === 'offline').length,
      linkedToDb: allDevices.filter(d => d.device.id).length,
      cacheOnly: allDevices.filter(d => !d.device.id).length
    };
  }

  // Sync database operations with cache
  static async syncDatabaseCreate(device: Device): Promise<void> {
    await ensureInitialized();

    const cacheDevice: CacheDevice = {
      device: {
        id: device.id,
        name: device.name,
        organizationId: device.organizationId,
        type: device.type,
        status: device.status,
        location: device.location || undefined,
        ipAddress: device.ipAddress || undefined,
        macAddress: device.macAddress,
        serialNumber: device.serialNumber || undefined,
        firmwareVersion: device.firmwareVersion || undefined,
        lastActive: device.lastActive,
      },
      lastSeen: new Date(device.lastActive),
      status: 'offline',
    };

    deviceCache.set(device.macAddress, cacheDevice);

    // Emit update
    const deviceData = await DeviceCacheManager.getDevicesWithCache(device.organizationId);
    if (deviceData) {
      emitDevicesUpdate('devicesUpdated', deviceData);
    }
  }

  static async syncDatabaseUpdate(device: Device): Promise<void> {
    await ensureInitialized();

    const existing = deviceCache.get(device.macAddress);

    const cacheDevice: CacheDevice = {
      device: {
        id: device.id,
        name: device.name,
        organizationId: device.organizationId,
        type: device.type,
        status: device.status,
        location: device.location || undefined,
        ipAddress: device.ipAddress || undefined,
        macAddress: device.macAddress,
        serialNumber: device.serialNumber || undefined,
        firmwareVersion: device.firmwareVersion || undefined,
        lastActive: device.lastActive,
      },
      lastSeen: existing?.lastSeen || new Date(device.lastActive),
      status: existing?.status || 'offline',
    };

    deviceCache.set(device.macAddress, cacheDevice);

    // Emit update
    const deviceData = await DeviceCacheManager.getDevicesWithCache(device.organizationId);
    if (deviceData) {
      emitDevicesUpdate('devicesUpdated', deviceData);
    }
  }

  static async syncDatabaseDelete(macAddress: string, organizationId: string): Promise<void> {
    await ensureInitialized();

    const device = deviceCache.get(macAddress);
    if (device && device.device.id) {
      // Remove dbId but keep in cache if it's still active
      device.device.id = undefined;
      deviceCache.set(macAddress, device);
    } else {
      deviceCache.delete(macAddress);
    }

    // Emit update
    const deviceData = await DeviceCacheManager.getDevicesWithCache(organizationId);
    if (deviceData) {
      emitDevicesUpdate('devicesUpdated', deviceData);
    }
  }

  // Get devices with cache data (replaces getDevicesWithCache from devices.ts)
  static async getDevicesWithCache(organizationId: string) {
    await ensureInitialized();

    const cachedDevices = await DeviceCacheManager.getAllDevices(organizationId);
    const devicesArray = Array.from(cachedDevices.values()).map(data => ({
      deviceId: data.device.macAddress,
      ...data.device,
      lastSeen: data.lastSeen,
      connectionStatus: data.status,
      source: data.device.id ? ('database+cache' as const) : ('cache-only' as const),
      dbId: data.device.id,
      orgId: data.device.organizationId,
    }));

    const stats = await DeviceCacheManager.getStats(organizationId);

    return {
      devices: devicesArray,
      totalDevices: devicesArray.length,
      cacheCount: stats.cacheOnly,
      dbCount: stats.linkedToDb,
      stats,
    };
  }

  // Get single device
  static async getDevice(macAddress: string): Promise<CacheDevice | undefined> {
    await ensureInitialized();
    return deviceCache.get(macAddress);
  }

  static clearAll(): void {
    deviceCache.clear();
  }

  // Manually trigger purge of cache-only inactive devices
  static async purgeCacheOnlyDevices(organizationId?: string): Promise<number> {
    const now = new Date();
    const threshold = DeviceCacheSettingsManager.getSettings().removeThresholdMs;
    let purgedCount = 0;

    const devices = organizationId
      ? await DeviceCacheManager.getAllDevices(organizationId)
      : new Map(deviceCache);

    for (const [macAddress, data] of devices.entries()) {
      const isInactive = now.getTime() - data.lastSeen.getTime() > threshold;
      const isCacheOnly = !data.device.id;

      if (isInactive && isCacheOnly) {
        if (DeviceCacheManager.removeDevice(macAddress)) {
          purgedCount++;
        }
      }
    }

    return purgedCount;
  }

  // Restart cleanup intervals with new settings
  static restartCleanupIntervals(): void {
    startOfflineCheck();
    startRemoveCheck();
  }
}

// Auto-initialize on module load
initializeCacheFromDatabase().catch(console.error);
