import { NextResponse } from "next/server";
import { getGroups, addGroup } from "@/models/server/groups";


export async function GET() {
  const groups = await getGroups();
  return NextResponse.json(groups);
}

export async function POST(request: Request) {
  try {
    const { name, localisation, description, users, devices } = await request.json();
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ error: 'Invalid group name' }, { status: 400 });
    }
    const newGroup = await addGroup({ name, localisation, description, users, devices });
    return NextResponse.json(newGroup, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}