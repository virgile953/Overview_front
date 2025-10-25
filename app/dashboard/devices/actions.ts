"use server";
import { auth } from '@/lib/auth';
import Drizzle from '@/lib/db/db';
import { devices } from '@/lib/db/schema';
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

// export async function addDeviceToDb(device: NewDevice) {
//   const session = await auth.api.getSession({
//     headers: await headers(),
//   });
//   if (!session) {
//     throw new Error('Unauthorized');
//   }
//   const organizationId = session.session.activeOrganizationId;
//   if (!organizationId) {
//     throw new Error('No active organization');
//   }
//   console.log('Adding device to organization:', organizationId);
//   console.log(device);
//   device.organizationId = organizationId;
//   const res = await Drizzle.insert(devices).values(device).returning();
//   console.log('Insert result:', res);
//   if (!res || res.length === 0) {
//     throw new Error('Failed to add device');
//   }
//   console.log('Added device:', res[0]);
//   // Add to cache
//   await DeviceCacheManager.set(res[0].macAddress, {
//     device: res[0],
//     lastSeen: res[0].lastActive,
//     status: 'online',
//   });

//   return res[0];
// }