"use server";
import { databases } from "@/models/client/config";
import { db, deviceCollection } from "@/models/name";
import { NextResponse } from "next/server";
import { Query } from "node-appwrite";

export async function GET() {
  const devices = await getStats();
  return NextResponse.json(devices);
}

export interface DeviceStatusResponse {
  online: number;
  offline: number;
  error: number;
}

export async function getStats(): Promise<DeviceStatusResponse> {
  const online = await databases.listDocuments(db, deviceCollection,
    [Query.equal('status', 'online')]
  );
  const offline = await databases.listDocuments(db, deviceCollection, [
    Query.equal('status', 'offline')
  ]);
  const error = await databases.listDocuments(db, deviceCollection, [
    Query.equal('status', 'error')
  ]);
  return {
    online: online.total,
    offline: offline.total,
    error: error.total,
  };
}