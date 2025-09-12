"use server";
import { NextResponse } from "next/server";
import { DeviceCacheManager } from "@/lib/deviceCacheManager";
import { getDevices } from "@/models/server/devices";

export async function GET() {
  try {
    const allCacheDevices = DeviceCacheManager.getAllDevices();
    const dbDevices = await getDevices();
    const cacheDeviceMACs = new Set(Array.from(allCacheDevices.keys()));
    const dbOnlyDevices = dbDevices.filter(device => !cacheDeviceMACs.has(device.macAddress));
    const stats = {
      ...DeviceCacheManager.getStats(),
      dbOnly: dbOnlyDevices.length
    };
    stats.total += dbOnlyDevices.length;
    stats.offline += dbOnlyDevices.length;

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard devices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

