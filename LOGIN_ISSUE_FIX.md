# Login Issue Fix Guide

## Problem Description

Users are able to register successfully but cannot log in afterward. This is caused by a mismatch between the authentication systems and database setup.

## Root Cause

The issue stems from a **database schema mismatch** between Supabase's authentication system and the application's user management:

1. **Supabase Auth**: Creates users in the `auth.users` table when they sign up
2. **Application Database**: Expects users to exist in the `public.users` table
3. **Missing Link**: No automatic creation of users in `public.users` table
4. **RLS Policies Fail**: Row Level Security policies can't find users, causing login to appear to fail

## Solutions

### Solution 1: Database Trigger (Recommended)

Run the SQL script `fix-user-creation-trigger.sql` in your Supabase SQL editor:

```sql
-- This creates a trigger that automatically creates users in public.users
-- when they sign up with Supabase auth
```

**Steps:**
1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `fix-user-creation-trigger.sql`
4. Run the script

### Solution 2: Manual User Creation in Code

The `AuthContext.tsx` has been updated to manually create users in the `public.users` table as a fallback.

### Solution 3: Check Environment Variables

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Testing the Fix

1. **Clear any existing sessions** in your browser
2. **Try to register a new user** - this should work
3. **Try to log in** with the same credentials - this should now work
4. **Check the browser console** for any error messages

## Debugging

If issues persist, check the browser console for:

- Authentication errors
- Database connection issues
- RLS policy violations

## Database Schema Requirements

The `public.users` table must have this structure:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## RLS Policies

Ensure these policies exist and are working:

```sql
-- Users can view own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

-- Users can insert own data (during signup)
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (true);
```

## Alternative Approach

If the above solutions don't work, consider:

1. **Disabling RLS temporarily** for testing
2. **Using Supabase's built-in user management** instead of custom tables
3. **Implementing a different authentication flow**

## Verification

After applying the fix:

1. Users should be able to register and log in
2. The `public.users` table should contain entries for all registered users
3. RLS policies should work correctly
4. Scenario saving should work (as this was also fixed)

## Support

If you continue to experience issues:

1. Check the Supabase logs for errors
2. Verify the database schema matches the expected structure
3. Ensure all RLS policies are correctly configured
4. Check that the trigger function has proper permissions

