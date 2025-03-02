#!/usr/bin/env node

/**
 * This script applies the shipping_address column hotfix to the Supabase database
 * It reads the SQL migration file and executes it against the Supabase database
 * 
 * Usage:
 * node scripts/apply-shipping-address-hotfix.js
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

// Path to the migration file
const migrationFilePath = path.join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '20250302_add_shipping_address_column.sql'
);

// Read the migration file
const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');

async function applyMigration() {
  console.log('Applying shipping_address column hotfix...');
  
  try {
    // Execute the SQL migration
    const { error } = await supabase.rpc('pgmigrate', { query: migrationSQL });
    
    if (error) {
      throw new Error(`Migration failed: ${error.message}`);
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
    console.log('\n' + migrationSQL);
    console.log('\n6. Run the query');
    
    process.exit(1);
  }
}

// Run the migration
applyMigration();
