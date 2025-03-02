// Script to set up a Supabase webhook for automatic revalidation
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Create a Supabase client with the service key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY // Note: This requires the service key, not the anon key
);

// Vercel deployment URL
const VERCEL_DEPLOYMENT_URL = process.env.VERCEL_DEPLOYMENT_URL || 'https://sensebycbd.com';

// Revalidation secret
const REVALIDATION_SECRET = process.env.REVALIDATION_SECRET;

if (!REVALIDATION_SECRET) {
  console.error('REVALIDATION_SECRET is not set in .env.local');
  process.exit(1);
}

/**
 * Create a database trigger and webhook for a table
 * @param {string} tableName - The name of the table to create a trigger for
 * @param {string} operation - The operation to trigger on (INSERT, UPDATE, DELETE, or *)
 * @param {string} webhookUrl - The URL to send the webhook to
 * @returns {Promise<boolean>} - Whether the trigger was created successfully
 */
async function createTriggerAndWebhook(tableName, operation, webhookUrl) {
  try {
    console.log(`Creating trigger and webhook for table ${tableName} on ${operation} operations...`);
    
    // Create a unique function name
    const functionName = `notify_${tableName}_${operation.toLowerCase()}`;
    
    // Create a unique trigger name
    const triggerName = `${tableName}_${operation.toLowerCase()}_trigger`;
    
    // SQL to create the function and trigger
    const sql = `
      -- Create or replace the function
      CREATE OR REPLACE FUNCTION ${functionName}()
      RETURNS trigger
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        payload json;
      BEGIN
        -- Create the payload
        payload := json_build_object(
          'table', TG_TABLE_NAME,
          'operation', TG_OP,
          'record', row_to_json(NEW),
          'old_record', CASE WHEN TG_OP = 'UPDATE' OR TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE null END,
          'timestamp', CURRENT_TIMESTAMP
        );
        
        -- Perform the HTTP request
        PERFORM
          net.http_post(
            url := '${webhookUrl}',
            headers := '{"Content-Type": "application/json"}',
            body := json_build_object(
              'secret', '${REVALIDATION_SECRET}',
              'payload', payload
            )::text
          );
        
        RETURN NEW;
      END;
      $$;
      
      -- Drop the trigger if it already exists
      DROP TRIGGER IF EXISTS ${triggerName} ON ${tableName};
      
      -- Create the trigger
      CREATE TRIGGER ${triggerName}
      AFTER ${operation} ON ${tableName}
      FOR EACH ROW
      EXECUTE FUNCTION ${functionName}();
    `;
    
    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { sql });
    
    if (error) {
      console.error(`Error creating trigger and webhook for table ${tableName}:`, error);
      return false;
    }
    
    console.log(`Successfully created trigger and webhook for table ${tableName}`);
    return true;
  } catch (error) {
    console.error(`Unexpected error creating trigger and webhook for table ${tableName}:`, error);
    return false;
  }
}

/**
 * Set up webhooks for all relevant tables
 * @returns {Promise<void>}
 */
async function setupWebhooks() {
  console.log('Setting up webhooks for automatic revalidation...');
  
  // Tables to set up webhooks for
  const tables = [
    { name: 'products', operations: ['INSERT', 'UPDATE', 'DELETE'] },
    { name: 'categories', operations: ['INSERT', 'UPDATE', 'DELETE'] },
    { name: 'blog_posts', operations: ['INSERT', 'UPDATE', 'DELETE'] },
    { name: 'blog_categories', operations: ['INSERT', 'UPDATE', 'DELETE'] },
  ];
  
  // Webhook URL for revalidation
  const webhookUrl = `${VERCEL_DEPLOYMENT_URL}/api/webhook/revalidate`;
  
  // Create triggers and webhooks for each table and operation
  for (const table of tables) {
    for (const operation of table.operations) {
      await createTriggerAndWebhook(table.name, operation, webhookUrl);
    }
  }
  
  console.log('Webhook setup completed');
}

// Run the function
setupWebhooks().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
