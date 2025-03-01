# Database Migrations

This directory contains SQL migration scripts for the Supabase database.

## How to Run Migrations

### Option 1: Using the Supabase Dashboard (Manual Method)

1. Log in to your Supabase dashboard at https://app.supabase.io
2. Navigate to your project
3. Go to the SQL Editor
4. Copy the contents of the migration file
5. Paste it into the SQL Editor
6. Click "Run" to execute the migration

### Option 2: Using the Supabase CLI (Recommended)

We've now integrated the Supabase CLI into the project as a dev dependency, making it easier to manage database migrations directly from VS Code.

You can run migrations using the following npm scripts:

```bash
# Create a new migration file
npm run db:new-migration migration_name

# Generate a migration from database changes
npm run db:diff migration_name

# Push all migrations to your Supabase database
npm run db:push

# Reset your database (use with caution)
npm run db:reset
```

For detailed instructions on how to use these commands and set up the Supabase CLI, please refer to the [Supabase Management Documentation](../docs/supabase-management.md).

## Migration Files

- `20250228_update_orders_table.sql`: Updates the orders table to match the expected structure in the application code.
  - Renames `total` column to `total_amount`
  - Adds `shipping_info` and `payment_info` JSONB columns
  - Adds `loyalty_points_earned` column
  - Removes `shipping_address` and `payment_id` columns

- `example_migration.sql`: An example migration file that demonstrates the recommended format and structure.
  - This is for reference only and should not be applied to the database
  - Shows how to create tables, indexes, RLS policies, functions, and triggers
  - Includes detailed comments explaining each section
