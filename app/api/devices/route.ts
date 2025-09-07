"use server";
import { getDevices } from "@/models/server/devices";
import { NextResponse } from "next/server";

export async function GET() {
  const devices = await getDevices();
  return NextResponse.json(devices); 
}
