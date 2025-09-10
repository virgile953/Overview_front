"use server";
import { NextResponse } from "next/server";
import { DeviceCacheManager } from "@/lib/deviceCacheManager";

export async function GET() {
  const stats = DeviceCacheManager.getStats();
  console.log('Device stats for dashboard:', stats);
  return NextResponse.json(stats);
}

