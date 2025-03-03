# Whitelabel System - Simplified Version

This project includes a streamlined whitelabel system that allows you to easily customize the site for different brands. This README provides a quick overview of the system and how to use it.

## Project Structure

The project has been simplified to include only the essential components:

- **Admin Panel**: Complete admin interface for managing site configuration
- **Homepage**: Fully customizable homepage with multiple sections
- **Configuration System**: Domain-specific configuration for branding and features

## Quick Start

To quickly apply the Dutch Seed Supply example configuration:

```bash
npm run whitelabel:apply-example
```

This will:
1. Load the configuration from `examples/dutch-seed-supply-config.ts`
2. Save it to the database
3. Generate the Tailwind theme based on the configuration
4. Update environment variables

Then start the development server to see the changes:

```bash
npm run dev
```

## Creating Your Own Configuration

You can create your own configuration file based on the examples in the `examples` directory:

1. Copy `examples/dutch-seed-supply-config.ts` to a new file
2. Modify the configuration to match your brand
3. Apply the configuration:

```bash
npm run config:from-file path/to/your-config.ts
```

## Using the Admin Interface

You can also use the admin interface to manage the configuration:

1. Start the development server: `npm run dev`
2. Navigate to `/admin/site-config`
3. Update the configuration as needed
4. Click "Save Configuration"
5. Apply the changes using the buttons at the bottom of the page

## What Can Be Customized

The whitelabel system allows you to customize:

- Site name and domain
- SEO metadata (title, description, keywords)
- Branding (colors, fonts, logo, favicon)
- Social media links
- Contact information
- Feature toggles
- Notification bars

## How It Works

The whitelabel system uses a central configuration that is stored in the database and accessed by both server-side and client-side components:

- Server-side components use `getServerSideConfig()` to access the configuration
- Client-side components use `useSiteConfig()` to access the configuration
- The Tailwind theme is generated based on the configuration
- Environment variables are updated based on the configuration

## Essential Scripts

The project includes only the essential scripts needed for the whitelabel system:

- `scripts/generate-tailwind-theme.js`: Generates the Tailwind theme based on the configuration
- `scripts/setup-env.js`: Updates environment variables based on the configuration
- `scripts/apply-config-from-file.js`: Applies a configuration from a file

## Documentation

For more detailed information, see the [Whitelabel Guide](docs/whitelabel-guide.md).
