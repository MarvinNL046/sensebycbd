import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import React from 'react';

/**
 * Higher Order Component (HOC) om pagina's te beveiligen met Auth0 authenticatie
 * 
 * Gebruik:
 * ```
 * import { withAuth } from '../lib/withAuth';
 * 
 * function AccountPage() {
 *   // Pagina inhoud
 * }
 * 
 * export default withAuth(AccountPage);
 * ```
 * 
 * @param Component De component die moet worden beveiligd
 * @param options Opties voor de beveiliging
 * @returns Een beveiligde component die alleen toegankelijk is voor ingelogde gebruikers
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
    const { user, isLoading, error } = useUser();
    const router = useRouter();

    useEffect(() => {
      // Als de gebruiker niet aan het laden is en niet is ingelogd, redirect naar login
      if (!isLoading && !user) {
        const redirectPath = `${redirectTo}?redirect=${encodeURIComponent(router.asPath)}`;
        router.push(redirectPath);
      }

      // Als adminOnly is ingeschakeld en de gebruiker is geen admin, redirect naar homepage
      if (adminOnly && user && !isAdmin(user)) {
        router.push('/');
      }
    }, [user, isLoading, router]);

    // Toon foutmelding als er een fout is opgetreden
    if (error) {
      return <ErrorComponent error={error} />;
    }

    // Toon laadcomponent tijdens het laden
    if (isLoading || !user) {
      return <>{loadingComponent}</>;
    }

    // Als adminOnly is ingeschakeld en de gebruiker is geen admin, toon niets
    if (adminOnly && !isAdmin(user)) {
      return null;
    }

    // Toon de beveiligde component als de gebruiker is ingelogd
    return <Component {...props} />;
  }

  // Kopieer displayName, defaultProps, etc.
  const componentName = Component.displayName || Component.name || 'Component';
  AuthenticatedComponent.displayName = `withAuth(${componentName})`;

  return AuthenticatedComponent;
}

/**
 * Controleert of een gebruiker een admin is
 * 
 * @param user De Auth0 gebruiker
 * @returns true als de gebruiker een admin is, anders false
 */
function isAdmin(user: any): boolean {
  // Controleer of de gebruiker een admin is op basis van Auth0 app_metadata
  // Dit vereist dat je in Auth0 de app_metadata hebt ingesteld met een is_admin veld
  return (
    user &&
    user.app_metadata &&
    user.app_metadata.is_admin === true
  );
}

/**
 * Standaard laadcomponent
 */
function DefaultLoadingComponent() {
  return (
    <div className="flex justify-center items-center min-h-[300px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

/**
 * Foutcomponent
 */
function ErrorComponent({ error }: { error: Error }) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
      <p className="font-bold">Er is een fout opgetreden</p>
      <p>{error.message}</p>
    </div>
  );
}

/**
 * HOC om pagina's te beveiligen voor alleen admins
 * 
 * Gebruik:
 * ```
 * import { withAdminAuth } from '../lib/withAuth';
 * 
 * function AdminPage() {
 *   // Admin pagina inhoud
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
