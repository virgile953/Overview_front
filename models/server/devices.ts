"use server";
import { db, deviceCollection } from "../name";
import { databases } from "./config";

export interface Device {
  $id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  ipAddress: string;
  macAddress: string;
  serialNumber: string;
  firmwareVersion: string;
  lastActive: string;
  ownerId: string;
}

export async function isDevice(doc: unknown): Promise<boolean> {
  return (
    typeof doc === "object" &&
    doc !== null &&
    "$id" in doc &&
    "name" in doc &&
    "type" in doc &&
    "status" in doc &&
    "location" in doc &&
    "ipAddress" in doc &&
    "macAddress" in doc &&
    "serialNumber" in doc &&
    "firmwareVersion" in doc &&
    "lastActive" in doc &&
    "ownerId" in doc
  );
}

export async function getDevices(): Promise<Device[]> {
  const result = await databases.listDocuments(db, deviceCollection);
  // Map raw documents to Device type
  const devices = await Promise.all(
    result.documents.map(async (doc: unknown) => {
      if (await isDevice(doc)) {
        return doc as Device;
      }
      throw new Error("Invalid device document");
    })
  );
  return devices;
}

export async function addDevice(device: Omit<Device, '$id'>): Promise<Device> {
  const result = await databases.createDocument(db, deviceCollection, 'unique()', device);

  if (!await isDevice(result)) {
    throw new Error("Invalid device document created");
  }
  return result as unknown as Device;
  // return {
  //   $id: result.$id,
  //   name: result.name,
  //   type: result.type,
  //   status: result.status,
  //   location: result.location,
  //   ipAddress: result.ipAddress,
  //   macAddress: result.macAddress,
  //   serialNumber: result.serialNumber,
  //   firmwareVersion: result.firmwareVersion,
  //   lastActive: result.lastActive,
  //   ownerId: result.ownerId,
  // };
}

export async function updateDevice(deviceId: string, updates: Partial<Omit<Device, '$id'>>): Promise<Device> {
  const result = await databases.updateDocument(db, deviceCollection, deviceId, updates);
  return {
    $id: result.$id,
    name: result.name,
    type: result.type,
    status: result.status,
    location: result.location,
    ipAddress: result.ipAddress,
    macAddress: result.macAddress,
    serialNumber: result.serialNumber,
    firmwareVersion: result.firmwareVersion,
    lastActive: result.lastActive,
    ownerId: result.ownerId,
  };
}

export async function deleteDevice(deviceId: string): Promise<void> {
  const ret = await databases.deleteDocument(db, deviceCollection, deviceId);
}
