// Script to test Supabase storage functionality
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Connecting to Supabase with service role key...');

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Test image path - using a sample image from the public directory
const TEST_IMAGE_PATH = path.join(__dirname, '../public/images/products/cbd-oil.jpg');
// If the test image doesn't exist, we'll create a simple test image
const FALLBACK_TEST_IMAGE_PATH = path.join(__dirname, '../test-image.jpg');

// Create a test image if needed
function createTestImageIfNeeded() {
  if (fs.existsSync(TEST_IMAGE_PATH)) {
    return TEST_IMAGE_PATH;
  }
  
  console.log('Test image not found, creating a fallback test image...');
  
  // Check if public/images/products directory exists
  const productsDir = path.join(__dirname, '../public/images/products');
  if (fs.existsSync(productsDir)) {
    // Look for any image in the products directory
    const files = fs.readdirSync(productsDir);
    for (const file of files) {
      if (file.endsWith('.jpg') || file.endsWith('.png') || file.endsWith('.jpeg')) {
        return path.join(productsDir, file);
      }
    }
  }
  
  // If no image is found, create a simple test image
  if (!fs.existsSync(FALLBACK_TEST_IMAGE_PATH)) {
    console.log('Creating a simple test image...');
    // This is a very simple 1x1 pixel JPEG
    const testImageData = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20,
      0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27,
      0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xdb, 0x00, 0x43, 0x01, 0x09, 0x09,
      0x09, 0x0c, 0x0b, 0x0c, 0x18, 0x0d, 0x0d, 0x18, 0x32, 0x21, 0x1c, 0x21, 0x32, 0x32, 0x32, 0x32,
      0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32,
      0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32,
      0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0xff, 0xc0,
      0x00, 0x11, 0x08, 0x00, 0x01, 0x00, 0x01, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11,
      0x01, 0xff, 0xc4, 0x00, 0x15, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xc4,
      0x00, 0x14, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x11, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x0c, 0x03, 0x01,
      0x00, 0x02, 0x11, 0x03, 0x11, 0x00, 0x3f, 0x00, 0xb2, 0xc0, 0x07, 0xff, 0xd9
    ]);
    
    fs.writeFileSync(FALLBACK_TEST_IMAGE_PATH, testImageData);
  }
  
  return FALLBACK_TEST_IMAGE_PATH;
}

// List all storage buckets
async function listBuckets() {
  console.log('\nListing storage buckets...');
  
  try {
    const { data: buckets, error } = await supabaseAdmin.storage.listBuckets();
    
    if (error) {
      throw error;
    }
    
    if (buckets.length === 0) {
      console.log('No buckets found. Creating required buckets...');
      await createRequiredBuckets();
      return;
    }
    
    console.log('Available buckets:');
    buckets.forEach((bucket, index) => {
      console.log(`${index + 1}. ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
    });
    
    // Check if required buckets exist
    const hasImagesBucket = buckets.some(bucket => bucket.name === 'images');
    const hasProductsBucket = buckets.some(bucket => bucket.name === 'products');
    
    if (!hasImagesBucket && !hasProductsBucket) {
      console.log('\nRequired buckets not found. Creating them...');
      await createRequiredBuckets();
    }
  } catch (error) {
    console.error('Error listing buckets:', error.message);
  }
}

// Create required buckets
async function createRequiredBuckets() {
  try {
    // Create images bucket (public)
    console.log('Creating "images" bucket (public)...');
    const { error: imagesBucketError } = await supabaseAdmin.storage.createBucket('images', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    });
    
    if (imagesBucketError) {
      console.error('Error creating images bucket:', imagesBucketError.message);
    } else {
      console.log('✅ "images" bucket created successfully');
    }
    
    // Create products bucket (public)
    console.log('Creating "products" bucket (public)...');
    const { error: productsBucketError } = await supabaseAdmin.storage.createBucket('products', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
    });
    
    if (productsBucketError) {
      console.error('Error creating products bucket:', productsBucketError.message);
    } else {
      console.log('✅ "products" bucket created successfully');
    }
  } catch (error) {
    console.error('Error creating buckets:', error.message);
  }
}

// Test uploading a file to a bucket
async function testUpload() {
  console.log('\nTesting file upload...');
  
  try {
    const testImagePath = createTestImageIfNeeded();
    console.log(`Using test image: ${testImagePath}`);
    
    if (!fs.existsSync(testImagePath)) {
      throw new Error(`Test image not found at ${testImagePath}`);
    }
    
    const fileContent = fs.readFileSync(testImagePath);
    const fileName = path.basename(testImagePath);
    const bucketName = 'images';
    const filePath = `test/${fileName}`;
    
    console.log(`Uploading ${fileName} to ${bucketName}/${filePath}...`);
    
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, fileContent, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg'
      });
    
    if (error) {
      throw error;
    }
    
    console.log('✅ File uploaded successfully');
    
    // Get public URL
    const { data: urlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    console.log('Public URL:', urlData.publicUrl);
    
    // Test uploading to products bucket
    const productsBucketName = 'products';
    const productsFilePath = `test/${fileName}`;
    
    console.log(`\nUploading ${fileName} to ${productsBucketName}/${productsFilePath}...`);
    
    const { data: productsData, error: productsError } = await supabaseAdmin.storage
      .from(productsBucketName)
      .upload(productsFilePath, fileContent, {
        cacheControl: '3600',
        upsert: true,
        contentType: 'image/jpeg'
      });
    
    if (productsError) {
      throw productsError;
    }
    
    console.log('✅ File uploaded successfully to products bucket');
    
    // Get public URL for products bucket
    const { data: productsUrlData } = supabaseAdmin.storage
      .from(productsBucketName)
      .getPublicUrl(productsFilePath);
    
    console.log('Products bucket public URL:', productsUrlData.publicUrl);
    
    return true;
  } catch (error) {
    console.error('❌ Error uploading file:', error.message);
    return false;
  }
}

// Set bucket policies to public
async function setBucketPolicies() {
  console.log('\nSetting bucket policies to public...');
  
  try {
    // Set images bucket policy
    console.log('Setting "images" bucket policy to public...');
    const { error: imagesPolicyError } = await supabaseAdmin.storage.updateBucket('images', {
      public: true
    });
    
    if (imagesPolicyError) {
      console.error('Error setting images bucket policy:', imagesPolicyError.message);
    } else {
      console.log('✅ "images" bucket policy set to public');
    }
    
    // Set products bucket policy
    console.log('Setting "products" bucket policy to public...');
    const { error: productsPolicyError } = await supabaseAdmin.storage.updateBucket('products', {
      public: true
    });
    
    if (productsPolicyError) {
      console.error('Error setting products bucket policy:', productsPolicyError.message);
    } else {
      console.log('✅ "products" bucket policy set to public');
    }
  } catch (error) {
    console.error('Error setting bucket policies:', error.message);
  }
}

// Main function
async function main() {
  console.log('=== TESTING SUPABASE STORAGE ===');
  
  // List buckets
  await listBuckets();
  
  // Set bucket policies
  await setBucketPolicies();
  
  // Test upload
  const uploadSuccess = await testUpload();
  
  console.log('\n=== SUMMARY ===');
  if (uploadSuccess) {
    console.log('✅ Supabase storage is working correctly');
    console.log('\nIf you were having issues with uploading product images, they should be fixed now.');
    console.log('The following changes were made:');
    console.log('1. Created missing storage buckets if needed');
    console.log('2. Set bucket policies to public');
    console.log('3. Verified file upload functionality');
  } else {
    console.log('❌ There are still issues with Supabase storage');
    console.log('\nPossible solutions:');
    console.log('1. Check if your Supabase project has storage enabled');
    console.log('2. Verify that your service role key has the necessary permissions');
    console.log('3. Check if you have exceeded your storage quota');
    console.log('4. Try creating the buckets manually in the Supabase dashboard');
  }
}

main().catch(error => {
  console.error('Error:', error.message);
});
