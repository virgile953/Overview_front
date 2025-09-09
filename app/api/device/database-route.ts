// // Database + WebSocket approach for real-time device tracking
// import { databases } from '@/models/server/config';
// import { Device } from '@/models/server/devices';
// import { Query } from 'node-appwrite';

// // WebSocket connections map (for real-time updates)
// const wsConnections = new Map<string, WebSocket>();

// export async function POST(request: Request) {
//   try {
//     const { name, type, status, location, ipAddress, macAddress, serialNumber, firmwareVersion, lastActive, ownerId } = await request.json();

//     // Validate required fields
//     if (!name || !type || !status || !ownerId) {
//       return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
//     }

//     // Create unique device identifier
//     const deviceId = macAddress || `${ipAddress}-${serialNumber}` || `${name}-${ownerId}`;
    
//     // Prepare device data
//     const deviceData: Device = {
//       $id,
//       name,
//       type,
//       status,
//       location,
//       ipAddress,
//       macAddress,
//       serialNumber,
//       firmwareVersion,
//       lastActive: lastActive || new Date().toISOString(),
//       ownerId,
//     };

//     try {
//       // Try to update existing device
//       const existingDevices = await databases.listDocuments(
//         'your-database-id',
//         'devices',
//         [Query.equal('deviceId', deviceId)]
//       );

//       if (existingDevices.documents.length > 0) {
//         // Update existing device
//         const existingDevice = existingDevices.documents[0];
//         await databases.updateDocument(
//           'your-database-id',
//           'devices',
//           existingDevice.$id,
//           {
//             ...deviceData,
//             updatedAt: new Date().toISOString()
//           }
//         );
//       } else {
//         // Create new device
//         await databases.createDocument(
//           'your-database-id',
//           'devices',
//           'unique()',
//           {
//             ...deviceData,
//             createdAt: new Date().toISOString(),
//             updatedAt: new Date().toISOString()
//           }
//         );
//       }

//       // Broadcast update to connected WebSocket clients
//       broadcastDeviceUpdate(deviceData);

//       return new Response(JSON.stringify({ 
//         success: true, 
//         deviceId,
//         message: 'Device registered/updated successfully'
//       }), { status: 200 });

//     } catch (dbError) {
//       console.error('Database error:', dbError);
//       return new Response(JSON.stringify({ error: "Database operation failed" }), { status: 500 });
//     }

//   } catch (error) {
//     console.error('Device registration error:', error);
//     return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
//   }
// }

// export async function GET(request: Request) {
//   try {
//     const url = new URL(request.url);
//     const deviceId = url.searchParams.get('deviceId');
//     const ownerId = url.searchParams.get('ownerId');
    
//     if (deviceId) {
//       // Get specific device
//       const devices = await databases.listDocuments(
//         'your-database-id',
//         'devices',
//         [Query.equal('deviceId', deviceId)]
//       );
      
//       if (devices.documents.length === 0) {
//         return new Response(JSON.stringify({ error: "Device not found" }), { status: 404 });
//       }
      
//       const device = devices.documents[0];
      
//       // Check if device should be considered offline
//       const lastSeen = new Date(device.lastSeen);
//       const now = new Date();
//       const offlineThreshold = 5 * 60 * 1000; // 5 minutes
      
//       const isOnline = (now.getTime() - lastSeen.getTime()) < offlineThreshold;
      
//       return new Response(JSON.stringify({
//         ...device,
//         connectionStatus: isOnline ? 'online' : 'offline',
//         isOnline
//       }), { status: 200 });
      
//     } else {
//       // Get all devices (optionally filter by owner)
//       const queries = ownerId ? [Query.equal('ownerId', ownerId)] : [];
      
//       const devices = await databases.listDocuments(
//         'your-database-id',
//         'devices',
//         queries
//       );
      
//       // Process devices to determine online status
//       const now = new Date();
//       const offlineThreshold = 5 * 60 * 1000; // 5 minutes
      
//       const processedDevices = devices.documents.map(device => {
//         const lastSeen = new Date(device.lastSeen);
//         const isOnline = (now.getTime() - lastSeen.getTime()) < offlineThreshold;
        
//         return {
//           ...device,
//           connectionStatus: isOnline ? 'online' : 'offline',
//           isOnline
//         };
//       });
      
//       const stats = {
//         totalDevices: processedDevices.length,
//         onlineDevices: processedDevices.filter(d => d.isOnline).length,
//         offlineDevices: processedDevices.filter(d => !d.isOnline).length
//       };
      
//       return new Response(JSON.stringify({ 
//         devices: processedDevices,
//         stats
//       }), { status: 200 });
//     }
    
//   } catch (error) {
//     console.error('Device retrieval error:', error);
//     return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
//   }
// }

// // WebSocket handler for real-time updates
// function broadcastDeviceUpdate(deviceData: Device) {
//   const message = JSON.stringify({
//     type: 'device_update',
//     data: deviceData,
//     timestamp: new Date().toISOString()
//   });
  
//   // Broadcast to all connected clients
//   wsConnections.forEach((ws, clientId) => {
//     if (ws.readyState === WebSocket.OPEN) {
//       ws.send(message);
//     } else {
//       // Remove dead connections
//       wsConnections.delete(clientId);
//     }
//   });
// }

// // Background task to mark inactive devices as offline
// export async function markInactiveDevicesOffline() {
//   try {
//     const offlineThreshold = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago
    
//     const inactiveDevices = await databases.listDocuments(
//       'your-database-id',
//       'devices',
//       [
//         Query.lessThan('lastSeen', offlineThreshold.toISOString()),
//         Query.equal('connectionStatus', 'online')
//       ]
//     );
    
//     // Update inactive devices to offline
//     for (const device of inactiveDevices.documents) {
//       await databases.updateDocument(
//         'your-database-id',
//         'devices',
//         device.$id,
//         {
//           connectionStatus: 'offline',
//           lastOffline: new Date().toISOString()
//         }
//       );
      
//       // Broadcast offline status
//       broadcastDeviceUpdate({
//         ...device,
//         connectionStatus: 'offline'
//       });
//     }
    
//     console.log(`Marked ${inactiveDevices.documents.length} devices as offline`);
    
//   } catch (error) {
//     console.error('Error marking devices offline:', error);
//   }
// }

// // Run cleanup every minute
// setInterval(markInactiveDevicesOffline, 60 * 1000);
