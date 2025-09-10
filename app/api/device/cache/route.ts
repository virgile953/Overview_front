import { DeviceCacheManager } from "@/lib/deviceCacheManager";

// Cache management utility endpoint for admin operations
export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');

  try {
    switch (action) {
      case 'stats':
        const stats = DeviceCacheManager.getStats();
        const allDevices = DeviceCacheManager.getAllDevices();

        return new Response(JSON.stringify({
          stats,
          devices: Array.from(allDevices.entries()).map(([macAddress, data]) => ({
            macAddress,
            name: data.device.name,
            status: data.status,
            lastSeen: data.lastSeen,
            hasDbId: !!data.dbId,
            dbId: data.dbId
          }))
        }), { status: 200 });
      case 'clear':
        DeviceCacheManager.clearAll();
        return new Response(JSON.stringify({
          success: true,
          message: "Cache cleared successfully"
        }), { status: 200 });

      default:
        return new Response(JSON.stringify({
          error: "Invalid action. Use 'stats' or 'clear'"
        }), { status: 400 });
    }
  } catch (error) {
    console.error('Error in cache management:', error);
    return new Response(JSON.stringify({
      error: "Cache management operation failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}

// Bulk operations for cache management
export async function POST(request: Request) {
  const { action, macAddresses } = await request.json();

  if (!action) {
    return new Response(JSON.stringify({ error: "Action is required" }), { status: 400 });
  }

  try {
    let results: { macAddress: string; success: boolean; }[] = [];

    switch (action) {
      case 'mark-offline':
        if (!Array.isArray(macAddresses)) {
          return new Response(JSON.stringify({ error: "macAddresses array is required" }), { status: 400 });
        }

        results = macAddresses.map(mac => ({
          macAddress: mac,
          success: DeviceCacheManager.markOffline(mac)
        }));
        break;

      case 'mark-online':
        if (!Array.isArray(macAddresses)) {
          return new Response(JSON.stringify({ error: "macAddresses array is required" }), { status: 400 });
        }

        results = macAddresses.map(mac => ({
          macAddress: mac,
          success: DeviceCacheManager.markOnline(mac)
        }));
        break;

      case 'remove':
        if (!Array.isArray(macAddresses)) {
          return new Response(JSON.stringify({ error: "macAddresses array is required" }), { status: 400 });
        }

        results = macAddresses.map(mac => ({
          macAddress: mac,
          success: DeviceCacheManager.removeDevice(mac)
        }));
        break;

      default:
        return new Response(JSON.stringify({
          error: "Invalid action. Use 'mark-offline', 'mark-online', or 'remove'"
        }), { status: 400 });
    }

    const stats = DeviceCacheManager.getStats();

    return new Response(JSON.stringify({
      success: true,
      action,
      results,
      stats
    }), { status: 200 });

  } catch (error) {
    console.error('Error in bulk cache operation:', error);
    return new Response(JSON.stringify({
      error: "Bulk operation failed",
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}
