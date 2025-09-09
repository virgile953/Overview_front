// Production-ready Redis-based device tracking
import { Redis } from 'ioredis';

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const DEVICE_PREFIX = 'device:';
const DEVICE_LIST_KEY = 'devices:active';
const OFFLINE_THRESHOLD = 5 * 60; // 5 minutes in seconds

export async function POST(request: Request) {
  try {
    const { name, type, status, location, ipAddress, macAddress, serialNumber, firmwareVersion, lastActive, ownerId } = await request.json();

    // Validate required fields
    if (!name || !type || !status || !ownerId) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    // Create unique device identifier
    const deviceId = macAddress || `${ipAddress}-${serialNumber}` || `${name}-${ownerId}`;
    const deviceKey = `${DEVICE_PREFIX}${deviceId}`;
    
    // Prepare device data
    const deviceData = {
      deviceId,
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
      lastSeen: new Date().toISOString(),
      connectionStatus: 'online'
    };

    // Store device data with TTL
    await redis.setex(deviceKey, OFFLINE_THRESHOLD * 2, JSON.stringify(deviceData));
    
    // Add to active devices set
    await redis.sadd(DEVICE_LIST_KEY, deviceId);
    
    // Set device expiry tracking
    await redis.setex(`${deviceKey}:heartbeat`, OFFLINE_THRESHOLD, 'alive');

    // TODO: Also persist to database for permanent storage
    
    return new Response(JSON.stringify({ 
      success: true, 
      deviceId,
      message: 'Device registered successfully'
    }), { status: 200 });

  } catch (error) {
    console.error('Device registration error:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const deviceId = url.searchParams.get('deviceId');
    
    if (deviceId) {
      // Get specific device
      const deviceKey = `${DEVICE_PREFIX}${deviceId}`;
      const deviceData = await redis.get(deviceKey);
      
      if (!deviceData) {
        return new Response(JSON.stringify({ error: "Device not found" }), { status: 404 });
      }
      
      const device = JSON.parse(deviceData);
      
      // Check if device is still considered online
      const heartbeat = await redis.get(`${deviceKey}:heartbeat`);
      device.connectionStatus = heartbeat ? 'online' : 'offline';
      
      return new Response(JSON.stringify(device), { status: 200 });
      
    } else {
      // Get all active devices
      const activeDeviceIds = await redis.smembers(DEVICE_LIST_KEY);
      const devices = [];
      
      for (const deviceId of activeDeviceIds) {
        const deviceKey = `${DEVICE_PREFIX}${deviceId}`;
        const deviceData = await redis.get(deviceKey);
        
        if (deviceData) {
          const device = JSON.parse(deviceData);
          
          // Check online status
          const heartbeat = await redis.get(`${deviceKey}:heartbeat`);
          device.connectionStatus = heartbeat ? 'online' : 'offline';
          
          devices.push(device);
        } else {
          // Remove stale device from active list
          await redis.srem(DEVICE_LIST_KEY, deviceId);
        }
      }
      
      return new Response(JSON.stringify({ 
        devices,
        totalDevices: devices.length,
        onlineDevices: devices.filter(d => d.connectionStatus === 'online').length
      }), { status: 200 });
    }
    
  } catch (error) {
    console.error('Device retrieval error:', error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

// Cleanup function to remove offline devices (call periodically)
export async function cleanupOfflineDevices() {
  try {
    const activeDeviceIds = await redis.smembers(DEVICE_LIST_KEY);
    
    for (const deviceId of activeDeviceIds) {
      const heartbeat = await redis.get(`${DEVICE_PREFIX}${deviceId}:heartbeat`);
      
      if (!heartbeat) {
        // Device is offline, optionally remove or mark as offline
        const deviceKey = `${DEVICE_PREFIX}${deviceId}`;
        const deviceData = await redis.get(deviceKey);
        
        if (deviceData) {
          const device = JSON.parse(deviceData);
          device.connectionStatus = 'offline';
          device.lastOffline = new Date().toISOString();
          
          // Update device status
          await redis.setex(deviceKey, OFFLINE_THRESHOLD * 4, JSON.stringify(device));
        }
      }
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}
