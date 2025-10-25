import { twMerge } from 'tailwind-merge'
import { EllipsisVertical, SquareActivity, SquareArrowOutUpRight } from 'lucide-react';
import Link from 'next/link';
import { DeviceCacheManager } from '@/lib/deviceCacheManager';
import { getDevices } from '@/models/server/devices';

export default async function DevicesDashboard({ orgId, className }: { orgId: string; className?: string }) {
  const allCacheDevices = await DeviceCacheManager.getAll(orgId);
  const dbDevices = await getDevices();
  const cacheDeviceMACs = new Set(Array.from(allCacheDevices.keys()));
  const dbOnlyDevices = dbDevices.filter(device => !cacheDeviceMACs.has(device.macAddress));
  const stats = await {
    ...DeviceCacheManager.getStats(orgId),
    dbOnly: dbOnlyDevices.length
  };
  stats.total += dbOnlyDevices.length;
  stats.offline += dbOnlyDevices.length;

  return (
    <div className={twMerge("p-4 bg-sidebar-accent rounded-lg shadow-md", className)}>
      <div className="flex items-center mb-4">
        <SquareActivity className="text-emerald-400 mr-2" />
        <h2 className="text-lg font-semibold text-foreground">Devices</h2>
        <EllipsisVertical className="ml-auto text-foreground" />

      </div>
      {stats && (
        <>
          <div className="text-3xl font-bold text-foreground">{stats ? stats.total : 0}</div>
          <div className="mt-2 text-sm text-muted-foreground mb-4">Total Devices</div>
        </>
      )
      }
      {/* Status breakdown */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Link
          href="/dashboard/devices?status=online"
          className="relative bg-green-600/20 border border-green-600/30 p-2 rounded flex flex-col items-center hover:bg-green-600/30 transition-colors"
        >
          <span className="text-lg font-bold text-green-600 dark:text-green-400">
            {stats ? stats.online : 0}
          </span>
          <span className="text-xs text-green-600 dark:text-green-400">Online</span>
          <SquareArrowOutUpRight className="absolute bottom-2 right-2 text-green-600 dark:text-green-300" size={12} />

        </Link>

        <Link
          href="/dashboard/devices?status=offline"
          className="relative bg-red-600/20 border border-red-600/30 p-2 rounded flex flex-col items-center hover:bg-red-600/30 transition-colors"
        >
          <span className="text-lg font-bold text-red-600 dark:text-red-400">
            {stats ? stats.offline : 0}
          </span>
          <span className="text-xs text-red-500 dark:text-red-400">Offline</span>
          <SquareArrowOutUpRight className="absolute bottom-2 right-2 text-red-600 dark:text-red-300" size={12} />
        </Link>

        <Link
          href="/dashboard/devices?status=error"
          className="relative bg-yellow-600/20 border border-yellow-600/30 p-2 rounded flex flex-col items-center hover:bg-yellow-600/30 transition-colors"
        >
          <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
            {stats ? stats.cacheOnly : 0}
          </span>
          <span className="text-xs text-yellow-500 dark:text-yellow-400">Cache Only</span>
          <SquareArrowOutUpRight className="absolute bottom-2 right-2 text-yellow-600 dark:text-yellow-300" size={12} />
        </Link>
      </div>

    </div>
  );
}