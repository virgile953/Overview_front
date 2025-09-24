"use server";
import { db, deviceLogCollection } from "../name";
import { databases } from "./config";
import { Query } from "node-appwrite";
import { Device, isDevice } from "./devices";

export interface DeviceLog {
  $id: string;
  $createdAt: Date;
  device: Device;
  status: 'info' | 'warning' | 'error' | 'ok';
  message: string;
  latency: number;
}

export async function isDeviceLog(doc: unknown): Promise<boolean> {
  if (
    typeof doc !== "object" ||
    doc === null ||
    !("$id" in doc) ||
    !("$createdAt" in doc) ||
    !("device" in doc) ||
    !("status" in doc) ||
    !("message" in doc) ||
    !("latency" in doc)
  ) {
    return false;
  }

  const typedDoc = doc as Record<string, unknown>;
  const validStatuses = ['info', 'warning', 'error', 'ok'];

  if (typeof typedDoc.status !== 'string' || !validStatuses.includes(typedDoc.status)) {
    return false;
  }

  return await isDevice(typedDoc.device);
}

export async function getLogCount(deviceId?: string): Promise<number> {
  const data = await databases.listDocuments(db, deviceLogCollection, deviceId ? [Query.equal("device", deviceId)] : []);

  return data.total
}

export async function getAllLogs(max?: number): Promise<DeviceLog[]> {
  try {
    const result = await databases.listDocuments(db, deviceLogCollection
      , max ? [
        Query.orderDesc("$createdAt"),
        Query.limit(max)
      ] : [
        Query.orderDesc("$createdAt"),
      ]
    );
    return await Promise.all(result.documents.map(async (doc: unknown) => {
      if (await isDeviceLog(doc)) {
        const typedDoc = doc as Record<string, unknown>;
        return {
          $id: typedDoc.$id as string,
          $createdAt: new Date(typedDoc.$createdAt as string),
          device: typedDoc.device,
          status: typedDoc.status,
          message: typedDoc.message,
          latency: typedDoc.latency,
        } as DeviceLog;
      }
      console.log("Invalid log document: ", doc);
      throw new Error("Invalid log document");
    }));
  } catch (error) {
    console.log("No logs found: ", error);
    return [];
  }
}

export async function getDeviceLogs(deviceId: string): Promise<DeviceLog[]> {
  const result = await databases.listDocuments(db, deviceLogCollection, [
    Query.equal("$id", deviceId),
    Query.orderDesc("$createdAt"),
    Query.limit(100)
  ]);
  const logs = await Promise.all(
    result.documents.map(async (doc: unknown) => {
      if (await isDeviceLog(doc)) {
        const typedDoc = doc as Record<string, unknown>;
        return {
          $id: typedDoc.$id,
          $createdAt: new Date(typedDoc.$createdAt as string),
          device: typedDoc.device as Device,
          status: typedDoc.status,
          message: typedDoc.message,
          latency: typedDoc.latency,
        } as DeviceLog;
      }
      throw new Error("Invalid device log document");
    })
  );
  return logs;
}

export async function addDeviceLog(log: Omit<DeviceLog, '$id' | '$createdAt'>): Promise<DeviceLog> {
  try {
    const result = await databases.createDocument(db, deviceLogCollection, 'unique()', {
      device: log.device.$id,
      status: log.status,
      message: log.message,
      latency: log.latency,
    });

    if (!await isDeviceLog(result)) {
      console.error("Created document failed validation:", result);
      throw new Error("Invalid device log document created");
    }

    return {
      $id: result.$id,
      $createdAt: new Date(result.$createdAt),
      device: result.device,
      status: result.status,
      message: result.message,
      latency: result.latency,
    } as DeviceLog;
  } catch (error) {
    console.error("Error creating device log:", error);
    throw error;
  }
}
// return {
//   $id: result.$id,
//   device: result.device,
//   status: result.status,
//   message: result.message,
//   latency: result.latency,
//   $createdAt: new Date(result.$createdAt),
// }; 