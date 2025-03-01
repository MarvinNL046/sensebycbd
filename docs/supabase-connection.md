# Supabase Connection Documentation

This document provides information about the Supabase connection setup, available utilities, and database structure for the SenseBy CBD project.

## Connection Setup

The connection to Supabase is configured using environment variables in the `.env.local` file:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tkihdbdnowkpazahzfyp.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Two Supabase clients are available:
1. **Regular client** (`supabase`) - For normal operations with Row Level Security (RLS)
2. **Admin client** (`supabaseAdmin`) - For administrative operations that bypass RLS

## Database Structure

The Supabase database contains the following tables:

| Table Name | Description | Key Fields |
|------------|-------------|------------|
| products | Product information | id, name, price, description, category_id, slug |
| categories | Product categories | id, name, slug, description |
| users | User information | id, email, full_name, loyalty_points, is_admin |
| orders | Order information | id, user_id, status, total_amount, shipping_info |
| order_items | Items within orders | id, order_id, product_id, quantity, price |
| blog_posts | Blog content | id, title, slug, content, excerpt, author_id, category_id |
| blog_categories | Blog categorization | id, name, slug, description |
| blog_tags | Blog tagging system | id, name, slug |
| reviews | Product reviews | id, product_id, user_id, rating, comment |
| translations | Translation data | (structure varies) |

## Utility Functions

The `lib/supabase-utils.ts` file provides comprehensive utility functions for working with Supabase:

### Authentication Utilities

```typescript
// Get the current logged in user
async function getCurrentUser(): Promise<User | null>

// Check if a user is logged in
async function isAuthenticated(): Promise<boolean>

// Sign up a new user
async function signUp(email: string, password: string)

// Sign in a user
async function signIn(email: string, password: string)

// Sign out the current user
async function signOut()
```

### Database Utilities

```typescript
// Generic function to fetch data from any table
async function fetchData<T>(
  table: string,
  columns: string = '*',
  filters: Record<string, any> = {},
  options: {
    limit?: number;
    offset?: number;
    orderBy?: { column: string; ascending?: boolean };
  } = {}
): Promise<{ data: T[] | null; error: any }>

// Generic function to insert data into any table
async function insertData<T>(
  table: string,
  data: Record<string, any> | Record<string, any>[]
)

// Generic function to update data in any table
async function updateData(
  table: string,
  data: Record<string, any>,
  filters: Record<string, any>
)

// Generic function to delete data from any table
async function deleteData(
  table: string,
  filters: Record<string, any>
)
```

### Storage Utilities

The following storage buckets are available:
- **images** - Public bucket for general image storage
- **products** - Public bucket for product images

```typescript
// Upload a file to Supabase Storage
async function uploadFile(
  bucket: string,  // 'images' or 'products'
  path: string,    // e.g., 'products/123/main.jpg'
  file: File
)

// Get a public URL for a file
function getPublicUrl(
  bucket: string,  // 'images' or 'products'
  path: string     // e.g., 'products/123/main.jpg'
)

// Delete a file from storage
async function deleteFile(
  bucket: string,  // 'images' or 'products'
  path: string     // e.g., 'products/123/main.jpg'
)
```

### Admin Utilities

These functions require the service role key and should only be used in admin-protected routes:

```typescript
// List all tables in the database
async function listTables()

// Get table schema information
async function getTableSchema(tableName: string)

// Get all data from a table (admin access bypasses RLS)
async function getTableData(tableName: string, limit: number = 100)

// Execute a raw SQL query (use with caution)
async function executeRawQuery(query: string, params?: any[])
```

### Database Health Check

```typescript
// Check if the database connection is working
async function checkConnection()
```

## Usage Examples

### Basic Data Operations

```typescript
import { fetchData, insertData, updateData, deleteData } from '../lib/supabase-utils';

// Fetch products with filters and pagination
async function getProducts() {
  const { data, error } = await fetchData(
    'products',
    'id, name, price, description',
    { is_featured: true },
    { limit: 10, orderBy: { column: 'created_at', ascending: false } }
  );
  
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  
  return data || [];
}

// Create a new product
async function createProduct(product) {
  const { data, error } = await insertData('products', {
    name: product.name,
    price: product.price,
    description: product.description,
    slug: product.name.toLowerCase().replace(/\s+/g, '-'),
    category_id: product.categoryId
  });
  
  if (error) {
    console.error('Error creating product:', error);
    return null;
  }
  
  return data?.[0] || null;
}

// Update a product
async function updateProduct(id, updates) {
  const { data, error } = await updateData(
    'products',
    updates,
    { id }
  );
  
  if (error) {
    console.error('Error updating product:', error);
    return false;
  }
  
  return true;
}

// Delete a product
async function deleteProduct(id) {
  const { error } = await deleteData('products', { id });
  
  if (error) {
    console.error('Error deleting product:', error);
    return false;
  }
  
  return true;
}
```

### Authentication

```typescript
import { signIn, signOut, getCurrentUser } from '../lib/supabase-utils';

// Sign in a user
async function loginUser(email, password) {
  const { data, error } = await signIn(email, password);
  
  if (error) {
    console.error('Error signing in:', error);
    return null;
  }
  
  return data.user;
}

// Check if user is logged in and get user data
async function checkAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    // Redirect to login page
    window.location.href = '/login';
    return null;
  }
  
  return user;
}

// Sign out
async function logout() {
  await signOut();
  window.location.href = '/';
}
```

### File Storage

```typescript
import { uploadFile, getPublicUrl, deleteFile } from '../lib/supabase-utils';

// Upload a product image
async function uploadProductImage(file, productId) {
  const path = `products/${productId}/${file.name}`;
  const { data, error } = await uploadFile('images', path, file);
  
  if (error) {
    console.error('Error uploading file:', error);
    return null;
  }
  
  // Get the public URL for the uploaded file
  const publicUrl = getPublicUrl('images', path);
  
  return publicUrl;
}

// Delete a product image
async function deleteProductImage(path) {
  const { error } = await deleteFile('images', path);
  
  if (error) {
    console.error('Error deleting file:', error);
    return false;
  }
  
  return true;
}
```

### Admin Operations

```typescript
import { listTables, getTableSchema, getTableData } from '../lib/supabase-utils';

// Get a list of all tables
async function getAllTables() {
  const { data, error } = await listTables();
  
  if (error) {
    console.error('Error listing tables:', error);
    return [];
  }
  
  return data || [];
}

// Get schema for a specific table
async function getSchema(tableName) {
  const { data, error } = await getTableSchema(tableName);
  
  if (error) {
    console.error(`Error getting schema for ${tableName}:`, error);
    return [];
  }
  
  return data || [];
}

// Get all data from a table
async function getAllData(tableName) {
  const { data, error } = await getTableData(tableName);
  
  if (error) {
    console.error(`Error getting data from ${tableName}:`, error);
    return [];
  }
  
  return data || [];
}
```

## Testing Scripts

Several scripts are available to test and explore the Supabase connection:

1. **Test Connection Script** (`scripts/test-supabase-connection.js`)
   - Tests the basic connection to Supabase
   - Fetches sample data from the products table

2. **List Tables Script** (`scripts/list-supabase-tables.js`)
   - Lists tables in the database
   - Shows sample data from the products table

3. **Explore Tables Script** (`scripts/explore-supabase-tables.js`)
   - Comprehensive exploration of all tables
   - Shows table structure and sample data
   - Provides a summary of all tables found

4. **Storage Test Script** (`scripts/test-supabase-storage.js`)
   - Tests and fixes Supabase storage functionality
   - Creates missing storage buckets if needed
   - Sets bucket policies to public
   - Tests file upload functionality

To run these scripts:

```bash
node scripts/test-supabase-connection.js
node scripts/list-supabase-tables.js
node scripts/explore-supabase-tables.js
node scripts/test-supabase-storage.js
```

## Admin Test Page

A test page is available at `/admin/supabase-test` that demonstrates:
- Connection status checking
- Product listing, creation, editing, and deletion
- Database table exploration

This page can be used to verify the Supabase connection is working correctly and to test the various utility functions.

## Troubleshooting

If you encounter issues with the Supabase connection:

1. **Check Environment Variables**
   - Ensure the Supabase URL and keys are correctly set in `.env.local`

2. **Verify Network Connectivity**
   - Make sure your network allows connections to the Supabase servers

3. **Check Permissions**
   - For admin operations, ensure the service role key has the necessary permissions
   - For regular operations, ensure Row Level Security (RLS) policies are correctly configured

4. **Run Test Scripts**
   - Use the provided test scripts to diagnose connection issues
   - Check for specific error messages that might indicate the problem

5. **Storage Issues**
   - If you're having trouble uploading files, run `node scripts/test-supabase-storage.js`
   - This script will create missing buckets, set proper permissions, and test uploads
   - Common storage issues include:
     - Missing storage buckets
     - Incorrect bucket permissions
     - File size limits exceeded
     - Unsupported file types
     - Row Level Security (RLS) policy violations

   If you encounter "Error uploading image: new row violates row-level security policy", we've implemented the following solutions:
   
   **Solution 1: API Endpoint for File Uploads**
   
   We've created a dedicated API endpoint at `pages/api/upload.ts` that handles file uploads using the admin client on the server side, which bypasses RLS policies. The ProductForm component has been updated to use this endpoint:
   
   ```typescript
   // Upload image to Supabase Storage via API endpoint
   const uploadImage = async (file: File, path: string): Promise<string> => {
     const fileExt = file.name.split('.').pop();
     const fileName = `${Date.now()}.${fileExt}`;
     const filePath = `${path}/${fileName}`;
     
     try {
       // Create a FormData object
       const formData = new FormData();
       formData.append('file', file);
       formData.append('bucket', 'products');
       formData.append('path', filePath);
       
       // Send the file to our API endpoint
       const response = await fetch('/api/upload', {
         method: 'POST',
         body: formData,
       });
       
       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || 'Error uploading image');
       }
       
       const data = await response.json();
       return data.url;
     } catch (error: any) {
       console.error('Upload error:', error);
       throw new Error(`Error uploading image: ${error.message || 'Unknown error'}`);
     }
   };
   ```
   
   The API endpoint (`pages/api/upload.ts`) uses the Supabase admin client with the service role key to upload files, which bypasses RLS policies:
   
   ```typescript
   // Upload the file to Supabase Storage
   const { data, error } = await supabaseAdmin.storage
     .from(bucket)
     .upload(path, fileBuffer, {
       contentType: file.mimetype || 'application/octet-stream',
       cacheControl: '3600',
       upsert: true,
     });
   ```
   
   **Solution 2: Apply RLS Policies**
   
   You can also apply the RLS policies defined in `supabase/migrations/20250302_fix_storage_rls_policies.sql` directly in the Supabase dashboard:
   
   1. Go to the Supabase dashboard
   2. Navigate to Storage > Policies
   3. Add policies that allow authenticated users to upload files

6. **Check Console Logs**
   - Look for error messages in the browser console or server logs
