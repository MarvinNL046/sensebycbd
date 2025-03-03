import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SiteConfig } from '../../../lib/site-config';
import { getServerSideConfig, getCurrentHostname, getDomainConfig } from '../../../lib/site-config-server';

// GET endpoint to retrieve the site configuration
export async function GET(request: NextRequest) {
  try {
    // Get the base configuration
    const config = await getServerSideConfig();
    
    // Get the hostname from the request
    const host = request.headers.get('host') || '';
    const hostname = host.split(':')[0]; // Remove port if present
    
    // Apply domain-specific configuration
    const domainConfig = getDomainConfig(config, hostname);
    
    return NextResponse.json(domainConfig);
  } catch (error) {
    console.error('Error in GET /api/site-config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch site configuration' },
      { status: 500 }
    );
  }
}

// POST endpoint to update the site configuration
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated and has admin role
    // This would typically use your existing auth mechanisms
    
    const config = await request.json() as SiteConfig;
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY!
    );
    
    // Check if the site_config table exists
    const { error: tableCheckError } = await supabase
      .from('site_config')
      .select('id')
      .limit(1);
    
    // If the table doesn't exist, create it
    if (tableCheckError && tableCheckError.message.includes('does not exist')) {
      // Create the table using SQL
      const { error: createTableError } = await supabase.rpc('create_site_config_table');
      
      if (createTableError) {
        console.error('Error creating site_config table:', createTableError);
        return NextResponse.json(
          { error: 'Failed to create site_config table' },
          { status: 500 }
        );
      }
    }
    
    // Upsert the configuration
    const { error } = await supabase
      .from('site_config')
      .upsert({ id: 1, config });
    
    if (error) {
      console.error('Error updating site config:', error);
      return NextResponse.json(
        { error: 'Failed to update site configuration' },
        { status: 500 }
      );
    }
    
    // Trigger a revalidation if needed
    if (process.env.REVALIDATION_SECRET && process.env.VERCEL_DEPLOYMENT_URL) {
      try {
        await fetch(
          `${process.env.VERCEL_DEPLOYMENT_URL}/api/revalidate?secret=${process.env.REVALIDATION_SECRET}`
        );
      } catch (revalidateError) {
        console.error('Error triggering revalidation:', revalidateError);
        // Continue anyway, this is not critical
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in POST /api/site-config:', error);
    return NextResponse.json(
      { error: 'Failed to update site configuration' },
      { status: 500 }
    );
  }
}
