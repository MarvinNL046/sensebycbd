/**
 * Script to run Lighthouse audits on the website
 * 
 * Usage:
 * node scripts/lighthouse.js [url] [options]
 * 
 * Examples:
 * node scripts/lighthouse.js https://sensebycbd.com
 * node scripts/lighthouse.js https://sensebycbd.com/products
 * node scripts/lighthouse.js https://sensebycbd.com --mobile
 * 
 * Options:
 * --mobile: Run mobile audits (default is desktop)
 * --output=html: Output format (html, json, csv)
 * --only-categories=performance,accessibility: Only run specific categories
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);
const url = args.find(arg => !arg.startsWith('--')) || 'http://localhost:3000';
const isMobile = args.includes('--mobile');
const outputFormat = args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'html';
const onlyCategories = args.find(arg => arg.startsWith('--only-categories='))?.split('=')[1];

// Create reports directory if it doesn't exist
const reportsDir = path.join(__dirname, '../lighthouse-reports');
if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir);
}

// Generate a filename based on the URL and device
const urlSlug = url.replace(/https?:\/\//, '').replace(/[^a-z0-9]/gi, '_');
const device = isMobile ? 'mobile' : 'desktop';
const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const filename = `${urlSlug}_${device}_${timestamp}`;

// Build the Lighthouse command
let command = `npx lighthouse ${url}`;
command += ` --output=${outputFormat}`;
command += ` --output-path=${path.join(reportsDir, `${filename}.${outputFormat}`)}`;
command += ` --preset=${isMobile ? 'mobile' : 'desktop'}`;
command += ` --chrome-flags="--headless --no-sandbox"`;

if (onlyCategories) {
  command += ` --only-categories=${onlyCategories}`;
}

// Run Lighthouse
console.log(`Running Lighthouse audit for ${url} (${device})...`);
try {
  execSync(command, { stdio: 'inherit' });
  console.log(`\nReport saved to: ${path.join(reportsDir, `${filename}.${outputFormat}`)}`);
} catch (error) {
  console.error('Error running Lighthouse:', error.message);
  process.exit(1);
}
