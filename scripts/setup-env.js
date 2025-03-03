const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

async function main() {
  try {
    // Try to load site config from the database via API
    let siteConfig;
    
    try {
      // Check if we're in a Node.js environment with fetch
      if (typeof fetch === 'undefined') {
        // If running in older Node versions without fetch
        const { default: nodeFetch } = await import('node-fetch');
        global.fetch = nodeFetch;
      }
      
      // Try to get config from local API
      const apiUrl = process.env.VERCEL_DEPLOYMENT_URL 
        ? `${process.env.VERCEL_DEPLOYMENT_URL}/api/site-config`
        : 'http://localhost:3000/api/site-config';
      
      const response = await fetch(apiUrl);
      
      if (response.ok) {
        siteConfig = await response.json();
        console.log('Loaded site config from API');
      } else {
        throw new Error('Failed to fetch from API');
      }
    } catch (apiError) {
      console.log('Could not load from API, falling back to local file:', apiError.message);
      
      // Fall back to the local config file
      const configPath = path.join(__dirname, '../lib/site-config.ts');
      
      if (fs.existsSync(configPath)) {
        // Read the file content
        const fileContent = fs.readFileSync(configPath, 'utf8');
        
        // Extract the siteConfig object using regex
        const configMatch = fileContent.match(/const siteConfig: SiteConfig = ({[\s\S]*?});/);
        
        if (configMatch && configMatch[1]) {
          // Convert the matched string to a JavaScript object
          // This is a simple approach and might not work for all cases
          // For production, consider using a proper TypeScript parser
          const configString = configMatch[1]
            .replace(/\/\/.*$/gm, '') // Remove comments
            .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
          
          try {
            siteConfig = eval(`(${configString})`);
            console.log('Loaded site config from local file');
          } catch (evalError) {
            console.error('Error parsing config from file:', evalError);
            throw new Error('Could not parse config from file');
          }
        } else {
          throw new Error('Could not extract config from file');
        }
      } else {
        throw new Error('Config file not found');
      }
    }
    
    if (!siteConfig) {
      throw new Error('Failed to load site configuration');
    }
    
    // Load existing .env.local if it exists
    const envPath = path.join(__dirname, '../.env.local');
    let existingEnv = {};
    
    if (fs.existsSync(envPath)) {
      existingEnv = dotenv.parse(fs.readFileSync(envPath));
      console.log('Loaded existing .env.local file');
    }
    
    // Merge with site config values
    const updatedEnv = {
      ...existingEnv,
      SITE_NAME: siteConfig.name,
      SITE_DOMAIN: siteConfig.domain,
      SITE_DESCRIPTION: siteConfig.seo.defaultDescription,
      VERCEL_DEPLOYMENT_URL: `https://${siteConfig.domain}`,
      // Add any other environment variables that should be derived from site config
    };
    
    // Convert to .env format
    const envContent = Object.entries(updatedEnv)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Write to .env.local
    fs.writeFileSync(envPath, envContent);
    
    console.log('.env.local file updated successfully!');
    
    // If this is a new installation, also create a template .env.local.example
    const exampleEnvPath = path.join(__dirname, '../.env.local.example');
    if (!fs.existsSync(exampleEnvPath)) {
      const exampleEnvContent = `# Supabase configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key

# Admin emails (comma-separated)
ADMIN_EMAILS=admin@${siteConfig.domain}

# Revalidation
REVALIDATION_SECRET=your-revalidation-secret
NEXT_PUBLIC_REVALIDATION_SECRET=your-revalidation-secret
VERCEL_DEPLOYMENT_URL=https://${siteConfig.domain}

# Authentication
AUTH0_SECRET=your-auth0-secret
AUTH0_BASE_URL=your-auth0-base-url
AUTH0_ISSUER_BASE_URL=your-auth0-issuer-base-url
AUTH0_CLIENT_ID=your-auth0-client-id
AUTH0_CLIENT_SECRET=your-auth0-client-secret

# Site Configuration
SITE_NAME=${siteConfig.name}
SITE_DOMAIN=${siteConfig.domain}
SITE_DESCRIPTION=${siteConfig.seo.defaultDescription}
`;
      
      fs.writeFileSync(exampleEnvPath, exampleEnvContent);
      console.log('.env.local.example file created successfully!');
    }
  } catch (error) {
    console.error('Error setting up environment variables:', error);
    process.exit(1);
  }
}

// Run the main function
main();
