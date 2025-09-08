import { updateUser } from "@/models/server/users";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;
  console.log(userId);

  try {
    const user = await request.json();
    if (!user.$id || typeof user.$id !== 'string') {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }
    const updatedUser = await updateUser(user);
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}