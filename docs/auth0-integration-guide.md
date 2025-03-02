# Auth0 Integratie met SenseByCBD

Dit document beschrijft het stappenplan voor het integreren van Auth0 met de SenseByCBD webshop, waarbij Supabase als primaire database blijft functioneren.

## Overzicht

De integratie maakt gebruik van Auth0 als authenticatieprovider, terwijl Supabase wordt gebruikt voor gegevensopslag. Dit zorgt ervoor dat:
- Gebruikers kunnen inloggen via Auth0 (met extra opties zoals social logins)
- Gebruikersgegevens, inclusief loyaliteitspunten, blijven opgeslagen in Supabase
- Bestaande functionaliteit zoals orders en gebruikersprofielen blijft intact

## Fase 1: Voorbereiding en Configuratie

### Stap 1: Omgevingsvariabelen instellen
1. Maak een `.env.local` bestand in de hoofdmap van je project (als deze nog niet bestaat)
2. Voeg de volgende Auth0 configuratievariabelen toe:
   ```
   # Auth0 configuratie
   AUTH0_SECRET='een_lange_willekeurige_string'
   AUTH0_BASE_URL='http://localhost:3000'
   AUTH0_ISSUER_BASE_URL='https://dev-gzb72t2cc4adjf8f.eu.auth0.com'
   AUTH0_CLIENT_ID='je_auth0_client_id'
   AUTH0_CLIENT_SECRET='je_auth0_client_secret'
   ```

### Stap 2: Installeer benodigde dependencies
```bash
npm install @auth0/nextjs-auth0
```

## Fase 2: Auth0 API Routes implementeren

### Stap 3: Maak Auth0 API routes
1. Maak een nieuwe map: `pages/api/auth`
2. Maak een bestand `[auth0].js` in deze map met de volgende inhoud:
   ```javascript
   import { handleAuth } from '@auth0/nextjs-auth0';
   
   export default handleAuth();
   ```

## Fase 3: Auth0 Provider integreren

### Stap 4: Update `_app.tsx` met Auth0 Provider
```typescript
import { AppProps } from 'next/app';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { AuthProvider } from '../lib/auth-context';
import '../styles/globals.css';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <AuthProvider>
        <Component {...pageProps} />
      </AuthProvider>
    </UserProvider>
  );
}

export default MyApp;
```

## Fase 4: Auth0-Supabase Integratie

### Stap 5: Update Auth Context voor Auth0-Supabase integratie
Maak een nieuwe versie van `lib/auth-context.tsx`:

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useUser as useAuth0User } from '@auth0/nextjs-auth0/client';
import logger from './utils/logger';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { user: auth0User, isLoading: auth0Loading } = useAuth0User();

  useEffect(() => {
    // Als Auth0 gebruiker is ingelogd, synchroniseer met Supabase
    async function syncUserWithSupabase() {
      if (!auth0User) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        // Haal de Supabase gebruiker op basis van de Auth0 email
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', auth0User.email)
          .single();

        if (error || !data) {
          logger.error('Gebruiker niet gevonden in Supabase:', error);
          setUser(null);
        } else {
          // Zet de gebruiker in de context
          setUser(data as unknown as User);
        }
      } catch (error) {
        logger.error('Fout bij het synchroniseren van gebruiker:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    if (!auth0Loading) {
      syncUserWithSupabase();
    }
  }, [auth0User, auth0Loading]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
```

### Stap 6: Maak een Auth0-Supabase synchronisatie script
Maak een nieuw bestand `lib/auth0-sync.ts`:

```typescript
import { supabase } from './supabase';
import logger from './utils/logger';

export async function syncAuth0UserToSupabase(auth0User: any) {
  if (!auth0User || !auth0User.email) return null;

  // Controleer of de gebruiker al bestaat in Supabase
  const { data: existingUser, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('email', auth0User.email)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    logger.error('Fout bij het ophalen van gebruiker:', fetchError);
    return null;
  }

  // Als de gebruiker bestaat, update dan de gegevens
  if (existingUser) {
    const { data, error } = await supabase
      .from('users')
      .update({
        full_name: auth0User.name,
        // Andere velden die je wilt updaten
      })
      .eq('email', auth0User.email)
      .select()
      .single();

    if (error) {
      logger.error('Fout bij het updaten van gebruiker:', error);
      return null;
    }

    return data;
  }

  // Als de gebruiker niet bestaat, maak een nieuwe aan
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({
      email: auth0User.email,
      full_name: auth0User.name,
      loyalty_points: 0,
      // Andere standaardvelden
    })
    .select()
    .single();

  if (createError) {
    logger.error('Fout bij het aanmaken van gebruiker:', createError);
    return null;
  }

  return newUser;
}
```

## Fase 5: UI Componenten Aanpassen

### Stap 7: Update Login/Logout componenten
Maak een nieuw bestand `components/ui/Auth0Buttons.tsx`:

```typescript
import React from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';

export const LoginButton = () => {
  return (
    <Link href="/api/auth/login" className="btn-primary">
      Inloggen
    </Link>
  );
};

export const LogoutButton = () => {
  return (
    <Link href="/api/auth/logout" className="btn-secondary">
      Uitloggen
    </Link>
  );
};

export const ProfileButton = () => {
  const { user } = useUser();
  
  if (!user) return null;
  
  return (
    <Link href="/account" className="flex items-center">
      {user.picture && (
        <img 
          src={user.picture} 
          alt="Profielfoto" 
          className="w-8 h-8 rounded-full mr-2"
        />
      )}
      <span>{user.name || user.email}</span>
    </Link>
  );
};
```

### Stap 8: Update Header component
Pas de Header component aan om de Auth0 login/logout knoppen te gebruiken:

```typescript
// In components/layout/Header.tsx
import { LoginButton, LogoutButton, ProfileButton } from '../ui/Auth0Buttons';
import { useUser } from '@auth0/nextjs-auth0/client';

// In je Header component:
const { user, isLoading } = useUser();

// Vervang de bestaande login/logout knoppen met:
{!isLoading && !user && <LoginButton />}
{!isLoading && user && (
  <div className="flex items-center space-x-4">
    <ProfileButton />
    <LogoutButton />
  </div>
)}
```

## Fase 6: Beveiligde Routes

### Stap 9: Beveilig pagina's die authenticatie vereisen
Maak een nieuw bestand `lib/withAuth.tsx`:

```typescript
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push(`/login?redirect=${router.asPath}`);
      }
    }, [user, isLoading, router]);

    if (isLoading) return <div>Laden...</div>;
    if (!user) return null;

    return <Component {...props} />;
  };
}
```

Gebruik deze HOC voor beveiligde pagina's:

```typescript
// pages/account/index.tsx
import { withAuth } from '../../lib/withAuth';

function AccountPage() {
  // Pagina inhoud
}

export default withAuth(AccountPage);
```

## Fase 7: Testen en Foutoplossing

### Stap 10: Test de integratie
1. Start de ontwikkelserver: `npm run dev`
2. Test de login flow: klik op de login knop, log in via Auth0
3. Controleer of de gebruiker correct wordt gesynchroniseerd met Supabase
4. Test de logout flow
5. Controleer of beveiligde routes correct werken

### Stap 11: Foutoplossing
Voeg logging toe om eventuele problemen te identificeren:

```typescript
// In lib/auth-context.tsx
logger.log('Auth0 gebruiker:', auth0User);
logger.log('Supabase gebruiker:', data);
```

## Fase 8: Productie Voorbereiding

### Stap 12: Configureer productie-instellingen
1. Update de Auth0 applicatie-instellingen voor productie
   - Allowed Callback URLs: `https://jouw-domein.com/api/auth/callback`
   - Allowed Logout URLs: `https://jouw-domein.com`
2. Update de omgevingsvariabelen in je productieomgeving

### Stap 13: Implementeer een migratiestrategie voor bestaande gebruikers
1. Maak een script om bestaande gebruikers uit te nodigen voor Auth0
2. Zorg voor een soepele overgang voor bestaande gebruikers

## Fase 9: Documentatie en Onderhoud

### Stap 14: Documenteer de integratie
Maak een document met:
1. Overzicht van de Auth0-Supabase integratie
2. Configuratie-instructies
3. Veelvoorkomende problemen en oplossingen

### Stap 15: Plan voor onderhoud
1. Regelmatige controles van Auth0 en Supabase updates
2. Monitoring van authenticatiefouten
3. Backup-strategie voor gebruikersgegevens

## Veelgestelde vragen

### Wat gebeurt er met bestaande gebruikers?
Bestaande gebruikers in Supabase blijven behouden. Wanneer een gebruiker inlogt via Auth0, wordt er gezocht naar een overeenkomende gebruiker in Supabase op basis van het e-mailadres. Als deze wordt gevonden, wordt de gebruiker gekoppeld.

### Hoe werken loyaliteitspunten met Auth0?
Loyaliteitspunten blijven opgeslagen in de Supabase database. De Auth0 integratie heeft geen invloed op de loyaliteitspunten functionaliteit, omdat deze wordt afgehandeld door de Supabase database.

### Kan ik social logins gebruiken?
Ja, Auth0 ondersteunt verschillende social login providers zoals Google, Facebook, Twitter, etc. Deze kunnen worden geconfigureerd in het Auth0 dashboard.

### Wat gebeurt er als een gebruiker zijn wachtwoord vergeet?
Auth0 biedt een ingebouwde "wachtwoord vergeten" functionaliteit. Gebruikers ontvangen een e-mail met een link om hun wachtwoord opnieuw in te stellen.

### Hoe zit het met beveiliging?
Auth0 biedt geavanceerde beveiligingsfuncties zoals:
- Multi-factor authenticatie (MFA)
- Brute force bescherming
- Anomaliedetectie
- Compliance met beveiligingsstandaarden

## Technische details

### Auth0 sessies vs. Supabase sessies
Met deze integratie wordt Auth0 gebruikt voor sessiemanagement. De Supabase sessie wordt niet meer direct gebruikt voor authenticatie, maar Supabase wordt nog steeds gebruikt voor autorisatie en gegevensopslag.

### Dataflow
1. Gebruiker logt in via Auth0
2. Auth0 retourneert een sessie cookie
3. De applicatie gebruikt de Auth0 sessie om de gebruiker te identificeren
4. De applicatie zoekt de overeenkomende gebruiker in Supabase
5. Supabase gegevens worden gebruikt voor de gebruikerscontext

### Foutafhandeling
Fouten tijdens het authenticatieproces worden gelogd met de logger utility. Controleer de logs voor details over eventuele problemen.
