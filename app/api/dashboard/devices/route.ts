"use server";
import { getDevicesStats } from "@/models/server/dashboard";
import { NextResponse } from "next/server";

export async function GET() {
  const devices = await getDevicesStats();
  return NextResponse.json(devices);
}

