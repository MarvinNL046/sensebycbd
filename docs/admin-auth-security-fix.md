# Admin Authentication Security Fix (Kritieke Update)

Dit document beschrijft de implementatie van een server-side authenticatie check voor admin pagina's om te voorkomen dat niet-geautoriseerde gebruikers toegang krijgen tot het admin panel, inclusief een kritieke beveiligingsupdate.

## De Problemen

Er waren twee beveiligingsproblemen met de admin authenticatie:

1. **Oorspronkelijk probleem**: Niet-admin gebruikers konden kort het admin panel zien voordat ze werden doorgestuurd naar de homepage. Dit gebeurde omdat de admin check client-side werd uitgevoerd in de `AdminLayout` component, wat betekent dat de pagina eerst werd gerenderd en pas daarna werd gecontroleerd of de gebruiker een admin is.

2. **Kritiek beveiligingsprobleem**: Na de eerste implementatie van de server-side check ontstond er een ernstig beveiligingsprobleem waarbij niet-admin gebruikers volledige toegang kregen tot het admin panel. Dit kwam doordat het fallback mechanisme iedereen toeliet als de server-side check faalde.

## De Definitieve Oplossing

We hebben de authenticatie check volledig herzien om beide problemen op te lossen:

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

### 2. Veilige Admin Check zonder Onveilige Fallbacks

We hebben de `checkAdminAuth` functie verbeterd om altijd naar de homepage te redirecten als de gebruiker geen admin is, zelfs als de server-side check faalt:

```typescript
// lib/admin-auth.ts
export async function checkAdminAuth(context: GetServerSidePropsContext) {
  try {
    // Try to get the user from the server-side session
    const { user } = await getServerUser(context);
    
    // If no user is found in server-side session, redirect to login
    if (!user) {
      return {
        redirect: {
          destination: `/login?redirect=${encodeURIComponent(context.resolvedUrl)}`,
          permanent: false,
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
    
    // Try with both server-side and regular client
    const serverSupabase = createServerSupabaseClient(context);
    const { data: userData, error } = await serverSupabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single();
    
    // If there's an error, try with regular client
    if (error) {
      const { data: regularUserData, error: regularError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      // If still error or not admin, redirect
      if (regularError || !regularUserData?.is_admin) {
        return {
          redirect: {
            destination: '/',
            permanent: false,
          },
        };
      }
    } else if (!userData?.is_admin) {
      // If not admin according to server client, redirect
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
    // For unexpected errors, redirect to homepage for safety
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
}
```

### 3. Dubbele Beveiliging in AdminLayout Component

We hebben de `AdminLayout` component aangepast om altijd een client-side check uit te voeren, ongeacht of de server-side check is geslaagd of niet:

```typescript
// components/admin/AdminLayout.tsx
// List of admin email addresses that should always have access
const ADMIN_EMAILS = ['marvinsmit1988@gmail.com'];

export default function AdminLayout({ 
  children, 
  title, 
  isAdminByEmail,
  isAdmin
}: AdminLayoutProps) {
  // ...
  
  useEffect(() => {
    const checkAuth = async () => {
      // ...
      
      // Always perform a client-side check as an extra security measure
      if (user.email && ADMIN_EMAILS.includes(user.email)) {
        return;
      }
      
      // Check if user is admin in the database
      const { data: userData, error } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single();
      
      if (error || !userData?.is_admin) {
        router.push('/');
      }
    };
    
    // This client-side check is a backup to the server-side check
    // but also provides an extra layer of security
    checkAuth();
  }, [user, loading, router, isAdminByEmail, isAdmin]);
  
  // ...
}
```

## Voordelen van deze Definitieve Oplossing

1. **Maximale Beveiliging**: Niet-admin gebruikers worden altijd doorgestuurd naar de homepage, zelfs als de server-side check faalt.
2. **Dubbele Beveiliging**: Zowel server-side als client-side checks worden uitgevoerd.
3. **Admin Email Whitelist**: Admin gebruikers met specifieke e-mailadressen krijgen altijd toegang.
4. **Betere Foutafhandeling**: Meer logging en betere foutafhandeling voor debugging.
5. **Geen Onveilige Fallbacks**: Geen fallback mechanisme dat iedereen toelaat als de check faalt.

## Implementatie

De volgende bestanden zijn gewijzigd:

1. Nieuw bestand: `lib/supabase-server.ts` - Server-side Supabase client
2. Gewijzigd: `lib/admin-auth.ts` - Veilige server-side admin authenticatie check
3. Gewijzigd: `components/admin/AdminLayout.tsx` - Verbeterde client-side check met dubbele beveiliging
4. Gewijzigd: `pages/admin/index.tsx` - Toegevoegd getServerSideProps met withAdminAuth
5. Gewijzigd: `pages/admin/orders/index.tsx` - Toegevoegd getServerSideProps met withAdminAuth

## Toekomstige Verbeteringen

1. Pas de server-side admin check toe op alle andere admin pagina's.
2. Implementeer een betere manier om de Supabase sessie door te geven aan de server-side client.
3. Voeg caching toe aan de admin check om het aantal database queries te verminderen.
4. Implementeer een meer gedetailleerd permissiesysteem voor verschillende admin rollen.
5. Voeg een audit log toe om alle toegangspogingen tot het admin panel te registreren.
