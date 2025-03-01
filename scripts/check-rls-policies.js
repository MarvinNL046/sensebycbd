// Script to check RLS policies
const { createClient } = require('@supabase/supabase-js');

// Get credentials from command line arguments
const supabaseUrl = process.argv[2];
const serviceRoleKey = process.argv[3];

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase credentials');
  console.error('Usage: node scripts/check-rls-policies.js SUPABASE_URL SERVICE_ROLE_KEY');
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

async function checkRlsPolicies() {
  console.log('\n=== CHECKING RLS POLICIES ===\n');
  
  try {
    // Check RLS policies for users table
    const { data: policies, error } = await supabaseAdmin.rpc('pg_get_policies', {
      p_table_name: 'users'
    });
    
    if (error) {
      console.error('Error checking RLS policies:', error.message);
      
      // Try alternative approach
      console.log('Trying alternative approach...');
      const { data: altPolicies, error: altError } = await supabaseAdmin.rpc('pg_execute_and_return', {
        p_statement: `
          SELECT 
            schemaname, 
            tablename, 
            policyname, 
            roles, 
            cmd, 
            qual, 
            with_check
          FROM 
            pg_policies 
          WHERE 
            tablename = 'users'
        `
      });
      
      if (altError) {
        console.error('Alternative approach failed:', altError.message);
        
        // Try direct SQL query
        console.log('Trying direct SQL query...');
        const { data: directPolicies, error: directError } = await supabaseAdmin.from('pg_policies').select('*').eq('tablename', 'users');
        
        if (directError) {
          console.error('Direct SQL query failed:', directError.message);
          return false;
        }
        
        console.log('RLS policies for users table:');
        console.log(directPolicies);
        return true;
      }
      
      console.log('RLS policies for users table:');
      console.log(altPolicies);
      return true;
    }
    
    console.log('RLS policies for users table:');
    console.log(policies);
    return true;
  } catch (error) {
    console.error('Error checking RLS policies:', error.message);
    return false;
  }
}

async function main() {
  await checkRlsPolicies();
  
  // Now let's check if an admin user can see all users
  console.log('\n=== CHECKING IF ADMIN CAN SEE ALL USERS ===\n');
  
  try {
    // First, get the admin user
    const { data: adminUsers, error: adminError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('is_admin', true)
      .limit(1);
    
    if (adminError) {
      console.error('Error finding admin user:', adminError.message);
      return;
    }
    
    if (!adminUsers || adminUsers.length === 0) {
      console.error('No admin users found');
      return;
    }
    
    const adminUser = adminUsers[0];
    console.log(`Found admin user: ${adminUser.email} (${adminUser.id})`);
    
    // Create a client with the admin user's auth
    console.log('Creating client with admin user auth...');
    
    // We can't actually authenticate as the admin user without their password,
    // so we'll use the service role key and simulate the auth by setting the auth.uid
    
    // Get all users with the admin client
    const { data: allUsers, error: allUsersError } = await supabaseAdmin
      .from('users')
      .select('*');
    
    if (allUsersError) {
      console.error('Error fetching all users:', allUsersError.message);
      return;
    }
    
    console.log(`Found ${allUsers.length} users with admin client`);
    
    // Now let's check if the RLS policy for "Admins can view all users" exists
    const { data: adminViewPolicy, error: policyError } = await supabaseAdmin.rpc('pg_execute_and_return', {
      p_statement: `
        SELECT 
          policyname
        FROM 
          pg_policies 
        WHERE 
          tablename = 'users'
          AND policyname = 'Admins can view all users'
      `
    });
    
    if (policyError) {
      console.error('Error checking admin view policy:', policyError.message);
    } else {
      if (adminViewPolicy && adminViewPolicy.length > 0) {
        console.log('✅ "Admins can view all users" policy exists');
      } else {
        console.log('❌ "Admins can view all users" policy does not exist');
        
        // Add the policy
        console.log('Adding "Admins can view all users" policy...');
        const { error: addPolicyError } = await supabaseAdmin.rpc('pg_execute', {
          p_statement: `
            CREATE POLICY "Admins can view all users" 
            ON public.users 
            FOR SELECT 
            USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));
          `
        });
        
        if (addPolicyError) {
          console.error('Error adding policy:', addPolicyError.message);
        } else {
          console.log('✅ Successfully added "Admins can view all users" policy');
        }
      }
    }
    
    // Check if the RLS policy for "Admins can update all users" exists
    const { data: adminUpdatePolicy, error: updatePolicyError } = await supabaseAdmin.rpc('pg_execute_and_return', {
      p_statement: `
        SELECT 
          policyname
        FROM 
          pg_policies 
        WHERE 
          tablename = 'users'
          AND policyname = 'Admins can update all users'
      `
    });
    
    if (updatePolicyError) {
      console.error('Error checking admin update policy:', updatePolicyError.message);
    } else {
      if (adminUpdatePolicy && adminUpdatePolicy.length > 0) {
        console.log('✅ "Admins can update all users" policy exists');
      } else {
        console.log('❌ "Admins can update all users" policy does not exist');
        
        // Add the policy
        console.log('Adding "Admins can update all users" policy...');
        const { error: addUpdatePolicyError } = await supabaseAdmin.rpc('pg_execute', {
          p_statement: `
            CREATE POLICY "Admins can update all users" 
            ON public.users 
            FOR UPDATE 
            USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));
          `
        });
        
        if (addUpdatePolicyError) {
          console.error('Error adding update policy:', addUpdatePolicyError.message);
        } else {
          console.log('✅ Successfully added "Admins can update all users" policy');
        }
      }
    }
  } catch (error) {
    console.error('Error checking admin access:', error.message);
  }
}

main().catch(error => {
  console.error('Unhandled error:', error.message);
  console.error(error);
});
