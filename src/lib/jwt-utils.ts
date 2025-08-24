import { jwtDecode } from 'jwt-decode';
import { NextRequest, NextResponse } from 'next/server';

// JWT payload interface for Supabase
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  username?: string;
  exp: number; // expiration timestamp
  iat: number; // issued at timestamp
  aud: string; // audience
  iss: string; // issuer
  role?: string; // Supabase role
  user_metadata?: any; // Supabase user metadata
}

// JWT token interface
export interface JWTToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

// JWT utility functions
export class JWTUtils {
  /**
   * Decode a JWT token and return the payload
   */
  static decodeToken(token: string): JWTPayload | null {
    try {
      return jwtDecode<JWTPayload>(token);
    } catch (error) {
      console.error('Failed to decode JWT token:', error);
      return null;
    }
  }

  /**
   * Check if a JWT token is expired
   */
  static isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  /**
   * Check if a JWT token will expire soon (within the next 5 minutes)
   */
  static isTokenExpiringSoon(token: string, thresholdMinutes: number = 5): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload) return true;
      
      const currentTime = Math.floor(Date.now() / 1000);
      const thresholdSeconds = thresholdMinutes * 60;
      return payload.exp < (currentTime + thresholdSeconds);
    } catch (error) {
      console.error('Error checking if token is expiring soon:', error);
      return true;
    }
  }

  /**
   * Extract user ID from JWT token
   */
  static getUserIdFromToken(token: string): string | null {
    try {
      const payload = this.decodeToken(token);
      return payload?.sub || null;
    } catch (error) {
      console.error('Error extracting user ID from token:', error);
      return null;
    }
  }

  /**
   * Extract email from JWT token
   */
  static getEmailFromToken(token: string): string | null {
    try {
      const payload = this.decodeToken(token);
      return payload?.email || null;
    } catch (error) {
      console.error('Error extracting email from token:', error);
      return null;
    }
  }

  /**
   * Get token expiration time as Date object
   */
  static getTokenExpirationDate(token: string): Date | null {
    try {
      const payload = this.decodeToken(token);
      if (!payload) return null;
      
      return new Date(payload.exp * 1000);
    } catch (error) {
      console.error('Error getting token expiration date:', error);
      return null;
    }
  }

  /**
   * Get time until token expires in seconds
   */
  static getTimeUntilExpiration(token: string): number | null {
    try {
      const payload = this.decodeToken(token);
      if (!payload) return null;
      
      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, payload.exp - currentTime);
    } catch (error) {
      console.error('Error calculating time until expiration:', error);
      return null;
    }
  }

  /**
   * Validate JWT token structure and basic properties
   */
  static validateToken(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload) return false;
      
      // Check required fields
      if (!payload.sub || !payload.exp || !payload.iat) {
        return false;
      }
      
      // Check if token is expired
      if (this.isTokenExpired(token)) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
}

// Middleware for protecting API routes
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Missing or invalid authorization header' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.substring(7);
    
    // Validate the token
    if (!JWTUtils.validateToken(token)) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Extract user ID from token
    const userId = JWTUtils.getUserIdFromToken(token);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unable to extract user information from token' },
        { status: 401 }
      );
    }

    // Call the handler with the authenticated request
    return await handler(request, userId);
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

// Helper function to create a protected API route
export function createProtectedRoute(
  handler: (request: NextRequest, userId: string, params?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, { params }: { params?: any } = {}) => {
    return withAuth(request, (req, userId) => handler(req, userId, params));
  };
}

// Utility function to get token from request headers
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

// Utility function to check if user has required permissions
export function hasPermission(
  token: string,
  requiredPermission: string
): boolean {
  try {
    const payload = JWTUtils.decodeToken(token);
    // This is a basic implementation - you can extend this based on your permission system
    // For example, you might have a 'permissions' array in the JWT payload
    return true; // Placeholder - implement based on your needs
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
}

// Export the main JWTUtils class for direct usage
export default JWTUtils;
