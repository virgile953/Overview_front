import { Device } from "./db/schema";
import { emitDevicesUpdate } from "./socketUtils";
import { DeviceCacheSettingsManager } from "./deviceCacheSettings";
import { getDevicesWithCache } from "./devices/devices";

export interface CacheDevice {
  device: Omit<Device, 'id'>;
  lastSeen: Date;
  status: 'online' | 'offline';
  dbId?: string;
  organizationId: string;
}

export interface CacheStats {
  total: number;
  online: number;
  offline: number;
  linkedToDb: number;
  cacheOnly: number;
}

// In-memory cache for device status (use Redis in production)
export const deviceCache = new Map<string, CacheDevice>();

// Cleanup interval to mark devices as offline after inactivity
let offlineCheckInterval: NodeJS.Timeout;
let removeCheckInterval: NodeJS.Timeout;

function startOfflineCheck() {
  if (offlineCheckInterval) clearInterval(offlineCheckInterval);
  
  const settings = DeviceCacheSettingsManager.getSettings();
  offlineCheckInterval = setInterval(async () => {
    const now = new Date();
    const devices = DeviceCacheManager.getAllDevices();
    const changedOrgs = new Set<string>();

    for (const [macAddress, data] of devices.entries()) {
      const threshold = DeviceCacheSettingsManager.getSettings().offlineThresholdMs;
      if (now.getTime() - data.lastSeen.getTime() > threshold && data.status === 'online') {
        DeviceCacheManager.markOffline(macAddress);
        changedOrgs.add(data.organizationId);
      }
    }

    // Emit updates per organization
    for (const orgId of changedOrgs) {
      try {
        const deviceData = await getDevicesWithCache(orgId);
        if (deviceData) {
          emitDevicesUpdate('devicesUpdated', deviceData);
        }
      } catch (error) {
        console.warn(`Failed to emit device offline update for org ${orgId}:`, error);
      }
    }
  }, settings.checkIntervalMs);
}

function startRemoveCheck() {
  if (removeCheckInterval) clearInterval(removeCheckInterval);
  
  const settings = DeviceCacheSettingsManager.getSettings();
  removeCheckInterval = setInterval(async () => {
    const now = new Date();
    const devices = DeviceCacheManager.getAllDevices();
    const changedOrgs = new Set<string>();

    for (const [macAddress, data] of devices.entries()) {
      const threshold = DeviceCacheSettingsManager.getSettings().removeThresholdMs;
      const isInactive = now.getTime() - data.lastSeen.getTime() > threshold;
      const isCacheOnly = !data.dbId;
      
      // Only remove devices that are cache-only AND inactive
      if (isInactive && isCacheOnly) {
        DeviceCacheManager.removeDevice(macAddress);
        changedOrgs.add(data.organizationId);
      }
    }

    // Emit updates per organization
    for (const orgId of changedOrgs) {
      try {
        const deviceData = await getDevicesWithCache(orgId);
        if (deviceData) {
          emitDevicesUpdate('devicesUpdated', deviceData);
        }
      } catch (error) {
        console.warn(`Failed to emit device removal update for org ${orgId}:`, error);
      }
    }
  }, settings.checkIntervalMs);
}

// Start the cleanup intervals
startOfflineCheck();
startRemoveCheck();

// Utility functions to manage device cache from anywhere in the app
export class DeviceCacheManager {

  static updateDevice(macAddress: string, deviceData: CacheDevice): void {
    deviceCache.set(macAddress, deviceData);
  }

  static removeDevice(macAddress: string): boolean {
    return deviceCache.delete(macAddress);
  }

  static getDevice(macAddress: string): CacheDevice | undefined {
    return deviceCache.get(macAddress);
  }

  static getAllDevices(organizationId?: string): Map<string, CacheDevice> {
    if (!organizationId) {
      return new Map(deviceCache);
    }
    
    const filtered = new Map<string, CacheDevice>();
    for (const [key, device] of deviceCache.entries()) {
      if (device.organizationId === organizationId) {
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
      device.dbId = dbId;
      deviceCache.set(macAddress, device);
      return true;
    }
    return false;
  }

  static getStats(organizationId?: string): CacheStats {
    const allDevices = organizationId 
      ? Array.from(DeviceCacheManager.getAllDevices(organizationId).values())
      : Array.from(deviceCache.values());

    return {
      total: allDevices.length,
      online: allDevices.filter(d => d.status === 'online').length,
      offline: allDevices.filter(d => d.status === 'offline').length,
      linkedToDb: allDevices.filter(d => d.dbId).length,
      cacheOnly: allDevices.filter(d => !d.dbId).length
    };
  }

  // Get devices by status
  static getDevicesByStatus(status: 'online' | 'offline', organizationId?: string): CacheDevice[] {
    const devices = organizationId
      ? Array.from(DeviceCacheManager.getAllDevices(organizationId).values())
      : Array.from(deviceCache.values());
    return devices.filter(d => d.status === status);
  }

  // Get devices that are cache-only (not in database)
  static getCacheOnlyDevices(organizationId?: string): CacheDevice[] {
    const devices = organizationId
      ? Array.from(DeviceCacheManager.getAllDevices(organizationId).values())
      : Array.from(deviceCache.values());
    return devices.filter(d => !d.dbId);
  }

  // Get devices that are linked to database
  static getLinkedDevices(organizationId?: string): CacheDevice[] {
    const devices = organizationId
      ? Array.from(DeviceCacheManager.getAllDevices(organizationId).values())
      : Array.from(deviceCache.values());
    return devices.filter(d => d.dbId);
  }

  static clearAll(): void {
    deviceCache.clear();
  }

  // Manually trigger purge of cache-only inactive devices
  static purgeCacheOnlyDevices(organizationId?: string): number {
    const now = new Date();
    const threshold = DeviceCacheSettingsManager.getSettings().removeThresholdMs;
    let purgedCount = 0;

    const devices = organizationId 
      ? DeviceCacheManager.getAllDevices(organizationId)
      : new Map(deviceCache);

    for (const [macAddress, data] of devices.entries()) {
      const isInactive = now.getTime() - data.lastSeen.getTime() > threshold;
      const isCacheOnly = !data.dbId;
      
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
