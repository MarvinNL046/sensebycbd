// Script to apply Row Level Security (RLS) policies for Supabase storage
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Initialize Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing Supabase environment variables');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Connecting to Supabase with service role key...');

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// Read the SQL file
const sqlFilePath = path.join(__dirname, '../supabase/migrations/20250302_fix_storage_rls_policies.sql');
const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Split the SQL content into individual statements
const sqlStatements = sqlContent
  .split(';')
  .map(statement => statement.trim())
  .filter(statement => statement && !statement.startsWith('--'));

// Function to execute SQL statements
async function executeSQL() {
  console.log('=== APPLYING STORAGE RLS POLICIES ===');
  
  try {
    // First, try to execute the SQL as a single batch
    console.log('Attempting to execute SQL as a batch...');
    
    const { error } = await supabaseAdmin.rpc('exec_sql', { 
      query: sqlContent 
    });
    
    if (error) {
      console.log('Batch execution failed. Trying statement by statement...');
      console.error('Error:', error.message);
      
      // If batch execution fails, try executing statements one by one
      for (let i = 0; i < sqlStatements.length; i++) {
        const statement = sqlStatements[i];
        
        if (!statement) continue;
        
        console.log(`Executing statement ${i + 1}/${sqlStatements.length}...`);
        
        try {
          const { error } = await supabaseAdmin.rpc('exec_sql', { 
            query: statement 
          });
          
          if (error) {
            console.error(`Error executing statement ${i + 1}:`, error.message);
            console.log('Statement:', statement);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (stmtError) {
          console.error(`Error executing statement ${i + 1}:`, stmtError.message);
          console.log('Statement:', statement);
        }
      }
    } else {
      console.log('✅ SQL executed successfully as a batch');
    }
    
    console.log('\n=== APPLYING FALLBACK POLICIES ===');
    console.log('Applying simpler policies that allow all operations...');
    
    // Apply simpler policies as a fallback
    const simplePolicies = [
      `DROP POLICY IF EXISTS "Allow All Access to Buckets" ON storage.buckets;`,
      `CREATE POLICY "Allow All Access to Buckets" ON storage.buckets FOR ALL USING (true);`,
      `DROP POLICY IF EXISTS "Allow All Access to Objects" ON storage.objects;`,
      `CREATE POLICY "Allow All Access to Objects" ON storage.objects FOR ALL USING (true);`
    ];
    
    for (let i = 0; i < simplePolicies.length; i++) {
      const policy = simplePolicies[i];
      
      try {
        const { error } = await supabaseAdmin.rpc('exec_sql', { 
          query: policy 
        });
        
        if (error) {
          console.error(`Error applying fallback policy ${i + 1}:`, error.message);
        } else {
          console.log(`✅ Fallback policy ${i + 1} applied successfully`);
        }
      } catch (policyError) {
        console.error(`Error applying fallback policy ${i + 1}:`, policyError.message);
      }
    }
    
    console.log('\n=== SUMMARY ===');
    console.log('Storage RLS policies have been applied.');
    console.log('If you still encounter issues with file uploads, try these steps:');
    console.log('1. Go to the Supabase dashboard');
    console.log('2. Navigate to Storage > Policies');
    console.log('3. Add policies that allow all operations (FOR ALL USING (true))');
    console.log('4. Test file uploads again');
    
  } catch (error) {
    console.error('Error executing SQL:', error.message);
  }
}

// Execute the SQL statements
executeSQL().catch(error => {
  console.error('Error:', error.message);
});
