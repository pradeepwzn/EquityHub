# JWT Authentication System

This project now includes a comprehensive JWT authentication system with utilities for both client-side and server-side token management.

## Features

- **JWT Token Management**: Decode, validate, and manage JWT tokens
- **Automatic Token Refresh**: Built-in token expiration checking and refresh logic
- **Protected API Routes**: Middleware and utilities for securing API endpoints
- **Client-Side Hooks**: React hooks for managing JWT tokens in components
- **Cookie Support**: Server-side cookie management for JWT tokens
- **Route Protection**: Next.js middleware for protecting routes

## Files Added

### Core JWT Utilities

- `src/lib/jwt-utils.ts` - Main JWT utility functions and middleware helpers
- `src/lib/jwt-cookies.ts` - Cookie-based JWT management utilities
- `src/middleware.ts` - Next.js middleware for route protection

### React Hooks

- `src/hooks/useJWT.ts` - Hooks for JWT management in React components

### Example API Routes

- `src/app/api/protected/user-profile/route.ts` - Example protected API endpoint

## Usage Examples

### 1. Basic JWT Token Operations

```typescript
import JWTUtils from "@/lib/jwt-utils";

// Decode a token
const payload = JWTUtils.decodeToken(token);

// Check if token is expired
const isExpired = JWTUtils.isTokenExpired(token);

// Get user ID from token
const userId = JWTUtils.getUserIdFromToken(token);

// Validate token structure and expiration
const isValid = JWTUtils.validateToken(token);
```

### 2. Using JWT Hooks in React Components

```typescript
import { useJWT, useAuthenticatedFetch } from "@/hooks/useJWT";

function MyComponent() {
  const { token, payload, isExpired, setToken, clearToken } = useJWT();

  const { authenticatedFetch } = useAuthenticatedFetch();

  const handleLogin = async (credentials) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.ok) {
      const { access_token } = await response.json();
      setToken(access_token);
    }
  };

  const handleLogout = () => {
    clearToken();
  };

  const fetchProtectedData = async () => {
    try {
      const response = await authenticatedFetch("/api/protected/data");
      const data = await response.json();
      // Handle data
    } catch (error) {
      // Handle authentication errors
    }
  };

  return (
    <div>
      {token ? (
        <div>
          <p>Welcome, {payload?.email}</p>
          <button onClick={handleLogout}>Logout</button>
          <button onClick={fetchProtectedData}>Fetch Data</button>
        </div>
      ) : (
        <button onClick={() => handleLogin(credentials)}>Login</button>
      )}
    </div>
  );
}
```

### 3. Creating Protected API Routes

```typescript
import { createProtectedRoute } from "@/lib/jwt-utils";
import { NextRequest, NextResponse } from "next/server";

export const GET = createProtectedRoute(
  async (request: NextRequest, userId: string) => {
    // Your protected API logic here
    // userId is automatically extracted from the JWT token

    return NextResponse.json({
      success: true,
      data: { userId, message: "Protected data" },
    });
  }
);
```

### 4. Using Cookie-Based Authentication

```typescript
import { withCookieAuth, createAuthenticatedResponse } from "@/lib/jwt-cookies";
import { NextRequest, NextResponse } from "next/server";

export const GET = withCookieAuth(
  async (request: NextRequest, userId: string) => {
    // Your protected API logic here

    return NextResponse.json({
      success: true,
      data: { userId },
    });
  }
);

// Setting cookies in response
export const POST = async (request: NextRequest) => {
  const { access_token, refresh_token } = await request.json();

  return createAuthenticatedResponse(
    { success: true, message: "Login successful" },
    access_token,
    refresh_token
  );
};
```

### 5. Route Protection with Middleware

The middleware automatically protects routes defined in the `protectedRoutes` array:

```typescript
// src/middleware.ts
const protectedRoutes = [
  "/dashboard",
  "/api/protected",
  "/profile",
  "/settings",
];
```

Routes starting with these paths will require valid JWT authentication.

## Configuration

### Environment Variables

Make sure you have the following environment variables set:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### JWT Token Storage

The system supports two token storage methods:

1. **LocalStorage** (Client-side): Used by the `useJWT` hook
2. **Cookies** (Server-side): Used by the middleware and cookie utilities

## Security Features

- **Automatic Token Validation**: All protected routes validate JWT tokens
- **Expiration Checking**: Tokens are checked for expiration before use
- **Automatic Refresh**: Built-in logic for token refresh when expiring soon
- **Secure Cookie Options**: HTTP-only cookies with secure flags in production
- **Route Protection**: Automatic redirection to login for unauthenticated users

## Token Refresh

The system includes automatic token refresh logic:

- Tokens are checked every minute for expiration
- Warnings are sent when tokens expire within 5 minutes
- API responses include headers indicating when refresh is needed

## Error Handling

The system provides comprehensive error handling:

- **401 Unauthorized**: Invalid or missing tokens
- **Token Expired**: Automatic redirection to login
- **Validation Errors**: Detailed error messages for debugging

## Extending the System

### Adding Custom Permissions

```typescript
// In your JWT payload, add permissions
interface JWTPayload {
  sub: string;
  email: string;
  permissions: string[];
  roles: string[];
}

// Use the usePermissions hook
const { hasPermission, hasRole } = usePermissions();

if (hasPermission("read:users")) {
  // Show user management features
}

if (hasRole("admin")) {
  // Show admin features
}
```

### Custom Token Validation

```typescript
// Extend JWTUtils class
class CustomJWTUtils extends JWTUtils {
  static validateCustomClaim(token: string, claim: string): boolean {
    const payload = this.decodeToken(token);
    return payload?.[claim] === true;
  }
}
```

## Best Practices

1. **Always validate tokens** on both client and server side
2. **Use HTTPS** in production for secure token transmission
3. **Implement proper error handling** for authentication failures
4. **Set appropriate token expiration times** (not too long, not too short)
5. **Use refresh tokens** for long-lived sessions
6. **Clear tokens on logout** to prevent unauthorized access
7. **Monitor token expiration** and refresh proactively

## Troubleshooting

### Common Issues

1. **Token not being sent**: Check Authorization header format (`Bearer <token>`)
2. **Middleware not working**: Ensure middleware.ts is in the correct location
3. **Cookie issues**: Check cookie configuration and domain settings
4. **Token expiration**: Implement proper refresh token logic

### Debug Mode

Enable debug logging by setting:

```typescript
// In your environment
NODE_ENV = development;
```

This will provide detailed logging for JWT operations.

## API Reference

### JWTUtils Class

- `decodeToken(token: string): JWTPayload | null`
- `isTokenExpired(token: string): boolean`
- `isExpiringSoon(token: string, thresholdMinutes?: number): boolean`
- `getUserIdFromToken(token: string): string | null`
- `getEmailFromToken(token: string): string | null`
- `validateToken(token: string): boolean`

### React Hooks

- `useJWT()`: Main JWT management hook
- `useAuthenticatedFetch()`: Hook for authenticated API calls
- `usePermissions()`: Hook for permission checking

### Middleware Functions

- `withAuth()`: Protect API routes with JWT validation
- `createProtectedRoute()`: Helper for creating protected routes
- `withCookieAuth()`: Cookie-based authentication middleware

This JWT system provides a robust foundation for authentication in your Next.js application while maintaining security best practices and ease of use.
