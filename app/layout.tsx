import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { getServerSideConfig } from '../lib/site-config-server';
import { Metadata } from 'next';

const inter = Inter({ subsets: ['latin'] });

/**
 * Generate metadata based on site configuration
 */
export async function generateMetadata(): Promise<Metadata> {
  const siteConfig = await getServerSideConfig();
  
  return {
    title: siteConfig.seo.defaultTitle,
    description: siteConfig.seo.defaultDescription,
    keywords: siteConfig.seo.defaultKeywords,
    icons: {
      icon: siteConfig.branding.favicon,
    },
  };
}

/**
 * Root layout component
 * Provides the basic HTML structure for the application
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Check if the current route is under (admin)
  // If it is, the admin layout will provide the HTML structure
  const isAdminRoute = children && 
    typeof children === 'object' && 
    'props' in children && 
    children.props?.childProp?.segment?.startsWith('(');
  
  if (isAdminRoute) {
    // For admin routes, just pass through the children
    return children;
  }
  
  // For other routes, provide the HTML structure
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
