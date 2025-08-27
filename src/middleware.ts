import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define which routes should be protected
const protectedRoutes = [
  '/api/protected',
  '/profile',
  '/settings',
];

// Define which routes should be accessible without authentication
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/api/auth',
  '/dashboard', // Let client-side handle dashboard authentication
];

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;

    // Check if the route is protected
    const isProtectedRoute = protectedRoutes.some(route => 
      pathname.startsWith(route)
    );

    // Check if the route is public
    const isPublicRoute = publicRoutes.some(route => 
      pathname.startsWith(route)
    );

    // Skip middleware for public routes
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // For protected routes, check authentication
    if (isProtectedRoute) {
      // Since we're using session-based auth, let the client-side handle authentication
      // The middleware will just pass through and let the client-side AuthContext handle it
      if (pathname.startsWith('/api/')) {
        // For API routes, we'll handle authentication in the API route itself
        // This allows for more flexible authentication strategies
        return NextResponse.next();
      } else {
        // For page routes, let the client-side handle authentication
        return NextResponse.next();
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // Return a generic error response instead of crashing
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Session-based authentication - no token extraction needed

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
