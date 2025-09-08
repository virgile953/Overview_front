import { updateUser } from "@/models/server/users";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  const body = await request.json();

  try {
    const updatedUser = await updateUser(body);
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.error();
  }
}