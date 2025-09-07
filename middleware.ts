import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getOrCreateDB } from './models/server/dbSetup'
import { getLoggedInUser } from './models/server/auth';

export async function middleware(request: NextRequest) {
  await getOrCreateDB();
  const user = await getLoggedInUser();
  const url = request.nextUrl.clone()

  if (user && url.pathname === '/login') {
    console.log("User logged in, redirecting to dashboard");
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  if (!user && url.pathname !== '/login') {
    console.log("No user, redirecting to login");
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/dashboard',
    '/login',
    '/'

  ],
}