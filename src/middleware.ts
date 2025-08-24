import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import JWTUtils from '@/lib/jwt-utils';

// Define which routes should be protected
const protectedRoutes = [
  '/dashboard',
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
      const token = getTokenFromRequest(request);
      
      if (!token) {
        // Redirect to login if no token is present
        if (pathname.startsWith('/api/')) {
          // For API routes, return 401
          return NextResponse.json(
            { error: 'Authentication required' },
            { status: 401 }
          );
        } else {
          // For page routes, redirect to login
          const loginUrl = new URL('/auth/login', request.url);
          loginUrl.searchParams.set('redirect', pathname);
          return NextResponse.redirect(loginUrl);
        }
      }

      // Validate the token with proper error handling
      try {
        if (!JWTUtils.validateToken(token)) {
          if (pathname.startsWith('/api/')) {
            // For API routes, return 401
            return NextResponse.json(
              { error: 'Invalid or expired token' },
              { status: 401 }
            );
          } else {
            // For page routes, redirect to login
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            loginUrl.searchParams.set('error', 'token_expired');
            return NextResponse.redirect(loginUrl);
          }
        }

        // Add header if token is expiring soon
        try {
          if (JWTUtils.isTokenExpiringSoon(token, 10)) {
            const response = NextResponse.next();
            response.headers.set('X-Token-Expiring-Soon', 'true');
            return response;
          }
        } catch (error) {
          // Log error but don't fail the request
          console.error('Error checking token expiration:', error);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        if (pathname.startsWith('/api/')) {
          return NextResponse.json(
            { error: 'Token validation failed' },
            { status: 401 }
          );
        } else {
          const loginUrl = new URL('/auth/login', request.url);
          loginUrl.searchParams.set('redirect', pathname);
          loginUrl.searchParams.set('error', 'validation_failed');
          return NextResponse.redirect(loginUrl);
        }
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

// Helper function to extract token from request
function getTokenFromRequest(request: NextRequest): string | null {
  try {
    // Check Authorization header
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Check for token in cookies (improved method for Edge Runtime)
    try {
      const cookieHeader = request.headers.get('cookie');
      if (cookieHeader) {
        const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            acc[key] = decodeURIComponent(value);
          }
          return acc;
        }, {} as Record<string, string>);
        
        if (cookies.auth_token) {
          return cookies.auth_token;
        }
      }
    } catch (cookieError) {
      console.error('Error parsing cookies:', cookieError);
    }

    // Check for token in query parameters (for certain scenarios)
    const tokenParam = request.nextUrl.searchParams.get('token');
    if (tokenParam) {
      return tokenParam;
    }

    return null;
  } catch (error) {
    console.error('Error extracting token from request:', error);
    return null;
  }
}

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
