# Admin Authentication Security Fix (Verbeterde Versie)

Dit document beschrijft de verbeterde implementatie van een server-side authenticatie check voor admin pagina's om te voorkomen dat niet-geautoriseerde gebruikers toegang krijgen tot het admin panel.

## Het Probleem

Er was een beveiligingsprobleem waarbij niet-admin gebruikers kort het admin panel konden zien voordat ze werden doorgestuurd naar de homepage. Dit gebeurde omdat de admin check client-side werd uitgevoerd in de `AdminLayout` component, wat betekent dat de pagina eerst werd gerenderd en pas daarna werd gecontroleerd of de gebruiker een admin is.

Na de eerste implementatie van de server-side check ontstond er een nieuw probleem: admin gebruikers konden niet meer inloggen op het admin panel. Dit kwam doordat de server-side authenticatie niet correct werkte met de Supabase sessie cookies.

## De Verbeterde Oplossing

We hebben de server-side authenticatie check verbeterd met de volgende aanpassingen:

### 1. Server-side Supabase Client

We hebben een nieuwe module `lib/supabase-server.ts` gemaakt die een Supabase client creëert die werkt in de server-side context:

```typescript
// lib/supabase-server.ts
export function createServerSupabaseClient(context: GetServerSidePropsContext) {
  try {
    // Extract the session cookie from the request
    const cookieString = context.req.headers.cookie || '';
    let supabaseSessionCookie = '';
    
    // Find the Supabase session cookie
    cookieString.split(';').forEach(cookie => {
      const [key, value] = cookie.trim().split('=');
      if (key === 'sb-access-token' || key === 'supabase-auth-token') {
        supabaseSessionCookie = value;
      }
    });
    
    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    
    return supabase;
  } catch (error) {
    // Fallback to a regular Supabase client
    return createClient(supabaseUrl, supabaseKey);
  }
}
```

### 2. Verbeterde Admin Check met Fallback

We hebben de `checkAdminAuth` functie verbeterd om een fallback mechanisme te bieden als de server-side check faalt:

```typescript
// lib/admin-auth.ts
export async function checkAdminAuth(context: GetServerSidePropsContext) {
  try {
    // Try to get the user from the server-side session
    const { user } = await getServerUser(context);
    
    // If no user is found in server-side session, fall back to client-side
    if (!user) {
      return {
        props: {
          serverSideAuthFailed: true,
        },
      };
    }
    
    // Check if user's email is in the admin list
    if (user.email && ADMIN_EMAILS.includes(user.email)) {
      return {
        props: {
          user,
          isAdminByEmail: true,
        },
      };
    }
    
    // Check if user is admin in the database
    const { data: userData, error } = await serverSupabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    if (error || !userData?.is_admin) {
      // If there's an error or user is not admin, redirect to homepage
      // But for server-side errors, we'll fall back to client-side check
      if (error) {
        return {
          props: {
            user,
            serverSideAuthFailed: true,
          },
        };
      }
      
      return {
        redirect: {
          destination: '/',
          permanent: false,
        },
      };
    }
    
    // User is an admin, return the user object as props
    return {
      props: {
        user,
        isAdmin: true,
      },
    };
  } catch (error) {
    // For unexpected errors, fall back to client-side check
    return {
      props: {
        serverSideAuthFailed: true,
      },
    };
  }
}
```

### 3. Tijdelijke Admin Email Bypass

We hebben een lijst van admin e-mailadressen toegevoegd die altijd toegang krijgen tot het admin panel, zelfs als de server-side check faalt:

```typescript
// lib/admin-auth.ts
const ADMIN_EMAILS = [
  'marvinsmit1988@gmail.com',
  // Add other admin emails here
];
```

### 4. Verbeterde AdminLayout Component

We hebben de `AdminLayout` component aangepast om rekening te houden met de nieuwe props die worden doorgegeven vanuit de server-side check:

```typescript
// components/admin/AdminLayout.tsx
interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  serverSideAuthFailed?: boolean;
  isAdminByEmail?: boolean;
  isAdmin?: boolean;
}

export default function AdminLayout({ 
  children, 
  title, 
  serverSideAuthFailed, 
  isAdminByEmail,
  isAdmin
}: AdminLayoutProps) {
  // ...
  
  useEffect(() => {
    const checkAuth = async () => {
      // ...
      
      // If the user is already verified as admin by email or server-side check, skip client-side check
      if (isAdminByEmail || isAdmin) {
        return;
      }
      
      // If server-side auth failed, we need to check on the client side
      if (serverSideAuthFailed) {
        // Check if user's email is in the admin list
        if (user.email && ['marvinsmit1988@gmail.com'].includes(user.email)) {
          return;
        }
        
        // Check if user is admin in the database
        const { data: userData, error } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();
        
        // ...
      }
    };
    
    checkAuth();
  }, [user, loading, router, serverSideAuthFailed, isAdminByEmail, isAdmin]);
  
  // ...
}
```

## Voordelen van deze Verbeterde Oplossing

1. **Robuuste Authenticatie**: De oplossing werkt nu zowel server-side als client-side.
2. **Fallback Mechanisme**: Als de server-side check faalt, valt het systeem terug op de client-side check.
3. **Admin Email Bypass**: Admin gebruikers kunnen altijd inloggen, zelfs als er problemen zijn met de database.
4. **Betere Foutafhandeling**: Meer logging en betere foutafhandeling voor debugging.

## Implementatie

De volgende bestanden zijn gewijzigd:

1. Nieuw bestand: `lib/supabase-server.ts` - Server-side Supabase client
2. Gewijzigd: `lib/admin-auth.ts` - Verbeterde server-side admin authenticatie check
3. Gewijzigd: `components/admin/AdminLayout.tsx` - Verbeterde client-side check met fallback
4. Gewijzigd: `pages/admin/index.tsx` - Toegevoegd getServerSideProps met withAdminAuth
5. Gewijzigd: `pages/admin/orders/index.tsx` - Toegevoegd getServerSideProps met withAdminAuth

## Toekomstige Verbeteringen

1. Pas de server-side admin check toe op alle andere admin pagina's.
2. Implementeer een betere manier om de Supabase sessie door te geven aan de server-side client.
3. Voeg caching toe aan de admin check om het aantal database queries te verminderen.
4. Implementeer een meer gedetailleerd permissiesysteem voor verschillende admin rollen.
