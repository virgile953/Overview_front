import { NextRequest } from "next/server";
import { cookies } from "next/headers";

export function isClientMobile(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent') || '';
  return /android|ipad|iphone|ipod/.test(userAgent.toLowerCase());
}

export async function setClientDeviceCookie(request: NextRequest): Promise<string> {
  const cookieStore = await cookies()

  const userAgent = request.headers.get('user-agent') || '';
  const isMobile = /android|ipad|iphone|ipod/.test(userAgent.toLowerCase());
  cookieStore.set('client-device', isMobile ? 'mobile' : 'desktop');
  return isMobile ? 'mobile' : 'desktop';
}

export async function forceClientDeviceCookie(deviceType: 'mobile' | 'desktop'): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set('client-device', deviceType);
}