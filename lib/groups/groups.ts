"use server";

import { eq, and } from "drizzle-orm";
import Drizzle from "../db/db";
import {
  Device,
  groups,
  groupDevices,
  groupUsers,
  users,
  devices,
  GroupWithRelations,
  GroupBase,
  UserBase,
} from "../db/schema";

async function getUsersForGroup(groupId: string): Promise<UserBase[]> {
  const groupUsersList: { user: UserBase }[] = await Drizzle.select({
    user: users,
  })
    .from(groupUsers)
    .innerJoin(users, eq(groupUsers.userId, users.id))
    .where(eq(groupUsers.groupId, groupId));

  return groupUsersList.map(gu => gu.user);
}

export async function getGroupsForUser(userId: string): Promise<GroupBase[]> {
  const userGroupList: {
    groups: GroupBase
  }[] = await Drizzle.select({
    groups: groups,
  })
    .from(groupUsers)
    .innerJoin(groups, eq(groupUsers.groupId, groups.id))
    .where(eq(groupUsers.userId, userId));

  return userGroupList.map(gu => gu.groups);
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

export async function getGroups(orgId: string): Promise<GroupWithRelations[]> {
  const orgGroups = await Drizzle.select()
    .from(groups)
    .where(eq(groups.organizationId, orgId));

  const groupsWithRelations = await Promise.all(
    orgGroups.map(async (group) => {
      const groupUsersList = await getUsersForGroup(group.id);
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

export async function removeUserFromGroup(groupId: string, userId: string) {
  return await Drizzle.delete(groupUsers)
    .where(
      and(eq(groupUsers.groupId, groupId), eq(groupUsers.userId, userId))
    );
}

export async function addDeviceToGroup(groupId: string, deviceId: string) {
  return await Drizzle.insert(groupDevices).values({
    groupId,
    deviceId,
  }).returning();
}

export async function removeDeviceFromGroup(groupId: string, deviceId: string) {
  return await Drizzle.delete(groupDevices)
    .where(
      and(eq(groupDevices.groupId, groupId), eq(groupDevices.deviceId, deviceId))
    );
}

export async function createGroup(group: Omit<GroupWithRelations, 'id' | "createdAt" | "updatedAt"> & { organizationId: string }): Promise<GroupWithRelations> {
  const [newGroup] = await Drizzle.insert(groups).values({
    name: group.name,
    localisation: group.localisation,
    description: group.description,
    organizationId: group.organizationId,
  }).returning();

  return {
    ...newGroup,
    users: [],
    devices: [],
  };
}

export async function deleteGroup(groupId: string): Promise<GroupBase | null> {
  const groupToDelete = await Drizzle.select().from(groups).where(eq(groups.id, groupId)).then(results => results[0]);

  if (!groupToDelete) {
    return null;
  }
  groupUsers
  await Drizzle.delete(groupUsers).where(eq(groupUsers.groupId, groupId));
  await Drizzle.delete(groupDevices).where(eq(groupDevices.groupId, groupId));

  await Drizzle.delete(groups).where(eq(groups.id, groupId));

  return groupToDelete;
}

export async function updateGroup(groupId: string, updates: Partial<GroupBase>): Promise<GroupWithRelations | null> {
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

  const groupUsersList = await getUsersForGroup(updatedGroup.id);
  const groupDevicesList = await getDevicesForGroup(updatedGroup.id);

  return {
    ...updatedGroup,
    users: groupUsersList,
    devices: groupDevicesList,
  };
}