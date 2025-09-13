"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getSocketUrl } from "@/lib/socketConfig";
import DeviceCard from "./DeviceCard";
import { ApiDevice, DeviceResponse } from "@/app/api/device/route";

export default function Devices() {
  const [deviceData, setDeviceData] = useState<DeviceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);

  const fetchDevices = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      const res = await fetch("/api/device");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setDeviceData(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDevices(false);

    // Use the utility function for consistent Socket.IO URL
    const newSocket = io(getSocketUrl());

    newSocket.on('devicesUpdated', (data: DeviceResponse) => {
      setDeviceData(data);
      setError(null);
    });

    newSocket.on('connect', () => {
      setIsSocketConnected(true);
    });
    newSocket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-foreground">Loading devices...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error loading devices</h3>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  const devices: ApiDevice[] = deviceData?.devices || [];
  const stats = deviceData?.stats;

  return (
    <div className="space-y-6">
      {/* Loading Bar */}
      <div className={`h-1 bg-gray-200 rounded-full overflow-hidden transition-opacity duration-300 ${refreshing ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full animate-loading-bar"></div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-foreground">Devices</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-muted-foreground">
              {isSocketConnected ? 'Real-time updates' : 'Disconnected'}
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Total: {devices.length} devices
            {stats && (
              <span className="ml-2">
                (Online: {stats.online}, Cache-only: {stats.cacheOnly})
              </span>
            )}
          </div>
          <button
            onClick={() => fetchDevices(true)}
            disabled={refreshing}
            className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No devices found</p>
        </div>
      ) : (
        <>
          {/* Legend */}
          <div className="bg-sidebar-accent border border-border rounded-lg p-4 mb-4">
            <h3 className="text-sm font-medium text-foreground mb-2">Device Status Legend:</h3>
            <div className="flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border bg-emerald-600/50 border-emerald-600 rounded"></div>
                <span className="text-muted-foreground">Database + Live (Recently active)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border bg-blue-600/50 border-blue-600 rounded"></div>
                <span className="text-muted-foreground">Database only (Offline)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 border bg-yellow-600/50 border-yellow-600 rounded"></div>
                <span className="text-muted-foreground">Cache only (Not in database)</span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => (
              <DeviceCard
                key={device.deviceId || device.$id}
                device={device}
                onDeviceAdded={() => fetchDevices(true)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
