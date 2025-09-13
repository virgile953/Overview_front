import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getLoggedInUser } from './models/server/auth';
import { setClientDeviceCookie } from './lib/clientDeviceHandler';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const url = request.nextUrl.clone()

  if (url.pathname.startsWith('/api/device')) {
    return NextResponse.next();
  }
  const user = await getLoggedInUser();

  const clientDevice = cookieStore.get('client-device');
  if (!clientDevice) {
    console.log("Client-side mobile navigation detected");
    await setClientDeviceCookie(request);
  }

  if (user && (url.pathname === '/login' || url.pathname === '/' || url.pathname === '/register')) {
    console.log("User logged in, redirecting to dashboard");
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  if (!user && (url.pathname !== '/login' && url.pathname !== '/register' && !url.pathname.startsWith('/api/auth'))) {
    console.log("No user, redirecting to login", url.pathname);
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|.well-known|api/socket|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$).*)',
  ],
}

// /((?!_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|/api/device$).*)

// /api/device