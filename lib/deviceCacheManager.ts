import { deviceCache } from "../app/api/device/route";
import { Device } from "@/models/server/devices";

export interface CacheDevice {
  device: Omit<Device, '$id'>;
  lastSeen: Date;
  status: 'online' | 'offline';
  dbId?: string;
}

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

  static getAllDevices(): Map<string, CacheDevice> {
    return new Map(deviceCache);
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

  static getStats() {
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
