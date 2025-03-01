-- Add policy to allow admins to view all users
CREATE POLICY "Admins can view all users" 
  ON public.users 
  FOR SELECT 
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));

-- Add policy to allow admins to update all users
CREATE POLICY "Admins can update all users" 
  ON public.users 
  FOR UPDATE 
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));

-- Make one of the existing users an admin (replace with your email)
UPDATE public.users
SET is_admin = true
WHERE email = 'marvinsmit1988@gmail.com';

-- Verify the policies
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'users';

-- Verify admin users
SELECT id, email, is_admin
FROM public.users
WHERE is_admin = true;
