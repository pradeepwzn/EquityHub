# 🔧 Complete RLS Policy Fix for Startup Simulator

## ❌ **Current Error**

```
Failed to create company: new row violates row-level security policy for table "companies"
```

## 🎯 **Root Cause**

Supabase Row-Level Security (RLS) is blocking company creation because:

1. RLS is enabled on the `companies` table
2. No policy exists to allow users to insert their own companies
3. The `auth.uid()` function in RLS policies needs proper authentication context

## 🚀 **Solution 1: Quick Fix (Disable RLS)**

### Step 1: Go to Supabase Dashboard

1. Open [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project
4. Go to **SQL Editor** in the left sidebar

### Step 2: Run This SQL Script

```sql
-- Disable RLS temporarily for testing
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Verify the changes
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('companies', 'users');
```

### Step 3: Test Company Creation

After running the SQL, try creating a company in your app again.

## 🔒 **Solution 2: Proper RLS Policy (Production Ready)**

### Step 1: Enable RLS

```sql
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create Company Policy

```sql
-- Allow users to access their own companies
CREATE POLICY "Users can access their own companies" ON public.companies
FOR ALL USING (user_id::text = auth.uid()::text);

-- Allow users to insert their own companies
CREATE POLICY "Users can insert their own companies" ON public.companies
FOR INSERT WITH CHECK (user_id::text = auth.uid()::text);

-- Allow users to update their own companies
CREATE POLICY "Users can update their own companies" ON public.companies
FOR UPDATE USING (user_id::text = auth.uid()::text);

-- Allow users to delete their own companies
CREATE POLICY "Users can delete their own companies" ON public.companies
FOR DELETE USING (user_id::text = auth.uid()::text);
```

### Step 3: Create User Policy

```sql
-- Allow users to access their own data
CREATE POLICY "Users can access own data" ON public.users
FOR ALL USING (id::text = auth.uid()::text);
```

## 🔍 **Troubleshooting**

### Check Current RLS Status

```sql
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename IN ('companies', 'users');
```

### Check Existing Policies

```sql
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename IN ('companies', 'users');
```

### Test Database Connection

```sql
-- Test if you can query the companies table
SELECT * FROM public.companies LIMIT 5;

-- Test if you can insert (after fixing RLS)
INSERT INTO public.companies (name, user_id, total_shares, esop_pool, status)
VALUES ('Test Company', 'your-user-id', 1000000, 10, 'Active');
```

## ⚠️ **Important Notes**

1. **Environment Variables**: Make sure your `.env.local` file has:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **Authentication**: The user must be properly authenticated for RLS policies to work

3. **User ID Format**: Ensure the `user_id` in your database matches the format from `auth.uid()`

## 🎉 **Expected Result**

After applying the fix:

- Company creation should work without errors
- Users can only access their own companies
- Database operations are properly secured

## 📞 **Need Help?**

If the issue persists after running the SQL:

1. Check the Supabase logs for more details
2. Verify your environment variables are set correctly
3. Ensure the user is properly authenticated
4. Check if there are any other database constraints

