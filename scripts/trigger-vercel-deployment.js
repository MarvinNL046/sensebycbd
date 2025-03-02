#!/usr/bin/env node

/**
 * This script triggers a manual deployment to Vercel
 * It requires the Vercel CLI to be installed
 * 
 * Usage:
 * node scripts/trigger-vercel-deployment.js
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.error('Vercel CLI is not installed. Please install it with:');
  console.error('npm install -g vercel');
  process.exit(1);
}

// Get project root directory
const projectRoot = path.resolve(__dirname, '..');

// Check if .vercel directory exists (indicates the project is linked to Vercel)
const vercelConfigExists = fs.existsSync(path.join(projectRoot, '.vercel'));

async function deployToVercel() {
  console.log('Starting deployment to Vercel...');
  
  try {
    // If the project is not linked to Vercel, link it first
    if (!vercelConfigExists) {
      console.log('Project is not linked to Vercel. Linking...');
      execSync('vercel link', { stdio: 'inherit', cwd: projectRoot });
    }
    
    // Deploy to production
    console.log('Deploying to production...');
    execSync('vercel --prod', { stdio: 'inherit', cwd: projectRoot });
    
    console.log('\n✅ Deployment completed successfully!');
    console.log('Note: It may take a few minutes for the changes to propagate.');
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    console.error('Please check the error message above and try again.');
    process.exit(1);
  }
}

// Run the deployment
deployToVercel();
