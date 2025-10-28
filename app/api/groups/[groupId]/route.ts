import { updateGroup } from "@/lib/groups/groups";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { }: { params: Promise<{ groupId: string }> }
) {

  try {
    const { id, name, localisation, description, users, devices } = await request.json();
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Invalid group ID' }, { status: 400 });
    }
    const updatedGroup = await updateGroup(id, { name, localisation, description });
    if (!updatedGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }
    return NextResponse.json(updatedGroup);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}