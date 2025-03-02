# Fixing the Admin CRUD System

This document explains how to fix issues with the admin CRUD (Create, Read, Update, Delete) system in the SenseByCBD admin dashboard.

## Problem

The admin dashboard may have issues with CRUD operations due to:

1. Supabase Row Level Security (RLS) policies restricting write operations
2. Authentication issues where the user might not have the proper permissions
3. Environment variables not being properly set up

## Solution

We've created several scripts and SQL functions to diagnose and fix these issues:

### 1. Test CRUD Operations

You can test if CRUD operations are working properly by:

- Using the test page at `/admin/test-crud`
- Running the Node.js script `scripts/test-admin-crud.js`

### 2. Check RLS Policies

To check the current RLS policies:

```bash
# Make sure you have the SUPABASE_SERVICE_KEY in your .env.local file
node scripts/check-rls-policies.js
```

### 3. Apply Admin RLS Policies

To apply RLS policies that allow admin users to perform CRUD operations:

1. First, execute the SQL functions:

```bash
node scripts/execute-admin-rls-functions.js
```

2. Then, apply the policies:

```bash
node scripts/apply-admin-rls-policies.js
```

## Environment Variables

Make sure you have the following environment variables set in your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

The `ADMIN_EMAILS` variable should contain a comma-separated list of email addresses that should have admin privileges.

## Troubleshooting

If you're still having issues:

1. Check the Supabase dashboard to make sure the RLS policies are applied correctly
2. Verify that your user account has admin privileges (either through the `users` table or the `ADMIN_EMAILS` environment variable)
3. Check the browser console for any errors during CRUD operations
4. Make sure you're properly authenticated when performing CRUD operations

## Implementation Details

### RLS Policies

The RLS policies we apply allow:

- Admin users (as defined in the `users` table with `is_admin = true`) to perform all CRUD operations
- Users with emails listed in the `ADMIN_EMAILS` environment variable to perform all CRUD operations
- Regular users to only read public data

### SQL Functions

We've created several SQL functions to manage RLS policies:

- `enable_rls(table_name)`: Enables RLS for a table
- `create_policy(table_name, policy_name, operation, definition, check_option, for_role)`: Creates a policy
- `get_tables()`: Gets all tables in the database
- `get_policies(table_name)`: Gets all policies for a table
- `is_rls_enabled(table_name)`: Checks if RLS is enabled for a table
- `set_admin_emails(emails)`: Sets the admin emails in PostgreSQL settings
- `is_admin()`: Checks if the current user is an admin

These functions are defined in `supabase/admin-rls-functions.sql`.
