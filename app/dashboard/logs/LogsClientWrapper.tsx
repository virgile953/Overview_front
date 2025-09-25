"use client";
import { createContext, useContext, useState } from "react";

interface LogsContextType {
  count: number;
  setCount: (count: number) => void;
  chartData: ChartData[];
  setChartData: (data: ChartData[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
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
}

export default function LogsClientWrapper({ 
  children, 
  initialCount, 
  initialChartData 
}: LogsClientWrapperProps) {
  const [count, setCount] = useState<number>(initialCount);
  const [chartData, setChartData] = useState<ChartData[]>(initialChartData);
  const [loading, setLoading] = useState(false);

  const contextValue = {
    count,
    setCount,
    chartData,
    setChartData,
    loading,
    setLoading,
  };

  return (
    <LogsContext.Provider value={contextValue}>
      {children}
    </LogsContext.Provider>
  );
}