"use server";
import { Query } from "node-appwrite";
import { db, deviceCollection } from "../name";
import { databases } from "./config";
import { getUsers } from "./users";
import { getGroups } from "./groups";

export interface DeviceStatusResponse {
  online: number;
  offline: number;
  error: number;
}



export async function getUsersStats() {
  const result = await getUsers();
  return result.length;
}

export async function getGroupsStats() {
  const result = await getGroups();
  return result.length;
}

export async function getDevicesStats(): Promise<DeviceStatusResponse> {
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


