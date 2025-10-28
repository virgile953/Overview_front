"use server";
import Drizzle from "../db/db";
import { NewUsers, Users, users } from "../db/schema";
import { and, eq, count } from "drizzle-orm";

export async function getUsers(organizationId: string): Promise<Users[]> {
  const dbUsers = await Drizzle.select()
    .from(users)
    .where(eq(users.organizationId, organizationId));
  return dbUsers;
}

export async function getUserById(userId: string, organizationId: string): Promise<Users | null> {
  const dbUser = await Drizzle.select()
    .from(users)
    .where(
      and(
        eq(users.id, userId)
        , eq(users.organizationId, organizationId)
      ))
    .limit(1);
  return dbUser[0] || null;
}

export async function getUserByOnlyId(userId: string) {
  const dbUser = await Drizzle.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return dbUser[0] || null;
}

export async function getUserByEmail(email: string, organizationId: string): Promise<Users | null> {
  const dbUser = await Drizzle.select()
    .from(users)
    .where(
      and(
        eq(users.email, email),
        eq(users.organizationId, organizationId)
      ))
    .limit(1);
  return dbUser[0] || null;
}

export async function createUser(user: NewUsers, organizationId: string): Promise<Users | null> {
  if (user.organizationId !== organizationId) {
    user.organizationId = organizationId;
  }

  const res = await Drizzle.insert(users).values(user).returning();
  return res[0];
}

export async function deleteUser(userId: string, organizationId: string) {
  const res = await Drizzle.delete(users)
    .where(
      and(
        eq(users.id, userId),
        eq(users.organizationId, organizationId)
      ))
    .returning();
  return res[0] || null;
}

export async function updateUser(userId: string, userData: Omit<Users, "id">, organizationId: string): Promise<Users | null> {
  const res = await Drizzle.update(users)
    .set(userData)
    .where(and(eq(users.id, userId), eq(users.organizationId, organizationId)))
    .returning();
  return res[0] || null;
}

export async function getUserCount(organizationId: string) {
  const countResult = await Drizzle.select({
    count: count(users.id),
  })
    .from(users)
    .where(eq(users.organizationId, organizationId));
  return Number(countResult[0]?.count || 0);
}

