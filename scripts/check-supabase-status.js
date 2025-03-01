#!/usr/bin/env node

/**
 * Script to check if the Supabase database is up to date with the latest migrations
 * Usage: node scripts/check-supabase-status.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Helper function to print colored messages
function print(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Helper function to print section headers
function printHeader(title) {
  console.log('\n' + '='.repeat(80));
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log('='.repeat(80));
}

// Check if Supabase CLI is installed
function checkSupabaseCLI() {
  printHeader('Checking Supabase CLI');
  try {
    const output = execSync('npx supabase --version').toString().trim();
    print('green', `✓ Supabase CLI is installed: ${output}`);
    return true;
  } catch (error) {
    print('red', '✗ Supabase CLI is not installed or not working properly');
    print('yellow', 'Try running: npm install -D supabase');
    return false;
  }
}

// Check if the project is linked to a Supabase project
function checkProjectLink() {
  printHeader('Checking Supabase Project Link');
  try {
    const output = execSync('npx supabase projects list').toString().trim();
    if (output.includes('sensebycbd')) {
      print('green', '✓ Project is linked to a Supabase project');
      return true;
    } else {
      print('yellow', '! Project might not be linked to the correct Supabase project');
      print('yellow', 'Try running: npx supabase link --project-ref your-project-ref');
      return false;
    }
  } catch (error) {
    print('red', '✗ Failed to check project link');
    print('yellow', 'Try running: npx supabase login');
    return false;
  }
}

// Check local migration files
function checkMigrations() {
  printHeader('Checking Migration Files');
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    print('red', '✗ Migrations directory not found');
    return [];
  }
  
  const files = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql') && !file.startsWith('example_'));
  
  if (files.length === 0) {
    print('yellow', '! No migration files found');
    return [];
  }
  
  print('green', `✓ Found ${files.length} migration files:`);
  files.forEach(file => {
    console.log(`  - ${file}`);
  });
  
  return files;
}

// Check if code is using the latest schema
function checkCodeCompatibility() {
  printHeader('Checking Code Compatibility');
  
  // Files to check for schema compatibility
  const filesToCheck = [
    { path: 'lib/db.ts', fields: ['total_amount', 'shipping_info', 'payment_info', 'loyalty_points_earned'] },
    { path: 'lib/mockDb.ts', fields: ['total_amount', 'loyalty_points_earned'] },
    { path: 'pages/account/index.tsx', fields: ['total_amount', 'shipping_info', 'payment_info', 'loyalty_points_earned'] }
  ];
  
  let allCompatible = true;
  
  filesToCheck.forEach(({ path: filePath, fields }) => {
    if (!fs.existsSync(filePath)) {
      print('yellow', `! File not found: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    const missingFields = fields.filter(field => !content.includes(field));
    
    if (missingFields.length > 0) {
      print('red', `✗ File ${filePath} is missing fields: ${missingFields.join(', ')}`);
      allCompatible = false;
    } else {
      print('green', `✓ File ${filePath} is compatible with the latest schema`);
    }
  });
  
  return allCompatible;
}

// Check if there are any pending migrations
function checkPendingMigrations() {
  printHeader('Checking for Pending Migrations');
  try {
    const output = execSync('npx supabase db diff').toString().trim();
    if (output.includes('No schema changes detected')) {
      print('green', '✓ No pending migrations');
      return true;
    } else {
      print('yellow', '! There might be pending migrations:');
      console.log(output);
      return false;
    }
  } catch (error) {
    print('red', '✗ Failed to check for pending migrations');
    print('yellow', 'This might be due to authentication issues or network problems');
    print('yellow', 'Try running: npx supabase login');
    return false;
  }
}

// Main function
function main() {
  printHeader('SUPABASE STATUS CHECK');
  print('blue', 'Checking if your Supabase database is up to date...\n');
  
  const cliInstalled = checkSupabaseCLI();
  if (!cliInstalled) {
    print('red', '\nCannot proceed without Supabase CLI. Please install it first.');
    process.exit(1);
  }
  
  const isLinked = checkProjectLink();
  const migrations = checkMigrations();
  const isCodeCompatible = checkCodeCompatibility();
  
  // Only check pending migrations if the project is linked
  let pendingMigrations = false;
  if (isLinked) {
    pendingMigrations = !checkPendingMigrations();
  }
  
  // Summary
  printHeader('SUMMARY');
  
  if (isLinked && !pendingMigrations && isCodeCompatible) {
    print('green', '✓ Your Supabase database is up to date!');
  } else {
    print('yellow', '! Your Supabase database might not be up to date.');
    
    if (!isLinked) {
      print('yellow', '- Project is not linked to Supabase');
    }
    
    if (pendingMigrations) {
      print('yellow', '- There are pending migrations');
    }
    
    if (!isCodeCompatible) {
      print('yellow', '- Code is not compatible with the latest schema');
    }
    
    print('blue', '\nRecommended actions:');
    
    if (!isLinked) {
      print('blue', '1. Link your project to Supabase:');
      print('white', '   npx supabase login');
      print('white', '   npx supabase link --project-ref your-project-ref');
    }
    
    if (pendingMigrations) {
      print('blue', `${!isLinked ? '2' : '1'}. Apply pending migrations:`);
      print('white', '   npm run db:push');
    }
    
    if (!isCodeCompatible) {
      print('blue', `${!isLinked && pendingMigrations ? '3' : (!isLinked || pendingMigrations ? '2' : '1')}. Update your code to use the latest schema`);
    }
  }
  
  print('blue', '\nFor more information, see docs/supabase-status.md and docs/supabase-management.md');
}

// Run the main function
main();
