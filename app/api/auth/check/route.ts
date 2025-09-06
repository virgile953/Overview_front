import { getLoggedInUser } from "@/models/server/auth";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await getLoggedInUser();

  return NextResponse.json({ authenticated: !!user });
}
