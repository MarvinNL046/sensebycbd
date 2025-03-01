-- Fix admin policies to avoid infinite recursion

-- First, drop the existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Direct query to avoid RLS
  SELECT u.is_admin INTO is_admin
  FROM public.users u
  WHERE u.id = uid;
  
  RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies using the function
CREATE POLICY "Admins can view all users" 
  ON public.users 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all users" 
  ON public.users 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

-- Make sure the admin user is set
UPDATE public.users
SET is_admin = true
WHERE email = 'marvinsmit1988@gmail.com';

-- Verify the policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'users';
