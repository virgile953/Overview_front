"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getSocketUrl } from "@/lib/socketConfig";
import DeviceCard from "./DeviceCard";
import Legend from "./legend";
import { ApiDevice, DeviceResponse, singleDeviceResponse } from "@/lib/devices/devices";
import { Device } from "@/lib/db/schema";
import { fetchDevices } from "./actions";

interface DevicesClientProps {
  initialDevices: Map<string, {
    device: Partial<Device>;
    lastSeen: Date;
    status: 'online' | 'offline';
  }>;
  organizationId: string;
}


function parseInitialDevices(initialDevices: Map<string, {
  device: Partial<Device>;
  lastSeen: Date;
  status: 'online' | 'offline';
}>): DeviceResponse {
  const devices = Array.from(initialDevices.values()).map(data => ({
    deviceId: data.device.macAddress!,
    ...data.device,
    lastSeen: data.lastSeen,
    connectionStatus: data.status,
    source: data.device.id ? ('database+cache' as const) : ('cache-only' as const),
  }));

  return {
    devices,
    totalDevices: devices.length,
    cacheCount: devices.filter(d => !d.id).length,
    dbCount: devices.filter(d => d.id).length,
    stats: {
      total: devices.length,
      online: devices.filter(d => d.connectionStatus === 'online').length,
      offline: devices.filter(d => d.connectionStatus === 'offline').length,
      linkedToDb: devices.filter(d => d.id).length,
      cacheOnly: devices.filter(d => !d.id).length,
    },
  };
}

export function DevicesClient({ initialDevices, organizationId }: DevicesClientProps) {
  const [deviceData, setDeviceData] = useState<DeviceResponse>(parseInitialDevices(initialDevices));

  const [refreshing, setRefreshing] = useState(false);
  const [isSocketConnected, setIsSocketConnected] = useState(false);
  const [recentlyUpdatedDevices, setRecentlyUpdatedDevices] = useState<Set<string>>(new Set());

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const response = await fetchDevices();
      setDeviceData(
        parseInitialDevices(response)
      );
    } catch (error) {
      console.error('Failed to refresh devices:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const socket: Socket = io(getSocketUrl());

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsSocketConnected(true);
      // Join organization room
      socket.emit('join-organization', organizationId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsSocketConnected(false);
    });

    // Handle full device list updates
    socket.on('devicesUpdated', (data: DeviceResponse) => {
      console.log('Devices updated:', data);
      setDeviceData(data);
    });

    // Handle individual device updates
    socket.on('deviceUpdated', (data: singleDeviceResponse) => {
      console.log('Device updated:', data);

      // Flash animation
      setRecentlyUpdatedDevices(prev => new Set([...prev, data.deviceId]));
      setTimeout(() => {
        setRecentlyUpdatedDevices(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.deviceId);
          return newSet;
        });
      }, 150);

      setDeviceData(prevData => {
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
            lastActive: data.lastActive,
            connectionStatus: data.connectionStatus,
            source: data.dbId ? 'database+cache' : 'cache-only'
          };
        } else {
          // Add new device
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
            lastActive: data.lastActive,
            organizationId: data.organizationId,
            lastSeen: new Date(data.lastSeen),
            connectionStatus: data.connectionStatus,
            source: data.dbId ? 'database+cache' : 'cache-only',
          };
          updatedDevices.push(newDevice);
        }

        // Recalculate stats
        const onlineCount = updatedDevices.filter(d => d.connectionStatus === 'online').length;
        const cacheOnlyCount = updatedDevices.filter(d => d.source === 'cache-only').length;
        const linkedToDbCount = updatedDevices.filter(d => d.id).length;

        return {
          ...prevData,
          devices: updatedDevices,
          totalDevices: updatedDevices.length,
          stats: {
            total: updatedDevices.length,
            online: onlineCount,
            offline: updatedDevices.length - onlineCount,
            linkedToDb: linkedToDbCount,
            cacheOnly: cacheOnlyCount
          }
        };
      });
    });

    return () => {
      socket.emit('leave-organization', organizationId);
      socket.disconnect();
    };
  }, [organizationId]);

  const devices = deviceData.devices;
  const stats = deviceData.stats;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Devices</h1>
          <div className="text-sm text-muted-foreground">
            Total: {devices.length} devices
            <span className="ml-2">
              (Online: {stats.online}, Cache-only: {stats.cacheOnly})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col sm:items-center">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <div className="flex items-center gap-2 mt-1">
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
                  onDeviceAdded={handleRefresh}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
