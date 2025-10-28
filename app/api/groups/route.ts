import { auth } from "@/lib/auth";
import { createGroup, deleteGroup, getGroups } from "@/lib/groups/groups";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return new Response(JSON.stringify({ error: "No active organization" }), { status: 400 });
  }

  try {
    const groupsData = await getGroups(organizationId);
    return new Response(JSON.stringify(groupsData), { status: 200 });
  } catch (error) {
    console.error("Error fetching groups:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch groups" }),
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const organizationId = session.session.activeOrganizationId;
  if (!organizationId) {
    return NextResponse.json({ error: "No active organization" }, { status: 400 });
  }

  try {
    const { name, localisation, description, users, devices } = await request.json();
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Invalid group name' }, { status: 400 });
    }
    const newGroup = await createGroup({
      name, localisation, description, users, devices, organizationId,
    });
    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 });
    }
    const deletedGroup = await deleteGroup(id);
    if (!deletedGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    return NextResponse.json(deletedGroup);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}