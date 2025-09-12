import { NextResponse } from "next/server";
import { getLoggedInUser, createSessionClient } from "@/models/server/auth";

export async function GET() {
  const user = await getLoggedInUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  return NextResponse.json({ user });
}

export async function PUT(request: Request) {
  try {
    const sessionClient = await createSessionClient();
    if (!sessionClient) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { prefs } = body;

    if (!prefs || typeof prefs !== 'object') {
      return NextResponse.json({ error: "Invalid preferences data" }, { status: 400 });
    }

    const { account } = sessionClient;
    const updatedUser = await account.updatePrefs(prefs);
    
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 });
  }
}
