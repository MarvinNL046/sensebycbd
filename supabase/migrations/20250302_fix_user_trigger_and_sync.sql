-- Fix user trigger and synchronize users
-- Run this in the Supabase SQL Editor

-- 1. Recreate the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, is_admin)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Synchronize existing users
INSERT INTO public.users (id, email, full_name, is_admin, created_at)
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'full_name', 
  COALESCE((raw_user_meta_data->>'is_admin')::boolean, false),
  created_at
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;

-- 5. Verify the trigger exists
SELECT tgname, tgrelid::regclass, tgtype, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- 6. Count users in both tables for verification
SELECT 'auth.users' as table_name, COUNT(*) as user_count FROM auth.users
UNION ALL
SELECT 'public.users' as table_name, COUNT(*) as user_count FROM public.users;
