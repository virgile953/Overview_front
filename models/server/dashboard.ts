"use server";
import { getGroups } from "@/lib/groups/groups";
import { getUsers } from "./users";

export async function getUsersStats() {
  const result = await getUsers();
  return result.length;
}

export async function getGroupsStats() {
  const result = await getGroups();
  return result.length;
}



