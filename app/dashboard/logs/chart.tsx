"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";

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
  ok: {
    label: "Success",
    color: "#10b981",
  },
} satisfies ChartConfig;

type ChartData = {
  date: string;
  info: number;
  warning: number;
  error: number;
};

type LogChartProps = {
  data: ChartData[];
}

export default function LogChart({ data }: LogChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-muted-foreground">
        No data available for chart
      </div>
    );
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Log Activity Over Time</h3>
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
              <linearGradient id="colorOk" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
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
              dataKey="ok"
              stackId="1"
              stroke="#10b981"
              fill="url(#colorOk)"
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
              stackId="1"
              stroke="#f59e0b"
              fill="url(#colorWarning)"
            />
            <Area
              type="monotone"
              dataKey="error"
              stackId="1"
              stroke="#ef4444"
              fill="url(#colorError)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}