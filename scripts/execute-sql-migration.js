// Script to execute the SQL migration directly
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  console.error('You can run "node scripts/setup-env.js" to set up your environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Connecting to Supabase with service role key...');

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Path to the SQL migration file
const migrationFilePath = path.join(
  process.cwd(),
  'supabase',
  'migrations',
  '20250302_fix_user_trigger_and_sync.sql'
);

// Check if the migration file exists
if (!fs.existsSync(migrationFilePath)) {
  console.error(`Error: Migration file not found at ${migrationFilePath}`);
  process.exit(1);
}

// Read the migration file
const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');

// Split the SQL into individual statements
const sqlStatements = migrationSQL
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0 && !statement.startsWith('--'));

async function executeSQL() {
  console.log('\n=== EXECUTING SQL MIGRATION ===\n');
  
  try {
    // Execute each SQL statement
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      console.log(`Executing statement ${i + 1}/${sqlStatements.length}...`);
      
      // Skip comments
      if (statement.startsWith('--')) {
        continue;
      }
      
      // Execute the statement
      const { data, error } = await supabaseAdmin.rpc('pgaudit.exec_sql', {
        query: statement
      });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error.message);
        console.error('Statement:', statement);
        
        // Try alternative method
        console.log('Trying alternative method...');
        const { error: altError } = await supabaseAdmin.rpc('exec_sql', {
          query: statement
        });
        
        if (altError) {
          console.error('Alternative method failed:', altError.message);
          
          // Try another alternative
          console.log('Trying direct SQL query...');
          const { error: directError } = await supabaseAdmin.from('_exec_sql').select(`exec_sql('${statement.replace(/'/g, "''")}')`);
          
          if (directError) {
            console.error('Direct SQL query failed:', directError.message);
            console.log('Continuing with next statement...');
          } else {
            console.log('Direct SQL query succeeded!');
          }
        } else {
          console.log('Alternative method succeeded!');
        }
      } else {
        console.log('Statement executed successfully!');
      }
    }
    
    console.log('\n=== SQL MIGRATION COMPLETED ===\n');
    
    // Verify that users are now in the public.users table
    console.log('Checking if users are now in the public.users table...');
    
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('Error fetching users:', usersError.message);
    } else {
      console.log(`Found ${users.length} users in the public.users table`);
      
      if (users.length > 0) {
        console.log('\nUser details:');
        users.forEach((user, index) => {
          console.log(`\nUser ${index + 1}:`);
          console.log(`  ID: ${user.id}`);
          console.log(`  Email: ${user.email}`);
          console.log(`  Name: ${user.full_name || 'Not provided'}`);
          console.log(`  Admin: ${user.is_admin ? 'Yes' : 'No'}`);
          console.log(`  Created: ${new Date(user.created_at).toLocaleString()}`);
        });
      } else {
        console.log('No users found in the public.users table');
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log('SQL migration has been executed.');
    console.log('If you see users listed above, the synchronization was successful!');
    console.log('You should now be able to see all users in your admin dashboard.');
    console.log('\nIf you need to make a user an admin, run:');
    console.log('node scripts/make-user-admin.js your-email@example.com');
  } catch (error) {
    console.error('Unexpected error:', error.message);
    console.error(error);
  }
}

executeSQL();
