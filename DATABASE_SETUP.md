# Database Setup and Troubleshooting

## Environment Variables Required

To connect to your Supabase database, you need to create a `.env.local` file in the project root with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### How to get these values:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key

## Testing Database Connection

### Option 1: Use the Debug Tab

1. Start the development server: `npm run dev`
2. Log in to your account
3. Go to the "Database Debug" tab in the dashboard
4. This will show you all the data in your database

### Option 2: Use the Test Script

1. Set your environment variables
2. Run the test script: `node scripts/test-db.js`
3. This will test the connection and show what data exists

### Option 3: Use the API Endpoint

1. Start the development server
2. Visit `/api/debug/database` in your browser
3. This will return JSON with all database data

## Common Issues and Solutions

### Issue: "Missing Supabase environment variables"

**Solution:** Create a `.env.local` file with your Supabase credentials

### Issue: "Authentication required" error

**Solution:** Make sure you're logged in to the application

### Issue: Database tables don't exist

**Solution:** Run the SQL setup script in your Supabase SQL editor:

```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('users', 'companies', 'founders', 'funding_rounds');
```

### Issue: Data exists but not showing in the app

**Possible causes:**

1. User ID mismatch between auth and database
2. Database permissions not set correctly
3. Store not loading data properly

**Debugging steps:**

1. Check the browser console for errors
2. Use the Database Debug tab to see what data exists
3. Check if the user ID in the database matches your auth user ID

## Database Schema

The application expects these tables:

### users

- `id` (UUID, primary key)
- `username` (text)
- `email` (text)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### companies

- `id` (UUID, primary key)
- `name` (text)
- `user_id` (UUID, foreign key to users.id)
- `total_shares` (integer)
- `valuation` (integer)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### founders

- `id` (UUID, primary key)
- `company_id` (UUID, foreign key to companies.id)
- `name` (text)
- `initial_ownership` (numeric)
- `current_ownership` (numeric)
- `shares` (integer)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### funding_rounds

- `id` (UUID, primary key)
- `company_id` (UUID, foreign key to companies.id)
- `name` (text)
- `investment_amount` (integer)
- `pre_money_valuation` (integer)
- `post_money_valuation` (integer)
- `shares_issued` (integer)
- `price_per_share` (numeric)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## Row Level Security (RLS) Policies

Make sure your Supabase tables have the correct RLS policies:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE founders ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_rounds ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Companies can only be accessed by their owner
CREATE POLICY "Companies can be accessed by owner" ON companies
  FOR ALL USING (auth.uid() = user_id);

-- Founders can only be accessed by company owner
CREATE POLICY "Founders can be accessed by company owner" ON founders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = founders.company_id
      AND companies.user_id = auth.uid()
    )
  );

-- Funding rounds can only be accessed by company owner
CREATE POLICY "Funding rounds can be accessed by company owner" ON funding_rounds
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM companies
      WHERE companies.id = funding_rounds.company_id
      AND companies.user_id = auth.uid()
    )
  );
```

## Testing the Setup

1. **Start the server:** `npm run dev`
2. **Check environment variables:** Look for console messages about missing variables
3. **Log in:** Use your existing account or create a new one
4. **Check the debug tab:** See what data exists in your database
5. **Create test data:** Try creating a company, founder, or funding round
6. **Verify persistence:** Refresh the page and check if data persists

## Getting Help

If you're still having issues:

1. Check the browser console for error messages
2. Use the Database Debug tab to see the current state
3. Verify your Supabase credentials are correct
4. Check that your database tables exist and have the correct schema
5. Ensure RLS policies are set up correctly
