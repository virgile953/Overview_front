import { devices } from "@/drizzle/schema";
import Drizzle from "../db/db";
import { eq, and } from 'drizzle-orm';
import { DeviceCacheManager } from "../deviceCacheManager";
import { Device } from "../db/schema";

export interface ApiDevice extends Partial<Device> {
  deviceId: string;
  lastSeen: Date | string;
  connectionStatus: string;
  source: 'database' | 'database+cache' | 'cache-only';
  dbId?: string;
  orgId: string;
}

export interface DeviceResponse {
  devices: ApiDevice[];
  totalDevices: number;
  cacheCount: number;
  dbCount: number;
  stats: {
    total: number;
    online: number;
    offline: number;
    linkedToDb: number;
    cacheOnly: number;
  };
}

export interface singleDeviceResponse {
  deviceId: string;
  name: string;
  type: string;
  status: string;
  location?: string;
  ipAddress?: string;
  macAddress: string;
  serialNumber?: string;
  firmwareVersion?: string;
  lastActive: string;
  organizationId: string;
  lastSeen: Date | string;
  connectionStatus: string;
  dbId?: string;
}

export async function getDevices(organizationId: string) {
  const res = await Drizzle.select().from(devices).where(eq(devices.organizationId, organizationId));
  return res;
}

export async function getDevice(organizationId: string, deviceId: string) {
  const res = await Drizzle.select().from(devices).where(
    and(
      eq(devices.organizationId, organizationId),
      eq(devices.macAddress, deviceId)
    ));
  return res;
}

export async function getDevicesWithCache(organizationId: string): Promise<DeviceResponse | null> {
  // Get all devices - combine database devices with cached devices
  const dbDevices = await getDevices(organizationId);
  const allDevices = new Map<string, ApiDevice>();

  // First, add all database devices
  dbDevices.forEach(device => {
    return allDevices.set(device.macAddress, {
      deviceId: device.macAddress,
      ...device,
      lastActive: new Date(device.lastActive),
      lastSeen: new Date(device.lastActive),
      connectionStatus: 'offline',
      source: 'database' as const,
      dbId: device.id,
      orgId: device.organizationId,
    });
  });

  // Then, add/update with cached devices (these are more recent)
  const cachedDevices = DeviceCacheManager.getAllDevices(organizationId);
  cachedDevices.forEach((data, macAddress) => {
    const existingDevice = allDevices.get(macAddress);

    allDevices.set(macAddress, {
      deviceId: macAddress,
      ...data.device,
      ...(existingDevice || {}), // Preserve DB data if exists
      lastSeen: data.lastSeen,
      connectionStatus: data.status,
      source: data.dbId ? 'database+cache' as const : 'cache-only' as const,
      dbId: data.dbId,
      orgId: data.organizationId,
    });
  });

  const devicesArray = Array.from(allDevices.values());
  const stats = DeviceCacheManager.getStats(organizationId);

  return {
    devices: devicesArray,
    totalDevices: devicesArray.length,
    cacheCount: stats.cacheOnly,
    dbCount: stats.linkedToDb,
    stats,
  };
}