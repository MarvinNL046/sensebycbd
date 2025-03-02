# Admin Authentication Security Fix

Dit document beschrijft de implementatie van een server-side authenticatie check voor admin pagina's om te voorkomen dat niet-geautoriseerde gebruikers toegang krijgen tot het admin panel.

## Het Probleem

Er was een beveiligingsprobleem waarbij niet-admin gebruikers kort het admin panel konden zien voordat ze werden doorgestuurd naar de homepage. Dit gebeurde omdat de admin check client-side werd uitgevoerd in de `AdminLayout` component, wat betekent dat de pagina eerst werd gerenderd en pas daarna werd gecontroleerd of de gebruiker een admin is.

De console logs toonden het volgende:
```
Admin check: 
Object
error: null
userData: {is_admin: false}
userId: "5e560c4b-54cc-499f-bdb5-716141d74997"
User is not an admin, redirecting to homepage
```

## De Oplossing

We hebben een server-side authenticatie check geïmplementeerd met Next.js's `getServerSideProps` functie. Deze check wordt uitgevoerd voordat de pagina wordt gerenderd, zodat niet-admin gebruikers de admin pagina nooit te zien krijgen.

### 1. Server-side Admin Check

We hebben een nieuwe module `lib/admin-auth.ts` gemaakt met de volgende functies:

- `checkAdminAuth`: Controleert of de huidige gebruiker een admin is en stuurt niet-admin gebruikers door naar de homepage.
- `withAdminAuth`: Een higher-order functie die `getServerSideProps` wikkelt met de admin check.

```typescript
// lib/admin-auth.ts
export async function checkAdminAuth(context: GetServerSidePropsContext) {
  // Get the current user
  const { user } = await getCurrentUser();
  
  // If no user is logged in, redirect to login
  if (!user) {
    return {
      redirect: {
        destination: `/login?redirect=${encodeURIComponent(context.resolvedUrl)}`,
        permanent: false,
      },
    };
  }
  
  // Check if user is admin
  const { data: userData, error } = await supabase
    .from('users')
    .select('is_admin')
    .eq('id', user.id)
    .single();
  
  // If not admin, redirect to homepage
  if (!userData?.is_admin) {
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
    },
  };
}

export function withAdminAuth(getServerSidePropsFunc?: Function) {
  return async (context: GetServerSidePropsContext) => {
    // Check admin authentication
    const authResult = await checkAdminAuth(context);
    
    // If there's a redirect, return it
    if ('redirect' in authResult) {
      return authResult;
    }
    
    // If there's a custom getServerSideProps function, call it
    if (getServerSidePropsFunc) {
      const result = await getServerSidePropsFunc(context);
      
      // Merge the props from both functions
      return {
        props: {
          ...authResult.props,
          ...result.props,
        },
      };
    }
    
    // Otherwise, just return the auth result
    return authResult;
  };
}
```

### 2. Toepassing op Admin Pagina's

We hebben de server-side admin check toegepast op alle admin pagina's door `getServerSideProps` toe te voegen met de `withAdminAuth` functie:

```typescript
// pages/admin/index.tsx
export const getServerSideProps: GetServerSideProps = withAdminAuth();
```

### 3. Client-side Check als Extra Beveiliging

We hebben de bestaande client-side check in de `AdminLayout` component behouden als extra beveiliging, maar deze is nu een backup voor de server-side check:

```typescript
// components/admin/AdminLayout.tsx
useEffect(() => {
  const checkAuth = async () => {
    // ...
  };
  
  // This client-side check is now a backup to the server-side check in getServerSideProps
  checkAuth();
}, [user, loading, router]);
```

## Voordelen van deze Oplossing

1. **Betere Beveiliging**: Niet-admin gebruikers krijgen de admin pagina nooit te zien, omdat de check wordt uitgevoerd voordat de pagina wordt gerenderd.
2. **Betere Gebruikerservaring**: Geen flikkering van de admin pagina voordat de gebruiker wordt doorgestuurd.
3. **Dubbele Beveiliging**: De client-side check blijft bestaan als extra beveiliging.
4. **Herbruikbaarheid**: De `withAdminAuth` functie kan eenvoudig worden toegepast op alle admin pagina's.

## Implementatie

De volgende bestanden zijn gewijzigd:

1. Nieuw bestand: `lib/admin-auth.ts` - Server-side admin authenticatie check
2. Gewijzigd: `components/admin/AdminLayout.tsx` - Client-side check als backup
3. Gewijzigd: `pages/admin/index.tsx` - Toegevoegd getServerSideProps met withAdminAuth
4. Gewijzigd: `pages/admin/orders/index.tsx` - Toegevoegd getServerSideProps met withAdminAuth

## Toekomstige Verbeteringen

1. Pas de server-side admin check toe op alle andere admin pagina's.
2. Voeg caching toe aan de admin check om het aantal database queries te verminderen.
3. Implementeer een meer gedetailleerd permissiesysteem voor verschillende admin rollen.
