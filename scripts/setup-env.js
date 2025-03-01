// Script to set up the .env.local file with the correct environment variables
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to the .env.local file
const envFilePath = path.join(process.cwd(), '.env.local');

// Check if .env.local already exists
const envFileExists = fs.existsSync(envFilePath);

console.log('=== Setting up .env.local file ===\n');

if (envFileExists) {
  console.log('An .env.local file already exists. Do you want to overwrite it? (y/n)');
  rl.question('> ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      promptForVariables();
    } else {
      console.log('Setup cancelled. Your .env.local file was not modified.');
      rl.close();
    }
  });
} else {
  promptForVariables();
}

function promptForVariables() {
  console.log('\nPlease enter the following environment variables from your Vercel configuration:');
  
  const variables = [
    { name: 'NEXT_PUBLIC_SUPABASE_URL', description: 'Your Supabase URL (e.g., https://tkihdbdnowkpazahzfyp.supabase.co)' },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', description: 'Your Supabase anon key' },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', description: 'Your Supabase service role key' },
    { name: 'NEXT_PUBLIC_SITE_URL', description: 'Your site URL (e.g., http://localhost:3000 for local development)', defaultValue: 'http://localhost:3000' },
    { name: 'REVALIDATION_TOKEN', description: 'Your revalidation token for ISR', defaultValue: 'your-secret-token-for-on-demand-revalidation' }
  ];
  
  const envVars = {};
  
  function promptNextVariable(index) {
    if (index >= variables.length) {
      writeEnvFile(envVars);
      return;
    }
    
    const variable = variables[index];
    const defaultPrompt = variable.defaultValue ? ` (default: ${variable.defaultValue})` : '';
    
    console.log(`\n${variable.name}: ${variable.description}${defaultPrompt}`);
    rl.question('> ', (value) => {
      // Use default value if empty
      if (!value && variable.defaultValue) {
        value = variable.defaultValue;
      }
      
      if (value) {
        envVars[variable.name] = value;
        promptNextVariable(index + 1);
      } else {
        console.log(`${variable.name} is required. Please enter a value.`);
        promptNextVariable(index);
      }
    });
  }
  
  promptNextVariable(0);
}

function writeEnvFile(variables) {
  let envContent = '# Supabase\n';
  envContent += `NEXT_PUBLIC_SUPABASE_URL=${variables.NEXT_PUBLIC_SUPABASE_URL}\n`;
  envContent += `NEXT_PUBLIC_SUPABASE_ANON_KEY=${variables.NEXT_PUBLIC_SUPABASE_ANON_KEY}\n`;
  envContent += `SUPABASE_SERVICE_ROLE_KEY=${variables.SUPABASE_SERVICE_ROLE_KEY}\n`;
  envContent += '\n# Site\n';
  envContent += `NEXT_PUBLIC_SITE_URL=${variables.NEXT_PUBLIC_SITE_URL}\n`;
  envContent += '\n# ISR (Incremental Static Regeneration)\n';
  envContent += `REVALIDATION_TOKEN=${variables.REVALIDATION_TOKEN}\n`;
  
  fs.writeFileSync(envFilePath, envContent);
  
  console.log('\n✅ .env.local file has been created successfully!');
  console.log(`File location: ${envFilePath}`);
  console.log('\nYou can now run the following scripts:');
  console.log('1. node scripts/check-users-sync.js - to check if users are in the public.users table');
  console.log('2. node scripts/make-user-admin.js your-email@example.com - to make a user an admin');
  
  rl.close();
}
