import { devices } from "@/drizzle/schema";
import Drizzle from "../db/db";
import { eq, and } from 'drizzle-orm';
import { DeviceCacheManager } from "../deviceCacheManager";
import { Device } from "../db/schema";

export interface ApiDevice extends Partial<Device> {
  deviceId?: string;
  lastSeen: Date | string;
  connectionStatus: string;
  source: 'database' | 'database+cache' | 'cache-only';
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

export async function getDevices(organizationId: string): Promise<DeviceResponse> {
  const cachedDevices = await DeviceCacheManager.getAll(organizationId);
  const devicesArray = Array.from(cachedDevices.values()).map(data => ({
    deviceId: data.device.macAddress,
    ...data.device,
    lastSeen: data.lastSeen,
    connectionStatus: data.status,
    source: data.device.id ? ('database+cache' as const) : ('cache-only' as const),
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

export async function getDevice(organizationId: string, deviceId: string) {
  const device = await DeviceCacheManager.get(deviceId);
  if (device && device.device.organizationId === organizationId) {
    return {
      deviceId: device.device.macAddress,
      ...device.device,
      lastSeen: device.lastSeen,
      connectionStatus: device.status,
    };
  }
  return null;
}

// Database mutation helpers that sync with cache
export async function createDevice(device: Omit<Device, 'id'>) {
  const [newDevice] = await Drizzle.insert(devices).values(device).returning();
  
  // Add to cache
  DeviceCacheManager.set(newDevice.macAddress, {
    device: newDevice,
    lastSeen: new Date(newDevice.lastActive),
    status: 'offline',
  });
  
  return newDevice;
}

export async function updateDevice(deviceId: string, organizationId: string, updates: Record<string, unknown>) {
  const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key] = key === 'lastActive' && value instanceof Date ? value.toISOString() : value;
    }
    return acc;
  }, {} as Record<string, unknown>);

  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error('No valid updates provided');
  }

  const [updatedDevice] = await Drizzle.update(devices)
    .set(filteredUpdates)
    .where(and(
      eq(devices.macAddress, deviceId),
      eq(devices.organizationId, organizationId)
    ))
    .returning();

  if (updatedDevice) {
    // Update cache
    const existing = await DeviceCacheManager.get(updatedDevice.macAddress);
    DeviceCacheManager.set(updatedDevice.macAddress, {
      device: updatedDevice,
      lastSeen: existing?.lastSeen || new Date(updatedDevice.lastActive),
      status: existing?.status || 'offline',
    });
  }
  
  return updatedDevice;
}

export async function deleteDevice(deviceId: string, organizationId: string) {
  await Drizzle.delete(devices)
    .where(and(
      eq(devices.macAddress, deviceId),
      eq(devices.organizationId, organizationId)
    ));

  DeviceCacheManager.remove(deviceId);
}