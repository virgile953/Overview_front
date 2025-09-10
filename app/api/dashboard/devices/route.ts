"use server";
import { NextResponse } from "next/server";
import { DeviceCacheManager } from "@/lib/deviceCacheManager";
import { getDevices } from "@/models/server/devices";

export async function GET() {

  const linkedDevices = DeviceCacheManager.getLinkedDevices();
  const dbDevices = await getDevices();

  const stats = DeviceCacheManager.getStats();
  console.log('Device stats for dashboard:', stats);
  return NextResponse.json(stats);
}

