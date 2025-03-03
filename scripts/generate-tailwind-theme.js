const fs = require('fs');
const path = require('path');

// Function to generate the Tailwind config based on site config
function generateTailwindConfig(siteConfig) {
  return {
    darkMode: ["class"],
    content: [
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
      './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: siteConfig.branding.colors.primary,
            light: siteConfig.branding.colors.primaryLight,
            dark: siteConfig.branding.colors.primaryDark,
            foreground: '#FFFFFF',
          },
          secondary: {
            DEFAULT: siteConfig.branding.colors.secondary,
            light: siteConfig.branding.colors.secondaryLight,
            dark: siteConfig.branding.colors.secondaryDark,
            foreground: '#FFFFFF',
          },
          accent: {
            DEFAULT: siteConfig.branding.colors.accent,
            dark: siteConfig.branding.colors.accent,
            foreground: siteConfig.branding.colors.primaryDark,
          },
          neutral: {
            DEFAULT: '#E9ECEF',
            dark: '#CED4DA',
          },
          warning: '#FFD166',
          error: '#EF476F',
          destructive: {
            DEFAULT: '#EF476F',
            foreground: '#FFFFFF',
          },
          muted: {
            DEFAULT: '#F8F9FA',
            foreground: '#6C757D',
          },
          card: {
            DEFAULT: '#FFFFFF',
            foreground: '#212529',
          },
          background: '#FFFFFF',
          foreground: '#212529',
          border: '#E9ECEF',
          input: '#CED4DA',
          ring: siteConfig.branding.colors.primary,
          
          // Dark mode colors
          "dark-primary": {
            DEFAULT: siteConfig.branding.colors.primaryLight,
            light: siteConfig.branding.colors.secondary,
            dark: siteConfig.branding.colors.primary,
            foreground: '#FFFFFF',
          },
          "dark-background": '#1A1A1A',
          "dark-foreground": '#E9ECEF',
          "dark-card": {
            DEFAULT: '#2A2A2A',
            foreground: '#E9ECEF',
          },
          "dark-muted": {
            DEFAULT: '#3A3A3A',
            foreground: '#ADB5BD',
          },
          "dark-border": '#3A3A3A',
          "dark-input": '#3A3A3A',
        },
        fontFamily: {
          sans: siteConfig.branding.fonts.body.split(',').map(font => font.trim()),
          heading: siteConfig.branding.fonts.heading.split(',').map(font => font.trim()),
          accent: siteConfig.branding.fonts.accent.split(',').map(font => font.trim()),
        },
        borderRadius: {
          lg: '0.5rem',
          md: '0.375rem',
          sm: '0.25rem',
        },
      },
    },
    plugins: [],
  };
}

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
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove multi-line comments
          
          try {
            // Use a safer approach than eval
            const configObj = Function(`return ${configString}`)();
            siteConfig = configObj;
            console.log('Loaded site config from local file');
          } catch (evalError) {
            console.error('Error parsing config from file:', evalError);
            
            // Fallback to default configuration
            siteConfig = {
              branding: {
                colors: {
                  primary: "#2D6A4F",
                  primaryLight: "#52B788",
                  primaryDark: "#1B4332",
                  secondary: "#74C69D",
                  secondaryLight: "#B7E4C7",
                  secondaryDark: "#40916C",
                  accent: "#D8F3DC"
                },
                fonts: {
                  heading: "Montserrat, sans-serif",
                  body: "Inter, sans-serif",
                  accent: "Playfair Display, serif"
                }
              }
            };
            
            console.log('Using fallback configuration');
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
    
    // Generate the Tailwind config
    const tailwindConfig = generateTailwindConfig(siteConfig);
    
    // Convert to string with proper formatting
    const configString = `/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(tailwindConfig, null, 2)};`;
    
    // Write to tailwind.config.js
    fs.writeFileSync(path.join(__dirname, '../tailwind.config.js'), configString);
    
    console.log('Tailwind config generated successfully!');
  } catch (error) {
    console.error('Error generating Tailwind config:', error);
    process.exit(1);
  }
}

// Run the main function
main();
