
import { Server as SocketIOServer } from 'socket.io';
import { DeviceResponse, singleDeviceResponse } from './devices/devices';

declare global {
  var io: SocketIOServer;
}

export function emitDevicesUpdate(eventName: string, data: DeviceResponse, organizationId?: string) {
  if (global.io) {
    global.io.emit(eventName, data, organizationId);
    // console.log(`Emitted ${eventName} event with data:`, { 
    //   totalDevices: data.totalDevices || 'N/A',
    //   deviceCount: Array.isArray(data.devices) ? data.devices.length : 'N/A'
    // });
  } else {
    console.warn('Socket.IO not available - cannot emit device update');
  }
}

export function emitDeviceUpdate(eventName: string, data: singleDeviceResponse) {
  if (global.io) {
    global.io.emit(eventName, data);
  } else {
    console.warn('Socket.IO not available - cannot emit device update');
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const emitUserUpdate = (eventName: string, data: any) => {
  if (global.io) {
    global.io.emit(eventName, data);
    console.log(`Emitted ${eventName} event with data:`, data);
  } else {
    console.warn('Socket.IO not available - cannot emit user update');
  }
};
