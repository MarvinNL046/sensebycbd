// Script to execute the admin RLS functions SQL
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Create a Supabase client with the service key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Note: This requires the service key, not the anon key
);

// Function to execute SQL from a file
async function executeSQLFromFile(filePath) {
  try {
    console.log(`Reading SQL file: ${filePath}`);
    
    // Read the SQL file
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log('Executing SQL...');
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error('Error executing SQL:', error);
      return false;
    }
    
    console.log('SQL executed successfully');
    return true;
  } catch (error) {
    console.error('Unexpected error executing SQL:', error);
    return false;
  }
}

// Main function to execute the SQL functions
async function executeAdminRLSFunctions() {
  console.log('Executing admin RLS functions...');
  
  // Path to the SQL file
  const sqlFilePath = path.join(__dirname, '..', 'supabase', 'admin-rls-functions.sql');
  
  // Execute the SQL
  const success = await executeSQLFromFile(sqlFilePath);
  
  if (success) {
    console.log('Admin RLS functions executed successfully');
  } else {
    console.error('Failed to execute admin RLS functions');
  }
}

// Run the function
executeAdminRLSFunctions();
