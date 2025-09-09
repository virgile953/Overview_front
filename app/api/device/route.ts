import { Device } from "@/models/server/devices";

// In-memory cache for device status (use Redis in production)
const deviceCache = new Map<string, {
  device: Omit<Device, '$id'>;
  lastSeen: Date;
  status: 'online' | 'offline';
}>();

// Cleanup interval to mark devices as offline after inactivity
const OFFLINE_THRESHOLD = 1 * 60 * 1000; // 1 minute
setInterval(() => {
  const now = new Date();
  for (const [deviceId, data] of deviceCache.entries()) {
    if (now.getTime() - data.lastSeen.getTime() > OFFLINE_THRESHOLD) {
      data.status = 'offline';
      deviceCache.set(deviceId, data);
    }
  }
}, 60 * 1000); // Check every minute

// Cleanup interval to mark devices as offline after inactivity
const REMOVE_THRESHOLD = 5 * 60 * 1000; // 5 minutes
setInterval(() => {
  const now = new Date();
  for (const [deviceId, data] of deviceCache.entries()) {
    if (now.getTime() - data.lastSeen.getTime() > REMOVE_THRESHOLD) {
      deviceCache.delete(deviceId);
    }
  }
}, 60 * 1000); // Check every minute

export async function POST(request: Request) {
  // Handle POST request to create a new device
  const { name, type, status, location, ipAddress, macAddress, serialNumber, firmwareVersion, lastActive, ownerId } = await request.json();

  // Validate required fields
  if (!name || !type || !status || !ownerId) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
  }

  // Create unique device identifier
  const deviceId: string = macAddress || `${ipAddress}-${serialNumber}` || `${name}-${ownerId}`;

  // Update device cache
  deviceCache.set(deviceId, {
    device: {
      name,
      type,
      status,
      location,
      ipAddress,
      macAddress,
      serialNumber,
      firmwareVersion,
      lastActive,
      ownerId,
    },
    lastSeen: new Date(),
    status: 'online'
  });

  // TODO: Also persist to database for permanent storage

  return new Response(JSON.stringify({
    success: true,
    deviceId,
    totalDevices: deviceCache.size
  }), { status: 200 });
}

// GET endpoint to retrieve device status
export async function GET(request: Request) {
  const url = new URL(request.url);
  const deviceId = url.searchParams.get('deviceId');

  if (deviceId) {
    // Get specific device
    const deviceData = deviceCache.get(deviceId);
    if (!deviceData) {
      return new Response(JSON.stringify({ error: "Device not found" }), { status: 404 });
    }

    return new Response(JSON.stringify(deviceData), { status: 200 });
  } else {
    // Get all devices with their status
    const devices = Array.from(deviceCache.entries()).map(([id, data]) => ({
      deviceId: id,
      ...data.device,
      lastSeen: data.lastSeen,
      connectionStatus: data.status
    }));

    return new Response(JSON.stringify({ devices }), { status: 200 });
  }
}