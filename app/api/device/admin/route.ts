import { addDevice, deleteDevice } from "@/lib/devices";
import { DeviceCacheManager } from "@/lib/deviceCacheManager";

// Admin route to manually add devices to the database
export async function POST(request: Request) {
  const requestData = await request.json();
  const { name, type, status, location, ipAddress, macAddress, serialNumber, firmwareVersion, organizationId } = requestData;

  if (!name || !type || !status || !organizationId || !macAddress) {
    return new Response(JSON.stringify({
      error: "Missing required fields (name, type, status, ownerId, macAddress are required)"
    }), { status: 400 });
  }

  try {
    // Add device to database
    const newDevice = await addDevice({
      name,
      type,
      status,
      location,
      ipAddress,
      macAddress,
      serialNumber,
      firmwareVersion,
      lastActive: new Date(),
      organizationId: organizationId
    });

    const existingCacheEntry = DeviceCacheManager.get(macAddress);
    if (existingCacheEntry) {
      // Update existing cache entry with database ID
      DeviceCacheManager.set(macAddress, {
        ...existingCacheEntry,
        device: {
          id: newDevice.id,
          name,
          type,
          status,
          location,
          ipAddress,
          macAddress,
          serialNumber,
          firmwareVersion,
          lastActive: newDevice.lastActive,
          organizationId,
        },
        lastSeen: new Date(),
        status: "online"
      });
    } else {
      // Add new cache entry
      DeviceCacheManager.set(macAddress, {
        device: {
          id: newDevice.id,
          name,
          type,
          status,
          location,
          ipAddress,
          macAddress,
          serialNumber,
          firmwareVersion,
          lastActive: newDevice.lastActive,
          organizationId,
        },
        lastSeen: new Date(),
        status: 'offline', // Default to offline since it's manually added
      });
    }

    const stats = await DeviceCacheManager.getStats();

    return new Response(JSON.stringify({
      success: true,
      message: "Device added to database and cache updated",
      deviceId: macAddress,
      dbId: newDevice.id,
      cacheUpdated: true,
      totalCachedDevices: stats.total,
      stats
    }), { status: 201 });

  } catch (error) {
    console.error('Error adding device to database:', error);
    return new Response(JSON.stringify({
      error: "Failed to add device to database",
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}

// Admin route to remove device from both DB and cache
export async function DELETE(request: Request) {
  const url = new URL(request.url);

  const macAddress = url.searchParams.get('macAddress');
  const dbId = url.searchParams.get('dbId')

  if (!dbId || !macAddress) {
    return new Response(JSON.stringify({ error: "dbId and MacAddress parameters required" }), { status: 400 });
  }

  try {
    // Remove from cache using DeviceCacheManager
    const wasInCache = await DeviceCacheManager.get(macAddress) !== undefined;
    const removed = await DeviceCacheManager.remove(macAddress);
    const stats = await DeviceCacheManager.getStats();

    // Remove from database if dbId is provided
    if (dbId) {
      await deleteDevice(dbId);
    }
    return new Response(JSON.stringify({
      success: true,
      message: "Device removed from cache",
      macAddress,
      wasInCache,
      removed,
      remainingCachedDevices: stats.total,
      stats
    }), { status: 200 });

  } catch (error) {
    console.error('Error removing device:', error);
    return new Response(JSON.stringify({
      error: "Failed to remove device",
      details: error instanceof Error ? error.message : 'Unknown error'
    }), { status: 500 });
  }
}
