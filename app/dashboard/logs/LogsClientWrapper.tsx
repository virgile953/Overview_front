"use client";
import { Device } from "@/models/server/devices";
import { createContext, useContext, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import { fetchLogsForChart } from "./actions";

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
  isLoadingChartData: boolean;
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
  initialDevices?: Device[];
}

export default function LogsClientWrapper({
  children,
  initialCount,
  initialDevices,
}: LogsClientWrapperProps) {
  const [count, setCount] = useState<number>(initialCount);
  const [chartData, setChartData] = useState<ChartData[]>([]);
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
  const [isLoadingChartData, setIsLoadingChartData] = useState(true);
  useEffect(() => {
    if (dateRange && dateRange.from && dateRange.to) {
      setIsLoadingChartData(true);

      fetchLogsForChart(dateRange.from, dateRange.to, "hour", devices?.map(d => d.$id)).then(data => {
        console.log(data.length);
        setChartData(data);
      });
    }
    setIsLoadingChartData(false);

  }, [dateRange, devices]);

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
    isLoadingChartData,
  };

  return (
    <LogsContext.Provider value={contextValue}>
      {children}
    </LogsContext.Provider>
  );
}