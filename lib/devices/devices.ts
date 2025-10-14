import { devices } from "@/drizzle/schema";
import Drizzle from "../db/db";
import { eq } from 'drizzle-orm';
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

export async function getDeviceWithCache(organizationId: string, deviceId?: string) {
  // Get all devices - combine database devices with cached devices
  const dbDevices = await getDevices(organizationId);
  const allDevices = new Map<string, Device & {
    deviceId: string;
    lastSeen: Date;
    connectionStatus: string;
    source: string;
  }>();

  // First, add all database devices
  dbDevices.forEach(device => {
    allDevices.set(device.macAddress, {
      deviceId: device.macAddress,
      ...device, // This includes id
      lastSeen: new Date(device.lastActive),
      lastActive: new Date(device.lastActive),
      connectionStatus: 'offline',
      source: 'database'
    });
  });

  // Then, add/update with cached devices (these are more recent)
  const cachedDevices = DeviceCacheManager.getAllDevices(organizationId);
  cachedDevices.forEach((data, macAddress) => {
    const existingDevice = allDevices.get(macAddress);

    allDevices.set(macAddress, {
      deviceId: macAddress,
      id: data.dbId || existingDevice?.id || "",
      ...data.device,
      lastSeen: data.lastSeen,
      connectionStatus: data.status,
      source: data.dbId ? 'database+cache' : 'cache-only',
      name: "",
      organizationId: "",
      type: "",
      status: "",
      location: "",
      ipAddress: "",
      macAddress: "",
      serialNumber: "",
      firmwareVersion: "",
      lastActive: new Date(),
    });
  });

  const devices = Array.from(allDevices.values());
  const stats = DeviceCacheManager.getStats();

}