"use server";
import { deviceLogs } from '../../drizzle/schema';
import Drizzle from '../../lib/db/db';
import { eq, desc, count } from "drizzle-orm";
import { sql } from "drizzle-orm";

export interface DeviceLog {
  id: string;
  createdAt: Date;
  device: string;
  status: string | 'info' | 'warning' | 'error';
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

export async function getLogsForChart(): Promise<{
  date: string,
  info: number,
  warning: number,
  error: number,
}[]> {
  // Use SQL to properly group by hour and count log levels
  const results = await Drizzle
    .select({
      hour: sql<string>`DATE_TRUNC('hour', ${deviceLogs.createdAt})::text`,
      level: deviceLogs.level,
      count: sql<number>`COUNT(*)::int`
    })
    .from(deviceLogs)
    .where(sql`${deviceLogs.createdAt} >= NOW() - INTERVAL '24 hours'`) // Last 24 hours
    .groupBy(
      sql`DATE_TRUNC('hour', ${deviceLogs.createdAt})`,
      deviceLogs.level
    )
    .orderBy(sql`DATE_TRUNC('hour', ${deviceLogs.createdAt}) DESC`);

  // Group the results by hour and aggregate counts by level
  const hourlyData: Record<string, { info: number; warning: number; error: number; }> = {};

  for (const row of results) {
    const hour = new Date(row.hour).toLocaleString("fr-FR", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      hour12: false
    });

    if (!hourlyData[hour]) {
      hourlyData[hour] = { info: 0, warning: 0, error: 0 };
    }

    // Add count for the specific level
    if (row.level in hourlyData[hour]) {
      hourlyData[hour][row.level as keyof typeof hourlyData[string]] = row.count;
    }
  }

  // Convert to array format for the chart
  return Object.entries(hourlyData).map(([date, counts]) => ({
    date,
    ...counts
  })).reverse(); // Show chronologically (oldest to newest)
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
