# Supabase Database Management

This document explains how to manage your Supabase database directly from VS Code, eliminating the need to manually execute SQL queries in the Supabase interface.

## Setup

The project has been configured with the Supabase CLI to allow for easier database management. The CLI has been installed as a dev dependency, and several npm scripts have been added to package.json.

### Prerequisites

1. Make sure you have the Supabase CLI configured with your project:

```bash
npx supabase login
```

2. Link your local project with your Supabase project:

```bash
npx supabase link --project-ref your-project-ref
```

Replace `your-project-ref` with your Supabase project reference ID, which you can find in your Supabase dashboard URL.

## Available Commands

The following npm scripts have been added to package.json to make database management easier:

### Creating a New Migration

There are two ways to create a new migration file:

#### Option 1: Using the Supabase CLI

```bash
npm run db:new-migration migration_name
```

This will create a new timestamped SQL file in the `supabase/migrations` directory using the Supabase CLI.

#### Option 2: Using the Custom Script (Recommended)

```bash
npm run db:create-migration migration_name
```

This uses our custom script that creates a new migration file with a helpful template that includes:
- Proper timestamp formatting
- A section for describing the migration
- Example SQL statements for common operations
- Reminders about Row Level Security (RLS)

This is the recommended approach as it provides more guidance and consistency in your migration files.

### Generating a Migration from Changes

If you've made changes to your local database and want to generate a migration file:

```bash
npm run db:diff migration_name
```

This will compare your local database with the remote one and generate a migration file with the differences.

### Pushing Changes to Supabase

To apply your migrations to your Supabase database:

```bash
npm run db:push
```

This will push all your migration files to your Supabase database.

### Resetting Your Database

If you need to reset your database to a clean state:

```bash
npm run db:reset
```

**Warning**: This will reset your database to its initial state, applying all migrations from scratch. Use with caution in production environments.

### Checking Database Status

To check if your Supabase database is up to date with the latest migrations:

```bash
npm run db:check-status
```

This script will:
- Check if the Supabase CLI is installed and working
- Verify if your project is linked to a Supabase project
- List all migration files in your project
- Check if your code is compatible with the latest schema
- Check if there are any pending migrations
- Provide a summary and recommended actions if needed

## Workflow Example

Here's a typical workflow for making database changes:

1. Create a new migration file using our custom script:
   ```bash
   npm run db:create-migration add_user_preferences
   ```

2. Edit the generated migration file in `supabase/migrations/[timestamp]_add_user_preferences.sql`, which already includes helpful templates and examples:
   ```sql
   -- Add user_preferences table
   CREATE TABLE user_preferences (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID REFERENCES auth.users(id) NOT NULL,
     theme VARCHAR(20) DEFAULT 'light',
     notifications BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Add RLS policies
   ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Users can view their own preferences"
     ON user_preferences
     FOR SELECT
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can update their own preferences"
     ON user_preferences
     FOR UPDATE
     USING (auth.uid() = user_id);
   ```

3. Push the changes to your Supabase database:
   ```bash
   npm run db:push
   ```

## Best Practices

1. **Always use migrations**: Avoid making manual changes to your database schema through the Supabase dashboard. Instead, create migration files and push them using the CLI.

2. **Version control**: Keep all your migration files in version control to track database changes over time.

3. **Test migrations**: Before applying migrations to production, test them in a development or staging environment.

4. **Document changes**: Add comments to your migration files to explain what changes are being made and why.

5. **Backup before major changes**: Always create a backup of your database before applying major changes.

## Troubleshooting

If you encounter issues with the Supabase CLI:

1. Make sure you're logged in:
   ```bash
   npx supabase login
   ```

2. Check if your project is linked correctly:
   ```bash
   npx supabase projects list
   ```

3. Re-link your project if necessary:
   ```bash
   npx supabase link --project-ref your-project-ref
   ```

4. Check the Supabase CLI documentation for more information:
   [Supabase CLI Documentation](https://supabase.com/docs/reference/cli)
