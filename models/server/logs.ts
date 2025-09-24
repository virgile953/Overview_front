"use server";
import { deviceLogs } from '../../drizzle/schema';
import Drizzle from '../../lib/db/db';
import { eq, desc, count } from "drizzle-orm";

export interface DeviceLog {
  id: string;
  createdAt: Date;
  device: string;
  status: string | 'info' | 'warning' | 'error' | 'ok';
  message: string;
  latency: number;
}

export async function getLogCount(): Promise<number> {
  const result = await Drizzle.select({ count: count() }).from(deviceLogs);
  return Number(result[0].count);
}

export async function getAllLogs(max?: number): Promise<DeviceLog[]> {
  const query = Drizzle.select().from(deviceLogs).orderBy(desc(deviceLogs.createdAt));
  if (max) query.limit(max);

  const results = await query;
  const logs: DeviceLog[] = [];

  for (const row of results) {
    logs.push({
      id: row.id,
      createdAt: new Date(row.createdAt),
      device: row.deviceId,
      status: row.level,
      message: row.message,
      latency: row.latency,
    });
  }

  return logs;
}

export async function getDeviceLogs(deviceId: string, max = 100): Promise<DeviceLog[]> {
  const results = await Drizzle
    .select()
    .from(deviceLogs)
    .where(eq(deviceLogs.deviceId, deviceId))
    .orderBy(desc(deviceLogs.createdAt))
    .limit(max);

  const logs: DeviceLog[] = [];

  for (const row of results) {
    logs.push({
      id: row.id,
      createdAt: new Date(row.createdAt),
      device: row.deviceId,
      status: row.level,
      message: row.message,
      latency: row.latency,
    });
  }

  return logs;
}

export async function addDeviceLog(log: Omit<DeviceLog, "id" | "createdAt">): Promise<DeviceLog> {
  const [created] = await Drizzle.insert(deviceLogs).values({
    deviceId: log.device,
    level: log.status,
    message: log.message,
    latency: log.latency,
  }).returning();

  return {
    id: created.id,
    createdAt: new Date(created.createdAt),
    device: created.deviceId,
    status: created.level,
    message: created.message,
    latency: created.latency,
  };
}
