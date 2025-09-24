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

type sourceTime = "millennium" | "century" | "decade" | "year" | "quarter" | "month" | "week" | "day" | "hour" | "minute" | "second" | "milliseconds" | "microseconds"

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

export async function getLogsForChart(startDate: Date, endDate: Date, period: number = 24, interval: sourceTime = "hour"): Promise<{
  date: string,
  info: number,
  warning: number,
  error: number,
}[]> {
  const results = await Drizzle
    .select({
      hour: sql<string>`DATE_TRUNC(${sql.raw(`'${interval}'`)}, ${deviceLogs.createdAt})::text`,
      level: deviceLogs.level,
      count: sql<number>`COUNT(*)::int`
    })
    .from(deviceLogs)
    .where(sql`${deviceLogs.createdAt} >= NOW() - INTERVAL ${sql.raw(`'${period} ${interval + 's'}'`)}`)
    .groupBy(
      sql`DATE_TRUNC(${sql.raw(`'${interval}'`)}, ${deviceLogs.createdAt})`,
      deviceLogs.level
    )
    .orderBy(sql`DATE_TRUNC(${sql.raw(`'${interval}'`)}, ${deviceLogs.createdAt}) ASC`);

  const timeData: Record<string, { info: number; warning: number; error: number; }> = {};

  for (const row of results) {
    const date = new Date(row.hour);
    let timeKey: string;

    // Format the time key based on the interval granularity
    switch (interval) {
      case 'second':
        timeKey = date.toLocaleString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        });
        break;
      case 'minute':
        timeKey = date.toLocaleString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        });
        break;
      case 'hour':
        timeKey = date.toLocaleString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        });
        break;
      case 'day':
        timeKey = date.toLocaleString("fr-FR", {
          month: "short",
          day: "numeric"
        });
        break;
      case 'week':
        timeKey = date.toLocaleString("fr-FR", {
          month: "short",
          day: "numeric"
        }) + ` (Week)`;
        break;
      case 'month':
        timeKey = date.toLocaleString("fr-FR", {
          month: "long",
          year: "numeric"
        });
        break;
      case 'year':
        timeKey = date.toLocaleString("fr-FR", {
          year: "numeric"
        });
        break;
      default:
        timeKey = date.toLocaleString("fr-FR", {
          day: "numeric",
          hour: "2-digit",
          hour12: false
        });
    }

    if (!timeData[timeKey]) {
      timeData[timeKey] = { info: 0, warning: 0, error: 0 };
    }

    if (row.level in timeData[timeKey]) {
      timeData[timeKey][row.level as keyof typeof timeData[string]] = row.count;
    }
  }

  return Object.entries(timeData).map(([date, counts]) => ({
    date,
    ...counts
  }));
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
