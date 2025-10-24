"use server";
import { auth } from '@/lib/auth';
import Drizzle from '@/lib/db/db';
import { devices, NewDevice } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { DeviceCacheManager } from '@/lib/deviceCacheManager';
import { eq } from 'drizzle-orm';

export async function fetchDevices() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error('Unauthorized');
  }
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    throw new Error('No active organization');
  }

  let cachedDevices = await DeviceCacheManager.getAll(organizationId);
  
  if (cachedDevices.size === 0) {
    // If no devices in cache, populate cache from DB
    const dbDevices = await Drizzle.select().from(devices).where(eq(devices.organizationId, organizationId));
    for (const dbDevice of dbDevices) {
      await DeviceCacheManager.set(dbDevice.macAddress, {
        device: dbDevice,
        lastSeen: new Date(dbDevice.lastActive),
        status: 'offline',
      });
    }
    cachedDevices = await DeviceCacheManager.getAll(organizationId);
  }

  return cachedDevices;
}

export async function addDeviceToDb(device: NewDevice) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error('Unauthorized');
  }
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    throw new Error('No active organization');
  }
  device.organizationId = organizationId;
  const res = await Drizzle.insert(devices).values(device).returning();
  if (!res || res.length === 0) {
    throw new Error('Failed to add device');
  }
  
  // Add to cache
  await DeviceCacheManager.set(res[0].macAddress, {
    device: res[0],
    lastSeen: new Date(res[0].lastActive),
    status: 'offline',
  });
  
  return res[0];
}