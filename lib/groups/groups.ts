"use server";

import { eq, and } from "drizzle-orm";
import Drizzle from "../db/db";
import { Device, groups, groupDevices, groupUsers, users, Users, devices } from "../db/schema";

export interface Group {
  id?: string;
  name: string;
  localisation: string;
  description: string;
  users?: Users[];
  devices?: Device[];
}

async function getUsersForGroup(groupId: string): Promise<Users[]> {
  const groupUsersList: { user: Users }[] = await Drizzle.select({
    user: users,
  })
    .from(groupUsers)
    .innerJoin(users, eq(groupUsers.userId, users.id))
    .where(eq(groupUsers.groupId, groupId));

  return groupUsersList.map(gu => gu.user);
}

async function getDevicesForGroup(groupId: string): Promise<Device[]> {
  const groupDevicesList: { device: Device }[] = await Drizzle.select({
    device: devices,
  })
    .from(groupDevices)
    .innerJoin(devices, eq(groupDevices.deviceId, devices.id))
    .where(eq(groupDevices.groupId, groupId));

  return groupDevicesList.map(gd => gd.device);
}

export async function getGroups(orgId: string): Promise<Group[]> {
  // Get all groups for the organization
  const orgGroups = await Drizzle.select()
    .from(groups)
    .where(eq(groups.organizationId, orgId));

  // For each group, get users and devices
  const groupsWithRelations = await Promise.all(
    orgGroups.map(async (group) => {
      // Get users for this group
      const groupUsersList = await getUsersForGroup(group.id);
      // Get devices for this group
      const groupDevicesList = await getDevicesForGroup(group.id);

      return {
        ...group,
        users: groupUsersList,
        devices: groupDevicesList,
      };
    })
  );

  return groupsWithRelations;
}

// Add user to group
export async function addUserToGroup(groupId: string, userId: string)
  : Promise<{
    groupId: string;
    userId: string;
    createdAt: Date;
  }[]> {
  return await Drizzle.insert(groupUsers).values({
    groupId,
    userId,
  }).returning();
}

// Remove user from group
export async function removeUserFromGroup(groupId: string, userId: string) {
  return await Drizzle.delete(groupUsers)
    .where(
      and(eq(groupUsers.groupId, groupId), eq(groupUsers.userId, userId))
    );
}

// Add device to group
export async function addDeviceToGroup(groupId: string, deviceId: string) {
  return await Drizzle.insert(groupDevices).values({
    groupId,
    deviceId,
  }).returning();
}

// Remove device from group
export async function removeDeviceFromGroup(groupId: string, deviceId: string) {
  return await Drizzle.delete(groupDevices)
    .where(
      and(eq(groupDevices.groupId, groupId), eq(groupDevices.deviceId, deviceId))
    );
}

export async function createGroup(group: Omit<Group, 'id'> & { organizationId: string }): Promise<Group> {

  const newGroup: Group = await Drizzle.insert(groups).values({
    name: group.name,
    localisation: group.localisation,
    description: group.description,
    organizationId: group.organizationId,
  }).returning().then(results => results[0]);

  newGroup.users = [];
  newGroup.devices = [];
  return newGroup;
}

export async function deleteGroup(groupId: string): Promise<Group | null> {
  // First, retrieve the group to return later
  const groupToDelete = await Drizzle.select().from(groups).where(eq(groups.id, groupId)).then(results => results[0]);

  if (!groupToDelete) {
    return null;
  }

  await Drizzle.delete(groupUsers).where(eq(groupUsers.groupId, groupId));
  await Drizzle.delete(groupDevices).where(eq(groupDevices.groupId, groupId));

  // Delete the group itself
  await Drizzle.delete(groups).where(eq(groups.id, groupId));

  return groupToDelete;
}

export async function updateGroup(groupId: string, updates: Partial<Group>): Promise<Group | null> {
  const filteredUpdates: Record<string, unknown> = {};
  if (updates.name !== undefined) filteredUpdates['name'] = updates.name;
  if (updates.localisation !== undefined) filteredUpdates['localisation'] = updates.localisation;
  if (updates.description !== undefined) filteredUpdates['description'] = updates.description;

  if (Object.keys(filteredUpdates).length === 0) {
    throw new Error('No valid updates provided');
  }
  const [updatedGroup] = await Drizzle.update(groups)
    .set(filteredUpdates)
    .where(eq(groups.id, groupId))
    .returning();

  if (!updatedGroup) {
    return null;
  }

  // Fetch updated users and devices
  const groupUsersList = await getUsersForGroup(updatedGroup.id);
  const groupDevicesList = await getDevicesForGroup(updatedGroup.id);

  return {
    ...updatedGroup,
    users: groupUsersList,
    devices: groupDevicesList,
  };
}