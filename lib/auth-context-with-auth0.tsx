import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { useUser as useAuth0User } from '@auth0/nextjs-auth0/client';
import { syncAuth0UserToSupabase, getSupabaseUserFromAuth0 } from './auth0-sync';
import logger from './utils/logger';

/**
 * Type definitie voor de authenticatie context
 */
type AuthContextType = {
  user: User | null;
  supabaseUser: any | null;
  loading: boolean;
  error: Error | null;
  isAdmin: boolean;
  loyaltyPoints: number;
};

/**
 * Authenticatie context
 */
const AuthContext = createContext<AuthContextType>({
  user: null,
  supabaseUser: null,
  loading: true,
  error: null,
  isAdmin: false,
  loyaltyPoints: 0
});

/**
 * Authenticatie provider component
 * 
 * Deze component combineert Auth0 en Supabase authenticatie:
 * - Auth0 wordt gebruikt voor de authenticatie (login/logout)
 * - Supabase wordt gebruikt voor gebruikersgegevens en autorisatie
 * 
 * @param children De child componenten
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Auth0 gebruiker en status
  const { user: auth0User, isLoading: auth0Loading, error: auth0Error } = useAuth0User();
  
  // Supabase gebruiker en status
  const [supabaseUser, setSupabaseUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  // Synchroniseer Auth0 gebruiker met Supabase
  useEffect(() => {
    async function syncUser() {
      // Reset status als er geen Auth0 gebruiker is
      if (!auth0User) {
        setSupabaseUser(null);
        setIsAdmin(false);
        setLoyaltyPoints(0);
        setLoading(false);
        return;
      }

      try {
        // Synchroniseer Auth0 gebruiker met Supabase
        logger.log('Synchroniseren van Auth0 gebruiker met Supabase:', auth0User.email);
        const syncedUser = await syncAuth0UserToSupabase(auth0User);
        
        if (syncedUser) {
          setSupabaseUser(syncedUser);
          setIsAdmin(syncedUser.is_admin === true);
          setLoyaltyPoints(syncedUser.loyalty_points || 0);
          logger.log('Auth0 gebruiker succesvol gesynchroniseerd met Supabase');
        } else {
          // Als synchronisatie mislukt, probeer de gebruiker op te halen
          logger.warn('Synchronisatie mislukt, proberen gebruiker op te halen');
          const existingUser = await getSupabaseUserFromAuth0(auth0User);
          
          if (existingUser) {
            setSupabaseUser(existingUser);
            setIsAdmin(existingUser.is_admin === true);
            setLoyaltyPoints(existingUser.loyalty_points || 0);
            logger.log('Bestaande Supabase gebruiker gevonden');
          } else {
            setError(new Error('Gebruiker kon niet worden gesynchroniseerd of gevonden'));
            logger.error('Gebruiker kon niet worden gesynchroniseerd of gevonden');
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Onbekende fout bij synchroniseren van gebruiker'));
        logger.error('Fout bij synchroniseren van gebruiker:', err);
      } finally {
        setLoading(false);
      }
    }

    // Alleen synchroniseren als Auth0 klaar is met laden
    if (!auth0Loading) {
      syncUser();
    }
  }, [auth0User, auth0Loading]);

  // Zet Auth0 error in de context
  useEffect(() => {
    if (auth0Error) {
      setError(auth0Error);
    }
  }, [auth0Error]);

  // Context waarde
  const contextValue: AuthContextType = {
    user: auth0User as unknown as User, // Auth0 gebruiker als Supabase User type
    supabaseUser,
    loading: auth0Loading || loading,
    error,
    isAdmin,
    loyaltyPoints
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook om de authenticatie context te gebruiken
 * 
 * @returns De authenticatie context
 */
export function useAuth() {
  return useContext(AuthContext);
}

/**
 * Hook om te controleren of de huidige gebruiker een admin is
 * 
 * @returns true als de gebruiker een admin is, anders false
 */
export function useIsAdmin() {
  const { isAdmin, loading } = useAuth();
  return { isAdmin, loading };
}

/**
 * Hook om de loyaliteitspunten van de huidige gebruiker op te halen
 * 
 * @returns Het aantal loyaliteitspunten en de laadstatus
 */
export function useLoyaltyPoints() {
  const { loyaltyPoints, loading } = useAuth();
  return { loyaltyPoints, loading };
}
