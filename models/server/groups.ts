"use server";
import { Query } from "node-appwrite";
import { db, groupCollection } from "../name";
import { databases } from "./config";
import { User, isUser } from "./users";
import { Device } from "@/lib/db/schema";


export interface Group {
  $id?: string;
  name: string;
  localisation: string;
  description: string;
  users: User[];
  devices: Device[];
}

export async function isGroup(doc: unknown): Promise<boolean> {
  if (
    typeof doc === "object" &&
    doc !== null &&
    typeof (doc as Group).$id === "string" &&
    typeof (doc as Group).name === "string" &&
    typeof (doc as Group).localisation === "string" &&
    typeof (doc as Group).description === "string" &&
    Array.isArray((doc as Group).users) && (doc as Group).users.every(u => isUser(u))
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
  return await Promise.all(result.documents.map(async (doc: unknown) => {
    if (await isGroup(doc)) {
      return doc as Group;
    }
    throw new Error("Invalid group document");
  }));
}

export async function getGroup(name?: string, id?: string): Promise<Group | null> {
  try {
    const result = await databases.listDocuments(db, groupCollection,
      [
        name ? Query.equal('name', name) : null,
        id ? Query.equal('$id', id) : null
      ].filter(Boolean) as string[]
    );
    if (await isGroup(result.documents[0])) {
      return result.documents[0] as unknown as Group;
    }
    return null;
  } catch (error) {
    console.error("Error fetching group:", error);
    return null;
  }
}

export async function updateGroup(group: Group): Promise<Group | null> {
  try {
    const existingGroup = await getGroup(undefined, group.$id);
    if (!existingGroup) {
      throw new Error("Group not found");
    }
    const updatedGroup = { ...existingGroup, ...group };
    await databases.updateDocument(db, groupCollection, group.$id!, {
      description: updatedGroup.description,
      localisation: updatedGroup.localisation,
      name: updatedGroup.name,
      users: updatedGroup.users.map(u => u.$id),
      devices: updatedGroup.devices.map(d => d.id)
    });
    return updatedGroup;
  } catch (error) {
    console.error("Error updating group:", error);
    return null;
  }
}

export async function deleteGroup(id: string): Promise<Group | null> {
  try {
    const existingGroup = await getGroup(undefined, id);
    if (!existingGroup) {
      throw new Error("Group not found");
    }
    await databases.deleteDocument(db, groupCollection, id);
    return existingGroup;
  } catch (error) {
    console.error("Error deleting group:", error);
    return null;
  }
}
