#!/usr/bin/env node

/**
 * This script applies the shipping_address column hotfix directly to the Supabase database
 * It executes the SQL directly via the REST API instead of using the pgmigrate RPC
 * 
 * Usage:
 * node scripts/apply-shipping-address-hotfix-direct.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing required environment variables.');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file.');
  process.exit(1);
}

// Create Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// SQL to check if the column already exists
const checkColumnSQL = `
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'orders'
  AND column_name = 'shipping_address'
) as column_exists;
`;

// SQL to add the column if it doesn't exist
const addColumnSQL = `
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_address JSONB;
`;

// SQL to copy data from shipping_info to shipping_address
const copyDataSQL = `
UPDATE orders
SET shipping_address = shipping_info
WHERE shipping_info IS NOT NULL AND shipping_address IS NULL;
`;

// SQL to add a comment to the column
const addCommentSQL = `
COMMENT ON COLUMN orders.shipping_address IS 'Shipping address information as a JSON object. Added as a hotfix to prevent errors with code that expects this column.';
`;

async function applyMigration() {
  console.log('Applying shipping_address column hotfix...');
  
  try {
    // Check if the column already exists
    const { data: checkResult, error: checkError } = await supabase.rpc('pg_query', { query: checkColumnSQL });
    
    if (checkError) {
      throw new Error(`Failed to check if column exists: ${checkError.message}`);
    }
    
    const columnExists = checkResult && checkResult.length > 0 && checkResult[0].column_exists;
    
    if (columnExists) {
      console.log('The shipping_address column already exists in the orders table.');
      return;
    }
    
    // Add the column
    console.log('Adding shipping_address column...');
    const { error: addError } = await supabase.rpc('pg_query', { query: addColumnSQL });
    
    if (addError) {
      throw new Error(`Failed to add column: ${addError.message}`);
    }
    
    // Copy data from shipping_info to shipping_address
    console.log('Copying data from shipping_info to shipping_address...');
    const { error: copyError } = await supabase.rpc('pg_query', { query: copyDataSQL });
    
    if (copyError) {
      throw new Error(`Failed to copy data: ${copyError.message}`);
    }
    
    // Add a comment to the column
    console.log('Adding comment to the column...');
    const { error: commentError } = await supabase.rpc('pg_query', { query: addCommentSQL });
    
    if (commentError) {
      throw new Error(`Failed to add comment: ${commentError.message}`);
    }
    
    console.log('\n✅ Hotfix applied successfully!');
    console.log('The shipping_address column has been added to the orders table.');
    console.log('This should prevent errors when the code tries to access this column.');
    console.log('\nNote: This is a temporary solution. The proper fix is to update the code to use shipping_info instead of shipping_address.');
  } catch (error) {
    console.error('\n❌ Failed to apply hotfix:', error.message);
    
    // Provide alternative manual instructions
    console.log('\nAlternative: You can apply the migration manually using the Supabase SQL editor:');
    console.log('1. Go to https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Go to the SQL Editor');
    console.log('4. Create a new query');
    console.log('5. Paste the following SQL:');
    console.log(`
-- Add shipping_address column if it doesn't exist
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS shipping_address JSONB;

-- Copy data from shipping_info to shipping_address
UPDATE orders
SET shipping_address = shipping_info
WHERE shipping_info IS NOT NULL AND shipping_address IS NULL;

-- Add a comment to the column
COMMENT ON COLUMN orders.shipping_address IS 'Shipping address information as a JSON object. Added as a hotfix to prevent errors with code that expects this column.';
    `);
    console.log('\n6. Run the query');
    
    process.exit(1);
  }
}

// Run the migration
applyMigration();
