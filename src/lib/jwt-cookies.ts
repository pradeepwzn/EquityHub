import { NextRequest, NextResponse } from 'next/server';
import JWTUtils from './jwt-utils';

// Cookie configuration
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: '/',
};

// Cookie names
export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_ID: 'user_id',
} as const;

/**
 * Set JWT tokens in cookies
 */
export function setJWTCookies(
  response: NextResponse,
  accessToken: string,
  refreshToken?: string
): NextResponse {
  // Set access token
  response.cookies.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, COOKIE_CONFIG);
  
  // Set refresh token if provided
  if (refreshToken) {
    response.cookies.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, COOKIE_CONFIG);
  }
  
  // Set user ID from token
  const userId = JWTUtils.getUserIdFromToken(accessToken);
  if (userId) {
    response.cookies.set(COOKIE_NAMES.USER_ID, userId, COOKIE_CONFIG);
  }
  
  return response;
}

/**
 * Clear JWT cookies
 */
export function clearJWTCookies(response: NextResponse): NextResponse {
  response.cookies.delete(COOKIE_NAMES.ACCESS_TOKEN);
  response.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN);
  response.cookies.delete(COOKIE_NAMES.USER_ID);
  
  return response;
}

/**
 * Get JWT token from cookies
 */
export function getJWTCookie(request: NextRequest, cookieName: string = COOKIE_NAMES.ACCESS_TOKEN): string | null {
  return request.cookies.get(cookieName)?.value || null;
}

/**
 * Get access token from cookies
 */
export function getAccessTokenFromCookie(request: NextRequest): string | null {
  return getJWTCookie(request, COOKIE_NAMES.ACCESS_TOKEN);
}

/**
 * Get refresh token from cookies
 */
export function getRefreshTokenFromCookie(request: NextRequest): string | null {
  return getJWTCookie(request, COOKIE_NAMES.REFRESH_TOKEN);
}

/**
 * Get user ID from cookies
 */
export function getUserIdFromCookie(request: NextRequest): string | null {
  return getJWTCookie(request, COOKIE_NAMES.USER_ID);
}

/**
 * Check if user is authenticated based on cookies
 */
export function isAuthenticatedFromCookie(request: NextRequest): boolean {
  const token = getAccessTokenFromCookie(request);
  return token ? JWTUtils.validateToken(token) : false;
}

/**
 * Create a response with JWT cookies set
 */
export function createAuthenticatedResponse(
  data: unknown,
  accessToken: string,
  refreshToken?: string,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status });
  return setJWTCookies(response, accessToken, refreshToken);
}

/**
 * Create a logout response with cleared cookies
 */
export function createLogoutResponse(data: unknown = { message: 'Logged out successfully' }): NextResponse {
  const response = NextResponse.json(data, { status: 200 });
  return clearJWTCookies(response);
}

/**
 * Validate and refresh token if needed
 */
export async function validateAndRefreshToken(
  request: NextRequest
): Promise<{ isValid: boolean; userId: string | null; shouldRefresh: boolean }> {
  const accessToken = getAccessTokenFromCookie(request);
  
  if (!accessToken) {
    return { isValid: false, userId: null, shouldRefresh: false };
  }
  
  // Check if token is valid
  if (!JWTUtils.validateToken(accessToken)) {
    return { isValid: false, userId: null, shouldRefresh: false };
  }
  
  // Check if token is expiring soon
  const isExpiringSoon = JWTUtils.isTokenExpiringSoon(accessToken, 5);
  
  // Get user ID
  const userId = JWTUtils.getUserIdFromToken(accessToken);
  
  return {
    isValid: true,
    userId,
    shouldRefresh: isExpiringSoon,
  };
}

/**
 * Middleware helper for cookie-based authentication
 */
export async function withCookieAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  const { isValid, userId, shouldRefresh } = await validateAndRefreshToken(request);
  
  if (!isValid || !userId) {
    return Promise.resolve(
      NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    );
  }
  
  // If token is expiring soon, add a header to indicate refresh is needed
  const response = handler(request, userId);
  
  if (shouldRefresh) {
    response.then(res => {
      res.headers.set('X-Token-Expiring-Soon', 'true');
    });
  }
  
  return response;
}
