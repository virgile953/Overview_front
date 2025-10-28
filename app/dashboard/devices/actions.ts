"use server";
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { DeviceCacheManager } from '@/lib/deviceCacheManager';

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

  // Initialize cache from database if empty
  await DeviceCacheManager.initializeFromDb(organizationId);

  // Get cached devices
  const cachedDevices = await DeviceCacheManager.getAll(organizationId);

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