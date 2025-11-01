"use server";
import { getGroups } from "@/lib/groups/groups";
import { getUsers } from "./users";

export async function getUsersStats(organizationId: string) {
  const result = await getUsers();
  console.log(organizationId);
  return result.length;
}

export async function getGroupsStats(organizationId: string) {
  const result = await getGroups();
  return result.length;
}



