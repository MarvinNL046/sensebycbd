// Script to execute SQL directly using the Supabase REST API
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client with the service key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Note: This requires the service key, not the anon key
);

// Function to execute SQL directly
async function executeSQL(sql) {
  try {
    console.log('Executing SQL...');
    console.log(sql);
    
    // Execute the SQL directly using the Supabase REST API
    const { data, error } = await supabase.rpc('exec_sql', { sql });
    
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

// Main function to execute SQL
async function main() {
  // Check if SQL is provided as a command line argument
  const sql = process.argv[2];
  
  if (!sql) {
    console.error('Please provide SQL as a command line argument');
    process.exit(1);
  }
  
  // Execute the SQL
  const success = await executeSQL(sql);
  
  if (success) {
    console.log('SQL executed successfully');
  } else {
    console.error('Failed to execute SQL');
    process.exit(1);
  }
}

// Run the function
main();
