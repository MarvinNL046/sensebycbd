// Script to apply RLS policies for admin users
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client with the service key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Note: This requires the service key, not the anon key
);

// Tables that need RLS policies
const tables = [
  'products',
  'categories',
  'orders',
  'order_items',
  'users',
  'blog_posts',
  'blog_categories',
  'translations'
];

// Function to enable RLS for a table
async function enableRLS(tableName) {
  try {
    console.log(`Enabling RLS for table ${tableName}...`);
    
    // Execute SQL to enable RLS
    const { error } = await supabase.rpc('enable_rls', { table_name: tableName });
    
    if (error) {
      console.error(`Error enabling RLS for table ${tableName}:`, error);
      return false;
    }
    
    console.log(`RLS enabled for table ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Unexpected error enabling RLS for table ${tableName}:`, error);
    return false;
  }
}

// Function to create an admin policy for a table
async function createAdminPolicy(tableName, operation) {
  try {
    const policyName = `admin_${operation}_${tableName}`;
    console.log(`Creating policy ${policyName}...`);
    
    // Define the policy definition based on the operation
    let definition = '';
    
    if (operation === 'select') {
      definition = `(
        auth.uid() IN (
          SELECT id FROM users WHERE is_admin = true
        ) OR 
        auth.email() IN (
          SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
        )
      )`;
    } else {
      // For insert, update, delete operations, only allow admins
      definition = `(
        auth.uid() IN (
          SELECT id FROM users WHERE is_admin = true
        ) OR 
        auth.email() IN (
          SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
        )
      )`;
    }
    
    // Execute SQL to create the policy
    const { error } = await supabase.rpc('create_policy', {
      table_name: tableName,
      policy_name: policyName,
      operation: operation,
      definition: definition,
      check_option: 'PERMISSIVE',
      for_role: 'authenticated'
    });
    
    if (error) {
      console.error(`Error creating policy ${policyName}:`, error);
      return false;
    }
    
    console.log(`Policy ${policyName} created successfully`);
    return true;
  } catch (error) {
    console.error(`Unexpected error creating policy for table ${tableName}:`, error);
    return false;
  }
}

// Function to set up admin emails in PostgreSQL settings
async function setupAdminEmails() {
  try {
    console.log('Setting up admin emails in PostgreSQL settings...');
    
    // Get admin emails from environment variable
    const adminEmails = process.env.ADMIN_EMAILS || 'marvinsmit1988@gmail.com';
    
    // Execute SQL to set the admin emails
    const { error } = await supabase.rpc('set_admin_emails', { emails: adminEmails });
    
    if (error) {
      console.error('Error setting admin emails:', error);
      return false;
    }
    
    console.log('Admin emails set successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error setting admin emails:', error);
    return false;
  }
}

// Main function to apply RLS policies
async function applyRLSPolicies() {
  console.log('Applying RLS policies for admin users...');
  
  // Set up admin emails
  await setupAdminEmails();
  
  // Apply policies to each table
  for (const table of tables) {
    // Enable RLS for the table
    const rlsEnabled = await enableRLS(table);
    
    if (!rlsEnabled) {
      console.log(`Skipping policy creation for table ${table} due to RLS enablement failure`);
      continue;
    }
    
    // Create policies for each operation
    const operations = ['select', 'insert', 'update', 'delete'];
    
    for (const operation of operations) {
      await createAdminPolicy(table, operation);
    }
    
    console.log(`Completed policy setup for table ${table}`);
  }
  
  console.log('\nRLS policy application completed.');
}

// Run the function
applyRLSPolicies();
