import { Server as SocketIOServer } from 'socket.io';
import { DeviceResponse, singleDeviceResponse } from './devices/devices';

declare global {
  var io: SocketIOServer;
}

export function emitDevicesUpdate(eventName: string, data: DeviceResponse, organizationId: string) {
  if (global.io && organizationId) {
    // Emit only to sockets in the organization room
    global.io.to(`org:${organizationId}`).emit(eventName, data);
    console.log(`Emitted ${eventName} to organization ${organizationId}:`, { 
      totalDevices: data.totalDevices || 'N/A',
      deviceCount: Array.isArray(data.devices) ? data.devices.length : 'N/A'
    });
  } else {
    console.warn('Socket.IO not available or no organization ID - cannot emit device update');
  }
}

export function emitDeviceUpdate(eventName: string, data: singleDeviceResponse, organizationId: string) {
  if (global.io && organizationId) {
    // Emit only to sockets in the organization room
    global.io.to(`org:${organizationId}`).emit(eventName, data);
    console.log(`Emitted ${eventName} to organization ${organizationId} for device:`, data.deviceId);
  } else {
    console.warn('Socket.IO not available or no organization ID - cannot emit device update');
  }
}

export const emitUserUpdate = (eventName: string, data: unknown, organizationId: string) => {
  if (global.io && organizationId) {
    global.io.to(`org:${organizationId}`).emit(eventName, data);
    console.log(`Emitted ${eventName} to organization ${organizationId}:`, data);
  } else {
    console.warn('Socket.IO not available or no organization ID - cannot emit user update');
  }
};
