import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { updateSession } from './utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Call updateSession to refresh the Supabase auth session
  const response = await updateSession(request);

  // For admin routes, check if user is authenticated and has admin role
  if (request.nextUrl.pathname.startsWith('/admin')) {
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
      // Redirect to login if not authenticated
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user is in admin list
    const ADMIN_EMAILS = ['marvinsmit1988@gmail.com'];
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
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
export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
