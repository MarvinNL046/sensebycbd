// Script to apply the fix-admin-policies migration
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Get credentials from command line arguments or environment variables
const supabaseUrl = process.argv[2] || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.argv[3] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Usage: node scripts/apply-fix-admin-policies.js [SUPABASE_URL] [SERVICE_ROLE_KEY]');
  console.error('Or set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
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
  '20250302_fix_admin_policies.sql'
);

// Check if the migration file exists
if (!fs.existsSync(migrationFilePath)) {
  console.error(`Error: Migration file not found at ${migrationFilePath}`);
  process.exit(1);
}

// Read the migration file
const migrationSQL = fs.readFileSync(migrationFilePath, 'utf8');

// Split the SQL into statements
const statements = migrationSQL
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement.length > 0);

async function applyMigration() {
  console.log('\n=== APPLYING MIGRATION ===\n');
  
  try {
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      // Execute the statement
      const { error } = await supabaseAdmin.rpc('pg_execute', {
        p_statement: statement
      });
      
      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error.message);
        
        // Try alternative approach
        console.log('Trying alternative approach...');
        
        // Create a temporary function to execute SQL
        const { error: createFunctionError } = await supabaseAdmin.rpc('pg_execute', {
          p_statement: `
            CREATE OR REPLACE FUNCTION public.temp_execute_sql(sql text)
            RETURNS void AS $$
            BEGIN
              EXECUTE sql;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
          `
        });
        
        if (createFunctionError) {
          console.error('Error creating temporary function:', createFunctionError.message);
          
          // If we can't create a function, we'll need to run the SQL manually
          console.log('\n=== MANUAL MIGRATION REQUIRED ===\n');
          console.log('Please run the following SQL in the Supabase dashboard:');
          console.log('\n```sql');
          console.log(migrationSQL);
          console.log('```');
          
          return false;
        }
        
        // Execute the statement using the temporary function
        const { error: executeError } = await supabaseAdmin.rpc('temp_execute_sql', {
          sql: statement
        });
        
        if (executeError) {
          console.error(`Error executing statement ${i + 1} with temporary function:`, executeError.message);
          
          // If we can't execute the statement, we'll need to run the SQL manually
          console.log('\n=== MANUAL MIGRATION REQUIRED ===\n');
          console.log('Please run the following SQL in the Supabase dashboard:');
          console.log('\n```sql');
          console.log(migrationSQL);
          console.log('```');
          
          return false;
        }
        
        // Drop the temporary function
        await supabaseAdmin.rpc('pg_execute', {
          p_statement: `DROP FUNCTION IF EXISTS public.temp_execute_sql(text);`
        });
      }
    }
    
    console.log('\n✅ Migration applied successfully');
    return true;
  } catch (error) {
    console.error('Error applying migration:', error.message);
    
    // If we can't execute the statements, we'll need to run the SQL manually
    console.log('\n=== MANUAL MIGRATION REQUIRED ===\n');
    console.log('Please run the following SQL in the Supabase dashboard:');
    console.log('\n```sql');
    console.log(migrationSQL);
    console.log('```');
    
    return false;
  }
}

async function verifyMigration() {
  console.log('\n=== VERIFYING MIGRATION ===\n');
  
  try {
    // Check if the is_admin function exists
    const { data: functions, error: functionsError } = await supabaseAdmin.rpc('pg_execute_and_return', {
      p_statement: `
        SELECT proname
        FROM pg_proc
        WHERE proname = 'is_admin'
      `
    });
    
    if (functionsError) {
      console.error('Error checking is_admin function:', functionsError.message);
      
      // Try alternative approach
      console.log('Trying alternative approach...');
      
      // Check if we can use the is_admin function
      const { data: testData, error: testError } = await supabaseAdmin.rpc('is_admin', {
        uid: '00000000-0000-0000-0000-000000000000'
      });
      
      if (testError) {
        console.error('Error testing is_admin function:', testError.message);
        return false;
      }
      
      console.log('✅ is_admin function exists and is working');
    } else {
      if (functions && functions.length > 0) {
        console.log('✅ is_admin function exists');
      } else {
        console.log('❌ is_admin function does not exist');
        return false;
      }
    }
    
    // Check if the admin policies exist
    const { data: policies, error: policiesError } = await supabaseAdmin.rpc('pg_execute_and_return', {
      p_statement: `
        SELECT policyname
        FROM pg_policies
        WHERE tablename = 'users'
          AND (policyname = 'Admins can view all users' OR policyname = 'Admins can update all users')
      `
    });
    
    if (policiesError) {
      console.error('Error checking admin policies:', policiesError.message);
      return false;
    }
    
    if (policies && policies.length === 2) {
      console.log('✅ Admin policies exist');
    } else {
      console.log(`❌ Admin policies do not exist (found ${policies ? policies.length : 0} of 2)`);
      return false;
    }
    
    // Check if the admin user is set
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('users')
      .select('email')
      .eq('is_admin', true);
    
    if (adminError) {
      console.error('Error checking admin users:', adminError.message);
      return false;
    }
    
    if (adminUsers && adminUsers.length > 0) {
      console.log(`✅ Admin users exist: ${adminUsers.map(user => user.email).join(', ')}`);
    } else {
      console.log('❌ No admin users found');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error verifying migration:', error.message);
    return false;
  }
}

async function main() {
  const migrationSuccess = await applyMigration();
  
  if (migrationSuccess) {
    const verificationSuccess = await verifyMigration();
    
    if (verificationSuccess) {
      console.log('\n=== SUCCESS ===');
      console.log('Migration applied and verified successfully');
      console.log('\nYou should now be able to see all users in your admin dashboard at:');
      console.log('https://www.sensebycbd.com/admin/users');
    } else {
      console.log('\n=== VERIFICATION FAILED ===');
      console.log('Migration applied but verification failed');
      console.log('Please check the error messages above for more information');
    }
  } else {
    console.log('\n=== MIGRATION FAILED ===');
    console.log('Failed to apply migration');
    console.log('Please check the error messages above for more information');
  }
}

main().catch(error => {
  console.error('Unhandled error:', error.message);
  console.error(error);
});
