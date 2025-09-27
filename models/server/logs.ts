"use server";
import { deviceLogs } from '../../drizzle/schema';
import Drizzle from '../../lib/db/db';
import { eq, desc, count, and, inArray } from "drizzle-orm";
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

function postgresNow(date: Date): string {
  const iso = date.toISOString();
  const [dateSplit, timeSplit] = iso.split("T");
  const [hms, msZ] = timeSplit.split(".");
  const ms = (msZ || "0Z").replace("Z", "");
  const micros = (ms + "000000").slice(0, 6);
  return `${dateSplit} ${hms}.${micros}+00`;
}


export async function getLogCount(deviceId?: string): Promise<number> {
  const result = await Drizzle.select({ count: count() }).from(deviceLogs).where(deviceId ? eq(deviceLogs.deviceId, deviceId) : undefined);
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

export async function getLogsForChart(startDate: Date, endDate: Date, interval: sourceTime = "hour", deviceIds?: string[]): Promise<{
  date: string,
  info: number,
  warning: number,
  error: number,
}[]> {
  const whereClauses = [
    sql`${deviceLogs.createdAt} <= ${sql.raw(`'${postgresNow(endDate)}'`)}`,
    sql`${deviceLogs.createdAt} >= ${sql.raw(`'${postgresNow(startDate)}'`)}`
  ];

  if (deviceIds && deviceIds.length > 0) {
    whereClauses.push(inArray(deviceLogs.deviceId, deviceIds));
  }
  const req = Drizzle
    .select({
      hour: sql<string>`DATE_TRUNC(${sql.raw(`'${interval}'`)}, ${deviceLogs.createdAt})::text`,
      level: deviceLogs.level,
      count: sql<number>`COUNT(*)::int`
    })
    .from(deviceLogs)
    .where(and(...whereClauses))
    .groupBy(
      sql`DATE_TRUNC(${sql.raw(`'${interval}'`)}, ${deviceLogs.createdAt})`,
      deviceLogs.level
    )
    .orderBy(sql`DATE_TRUNC(${sql.raw(`'${interval}'`)}, ${deviceLogs.createdAt}) ASC`);

  const results = await req;
  const timeData: Record<string, { info: number; warning: number; error: number; }> = {};

  const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const spansMultipleDays = daysDifference > 1;

  for (const row of results) {
    const date = new Date(row.hour);
    let timeKey: string;

    switch (interval) {
      case 'second':
        timeKey = date.toLocaleString("fr-FR", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false
        });
        break;
      case 'minute':
        if (spansMultipleDays) {
          timeKey = date.toLocaleString("fr-FR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          });
        } else {
          timeKey = date.toLocaleString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
          });
        }
        break;
      case 'hour':
        if (spansMultipleDays) {
          // Include the date when spanning multiple days
          timeKey = date.toLocaleString("fr-FR", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            hour12: false
          });
        } else {
          // Only show the hour for single day
          timeKey = date.toLocaleString("fr-FR", {
            hour: "2-digit",
            hour12: false
          });
        }
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
          month: "short",
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
