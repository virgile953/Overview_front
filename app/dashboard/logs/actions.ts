import { getLogCount, getLogsForChart } from "@/models/server/logs";

export async function fetchLogCount(): Promise<number> {
  return await getLogCount();
}

export async function fetchLogsForChart(
  startDate: Date,
  endDate: Date,
  interval: "hour" | "day" | "week" | "month" = "hour",
  deviceIds?: string[]
) {
  return await getLogsForChart(startDate, endDate, interval, deviceIds);
}