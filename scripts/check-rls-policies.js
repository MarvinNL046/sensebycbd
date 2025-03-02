// Script to check Supabase RLS policies
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Note: This requires the service key, not the anon key
);

// Function to get all tables
async function getTables() {
  try {
    const { data, error } = await supabase.rpc('get_tables');
    
    if (error) {
      console.error('Error getting tables:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Unexpected error getting tables:', error);
    return [];
  }
}

// Function to get RLS policies for a table
async function getPolicies(tableName) {
  try {
    const { data, error } = await supabase.rpc('get_policies', { target_table: tableName });
    
    if (error) {
      console.error(`Error getting policies for table ${tableName}:`, error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error(`Unexpected error getting policies for table ${tableName}:`, error);
    return [];
  }
}

// Function to check if RLS is enabled for a table
async function isRLSEnabled(tableName) {
  try {
    const { data, error } = await supabase.rpc('is_rls_enabled', { table_name: tableName });
    
    if (error) {
      console.error(`Error checking RLS for table ${tableName}:`, error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error(`Unexpected error checking RLS for table ${tableName}:`, error);
    return null;
  }
}

// Main function to check RLS policies
async function checkRLSPolicies() {
  console.log('Checking RLS policies...');
  
  // Get all tables
  const tables = await getTables();
  
  if (!tables || tables.length === 0) {
    console.log('No tables found or error occurred.');
    return;
  }
  
  console.log(`Found ${tables.length} tables.`);
  
  // Check RLS for each table
  for (const table of tables) {
    const tableName = table.table_name;
    
    // Skip system tables
    if (tableName.startsWith('pg_') || tableName.startsWith('_')) {
      continue;
    }
    
    console.log(`\nTable: ${tableName}`);
    
    // Check if RLS is enabled
    const rlsEnabled = await isRLSEnabled(tableName);
    
    if (rlsEnabled === null) {
      console.log(`  Could not determine if RLS is enabled.`);
      continue;
    }
    
    console.log(`  RLS Enabled: ${rlsEnabled}`);
    
    if (rlsEnabled) {
      // Get policies for the table
      const policies = await getPolicies(tableName);
      
      if (!policies || policies.length === 0) {
        console.log(`  No policies found or error occurred.`);
        continue;
      }
      
      console.log(`  Found ${policies.length} policies:`);
      
      // Print each policy
      for (const policy of policies) {
        console.log(`    Policy: ${policy.policy_name}`);
        console.log(`      Operation: ${policy.operation}`);
        console.log(`      Definition: ${policy.definition}`);
        console.log(`      Roles: ${policy.roles}`);
      }
    }
  }
  
  console.log('\nRLS policy check completed.');
}

// Run the function
checkRLSPolicies();
