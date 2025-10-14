import { Device } from "./db/schema";
import { emitDevicesUpdate } from "./socketUtils";

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
const OFFLINE_THRESHOLD = 1 * 60 * 1000; // 1 minute
setInterval(async () => {
  const now = new Date();
  const devices = DeviceCacheManager.getAllDevices();
  let hasChanges = false;

  for (const [macAddress, data] of devices.entries()) {
    if (now.getTime() - data.lastSeen.getTime() > OFFLINE_THRESHOLD && data.status === 'online') {
      DeviceCacheManager.markOffline(macAddress);
      hasChanges = true;
    }
  }

  // Emit update if any devices were marked offline
  if (hasChanges) {
    try {
      const deviceData = await getCurrentDeviceData();
      emitDevicesUpdate('devicesUpdated', deviceData);
    } catch (error) {
      console.warn('Failed to emit device offline update:', error);
    }
  }
}, 60 * 1000); // Check every minute

// Cleanup interval to remove devices after prolonged inactivity
const REMOVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
setInterval(async () => {
  const now = new Date();
  const devices = DeviceCacheManager.getAllDevices();
  let hasChanges = false;

  for (const [macAddress, data] of devices.entries()) {
    if (now.getTime() - data.lastSeen.getTime() > REMOVE_THRESHOLD) {
      DeviceCacheManager.removeDevice(macAddress);
      hasChanges = true;
    }
  }

  // Emit update if any devices were removed
  if (hasChanges) {
    try {
      const deviceData = await getCurrentDeviceData(organizationId);
      emitDevicesUpdate('devicesUpdated', deviceData);
    } catch (error) {
      console.warn('Failed to emit device removal update:', error);
    }
  }
}, 60 * 1000); // Check every minute



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
    return new Map(deviceCache.entries().filter(([_, device]) => device.organizationId === organizationId));
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

  static getStats(): CacheStats {
    const devices = Array.from(deviceCache.values()) as CacheDevice[];

    return {
      total: devices.length,
      online: devices.filter(d => d.status === 'online').length,
      offline: devices.filter(d => d.status === 'offline').length,
      linkedToDb: devices.filter(d => d.dbId).length,
      cacheOnly: devices.filter(d => !d.dbId).length
    };
  }

  // Get devices by status
  static getDevicesByStatus(status: 'online' | 'offline'): CacheDevice[] {
    const devices = Array.from(deviceCache.values()) as CacheDevice[];
    return devices.filter(d => d.status === status);
  }

  // Get devices that are cache-only (not in database)
  static getCacheOnlyDevices(): CacheDevice[] {
    const devices = Array.from(deviceCache.values()) as CacheDevice[];
    return devices.filter(d => !d.dbId);
  }

  // Get devices that are linked to database
  static getLinkedDevices(): CacheDevice[] {
    const devices = Array.from(deviceCache.values()) as CacheDevice[];
    return devices.filter(d => d.dbId);
  }

  static clearAll(): void {
    deviceCache.clear();
  }
}
