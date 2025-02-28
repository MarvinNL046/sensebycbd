# Database Migrations

This directory contains SQL migration scripts for the Supabase database.

## How to Run Migrations

### Option 1: Using the Supabase Dashboard

1. Log in to your Supabase dashboard at https://app.supabase.io
2. Navigate to your project
3. Go to the SQL Editor
4. Copy the contents of the migration file
5. Paste it into the SQL Editor
6. Click "Run" to execute the migration

### Option 2: Using the Supabase CLI

If you have the Supabase CLI installed, you can run migrations using the following command:

```bash
supabase db push
```

This will apply all migrations in the migrations directory to your Supabase database.

## Migration Files

- `20250228_update_orders_table.sql`: Updates the orders table to match the expected structure in the application code.
  - Renames `total` column to `total_amount`
  - Adds `shipping_info` and `payment_info` JSONB columns
  - Adds `loyalty_points_earned` column
  - Removes `shipping_address` and `payment_id` columns
