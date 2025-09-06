import { NextResponse } from "next/server";
import { getLoggedInUser } from "@/models/server/auth";

export async function POST() {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}
