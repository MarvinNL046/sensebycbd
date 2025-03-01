-- Migration to fix Row Level Security (RLS) policies for storage buckets
-- This will allow authenticated users to upload files and public access for reading

-- Enable RLS on the buckets
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Create policies for the buckets table
CREATE POLICY "Public Access to Buckets" ON storage.buckets
  FOR SELECT USING (true);

CREATE POLICY "Admin Access to Buckets" ON storage.buckets
  FOR INSERT USING (auth.role() = 'authenticated' AND (SELECT is_admin FROM public.users WHERE id = auth.uid()));

-- Enable RLS on the objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policies for the objects table
CREATE POLICY "Public Access to Objects" ON storage.objects
  FOR SELECT USING (bucket_id IN ('images', 'products'));

CREATE POLICY "Authenticated Users Can Upload Objects" ON storage.objects
  FOR INSERT USING (
    bucket_id IN ('images', 'products') AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated Users Can Update Own Objects" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('images', 'products') AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Admin Users Can Delete Objects" ON storage.objects
  FOR DELETE USING (
    bucket_id IN ('images', 'products') AND
    auth.role() = 'authenticated' AND
    (SELECT is_admin FROM public.users WHERE id = auth.uid())
  );

-- If the above policies don't work, try these simpler policies that allow all operations
-- Comment out the above policies and uncomment these if needed

-- CREATE POLICY "Allow All Access to Buckets" ON storage.buckets
--   FOR ALL USING (true);

-- CREATE POLICY "Allow All Access to Objects" ON storage.objects
--   FOR ALL USING (true);
