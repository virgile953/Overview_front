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

export async function getDevices(organizationId: string) {
  return DeviceCacheManager.getDevicesWithCache(organizationId);
}

export async function getDevice(organizationId: string, deviceId: string) {
  const device = await DeviceCacheManager.getDevice(deviceId);
  if (device && device.device.organizationId === organizationId) {
    return {
      deviceId: device.device.macAddress,
      ...device.device,
      lastSeen: device.lastSeen,
      connectionStatus: device.status,
      dbId: device.device.id,
      orgId: device.device.organizationId,
    };
  }
  return null;
}

// Database mutation helpers that sync with cache
export async function createDevice(device: Omit<Device, 'id'>) {
  const [newDevice] = await Drizzle.insert(devices).values(device).returning();
  const deviceForCache = {
    ...newDevice,
    lastActive: new Date(newDevice.lastActive)
  };
  await DeviceCacheManager.syncDatabaseCreate(deviceForCache);
  return newDevice;
}

export async function updateDevice(deviceId: string, organizationId: string, updates: Record<string, unknown>) {
  // Filter out undefined values
  const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      if (key === 'lastActive' && value instanceof Date) {
        acc[key] = value.toISOString();
      } else {
        acc[key] = value;
      }
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
    const deviceForCache = {
      ...updatedDevice,
      lastActive: new Date(updatedDevice.lastActive)
    };
    await DeviceCacheManager.syncDatabaseUpdate(deviceForCache);
  }
  return updatedDevice;
}

export async function deleteDevice(deviceId: string, organizationId: string) {
  await Drizzle.delete(devices)
    .where(and(
      eq(devices.macAddress, deviceId),
      eq(devices.organizationId, organizationId)
    ));

  await DeviceCacheManager.syncDatabaseDelete(deviceId, organizationId);
}