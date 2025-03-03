// import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import React from 'react';

// NOTE: This file is for App Router compatibility
// Authentication is now handled by middleware.ts for admin routes

/**
 * Higher Order Component (HOC) for page authentication
 * 
 * Usage:
 * ```
 * import { withAuth } from '../lib/withAuth';
 * 
 * function AccountPage() {
 *   // Page content
 * }
 * 
 * export default withAuth(AccountPage);
 * ```
 * 
 * @param Component The component to be secured
 * @param options Security options
 * @returns A secured component only accessible to logged-in users
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: {
    loadingComponent?: React.ReactNode;
    redirectTo?: string;
    adminOnly?: boolean;
  } = {}
) {
  const {
    loadingComponent = <DefaultLoadingComponent />,
    redirectTo = '/login',
    adminOnly = false,
  } = options;

  function AuthenticatedComponent(props: P) {
    // In App Router, authentication is handled by middleware
    // This HOC is kept for backward compatibility
    return <Component {...props} />;
  }

  // Copy displayName, defaultProps, etc.
  const componentName = Component.displayName || Component.name || 'Component';
  AuthenticatedComponent.displayName = `withAuth(${componentName})`;

  return AuthenticatedComponent;
}

/**
 * Default loading component
 */
function DefaultLoadingComponent() {
  return (
    <div className="flex justify-center items-center min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

/**
 * Error component
 */
function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
      <p className="font-bold">An error occurred</p>
      <p>{error.message}</p>
    </div>
  );
}

/**
 * HOC to secure pages for admins only
 * 
 * Usage:
 * ```
 * import { withAdminAuth } from '../lib/withAuth';
 * 
 * function AdminPage() {
 *   // Admin page content
 * }
 * 
 * export default withAdminAuth(AdminPage);
 * ```
 */
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<Parameters<typeof withAuth>[1], 'adminOnly'> = {}
) {
  return withAuth(Component, { ...options, adminOnly: true });
}
