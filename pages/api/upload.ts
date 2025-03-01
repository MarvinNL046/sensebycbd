import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable, { Fields, Files, File } from 'formidable';
import fs from 'fs';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

// Create a Supabase admin client with the service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Parse the form data
    const form = formidable({ multiples: true });
    
    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err: Error | null, fields: Fields, files: Files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    // Get the bucket and path from the form data
    const bucketValue = fields.bucket;
    const pathValue = fields.path;
    
    const bucket = Array.isArray(bucketValue) ? bucketValue[0] : bucketValue;
    const path = Array.isArray(pathValue) ? pathValue[0] : pathValue;
    
    if (!bucket || !path) {
      return res.status(400).json({ error: 'Missing bucket or path' });
    }

    // Get the file
    const fileValue = files.file;
    
    if (!fileValue) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const file = Array.isArray(fileValue) ? fileValue[0] : fileValue;

    // Read the file
    const fileBuffer = fs.readFileSync(file.filepath);
    
    // Upload the file to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, fileBuffer, {
        contentType: file.mimetype || 'application/octet-stream',
        cacheControl: '3600',
        upsert: true,
      });
    
    if (error) {
      console.error('Supabase upload error:', error);
      return res.status(500).json({ error: `Error uploading file: ${error.message}` });
    }
    
    // Get the public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(path);
    
    // Return the public URL
    return res.status(200).json({ url: urlData.publicUrl });
  } catch (error: any) {
    console.error('Upload API error:', error);
    return res.status(500).json({ error: `Server error: ${error.message}` });
  }
}
