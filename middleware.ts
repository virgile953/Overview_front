import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// import { getOrCreateDB } from './models/server/dbSetup'
import { getLoggedInUser } from './models/server/auth';
import { isResolvedLazyResult } from 'next/dist/server/lib/lazy-result';

export async function middleware(request: NextRequest) {
  // await getOrCreateDB();
  const user = await getLoggedInUser();
  const url = request.nextUrl.clone()

  if (url.pathname.startsWith('/api/device')) {
    return NextResponse.next();
  }

  if (user && (url.pathname === '/login' || url.pathname === '/' || url.pathname === '/register')) {
    console.log("User logged in, redirecting to dashboard");
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  if (!user && (url.pathname !== '/login' && url.pathname !== '/register' && !url.pathname.startsWith('/api/auth'))) {
    console.log("No user, redirecting to login");
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$).*)',
    '/((?!api\\/device).*)',
  ],
}

// /api/device