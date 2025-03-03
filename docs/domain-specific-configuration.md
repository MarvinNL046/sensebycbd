# Domain-Specific Configuration Guide

This guide explains how to use the domain-specific configuration system to customize the site for different domains.

## Overview

The domain-specific configuration system allows you to customize the following aspects of the site for different domains:

- Language
- SEO metadata (title, description, keywords)

This is particularly useful for multilingual sites where you want to serve different content based on the domain, such as:

- example.com (English)
- example.nl (Dutch)
- example.de (German)
- example.fr (French)

## How It Works

1. The system detects the current domain from the request headers
2. It looks for a matching domain configuration in the site configuration
3. If a match is found, it applies the domain-specific settings
4. If no match is found, it falls back to the default settings

## Configuration

Domain-specific configuration is stored in the `domains` property of the site configuration. Each domain has its own configuration object with the following properties:

- `language`: The language code for the domain (e.g., "en", "nl", "de", "fr")
- `title`: The default title for the domain
- `description`: The default description for the domain
- `keywords`: The default keywords for the domain

Example:

```json
{
  "domains": {
    "example.com": {
      "language": "en",
      "title": "Example | English Site",
      "description": "This is the English version of the site",
      "keywords": "example, english"
    },
    "example.nl": {
      "language": "nl",
      "title": "Example | Nederlandse Site",
      "description": "Dit is de Nederlandse versie van de site",
      "keywords": "voorbeeld, nederlands"
    }
  }
}
```

## Managing Domain Configurations

You can manage domain configurations in two ways:

### 1. Using the Admin Interface

1. Go to `/admin/site-config`
2. Scroll down to the "Domain-specific Configuration" section
3. Add, edit, or remove domain configurations
4. Click "Save Configuration" to save your changes
5. Click "Apply All Changes" to apply the changes to the site

### 2. Using Configuration Files

1. Create a configuration file based on the examples in the `examples` directory
2. Add domain configurations to the `domains` property
3. Apply the configuration using the `config:from-file` script:

```bash
npm run config:from-file path/to/your-config.ts
```

## Testing Domain Configurations

To test domain configurations locally:

1. Add entries to your hosts file for the domains you want to test:
   ```
   127.0.0.1 example.com
   127.0.0.1 example.nl
   127.0.0.1 example.de
   127.0.0.1 example.fr
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access the site using the different domains:
   - http://example.com:3000
   - http://example.nl:3000
   - http://example.de:3000
   - http://example.fr:3000

## Production Setup

For production, you need to:

1. Configure your DNS to point all domains to your server
2. Configure your web server or hosting provider to handle multiple domains
3. Set up SSL certificates for all domains
4. Deploy your site with the domain configurations

### Vercel Setup

If you're using Vercel, you can add multiple domains to your project:

1. Go to your project settings
2. Click on "Domains"
3. Add each domain you want to use
4. Verify ownership of the domains
5. Configure your DNS settings as instructed by Vercel

## Troubleshooting

### Domain Configuration Not Applied

If the domain-specific configuration is not being applied:

1. Check that the domain in your configuration exactly matches the domain in the request
2. Make sure you've saved and applied the configuration changes
3. Clear your browser cache
4. Check the server logs for any errors

### SEO Metadata Not Updated

If the SEO metadata is not being updated:

1. Make sure you've applied the configuration changes
2. Check that the domain-specific configuration has the correct SEO properties
3. Verify that the metadata is being generated correctly in the layout component
4. Check the HTML source of the page to see if the metadata is being rendered

## Technical Details

The domain-specific configuration system is implemented in the following files:

- `lib/site-config.ts`: Defines the configuration interface and default values
- `lib/site-config-server.ts`: Server-side functions for accessing the configuration
- `app/api/site-config/route.ts`: API endpoint for retrieving and updating the configuration
- `app/(admin)/admin/site-config/page.tsx`: Admin interface for managing the configuration

The system uses the following functions:

- `getCurrentHostname()`: Gets the current hostname from the request headers
- `getDomainConfig()`: Gets the domain-specific configuration based on the hostname
- `getServerSideConfig()`: Gets the server-side configuration with domain-specific settings applied
