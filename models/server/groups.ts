"use server";
import { Query } from "node-appwrite";
import { db, groupCollection } from "../name";
import { databases } from "./config";
import { Device, isDevice } from "./devices";


export interface Group {
  $id?: string;
  name: string;
  localisation: string;
  description: string;
  users: string[];
  devices: Device[];
}

function isGroup(doc: unknown): doc is Group {
  if (
    typeof doc === "object" &&
    doc !== null &&
    typeof (doc as Group).$id === "string" &&
    typeof (doc as Group).name === "string" &&
    typeof (doc as Group).localisation === "string" &&
    typeof (doc as Group).description === "string" &&
    Array.isArray((doc as Group).users) &&
    Array.isArray((doc as Group).devices) && (doc as Group).devices.every(d => isDevice(d))
  ) {
    return true;
  }
  return false;
}


export async function addGroup(group: Omit<Group, '$id'>): Promise<Group> {
  const newGroup: Group = {
    name: group.name,
    localisation: group.localisation,
    description: group.description,
    users: group.users || [],
    devices: group.devices || [],
  };
  const result = await databases.createDocument(db, groupCollection, 'unique()', newGroup);
  return {
    $id: result.$id,
    name: result.name,
    localisation: result.localisation,
    description: result.description,
    users: result.users,
    devices: result.devices,
  };
}

export async function getGroups(): Promise<Group[]> {
  const result = await databases.listDocuments(db, groupCollection);
  // Map raw documents to Group type
  console.log(result.documents);
  return result.documents.map((doc: unknown) => {
    if (isGroup(doc)) {
      return doc;
    }
    throw new Error("Invalid group document");
  });
}
export async function getGroup(name?: string, id?: string): Promise<Group | null> {
  try {
    const result = await databases.listDocuments(db, groupCollection,
      [
        name ? Query.equal('name', name) : null,
        id ? Query.equal('$id', id) : null
      ].filter(Boolean) as string[]
    );
    if (isGroup(result.documents[0])) {
      return result.documents[0];
    }
    return null;
  } catch (error) {
    console.error("Error fetching group:", error);
    return null;
  }
}
