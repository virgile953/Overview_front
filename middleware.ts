import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { setClientDeviceCookie } from './lib/clientDeviceHandler';
import { cookies } from 'next/headers';
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const url = request.nextUrl.clone()

  if (url.pathname.startsWith('/api/device')) {
    return NextResponse.next();
  }


  const session = await auth.api.getSession({
    headers: request.headers
  })

  const clientDevice = cookieStore.get('client-device');
  if (!clientDevice) {
    await setClientDeviceCookie(request);
  }

  if (session && (url.pathname === '/login' || url.pathname === '/register')) {
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  if (!session && (url.pathname !== '/login' && url.pathname !== '/register' && url.pathname !== '/' && !url.pathname.startsWith('/api/auth'))) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  runtime: "nodejs",
  matcher: [
    '/((?!_next/static|_next/image|.well-known|api/socket|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$).*)',
  ],
}
