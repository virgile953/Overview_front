"use server";
import Drizzle from "@/lib/db/db";
import { Device, devices, NewDevice } from "@/lib/db/schema";
import { eq } from "drizzle-orm";


export async function isDevice(doc: unknown): Promise<boolean> {
  return (
    typeof doc === "object" &&
    doc !== null &&
    "id" in doc &&
    "name" in doc &&
    "type" in doc &&
    "status" in doc &&
    "location" in doc &&
    "ipAddress" in doc &&
    "macAddress" in doc &&
    "serialNumber" in doc &&
    "firmwareVersion" in doc &&
    "lastActive" in doc &&
    "organizationId" in doc
  );
}

export async function getDevices(): Promise<Device[]> {
  const result = await Drizzle.select().from(devices).where(eq(devices.organizationId, ""));
  return result;
}

export async function getDevice(deviceId: string): Promise<Device | null> {
  try {

    const result = await Drizzle.select().from(devices).where(eq(devices.id, deviceId)).limit(1);
    if (result.length > 0 && await isDevice(result[0])) {
      return result[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching device:', error);
    return null;
  }
}

export async function addDevice(device: NewDevice): Promise<Device> {
  const result = await Drizzle.insert(devices).values(device).returning();

  if (!result || result.length === 0) {
    throw new Error("Failed to create device");
  }
  if (!await isDevice(result[0])) {
    throw new Error("Invalid device created");
  }
  return result[0];
}

export async function updateDevice(deviceId: string, updates: Partial<NewDevice>): Promise<Device> {

  const result = await Drizzle.update(devices).set(updates).where(eq(devices.id, deviceId)).returning();
  if (!result || result.length === 0) {
    throw new Error("Failed to update device");
  }
  if (!await isDevice(result[0])) {
    throw new Error("Invalid device updated");
  }
  return result[0];
}

export async function deleteDevice(deviceId: string): Promise<void> {
  const res = await Drizzle.delete(devices).where(eq(devices.id, deviceId));
  if (res.rowCount === 0) {
    throw new Error("Failed to delete device");
  }
}
