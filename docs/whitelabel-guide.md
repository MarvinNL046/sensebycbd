# Whitelabel Guide

This guide explains how to use the whitelabel system to customize the site for different brands.

## Overview

The whitelabel system allows you to customize the following aspects of the site:

- Site name and domain
- SEO metadata (title, description, keywords)
- Branding (colors, fonts, logo, favicon)
- Social media links
- Contact information
- Feature toggles (blog, multilingual, auth, newsletter)
- Notification bars

All of these settings are stored in a central configuration that can be managed through the admin interface or by directly editing the configuration files.

## Getting Started

### 1. Initial Setup

To set up a new whitelabel instance:

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file based on `.env.local.example`
4. Run the setup script: `npm run whitelabel:setup`

This will:
- Create the necessary database tables
- Initialize the default configuration
- Generate the Tailwind theme based on the configuration
- Update environment variables

### 2. Customizing the Configuration

There are two ways to customize the configuration:

#### Option 1: Using the Admin Interface

1. Start the development server: `npm run dev`
2. Navigate to `/admin/site-config`
3. Update the configuration as needed
4. Click "Save Configuration"
5. Apply the changes using the buttons at the bottom of the page

#### Option 2: Using a Configuration File

1. Create a configuration file based on the examples in the `examples` directory
2. Run `npm run config:from-file path/to/your-config.ts` to apply the configuration

For example, to apply the Dutch Seed Supply example configuration:

```bash
npm run whitelabel:apply-example
```

#### Option 3: Editing the Default Configuration

1. Edit `lib/site-config.ts`
2. Run `npm run config:apply` to apply the changes

### 3. Applying Changes

After updating the configuration, you need to apply the changes:

- **Generate Theme**: Updates the Tailwind theme based on the configuration
- **Update Environment**: Updates environment variables based on the configuration
- **Apply All Changes**: Does both of the above

You can do this through the admin interface or by running the following commands:

- `npm run config:theme` - Generate the Tailwind theme
- `npm run config:setup` - Update environment variables
- `npm run config:apply` - Apply all changes
- `npm run config:from-file <path>` - Apply configuration from a file
- `npm run whitelabel:apply-example` - Apply the Dutch Seed Supply example configuration

## Configuration Options

### Basic Information

- **Site Name**: The name of the site, displayed in the header, footer, and metadata
- **Domain**: The domain name of the site, used for generating URLs and environment variables

### SEO

- **Default Title**: The default title for the site, used in the `<title>` tag and metadata
- **Default Description**: The default description for the site, used in metadata
- **Default Keywords**: The default keywords for the site, used in metadata
- **OG Image**: The path to the Open Graph image, used for social media sharing

### Branding

#### Assets

- **Logo Path**: The path to the logo image
- **Favicon Path**: The path to the favicon image

#### Colors

- **Primary Color**: The main color of the site
- **Primary Light**: A lighter shade of the primary color
- **Primary Dark**: A darker shade of the primary color
- **Secondary Color**: The secondary color of the site
- **Secondary Light**: A lighter shade of the secondary color
- **Secondary Dark**: A darker shade of the secondary color
- **Accent Color**: An accent color for highlights and special elements

#### Fonts

- **Heading Font**: The font used for headings
- **Body Font**: The font used for body text
- **Accent Font**: The font used for accent text

### Social Media

- **Facebook URL**: The URL to the Facebook page
- **Instagram URL**: The URL to the Instagram page
- **Twitter URL**: The URL to the Twitter page
- **YouTube URL**: The URL to the YouTube channel
- **LinkedIn URL**: The URL to the LinkedIn page

### Contact Information

- **Email**: The contact email address
- **Phone**: The contact phone number
- **Address**: The physical address

### Features

- **Enable Blog**: Whether to enable the blog feature
- **Enable Multilingual**: Whether to enable multilingual support
- **Enable Authentication**: Whether to enable user authentication
- **Enable Newsletter**: Whether to enable the newsletter feature

### Notification Bars

#### Top Notification Bar

- **Message**: The message to display in the top notification bar
- **Background Color**: The background color of the top notification bar
- **Text Color**: The text color of the top notification bar

#### Bottom Notification Bar

- **Message**: The message to display in the bottom notification bar
- **Background Color**: The background color of the bottom notification bar
- **Text Color**: The text color of the bottom notification bar

## Database Schema

The whitelabel configuration is stored in the `site_config` table in the database. The table has the following structure:

```sql
CREATE TABLE site_config (
  id BIGINT PRIMARY KEY,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

The `config` column contains the entire configuration as a JSON object.

## API Endpoints

### GET /api/site-config

Returns the current site configuration.

### POST /api/site-config

Updates the site configuration. Requires authentication and admin role.

Request body: The entire site configuration as a JSON object.

### GET /api/admin/apply-config

Applies configuration changes. Requires authentication and admin role.

Query parameters:
- `action`: The action to perform. Can be `theme`, `env`, or `all`.

## Technical Details

### How It Works

1. The site configuration is stored in the database and cached in memory.
2. Server-side components use `getServerSideConfig()` to access the configuration.
3. Client-side components use `useSiteConfig()` to access the configuration.
4. The Tailwind theme is generated based on the configuration.
5. Environment variables are updated based on the configuration.

### Files

- `lib/site-config.ts`: Defines the configuration interface and default values
- `lib/site-config-server.ts`: Server-side functions for accessing the configuration
- `lib/use-site-config.ts`: Client-side hook for accessing the configuration
- `app/api/site-config/route.ts`: API endpoint for retrieving and updating the configuration
- `app/api/admin/apply-config/route.ts`: API endpoint for applying configuration changes
- `app/(admin)/admin/site-config/page.tsx`: Admin interface for managing the configuration
- `scripts/generate-tailwind-theme.js`: Script for generating the Tailwind theme
- `scripts/setup-env.js`: Script for updating environment variables
- `scripts/apply-config-from-file.js`: Script for applying a configuration from a file
- `examples/dutch-seed-supply-config.ts`: Example configuration for Dutch Seed Supply
- `supabase/migrations/20250302_add_site_config.sql`: Database migration for creating the site_config table

## Troubleshooting

### Changes Not Appearing

If changes to the configuration are not appearing on the site:

1. Make sure you've applied the changes using the admin interface or `npm run config:apply`
2. Clear your browser cache
3. Restart the development server

### Database Errors

If you encounter database errors:

1. Make sure the `site_config` table exists in the database
2. Check that the database connection is configured correctly in `.env.local`
3. Run `npm run db:push` to apply the database migrations

### Theme Generation Errors

If the theme generation fails:

1. Check the console output for errors
2. Make sure the color values in the configuration are valid hex codes
3. Try running `npm run config:theme` manually to see the error output
