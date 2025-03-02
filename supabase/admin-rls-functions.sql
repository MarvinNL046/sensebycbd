-- SQL functions for RLS policies

-- Function to enable RLS for a table
CREATE OR REPLACE FUNCTION enable_rls(table_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', table_name);
END;
$$;

-- Function to create a policy
CREATE OR REPLACE FUNCTION create_policy(
  table_name text,
  policy_name text,
  operation text,
  definition text,
  check_option text DEFAULT 'PERMISSIVE',
  for_role text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Drop the policy if it already exists
  BEGIN
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', policy_name, table_name);
  EXCEPTION WHEN OTHERS THEN
    -- Ignore errors
  END;
  
  -- Create the policy
  IF for_role IS NULL THEN
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR %s USING (%s) WITH CHECK (%s)',
      policy_name,
      table_name,
      operation,
      definition,
      definition
    );
  ELSE
    EXECUTE format(
      'CREATE POLICY %I ON %I FOR %s TO %I USING (%s) WITH CHECK (%s)',
      policy_name,
      table_name,
      operation,
      for_role,
      definition,
      definition
    );
  END IF;
END;
$$;

-- Function to get all tables
CREATE OR REPLACE FUNCTION get_tables()
RETURNS TABLE (
  table_name text,
  table_schema text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT t.tablename::text, t.schemaname::text
  FROM pg_tables t
  WHERE t.schemaname = 'public';
END;
$$;

-- Function to get policies for a table
CREATE OR REPLACE FUNCTION get_policies(target_table text)
RETURNS TABLE (
  policy_name text,
  table_name text,
  operation text,
  roles text[],
  definition text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.polname::text,
    t.relname::text,
    CASE
      WHEN p.polcmd = 'r' THEN 'select'
      WHEN p.polcmd = 'a' THEN 'insert'
      WHEN p.polcmd = 'w' THEN 'update'
      WHEN p.polcmd = 'd' THEN 'delete'
      WHEN p.polcmd = '*' THEN 'all'
      ELSE p.polcmd::text
    END,
    p.polroles::text[],
    pg_get_expr(p.polqual, p.polrelid)::text
  FROM pg_policy p
  JOIN pg_class t ON p.polrelid = t.oid
  WHERE t.relname = target_table
  AND t.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
END;
$$;

-- Function to check if RLS is enabled for a table
CREATE OR REPLACE FUNCTION is_rls_enabled(table_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result boolean;
BEGIN
  SELECT c.relrowsecurity INTO result
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public'
  AND c.relname = table_name;
  
  RETURN result;
END;
$$;

-- Function to set admin emails in PostgreSQL settings
CREATE OR REPLACE FUNCTION set_admin_emails(emails text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Set the admin emails in the PostgreSQL settings
  PERFORM set_config('app.admin_emails', emails, false);
END;
$$;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if the user is an admin
  RETURN (
    auth.uid() IN (
      SELECT id FROM users WHERE is_admin = true
    ) OR 
    auth.email() IN (
      SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
    )
  );
END;
$$;
