import Drizzle from "../db/db";
import { Users, users } from "../db/schema";
import { and, eq, count } from "drizzle-orm";

export async function getUsers(organizationId: string) {
  const dbUsers = await Drizzle.select()
    .from(users)
    .where(eq(users.organizationId, organizationId));
  return dbUsers;
}

export async function getUserById(userId: string, organizationId: string) {
  const dbUser = await Drizzle.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  return dbUser[0] || null;
}

export async function getUserByEmail(email: string, organizationId: string) {
  const dbUser = await Drizzle.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return dbUser[0] || null;
}

export async function createUser(userData: {
  name: string;
  email: string;
  function: string;
  lastName: string;
  service: string;
}, organizationId: string) {
  const res = await Drizzle.insert(users).values({ ...userData, organizationId }).returning();
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

export async function updateUser(userId: string, userData: Omit<Users, "id">, organizationId: string) {
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

