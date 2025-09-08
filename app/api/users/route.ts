import { addUser, getUsers } from "@/models/server/users";
import { NextResponse } from "next/server";

export async function GET() {
  const users = await getUsers();
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const data = await request.json();
  if (!data.name || !data.email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
  }
  try {
    const newUser = await addUser(data);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}

