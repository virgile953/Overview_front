"use server";
import { auth } from '@/lib/auth';
import Drizzle from '@/lib/db/db';
import { devices, NewDevice } from '@/lib/db/schema';
import { headers } from 'next/headers';
import { getDevicesWithCache } from '@/lib/devices/devices';


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
  const res = await getDevicesWithCache(organizationId);
  return res;
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
  return res[0];
}