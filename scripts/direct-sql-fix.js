// Script to directly execute SQL to fix the user trigger and synchronize users
require('dotenv').config({ path: '.env.local' });
const https = require('https');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Extract the project reference from the Supabase URL
const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)[1];

console.log('Supabase URL:', supabaseUrl);
console.log('Project Ref:', projectRef);

// SQL statements to execute
const sqlStatements = [
  // 1. Recreate the handle_new_user function
  `CREATE OR REPLACE FUNCTION public.handle_new_user() 
  RETURNS TRIGGER AS $$
  BEGIN
    INSERT INTO public.users (id, email, full_name, is_admin)
    VALUES (
      new.id, 
      new.email, 
      new.raw_user_meta_data->>'full_name',
      COALESCE((new.raw_user_meta_data->>'is_admin')::boolean, false)
    );
    RETURN new;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;`,

  // 2. Drop the existing trigger if it exists
  `DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;`,

  // 3. Create the trigger
  `CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();`,

  // 4. Synchronize existing users
  `INSERT INTO public.users (id, email, full_name, is_admin, created_at)
  SELECT 
    id, 
    email, 
    raw_user_meta_data->>'full_name', 
    COALESCE((raw_user_meta_data->>'is_admin')::boolean, false),
    created_at
  FROM auth.users
  WHERE id NOT IN (SELECT id FROM public.users)
  ON CONFLICT (id) DO NOTHING;`,

  // 5. Verify the trigger exists
  `SELECT tgname, tgrelid::regclass, tgtype, tgenabled
  FROM pg_trigger
  WHERE tgname = 'on_auth_user_created';`,

  // 6. Count users in both tables for verification
  `SELECT 'auth.users' as table_name, COUNT(*) as user_count FROM auth.users
  UNION ALL
  SELECT 'public.users' as table_name, COUNT(*) as user_count FROM public.users;`
];

// Function to execute a SQL query using the Supabase REST API
function executeSql(sql) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const result = data ? JSON.parse(data) : {};
            resolve(result);
          } catch (e) {
            resolve({ success: true, message: 'Query executed successfully (no JSON response)' });
          }
        } else {
          reject(new Error(`HTTP Error: ${res.statusCode} - ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(JSON.stringify({
      query: sql
    }));

    req.end();
  });
}

// Function to execute all SQL statements
async function executeAllSql() {
  console.log('\n=== EXECUTING SQL STATEMENTS ===\n');

  for (let i = 0; i < sqlStatements.length; i++) {
    const sql = sqlStatements[i];
    console.log(`Executing statement ${i + 1}/${sqlStatements.length}...`);
    
    try {
      const result = await executeSql(sql);
      console.log('Success:', result);
    } catch (error) {
      console.error('Error:', error.message);
      
      // If it's a verification or count query, we can continue
      if (i >= 4) {
        console.log('This was a verification query, continuing...');
      } else {
        console.log('Trying alternative approach...');
        
        try {
          // Try using a different RPC function
          const result = await executeSql(`SELECT exec_sql('${sql.replace(/'/g, "''")}')`);
          console.log('Alternative approach succeeded:', result);
        } catch (altError) {
          console.error('Alternative approach failed:', altError.message);
        }
      }
    }
  }

  console.log('\n=== SQL EXECUTION COMPLETED ===\n');
  
  // Now check if users are in the public.users table
  try {
    console.log('Checking users in public.users table...');
    const result = await executeSql('SELECT * FROM public.users');
    
    if (Array.isArray(result) && result.length > 0) {
      console.log(`Found ${result.length} users in the public.users table`);
      
      console.log('\nUser details:');
      result.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Name: ${user.full_name || 'Not provided'}`);
        console.log(`  Admin: ${user.is_admin ? 'Yes' : 'No'}`);
        console.log(`  Created: ${new Date(user.created_at).toLocaleString()}`);
      });
    } else {
      console.log('No users found in the public.users table or unexpected response format');
    }
  } catch (error) {
    console.error('Error checking users:', error.message);
  }
  
  console.log('\n=== SUMMARY ===');
  console.log('SQL statements have been executed.');
  console.log('If you see users listed above, the synchronization was successful!');
  console.log('You should now be able to see all users in your admin dashboard.');
  console.log('\nIf you need to make a user an admin, run:');
  console.log('node scripts/make-user-admin.js your-email@example.com');
}

// Execute all SQL statements
executeAllSql().catch(error => {
  console.error('Unhandled error:', error.message);
  console.error(error);
});
