"use client";
import { Device } from "@/models/server/devices";
import { useEffect, useState } from "react";
import DeviceCard from "./DeviceCard";

// Extended device type that includes additional API response fields
export interface ApiDevice extends Device {
  deviceId: string;
  lastSeen: string;
  connectionStatus: string;
}

interface DeviceResponse {
  devices?: ApiDevice[];
  totalDevices?: number;
}

export default function Devices() {
  const [deviceData, setDeviceData] = useState<DeviceResponse | ApiDevice[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDevices = async ( ) => {
    try {
      const res = await fetch("/api/device");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setDeviceData(data);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchDevices, 5 * 1000); // Refresh every 5 seconds
    fetchDevices(); // Initial load
    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading devices...</p>
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

  // Handle both array response and object response
  let devices: ApiDevice[] = [];
  if (Array.isArray(deviceData)) {
    devices = deviceData;
  } else if (deviceData && 'devices' in deviceData && deviceData.devices) {
    devices = deviceData.devices;
  }

  return (
    <div className="space-y-6">
      {/* Loading Bar */}
      <div className={`h-1 bg-gray-200 rounded-full overflow-hidden transition-opacity duration-300 ${refreshing ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full animate-loading-bar"></div>
      </div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-200">Devices</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            Total: {devices.length} devices
          </div>
          <button
            onClick={fetchDevices}
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {devices.map((device) => (
            <DeviceCard key={device.deviceId || device.$id} device={device} />
          ))}
        </div>
      )}
    </div>
  );
}
