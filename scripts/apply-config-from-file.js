/**
 * Script to apply a configuration from a file
 * 
 * Usage:
 * node scripts/apply-config-from-file.js path/to/config.ts
 * 
 * Example:
 * node scripts/apply-config-from-file.js examples/dutch-seed-supply-config.ts
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

async function main() {
  try {
    // Get the config file path from command line arguments
    const configFilePath = process.argv[2];
    
    if (!configFilePath) {
      console.error('Please provide a path to a configuration file');
      console.error('Usage: node scripts/apply-config-from-file.js path/to/config.ts');
      process.exit(1);
    }
    
    // Resolve the path relative to the current working directory
    const resolvedPath = path.resolve(process.cwd(), configFilePath);
    
    // Check if the file exists
    if (!fs.existsSync(resolvedPath)) {
      console.error(`File not found: ${resolvedPath}`);
      process.exit(1);
    }
    
    console.log(`Loading configuration from ${resolvedPath}`);
    
    // Read the file content
    const fileContent = fs.readFileSync(resolvedPath, 'utf8');
    
    // Extract the configuration object using regex
    const configMatch = fileContent.match(/const \w+: SiteConfig = ({[\s\S]*?});/);
    
    if (!configMatch || !configMatch[1]) {
      console.error('Could not extract configuration from file');
      process.exit(1);
    }
    
    // Convert the matched string to a JavaScript object
    const configString = configMatch[1]
      .replace(/\/\/.*$/gm, '') // Remove comments
      .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
    
    let config;
    try {
      config = eval(`(${configString})`);
      console.log('Configuration loaded successfully');
    } catch (evalError) {
      console.error('Error parsing configuration:', evalError);
      process.exit(1);
    }
    
    // Connect to Supabase
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    // Check if the site_config table exists
    const { error: tableCheckError } = await supabase
      .from('site_config')
      .select('id')
      .limit(1);
    
    // If the table doesn't exist, create it
    if (tableCheckError && tableCheckError.message.includes('does not exist')) {
      console.log('Creating site_config table...');
      
      // Create the table using SQL
      const { error: createTableError } = await supabase.rpc('create_site_config_table');
      
      if (createTableError) {
        console.error('Error creating site_config table:', createTableError);
        process.exit(1);
      }
      
      console.log('site_config table created successfully');
    }
    
    // Upsert the configuration
    console.log('Saving configuration to database...');
    const { error } = await supabase
      .from('site_config')
      .upsert({ id: 1, config });
    
    if (error) {
      console.error('Error saving configuration:', error);
      process.exit(1);
    }
    
    console.log('Configuration saved to database successfully');
    
    // Run the config:apply script to apply the changes
    console.log('Applying configuration changes...');
    const { execSync } = require('child_process');
    execSync('npm run config:apply', { stdio: 'inherit' });
    
    console.log('Configuration applied successfully');
  } catch (error) {
    console.error('Error applying configuration:', error);
    process.exit(1);
  }
}

// Run the main function
main();
