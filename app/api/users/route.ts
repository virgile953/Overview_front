import { auth } from "@/lib/auth";
import Drizzle from "@/lib/db/db";
import { users, groupUsers, NewUsers } from "@/lib/db/schema";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return new Response(JSON.stringify({ error: "No active organization" }), { status: 400 });
  }

  try {
    const allUsers = await Drizzle.select()
      .from(users)
      .where(eq(users.organizationId, organizationId));

    return new Response(JSON.stringify(allUsers), { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch users" }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return new Response(JSON.stringify({ error: "No active organization" }), { status: 400 });
  }

  try {
    const body = await request.json();
    const { groupIds, ...userData } = body;

    // Create user
    const newUser: NewUsers = {
      ...userData,
      organizationId,
    };

    const [createdUser] = await Drizzle.insert(users).values(newUser).returning();

    // Associate user with groups
    if (groupIds && groupIds.length > 0) {
      const groupUserRecords = groupIds.map((groupId: string) => ({
        groupId,
        userId: createdUser.id,
      }));

      await Drizzle.insert(groupUsers).values(groupUserRecords);
    }

    return new Response(JSON.stringify(createdUser), { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return new Response(
      JSON.stringify({ error: "Failed to create user" }),
      { status: 500 }
    );
  }
}

