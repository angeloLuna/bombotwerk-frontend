import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthorized = request.cookies.get('site_authorized')?.value === 'true';

  // 1. Exclude the unlock API endpoint
  if (pathname.startsWith('/api/unlock')) {
    return NextResponse.next();
  }

  // 2. Handle Coming Soon page access
  if (pathname === '/coming-soon') {
    if (isAuthorized) {
      // If already authorized, redirect to home page
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // 3. For all other matched routes, enforce authorization
  if (!isAuthorized) {
    return NextResponse.redirect(new URL('/coming-soon', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public image assets directory)
     * - api/ (standard API endpoints, except api/unlock)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|api/).*)',
  ],
};
