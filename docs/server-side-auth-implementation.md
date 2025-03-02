# Server-Side Authentication Implementation

Dit document beschrijft de implementatie van server-side authenticatie voor het admin panel, gebruikmakend van Next.js App Router en Supabase SSR.

## Overzicht

De nieuwe implementatie gebruikt server-side rendering (SSR) en middleware om te voorkomen dat niet-admin gebruikers het admin panel kunnen zien. Dit lost het beveiligingsprobleem op waarbij niet-admin gebruikers kort het admin panel konden zien voordat ze werden doorgestuurd naar de homepage.

## Technische Details

### 1. App Directory Structuur

We hebben de volgende structuur geïmplementeerd:

```
app/
├── (admin)/
│   ├── admin/
│   │   ├── page.tsx
│   │   └── orders/
│   │       └── page.tsx
│   └── layout.tsx
├── login/
│   └── page.tsx
├── utils/
│   ├── supabase-client.ts
│   └── supabase-server.ts
├── layout.tsx
└── page.tsx
```

De `(admin)` directory is een route group die een gedeelde layout heeft voor alle admin pagina's. De layout bevat de server-side authenticatie check.

### 2. Middleware

We hebben een middleware geïmplementeerd die draait voor elke verzoek naar de server. De middleware:

1. Vernieuwt de Supabase sessie
2. Controleert of de gebruiker is ingelogd voor admin routes
3. Controleert of de gebruiker admin rechten heeft
4. Redirected niet-admin gebruikers naar de login pagina of homepage

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // ...
  
  // For admin routes, check if user is authenticated and has admin role
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Redirect to login if not authenticated
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check if user is admin
    // ...
  }
  
  // ...
}
```

### 3. Server-Side Supabase Client

We hebben een server-side Supabase client geïmplementeerd die werkt met de Next.js App Router:

```typescript
// app/utils/supabase-server.ts
export const createClient = () => {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          // ...
        },
        remove(name: string, options) {
          // ...
        },
      },
    }
  );
};
```

### 4. Admin Layout met Server-Side Check

De admin layout bevat een server-side authenticatie check die voorkomt dat niet-admin gebruikers het admin panel kunnen zien:

```typescript
// app/(admin)/layout.tsx
export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  // Server-side admin check
  const { isAdmin, user, isAdminByEmail } = await checkAdminAuth();
  
  // If not admin, redirect to homepage
  if (!isAdmin) {
    redirect('/');
  }
  
  // ...
}
```

### 5. Client-Side Supabase Client

We hebben ook een client-side Supabase client geïmplementeerd voor gebruik in client components:

```typescript
// app/utils/supabase-client.ts
'use client';

import { createBrowserClient } from '@supabase/ssr';

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};
```

## Voordelen van deze Implementatie

1. **Betere Beveiliging**: Niet-admin gebruikers kunnen het admin panel niet zien, zelfs niet voor een kort moment.
2. **Betere Gebruikerservaring**: Gebruikers worden direct doorgestuurd naar de juiste pagina.
3. **Betere Performance**: Server-side rendering is sneller dan client-side rendering.
4. **Betere SEO**: Server-side rendering is beter voor SEO.
5. **Betere Toegankelijkheid**: Server-side rendering is beter voor toegankelijkheid.

## Toekomstige Verbeteringen

1. **Rolgebaseerde Toegangscontrole**: Implementeer een meer gedetailleerd permissiesysteem voor verschillende admin rollen.
2. **Caching**: Voeg caching toe aan de admin check om het aantal database queries te verminderen.
3. **Audit Logging**: Voeg een audit log toe om alle toegangspogingen tot het admin panel te registreren.
4. **Migreer alle Admin Pagina's**: Migreer alle admin pagina's naar de app directory.
5. **Voeg Custom Claims toe**: Voeg custom claims toe aan de Supabase sessie voor betere performance.

## Conclusie

Deze implementatie lost het beveiligingsprobleem op waarbij niet-admin gebruikers kort het admin panel konden zien. Door gebruik te maken van server-side rendering en middleware, kunnen we ervoor zorgen dat alleen admin gebruikers toegang hebben tot het admin panel.
