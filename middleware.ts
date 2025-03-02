import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { updateSession } from './utils/supabase/middleware';
import { getAdminEmails } from './utils/admin-config';

// Define supported languages
export const supportedLanguages = ['en', 'nl', 'de', 'fr'];
export const defaultLanguage = 'en';

export async function middleware(request: NextRequest) {
  // Call updateSession to refresh the Supabase auth session
  const response = await updateSession(request);
  
  // Get the pathname from the request
  const { pathname } = request.nextUrl;
  
  // Skip language routing for certain paths
  const shouldSkipLanguageRouting = 
    pathname.startsWith('/api/') || 
    pathname.startsWith('/_next/') || 
    pathname.startsWith('/admin') ||  // Changed to also match '/admin' without trailing slash
    pathname.includes('/static/') || 
    pathname.includes('/images/') || 
    pathname.includes('/locales/') ||
    pathname === '/favicon.ico';
  
  if (shouldSkipLanguageRouting) {
    return response;
  }
  
  // Handle language routing
  // Check if the pathname starts with a language prefix
  const pathnameHasLang = supportedLanguages.some(
    (lang) => pathname.startsWith(`/${lang}/`) || pathname === `/${lang}`
  );
  
  // If the pathname doesn't have a language prefix and is not the root path,
  // redirect to the path with the preferred language prefix
  // The root path (/) is handled by app/page.tsx which redirects to the default language
  if (!pathnameHasLang && pathname !== '/') {
    // Get the user's preferred language from the Accept-Language header
    const acceptLanguage = request.headers.get('accept-language') || '';
    const preferredLanguage = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().substring(0, 2))
      .find(lang => supportedLanguages.includes(lang)) || defaultLanguage;
    
    // Create a new URL with the preferred language
    const newUrl = new URL(
      `/${preferredLanguage}${pathname}`,
      request.url
    );
    
    // Preserve the search params
    const searchParams = request.nextUrl.searchParams;
    searchParams.forEach((value, key) => {
      newUrl.searchParams.set(key, value);
    });
    
    return NextResponse.redirect(newUrl);
  }

  // For admin routes, check if user is authenticated and has admin role
  if (pathname.startsWith('/admin')) {
    // Create a Supabase client for this specific middleware invocation
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value;
          },
          set(name: string, value: string, options) {
            response.cookies.set({
              name,
              value,
              ...options,
            });
          },
          remove(name: string, options) {
            response.cookies.set({
              name,
              value: '',
              ...options,
            });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Redirect to language-specific login if not authenticated
      const acceptLanguage = request.headers.get('accept-language') || '';
      const preferredLanguage = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim().substring(0, 2))
        .find(lang => supportedLanguages.includes(lang)) || defaultLanguage;
      
      const redirectUrl = new URL(`/${preferredLanguage}/login`, request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user is in admin list from environment variables
    const adminEmails = getAdminEmails();
    if (user.email && adminEmails.includes(user.email)) {
      return response;
    }

    // Check if user has admin role in database
    const { data: userData, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (error || !userData?.is_admin) {
      // Redirect to homepage if not admin
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}

// Only run middleware on specific paths
// Exclude static assets, images, and other files that don't need language routing
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|locales|robots.txt|sitemap.xml).*)',
  ],
};
