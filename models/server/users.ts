"use server";
import { Query } from "node-appwrite";
import { db, userCollection } from "../name";
import { databases } from "./config";
import { Group, isGroup } from "./groups";


export interface User {
  $id?: string;
  name: string;
  last_name?: string;
  email: string;
  service?: string;
  function?: string;
  title?: string;
  groups: Group[];
}

export async function isUser(doc: unknown): Promise<boolean> {
  if (
    typeof doc === "object" &&
    doc !== null &&
    typeof (doc as User).$id === "string" &&
    typeof (doc as User).name === "string" &&
    typeof (doc as User).service === "string" &&
    Array.isArray((doc as User).groups) && (doc as User).groups.every(d => isGroup(d))
  ) {
    return true;
  }
  return false;
}


export async function addUser(user: Omit<User, '$id'>): Promise<User> {
  const newUser: User = {
    name: user.name,
    service: user.service,
    function: user.function,
    last_name: user.last_name,
    email: user.email,
    groups: user.groups || [],
  };
  const result = await databases.createDocument(db, userCollection, 'unique()', {
    name: newUser.name,
    service: newUser.service,
    function: newUser.function,
    last_name: newUser.last_name,
    email: newUser.email,
    groups: newUser.groups.map(g => g.$id)
  });
  return {
    $id: result.$id,
    name: result.name,
    service: result.service,
    function: result.function,
    last_name: result.last_name,
    groups: result.groups,
    email: result.email
  };
}

export async function getUsers(): Promise<User[]> {
  const result = await databases.listDocuments(db, userCollection);
  return await Promise.all(result.documents.map(async (doc: unknown) => {
    if (await isUser(doc)) {
      return doc as User;
    }
    throw new Error("Invalid user document");
  }));
}
export async function getUser(email?: string, id?: string): Promise<User | null> {
  try {
    const result = await databases.listDocuments(db, userCollection,
      [
        email ? Query.equal('email', email) : null,
        id ? Query.equal('$id', id) : null
      ].filter(Boolean) as string[]
    );
    if (await isUser(result.documents[0])) {
      return result.documents[0] as unknown as User;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}


export async function updateUser(user: User): Promise<User | null> {
  try {
    const existingUser = await getUser(undefined, user.$id);
    if (!existingUser) {
      throw new Error("User not found");
    }
    const updatedUser = { ...existingUser, ...user };
    await databases.updateDocument(db, userCollection, user.$id!, {
      name: updatedUser.name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      service: updatedUser.service,
      function: updatedUser.function,
      title: updatedUser.title,
      groups: updatedUser.groups.map(g => g.$id)
    });
    return updatedUser;
  } catch (error) {
    console.error("Error updating user:", error);
    return null;
  }
}
