import { getUsersStats } from "@/models/server/dashboard";
import { NextResponse } from "next/server";


export async function GET() {
  const users = await getUsersStats();
  return NextResponse.json(users);
}