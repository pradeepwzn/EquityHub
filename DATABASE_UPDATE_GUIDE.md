# Database Update Guide for Enhanced Funding Rounds

## Overview

This guide will help you update your existing Startup Value Simulator database to support the new enhanced funding rounds features, including SAFE agreements, ESOP adjustments, founder secondary sales, and scenario recalculation.

## Prerequisites

- Access to your Supabase project
- SQL editor access (Supabase Dashboard → SQL Editor)
- Existing Startup Value Simulator database (or create new one)

## Option 1: Complete Database Setup (New Installation)

If you're setting up the database for the first time, use the complete setup script:

### 1. Run Complete Setup Script

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `complete-database-setup.sql`
4. Click **Run** to execute the script

This script will create all necessary tables with the enhanced features from scratch.

## Option 2: Update Existing Database (Migration)

If you already have a database with basic tables, use the migration script:

### 1. Run Migration Script

1. Go to your **Supabase Dashboard**
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `migrate-existing-database.sql`
4. Click **Run** to execute the script

This script will add the new columns and features to your existing tables.

### 2. What the Migration Adds

#### New Columns in `funding_rounds` table:

- `round_type` - Type of funding round (SAFE or Priced Round)
- `valuation_type` - Whether valuation is pre-money or post-money
- `esop_adjustment` - JSON field for ESOP pool adjustments
- `founder_secondary_sale` - JSON field for founder secondary sales
- `safe_terms` - JSON field for SAFE agreement terms
- `order_number` - Order of funding rounds

#### New Column in `companies` table:

- `esop_pool` - Percentage of total shares allocated to ESOP pool

#### New Table:

- `exit_scenarios` - For storing exit projections and ownership breakdowns

## Option 3: Manual Column Addition

If you prefer to add columns manually, here are the individual commands:

### 1. Add New Columns to funding_rounds

```sql
-- Add new columns
ALTER TABLE funding_rounds
ADD COLUMN IF NOT EXISTS round_type VARCHAR(20) DEFAULT 'Priced Round',
ADD COLUMN IF NOT EXISTS valuation_type VARCHAR(20) DEFAULT 'pre_money',
ADD COLUMN IF NOT EXISTS esop_adjustment JSONB,
ADD COLUMN IF NOT EXISTS founder_secondary_sale JSONB,
ADD COLUMN IF NOT EXISTS safe_terms JSONB,
ADD COLUMN IF NOT EXISTS order_number INTEGER DEFAULT 0;

-- Add constraints
ALTER TABLE funding_rounds
ADD CONSTRAINT check_round_type
CHECK (round_type IN ('SAFE', 'Priced Round'));

ALTER TABLE funding_rounds
ADD CONSTRAINT check_valuation_type
CHECK (valuation_type IN ('pre_money', 'post_money'));
```

### 2. Add ESOP Pool to companies

```sql
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS esop_pool NUMERIC(5,2) DEFAULT 10.0;
```

### 3. Create exit_scenarios table

```sql
CREATE TABLE IF NOT EXISTS exit_scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  scenario_name VARCHAR(255) NOT NULL,
  exit_valuation BIGINT NOT NULL,
  ownership_breakdown JSONB NOT NULL,
  founder_returns JSONB NOT NULL,
  investor_returns JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Verification

After running any of the above options, verify your setup:

### 1. Run Verification Script

1. Copy and paste the contents of `verify-database-setup.sql`
2. Click **Run** to check your database status

### 2. Manual Verification

Check if the new columns exist:

```sql
-- Check funding_rounds structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'funding_rounds'
ORDER BY ordinal_position;

-- Check companies structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'companies'
ORDER BY ordinal_position;
```

## JSON Field Structures

The new JSON fields expect the following data structures:

### ESOP Adjustment

```json
{
  "add_new_pool": true,
  "pool_size": 1000000,
  "is_pre_money": true
}
```

### Founder Secondary Sale

```json
{
  "enabled": true,
  "shares_sold": 500000,
  "sale_price_per_share": 2.5
}
```

### SAFE Terms

```json
{
  "valuation_cap": 10000000,
  "discount_percentage": 20,
  "conversion_trigger": "next_round"
}
```

## Troubleshooting

### Common Issues

#### 1. "Column already exists" Error

- Use `ADD COLUMN IF NOT EXISTS` to avoid this error
- The migration script handles this automatically

#### 2. Permission Denied

- Ensure you have admin access to your Supabase project
- Check that RLS policies are properly configured

#### 3. Constraint Violation

- Verify that existing data meets the new constraints
- The migration script sets default values for existing records

#### 4. Index Creation Failed

- Some indexes might already exist
- Use `CREATE INDEX IF NOT EXISTS` to avoid errors

### Debug Steps

1. **Check Table Structure**

   ```sql
   \d funding_rounds
   \d companies
   ```

2. **Verify Constraints**

   ```sql
   SELECT constraint_name, constraint_type, table_name
   FROM information_schema.table_constraints
   WHERE table_schema = 'public';
   ```

3. **Check Indexes**

   ```sql
   SELECT indexname, tablename
   FROM pg_indexes
   WHERE schemaname = 'public';
   ```

4. **Test Data Insertion**
   ```sql
   -- Test inserting a funding round with new fields
   INSERT INTO funding_rounds (
     company_id, name, investment_amount,
     pre_money_valuation, post_money_valuation,
     round_type, valuation_type
   ) VALUES (
     'your-company-id', 'Test Round', 1000000,
     5000000, 6000000, 'Priced Round', 'pre_money'
   );
   ```

## Performance Considerations

### Indexes

The setup creates indexes on:

- `round_type` - For filtering by round type
- `valuation_type` - For filtering by valuation type
- `order_number` - For sorting funding rounds
- Foreign keys - For join performance

### JSON Fields

- JSONB fields are indexed automatically by PostgreSQL
- Consider adding GIN indexes for complex JSON queries if needed

## Security

### Row Level Security (RLS)

- All tables have RLS enabled
- Users can only access their own data
- Policies are automatically created

### Data Validation

- Check constraints ensure valid enum values
- JSON fields can be validated at the application level

## Next Steps

After updating your database:

1. **Test the Application**

   - Start your development server
   - Try creating a funding round with new features
   - Test the "Update & Recalculate" functionality

2. **Verify Data Persistence**

   - Create test data with new fields
   - Refresh the page to ensure data persists
   - Check the database directly to verify storage

3. **Monitor Performance**
   - Watch for any slow queries
   - Check database performance metrics
   - Optimize if needed

## Support

If you encounter issues:

1. **Check the verification script output**
2. **Review Supabase logs** in the dashboard
3. **Verify your environment variables**
4. **Check the application console** for errors
5. **Use the Database Debug tab** in the application

## Rollback (If Needed)

If you need to rollback the changes:

```sql
-- Remove new columns from funding_rounds
ALTER TABLE funding_rounds
DROP COLUMN IF EXISTS round_type,
DROP COLUMN IF EXISTS valuation_type,
DROP COLUMN IF EXISTS esop_adjustment,
DROP COLUMN IF EXISTS founder_secondary_sale,
DROP COLUMN IF EXISTS safe_terms,
DROP COLUMN IF EXISTS order_number;

-- Remove new column from companies
ALTER TABLE companies
DROP COLUMN IF EXISTS esop_pool;

-- Drop new table
DROP TABLE IF EXISTS exit_scenarios;
```

**Note**: This will permanently delete any data stored in the new fields.

## Conclusion

The database update provides a solid foundation for the enhanced funding rounds features. The new structure supports:

- **SAFE agreements** with valuation caps and discounts
- **ESOP pool adjustments** with pre/post-money options
- **Founder secondary sales** for liquidity events
- **Enhanced scenario modeling** with ownership breakdowns
- **Real-time recalculation** of valuations and ownership

Follow the verification steps to ensure everything is working correctly, and you'll be ready to use all the new features!
