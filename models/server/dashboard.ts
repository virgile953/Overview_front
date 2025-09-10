"use server";
import { getUsers } from "./users";
import { getGroups } from "./groups";

export async function getUsersStats() {
  const result = await getUsers();
  return result.length;
}

export async function getGroupsStats() {
  const result = await getGroups();
  return result.length;
}



