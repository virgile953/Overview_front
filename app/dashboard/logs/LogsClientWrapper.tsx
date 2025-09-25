"use client";
import { Device } from "@/models/server/devices";
import { createContext, useContext, useState } from "react";
import { DateRange } from "react-day-picker";

interface LogsContextType {
  initialDevices?: Device[];
  devices?: Device[];
  setDevices: (devices: Device[]) => void;
  count: number;
  setCount: (count: number) => void;
  chartData: ChartData[];
  setChartData: (data: ChartData[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  dateRange?: DateRange;
  setDateRange: (range?: DateRange) => void;
}

type ChartData = {
  date: string;
  info: number;
  warning: number;
  error: number;
};

const LogsContext = createContext<LogsContextType | null>(null);

export const useLogsContext = () => {
  const context = useContext(LogsContext);
  if (!context) {
    throw new Error('useLogsContext must be used within LogsClientWrapper');
  }
  return context;
};

interface LogsClientWrapperProps {
  children: React.ReactNode;
  initialCount: number;
  initialChartData: ChartData[];
  initialDevices?: Device[];
}

export default function LogsClientWrapper({
  children,
  initialCount,
  initialChartData,
  initialDevices,
}: LogsClientWrapperProps) {
  const [count, setCount] = useState<number>(initialCount);
  const [chartData, setChartData] = useState<ChartData[]>(initialChartData);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: (() => {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d;
    })(),
    to: new Date(),
  })
  const [devices, setDevices] = useState<Device[] | undefined>(undefined);
  const contextValue = {
    initialDevices,
    count,
    setCount,
    chartData,
    setChartData,
    loading,
    setLoading,
    dateRange,
    setDateRange,
    devices,
    setDevices,
  };

  return (
    <LogsContext.Provider value={contextValue}>
      {children}
    </LogsContext.Provider>
  );
}