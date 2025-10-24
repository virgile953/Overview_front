import { auth } from "@/lib/auth";
import { DeviceCacheManager } from "@/lib/deviceCacheManager";
import { headers } from "next/headers";
import { RefreshButton } from "./refresh-button";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CacheManagementPage() {

  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    return <></>
  }

  const cachedDevices = await DeviceCacheManager.getAll(session.session.activeOrganizationId!);
  const stats = await DeviceCacheManager.getStats(session.session.activeOrganizationId!);
  const cacheInfo = await DeviceCacheManager.getCacheInfo();

  console.log("Cache Backend:", cacheInfo);
  console.log("Cached Devices Count:", cachedDevices.size);
  console.log("Cache Stats:", stats);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Device Cache Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Backend: <span className="font-mono">{cacheInfo.backend}</span>
            {cacheInfo.backend === 'redis' && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                Connected
              </span>
            )}
          </p>
        </div>
        <RefreshButton />
      </div>
      <p className="mb-6">Manage and monitor the device cache settings and status for organization: {session.session.activeOrganizationId}</p>
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 bg-card rounded-lg border">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <div className="text-sm text-muted-foreground">Online</div>
            <div className="text-2xl font-bold text-green-600">{stats.online}</div>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <div className="text-sm text-muted-foreground">Offline</div>
            <div className="text-2xl font-bold text-gray-600">{stats.offline}</div>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <div className="text-sm text-muted-foreground">In Database</div>
            <div className="text-2xl font-bold text-blue-600">{stats.linkedToDb}</div>
          </div>
          <div className="p-4 bg-card rounded-lg border">
            <div className="text-sm text-muted-foreground">Cache Only</div>
            <div className="text-2xl font-bold text-orange-600">{stats.cacheOnly}</div>
          </div>
        </div>

        {/* Devices List */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Cached Devices ({cachedDevices.size})</h2>
          {cachedDevices.size === 0 ? (
            <div className="p-8 bg-card rounded-lg border text-center text-muted-foreground">
              No devices in cache for this organization
            </div>
          ) : (
            <div className="grid gap-4">
              {Array.from(cachedDevices.entries()).map(([macAddress, device]) => (
                <div key={macAddress} className="p-4 bg-card rounded-lg border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{device.device.name}</h3>
                        <span className={`px-2 py-1 text-xs rounded-full ${device.status === 'online'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                          }`}>
                          {device.status}
                        </span>
                        {device.device.id ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">
                            DB Linked
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100">
                            Cache Only
                          </span>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <div><span className="font-medium">MAC:</span> {device.device.macAddress}</div>
                        <div><span className="font-medium">Type:</span> {device.device.type}</div>
                        {device.device.ipAddress && (
                          <div><span className="font-medium">IP:</span> {device.device.ipAddress}</div>
                        )}
                        {device.device.location && (
                          <div><span className="font-medium">Location:</span> {device.device.location}</div>
                        )}
                        <div><span className="font-medium">Last Seen:</span> {new Date(device.lastSeen).toLocaleString()}</div>
                        <div><span className="font-medium">Last Active:</span> {device.device.lastActive?.toLocaleString()}</div>
                        {device.device.id && (
                          <div><span className="font-medium">DB ID:</span> {device.device.id}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cache Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Cache Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-medium mb-2">Clear Cache</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Remove all cached devices for this organization
              </p>
              <button className="w-full px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90">
                Clear All Cache
              </button>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-medium mb-2">Sync to Database</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Sync cache-only devices to database
              </p>
              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                Sync to DB
              </button>
            </div>
            <div className="p-4 bg-card rounded-lg border">
              <h3 className="font-medium mb-2">Refresh Cache</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Reload cache from all sources
              </p>
              <button className="w-full px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80">
                Refresh Cache
              </button>
            </div>
          </div>
        </div>
      </div>
    </div >
  );
}
