"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useLogsContext } from "./LogsClientWrapper";

const chartConfig = {
  info: {
    label: "Info",
    color: "#3b82f6",
  },
  warning: {
    label: "Warning",
    color: "#f59e0b",
  },
  error: {
    label: "Error",
    color: "#ef4444",
  },
} satisfies ChartConfig;

export type ChartData = {
  date: string;
  info: number;
  warning: number;
  error: number;
};


export default function LogChart() {

  const { chartData, isLoadingChartData } = useLogsContext();

  if (isLoadingChartData) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        Loading chart data...
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No data available for chart
      </div>
    );
  }


  return (
    <div className="w-full max-h-[400px]">

      <ChartContainer config={chartConfig} className="h-full max-h-[400px] w-full">
        <ResponsiveContainer width="100%" height={"100%"}>
        <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorInfo" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
            labelFormatter={(value) => `Time: ${value}`}
            formatter={(value: number, name: string) => [
              `${value} ${name}${value !== 1 ? 's' : ''}`,
              chartConfig[name as keyof typeof chartConfig]?.label || name
            ]}
          />
          <Area
            type="monotone"
            dataKey="info"
            stackId="1"
            stroke="#3b82f6"
            fill="url(#colorInfo)"
          />
          <Area
            type="monotone"
            dataKey="warning"
            stackId="2"
            stroke="#f59e0b"
            fill="url(#colorWarning)"
          />
          <Area
            type="monotone"
            dataKey="error"
            stackId="3"
            stroke="#ef4444"
            fill="url(#colorError)"
          />
        </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}