"use server";

import { devices } from "@/drizzle/schema";
import Drizzle from "../db/db";
import { eq, and } from 'drizzle-orm';
import { DeviceCacheManager } from "../deviceCacheManager";
import { Device } from "../db/schema";

export interface ApiDevice extends Partial<Device> {
  deviceId?: string;
  lastSeen: Date;
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
  lastActive: Date;
  organizationId: string;
  lastSeen: Date;
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
  // Ensure lastActive is properly formatted and clean null bytes from string fields
  const deviceToInsert = {
    ...device,
    lastActive: device.lastActive instanceof Date
      ? device.lastActive
      : new Date(device.lastActive),
    // Clean null bytes from string fields to avoid UTF-8 encoding issues
    ...(device.serialNumber && { serialNumber: device.serialNumber.replace(/\x00/g, '') }),
    name: device.name?.replace(/\x00/g, '') || device.name,
    type: device.type?.replace(/\x00/g, '') || device.type,
    ...(device.location && { location: device.location.replace(/\x00/g, '') }),
    ...(device.firmwareVersion && { firmwareVersion: device.firmwareVersion.replace(/\x00/g, '') })
  };

  // const [newDevice] = await Drizzle.insert(devices).values(deviceToInsert).returning();
  const req = Drizzle.insert(devices).values(deviceToInsert).returning();

  console.log("params: ", req.toSQL().sql, req.toSQL().params);
  const [newDevice] = await req;

  console.log('Insert result:', newDevice);
  if (!newDevice) {
    throw new Error('Failed to add device');
  }

  // Add to cache
  await DeviceCacheManager.set(newDevice.macAddress, {
    device: newDevice,
    lastSeen: new Date(newDevice.lastActive),
    status: 'offline',
  });

  return newDevice;
}

export async function updateDevice(deviceId: string, organizationId: string, device: Omit<Device, 'id' | 'organizationId'>) {
  // Sanitize all string fields to remove null bytes
  const sanitizedDevice = {
    ...device,
    name: device.name?.replace(/\x00/g, '') || device.name,
    type: device.type?.replace(/\x00/g, '') || device.type,
    status: device.status?.replace(/\x00/g, '') || device.status,
    location: device.location?.replace(/\x00/g, '') || device.location,
    ipAddress: device.ipAddress?.replace(/\x00/g, '') || device.ipAddress,
    macAddress: device.macAddress?.replace(/\x00/g, '') || device.macAddress,
    serialNumber: device.serialNumber?.replace(/\x00/g, '') || device.serialNumber,
    firmwareVersion: device.firmwareVersion?.replace(/\x00/g, '') || device.firmwareVersion,
    lastActive: device.lastActive instanceof Date ? device.lastActive : new Date(device.lastActive),
  };

  const [updatedDevice] = await Drizzle.update(devices)
    .set(sanitizedDevice)
    .where(and(
      eq(devices.id, deviceId),
      eq(devices.organizationId, organizationId)
    ))
    .returning();
  if (updatedDevice) {
    // Update cache
    const existing = await DeviceCacheManager.get(updatedDevice.macAddress);
    await DeviceCacheManager.set(updatedDevice.macAddress, {
      device: updatedDevice,
      lastSeen: existing?.lastSeen || new Date(updatedDevice.lastActive),
      status: existing?.status || 'offline',
    });
  }

  return updatedDevice;
}

export async function deleteDevice(deviceId: string, organizationId: string) {
  try {
    await Drizzle.delete(devices)
      .where(and(
        eq(devices.id, deviceId),
        eq(devices.organizationId, organizationId)
      ));
    DeviceCacheManager.remove(deviceId);
    return true;
  } catch (error) {
    throw new Error('Failed to delete device: ' + error);
  }

}