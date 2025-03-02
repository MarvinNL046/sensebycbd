#!/usr/bin/env node

/**
 * This script executes the simplified SQL for adding the shipping_address column
 * It uses the Supabase REST API to execute the SQL directly
 * 
 * Usage:
 * node scripts/execute-shipping-address-sql.js
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

// Path to the SQL file
const sqlFilePath = path.join(
  __dirname,
  '..',
  'supabase',
  'migrations',
  '20250302_add_shipping_address_column_simplified.sql'
);

// Read the SQL file
const sql = fs.readFileSync(sqlFilePath, 'utf8');

async function executeSQL() {
  console.log('Executing SQL to add shipping_address column...');
  console.log('SQL to execute:');
  console.log(sql);
  
  try {
    // Execute the SQL directly using the REST API
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        query: sql
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to execute SQL: ${errorText}`);
    }
    
    console.log('\n✅ SQL executed successfully!');
    console.log('The shipping_address column has been added to the orders table.');
    console.log('This should prevent errors when the code tries to access this column.');
    console.log('\nNote: This is a temporary solution. The proper fix is to update the code to use shipping_info instead of shipping_address.');
  } catch (error) {
    console.error('\n❌ Failed to execute SQL:', error.message);
    
    // Provide alternative manual instructions
    console.log('\nAlternative: You can execute the SQL manually using the Supabase SQL Editor:');
    console.log('1. Go to https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Go to the SQL Editor');
    console.log('4. Create a new query');
    console.log('5. Paste the following SQL:');
    console.log('\n' + sql);
    console.log('\n6. Run the query');
    
    process.exit(1);
  }
}

// Execute the SQL
executeSQL();
