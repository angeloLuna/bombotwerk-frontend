import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export default auth(async function proxy(request: NextRequest & { auth: any }) {
  const { pathname } = request.nextUrl;

  // 1. Exclude NextAuth endpoints
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 2. Handle Admin protection
  if (pathname.startsWith('/admin')) {
    const session = request.auth; // Resolves from NextAuth auth middleware wrapper

    if (!session) {
      // Redirect to login if no session is active
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.href);
      return NextResponse.redirect(loginUrl);
    }

    if (session.user?.role !== 'admin') {
      // Redirect to unauthorized landing page if not admin
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (public image assets directory)
     * - api/ (standard API endpoints, except api/auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|api/(?!auth)).*)',
  ],
};
