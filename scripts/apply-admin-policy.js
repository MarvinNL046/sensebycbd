// Script to apply the admin policy migration
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Connecting to Supabase with service role key...');

// Create admin client
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Path to the migration file
const migrationFilePath = path.join(
  process.cwd(),
  'supabase',
  'migrations',
  '20250302_add_admin_users_policy.sql'
);

// Check if the migration file exists
if (!fs.existsSync(migrationFilePath)) {
  console.error(`Error: Migration file not found at ${migrationFilePath}`);
  process.exit(1);
}

// Read the migration file
const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');

// Check if Supabase CLI is installed
function isSupabaseCLIInstalled() {
  try {
    execSync('supabase --version', { stdio: 'ignore' });
    return true;
  } catch (error) {
    return false;
  }
}

// Apply the migration using Supabase CLI
async function applyMigrationWithCLI() {
  console.log('\n=== APPLYING MIGRATION WITH SUPABASE CLI ===\n');
  
  try {
    console.log('Running migration with Supabase CLI...');
    execSync(`supabase db push --db-url "${process.env.SUPABASE_DB_URL}"`, { stdio: 'inherit' });
    console.log('✅ Migration applied successfully with Supabase CLI');
    return true;
  } catch (error) {
    console.error('❌ Error applying migration with Supabase CLI:', error.message);
    return false;
  }
}

// Apply the migration manually
async function applyMigrationManually() {
  console.log('\n=== APPLYING MIGRATION MANUALLY ===\n');
  
  console.log('Since we cannot execute SQL directly through the REST API, you need to run this SQL in the Supabase dashboard:');
  console.log('\n1. Go to https://app.supabase.com/');
  console.log('2. Select your project');
  console.log('3. Go to the SQL Editor (in the left sidebar)');
  console.log('4. Create a new query');
  console.log('5. Copy and paste the following SQL:');
  console.log('\n```sql');
  console.log(migrationSQL);
  console.log('```');
  console.log('\n6. Run the query');
  
  // Ask the user if they've run the SQL
  console.log('\nHave you run the SQL in the Supabase dashboard? (y/n)');
  process.stdin.once('data', async (data) => {
    const input = data.toString().trim().toLowerCase();
    
    if (input === 'y' || input === 'yes') {
      console.log('Great! Let\'s verify that the migration was applied successfully.');
      await verifyMigration();
    } else {
      console.log('Please run the SQL in the Supabase dashboard and then run this script again.');
      process.exit(0);
    }
  });
}

// Verify that the migration was applied successfully
async function verifyMigration() {
  console.log('\n=== VERIFYING MIGRATION ===\n');
  
  try {
    // Check if the admin user can view all users
    console.log('Checking if the admin user can view all users...');
    
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*');
    
    if (error) {
      console.error('❌ Error fetching users:', error.message);
      return false;
    }
    
    console.log(`✅ Found ${users.length} users in the public.users table`);
    
    if (users.length === 0) {
      console.log('⚠️ No users found in the public.users table');
      return false;
    }
    
    // Check if there's at least one admin user
    const adminUsers = users.filter(user => user.is_admin);
    
    if (adminUsers.length === 0) {
      console.log('⚠️ No admin users found. Let\'s make one of the users an admin.');
      
      // Make the first user an admin
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ is_admin: true })
        .eq('id', users[0].id);
      
      if (updateError) {
        console.error('❌ Error making user an admin:', updateError.message);
        return false;
      }
      
      console.log(`✅ Successfully made ${users[0].email} an admin`);
    } else {
      console.log(`✅ Found ${adminUsers.length} admin users:`);
      adminUsers.forEach(user => {
        console.log(`  - ${user.email}`);
      });
    }
    
    console.log('\n=== MIGRATION VERIFIED ===');
    console.log('The migration was applied successfully!');
    console.log('You should now be able to see all users in your admin dashboard at:');
    console.log('https://www.sensebycbd.com/admin/users');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error verifying migration:', error.message);
    return false;
  }
}

// Main function
async function main() {
  // Check if Supabase CLI is installed
  if (isSupabaseCLIInstalled() && process.env.SUPABASE_DB_URL) {
    const success = await applyMigrationWithCLI();
    
    if (success) {
      await verifyMigration();
    } else {
      await applyMigrationManually();
    }
  } else {
    await applyMigrationManually();
  }
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error.message);
  console.error(error);
});
