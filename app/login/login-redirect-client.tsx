'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { defaultLanguage } from '../../middleware';

export default function LoginRedirectClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Get the redirect parameter if it exists
    const redirect = searchParams?.get('redirect') || '';
    
    // Create the new URL with the language prefix
    const newPath = `/${defaultLanguage}/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`;
    
    // Redirect to the language-specific login page
    router.replace(newPath);
  }, [router, searchParams]);
  
  // Show a loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}
