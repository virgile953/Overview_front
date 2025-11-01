import { DeviceCacheManager } from "@/lib/deviceCacheManager";
import { getDevices, updateDevice } from "@/lib/devices/devices";

export async function POST(request: Request) {
  const requestData = await request.json();
  const { name, type, status, location, ipAddress, macAddress, serialNumber, firmwareVersion, organizationId, lastActive } = requestData;

  console.log('Received device POST:', { name, macAddress, organizationId });

  if (!name || !type || !status || !organizationId || !macAddress) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  // Sanitize function to remove null bytes
  const sanitize = (str: string | undefined): string | undefined => {
    return str?.replace(/\x00/g, '');
  };

  // Ensure lastActive is a proper Date object
  const lastActiveDate = lastActive 
    ? (typeof lastActive === 'string' ? new Date(lastActive) : new Date())
    : new Date();

  try {
    const dbDevicesResponse = await getDevices();
    const existingDbDevice = dbDevicesResponse.devices.find(d => d.macAddress === macAddress);

    let dbId: string | undefined;
    let action = 'cache-only';

    // Update database if device exists
    if (existingDbDevice && existingDbDevice.id) {
      const deviceUpdate = {
        name: sanitize(name)!,
        type: sanitize(type)!,
        status: sanitize(status)!,
        location: sanitize(location)!,
        ipAddress: sanitize(ipAddress)!,
        macAddress: sanitize(macAddress)!,
        serialNumber: sanitize(serialNumber)!,
        firmwareVersion: sanitize(firmwareVersion)!,
        lastActive: lastActiveDate,
      };

      const updatedDevice = await updateDevice(existingDbDevice.id, organizationId, deviceUpdate);
      dbId = updatedDevice.id;
      action = 'updated';
    }

    // Update cache - this will automatically emit socket update
    await DeviceCacheManager.set(sanitize(macAddress)!, {
      device: {
        id: dbId,
        name: sanitize(name),
        type: sanitize(type),
        status: sanitize(status),
        location: sanitize(location),
        ipAddress: sanitize(ipAddress),
        macAddress: sanitize(macAddress),
        serialNumber: sanitize(serialNumber),
        firmwareVersion: sanitize(firmwareVersion),
        lastActive: lastActiveDate,
        organizationId,
      },
      lastSeen: new Date(),
      status: 'online',
    });

    console.log(`Device ${macAddress} cached for org ${organizationId}`);

    const stats = await DeviceCacheManager.getStats(organizationId);

    return new Response(JSON.stringify({
      success: true,
      deviceId: macAddress,
      dbId,
      action,
      totalDevices: stats.total,
      organizationId,
    }), { status: 200 });

  } catch (error) {
    console.error('Error handling device POST:', error);

    // Cache even on error - socket update will be emitted automatically
    await DeviceCacheManager.set(sanitize(macAddress)!, {
      device: { 
        name: sanitize(name), 
        type: sanitize(type), 
        status: sanitize(status), 
        location: sanitize(location), 
        ipAddress: sanitize(ipAddress), 
        macAddress: sanitize(macAddress), 
        serialNumber: sanitize(serialNumber), 
        firmwareVersion: sanitize(firmwareVersion), 
        lastActive: lastActiveDate, 
        organizationId 
      },
      lastSeen: new Date(),
      status: 'online',
    });

    return new Response(JSON.stringify({
      success: true,
      deviceId: macAddress,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), { status: 200 });
  }
}
