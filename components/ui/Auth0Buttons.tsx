import React from 'react';
// import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { User, LogOut, LogIn } from 'lucide-react';

// NOTE: This file is temporarily disabled until Auth0 is installed
// To enable, uncomment the import above and install @auth0/nextjs-auth0

/**
 * Login knop component voor Auth0 authenticatie
 */
export const LoginButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Link 
      href="/api/auth/login" 
      className={`btn-primary flex items-center gap-2 ${className}`}
    >
      <LogIn className="w-4 h-4" />
      <span>Inloggen</span>
    </Link>
  );
};

/**
 * Logout knop component voor Auth0 authenticatie
 */
export const LogoutButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <Link 
      href="/api/auth/logout" 
      className={`btn-secondary flex items-center gap-2 ${className}`}
    >
      <LogOut className="w-4 h-4" />
      <span>Uitloggen</span>
    </Link>
  );
};

/**
 * Profiel knop component voor Auth0 authenticatie
 * Toont de profielfoto en naam van de ingelogde gebruiker
 */
export const ProfileButton: React.FC<{ className?: string }> = ({ className = '' }) => {
  // Temporarily disabled until Auth0 is installed
  return null;
  
  /* Original implementation:
  const { user } = useUser();
  
  if (!user) return null;
  
  return (
    <Link 
      href="/account" 
      className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
    >
      {user.picture ? (
        <img 
          src={user.picture} 
          alt="Profielfoto" 
          className="w-8 h-8 rounded-full"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
          <User className="w-4 h-4" />
        </div>
      )}
      <span className="hidden md:inline">{user.name || user.email}</span>
    </Link>
  );
  */
};

/**
 * Auth0 knoppen container component
 * Toont de juiste knoppen op basis van de authenticatiestatus
 */
export const Auth0ButtonsContainer: React.FC = () => {
  // const { user, isLoading } = useUser();
  const user = null;
  const isLoading = false;
  
  if (isLoading) {
    return (
      <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
    );
  }
  
  if (!user) {
    return <LoginButton />;
  }
  
  return (
    <div className="flex items-center gap-4">
      <ProfileButton />
      <LogoutButton />
    </div>
  );
};

/**
 * Voorbeeld van hoe je de Auth0 knoppen kunt gebruiken in een header component:
 * 
 * import { Auth0ButtonsContainer } from '../ui/Auth0Buttons';
 * 
 * function Header() {
 *   return (
 *     <header className="...">
 *       <div className="...">
 *         <Logo />
 *         <nav>...</nav>
 *         <Auth0ButtonsContainer />
 *       </div>
 *     </header>
 *   );
 * }
 */
