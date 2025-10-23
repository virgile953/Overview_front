"use client";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getSocketUrl } from "@/lib/socketConfig";
import DeviceCard from "./DeviceCard";
import Legend from "./legend";
import { fetchDevices } from "./actions";
import { ApiDevice, DeviceResponse, singleDeviceResponse } from "@/lib/devices/devices";

export default function Devices() {
  const [deviceData, setDeviceData] = useState<DeviceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [recentlyUpdatedDevices, setRecentlyUpdatedDevices] = useState<Set<string>>(new Set());

  // const fetchDevices = async (isRefresh = false) => {
  //   try {
  //     if (isRefresh) {
  //       setRefreshing(true);
  //     } else {
  //       setLoading(true);
  //     }
  //     const res = await fetch("/api/device");
  //     if (!res.ok) {
  //       throw new Error(`HTTP error! status: ${res.status}`);
  //     }
  //     const data = await res.json();
  //     setDeviceData(data);
  //     setError(null);
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'Failed to fetch devices');
  //   } finally {
  //     setLoading(false);
  //     setRefreshing(false);
  //   }
  // };

  useEffect(() => {
    setLoading(true);
    fetchDevices();
    const newSocket = io(getSocketUrl());

    newSocket.on('devicesUpdated', (data: DeviceResponse) => {
      setDeviceData(data);
      setError(null);
    });

    newSocket.on('deviceUpdated', (data: singleDeviceResponse) => {
      setRecentlyUpdatedDevices(prev => new Set([...prev, data.deviceId]));
      setTimeout(() => {
        setRecentlyUpdatedDevices(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.deviceId);
          return newSet;
        });
      }, 150);

      setDeviceData(prevData => {
        if (!prevData) return prevData;

        const updatedDevices = [...prevData.devices];
        const deviceIndex = updatedDevices.findIndex(
          device => device.deviceId === data.deviceId || device.macAddress === data.macAddress
        );

        if (deviceIndex !== -1) {
          // Update existing device
          updatedDevices[deviceIndex] = {
            ...updatedDevices[deviceIndex],
            ...data,
            lastSeen: new Date(data.lastSeen),
            lastActive: new Date(data.lastActive),
            connectionStatus: data.connectionStatus,
            source: data.dbId ? 'database+cache' : 'cache-only'
          };
        } else {
          // Add new device if it doesn't exist
          const newDevice: ApiDevice = {
            id: data.dbId || "",
            deviceId: data.deviceId,
            name: data.name,
            type: data.type,
            status: data.status,
            location: data.location || "",
            ipAddress: data.ipAddress || "",
            macAddress: data.macAddress,
            serialNumber: data.serialNumber || "",
            firmwareVersion: data.firmwareVersion || "",
            lastActive: new Date(data.lastActive),
            organizationId: data.organizationId,
            lastSeen: new Date(data.lastSeen),
            connectionStatus: data.connectionStatus,
            source: data.dbId ? 'database+cache' : 'cache-only',
          };
          updatedDevices.push(newDevice);
        }

        const onlineCount = updatedDevices.filter(d => d.connectionStatus === 'online').length;
        const cacheOnlyCount = updatedDevices.filter(d => d.source === 'cache-only').length;
        const linkedToDbCount = updatedDevices.filter(d => d.deviceId).length;

        return {
          ...prevData,
          devices: updatedDevices,
          totalDevices: updatedDevices.length,
          stats: {
            ...prevData.stats,
            total: updatedDevices.length,
            online: onlineCount,
            offline: updatedDevices.length - onlineCount,
            linkedToDb: linkedToDbCount,
            cacheOnly: cacheOnlyCount
          }
        };
      });
      setLoading(false);
      setError(null);
    });

    newSocket.on('connect', () => {
      setIsSocketConnected(true);
    });
    newSocket.on('disconnect', () => {
      setIsSocketConnected(false);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <>
        <div className="flex flex-col">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="w-full">
                <h1 className="text-2xl font-bold text-foreground">Devices</h1>
                <div className="text-sm text-muted-foreground">
                  Total: 0 devices
                  <span className="ml-2">
                    (Online: 0, Cache-only: 0)
                  </span>
                </div>
              </div>
            </div>
            <Legend />

          </div>
        </div>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-foreground">Loading devices...</p>
          </div>
        </div></>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Devices</h1>
          <div className="text-sm text-muted-foreground">
            Total: {devices.length} devices
            {stats && (
              <span className="ml-2">
                (Online: {stats.online}, Cache-only: {stats.cacheOnly})
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">

          <div className="flex flex-col  sm:items-center ">
            <button
              onClick={async () => {
                setRefreshing(true);
                await fetchDevices()
                setRefreshing(false);
              }}
              disabled={refreshing}
              className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isSocketConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-xs text-muted-foreground">
                {isSocketConnected ? 'Real-time' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No devices found</p>
        </div>
      ) : (
        <>
          <Legend />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {devices.map((device) => (
              <div
                key={device.deviceId || device.id}
                className={`transition-all rounded-lg duration-200 ${recentlyUpdatedDevices.has(device.id!)
                  ? 'ring-2 ring-emerald-400 ring-opacity-75 shadow-lg'
                  : ''
                  }`}
              >
                <DeviceCard
                  device={device}
                  onDeviceAdded={async () => {
                    setRefreshing(true);
                    await fetchDevices()
                    setRefreshing(false);
                  }}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
