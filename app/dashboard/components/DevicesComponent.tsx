"use client";
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge'
import { DeviceStatusResponse } from '@/app/api/dashboard/devices/route';
import { SquareActivity, SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';



// export interface DeviceStatusResponse {
//   online: number;
//   offline: number;
//   error: number;
// }

export default function DevicesDashboard({ className }: { className?: string }) {
  const [devicesStatus, setDevicesStatus] = useState<DeviceStatusResponse | null>(null);
  useEffect(() => {
    async function fetchStatus() {
      const res = await fetch('/api/dashboard/devices');
      if (res.ok) {
        const data = await res.json();
        setDevicesStatus(data);
      }
    }
    fetchStatus();
  }, []);
  return (
    <div
      className={twMerge(
        "h-full w-full p-2 border border-gray-300 rounded-lg shadow-sm",
        className)}
    >
      <div className="flex items-center mb-2 justify-between">
        <div className="text-xl">Devices status</div>
        <SquareActivity size={36} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {/* Online */}
        <Link className="bg-green-100 p-4 rounded-lg flex flex-col items-center"
          href={'/dashboard/devices?status=online'}>
          <SquareArrowOutUpRight color='green' className='place-self-end -mb-5' size={16} />
          <span className="text-2xl font-bold text-green-700">
            {devicesStatus ? devicesStatus.online :
              <span className="animate-pulse bg-green-300 rounded w-10 h-8 block" />}
          </span>
          <span className="text-sm text-green-600">Online</span>
        </Link>
        {/* Offline */}
        <Link className="bg-red-100 p-4 rounded-lg flex flex-col items-center"
          href={'/dashboard/devices?status=offline'}>
          <SquareArrowOutUpRight color='red' className='place-self-end -mb-5' size={16} />
          <span className="text-2xl font-bold text-red-700">
            {devicesStatus ? devicesStatus.offline :
              <span className="animate-pulse bg-red-300 rounded w-10 h-8 block" />}
          </span>
          <span className="text-sm text-red-600">Offline</span>
        </Link>
        {/* Error */}
        <Link className="bg-yellow-100 p-4 rounded-lg flex flex-col items-center"
          href={'/dashboard/devices?status=error'}>
          <SquareArrowOutUpRight color='orange' className='place-self-end -mb-5' size={16} />
          <span className="text-2xl font-bold text-yellow-700">
            {devicesStatus ? devicesStatus.error :
              <span className="animate-pulse bg-yellow-300 rounded w-10 h-8 block" />}
          </span>
          <span className="text-sm text-yellow-600">Error</span>
        </Link>
      </div>
    </div>
  );
}