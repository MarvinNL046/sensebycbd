# Cache Management Systeem

Dit document beschrijft het cache management systeem dat is geïmplementeerd voor de SenseByCBD webshop.

## Overzicht

De SenseByCBD webshop gebruikt Next.js Incremental Static Regeneration (ISR) om pagina's te cachen voor betere prestaties. Dit betekent dat pagina's worden gegenereerd en gecached op het moment dat ze voor het eerst worden opgevraagd, en vervolgens periodiek worden bijgewerkt op basis van een revalidatietijd.

Het cache management systeem bestaat uit de volgende componenten:

1. **Revalidatie API Endpoint**: Een API endpoint dat pagina's kan revalideren op basis van een pad.
2. **Webhook Endpoint**: Een webhook endpoint dat automatisch pagina's revalideert wanneer producten of content worden bijgewerkt in de database.
3. **Admin Dashboard**: Een interface in het admin dashboard om handmatig pagina's te revalideren.
4. **Supabase Triggers**: Database triggers die de webhook aanroepen wanneer producten of content worden bijgewerkt.
5. **Revalidatie Script**: Een script dat kan worden gebruikt om pagina's te revalideren vanuit de command line.

## Revalidatie API Endpoint

Het revalidatie API endpoint is geïmplementeerd in `app/api/revalidate/route.ts`. Dit endpoint accepteert een POST-verzoek met een pad en een geheim token, en revalideert vervolgens de pagina op dat pad.

```typescript
// app/api/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Controleer of het geheime token overeenkomt
    if (!body.secret || body.secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Revalideer het pad
    revalidatePath(body.path);
    
    return NextResponse.json({
      success: true,
      revalidated: true,
      path: body.path,
      date: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

## Webhook Endpoint

Het webhook endpoint is geïmplementeerd in `app/api/webhook/revalidate/route.ts`. Dit endpoint wordt aangeroepen door Supabase triggers wanneer producten of content worden bijgewerkt in de database. Het endpoint bepaalt welke pagina's moeten worden gerevalideerd op basis van de tabel en de operatie.

```typescript
// app/api/webhook/revalidate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Controleer of het geheime token overeenkomt
    if (!body.secret || body.secret !== process.env.REVALIDATION_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Bepaal welke paden moeten worden gerevalideerd op basis van de tabel en operatie
    const { table, operation, record } = body.payload;
    const pathsToRevalidate = [];
    
    // Voeg paden toe op basis van de tabel
    switch (table) {
      case 'products':
        pathsToRevalidate.push('/products');
        // Voeg specifieke productpaden toe indien beschikbaar
        if (record && record.slug) {
          pathsToRevalidate.push(`/products/${record.slug}`);
        }
        break;
      // Voeg andere tabellen toe zoals nodig
    }
    
    // Revalideer alle paden
    for (const path of pathsToRevalidate) {
      revalidatePath(path);
    }
    
    return NextResponse.json({
      success: true,
      revalidated: true,
      paths: pathsToRevalidate,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
```

## Admin Dashboard

Het admin dashboard bevat een interface om handmatig pagina's te revalideren. Deze interface is geïmplementeerd in `components/admin/RevalidatePanel.tsx` en `components/admin/RevalidateButton.tsx`.

De interface biedt de volgende functionaliteit:

- Revalideren van veelgebruikte pagina's (homepage, producten, blog, etc.)
- Revalideren van een specifiek pad
- Revalideren van alle pagina's

## Supabase Triggers

Supabase triggers worden gebruikt om de webhook aan te roepen wanneer producten of content worden bijgewerkt in de database. Deze triggers worden ingesteld met het script `scripts/setup-supabase-webhook.js`.

```javascript
// scripts/setup-supabase-webhook.js
const { createClient } = require('@supabase/supabase-js');

// Maak een Supabase client met de service key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Webhook URL voor revalidatie
const webhookUrl = `${process.env.VERCEL_DEPLOYMENT_URL}/api/webhook/revalidate`;

// Tabellen om webhooks voor in te stellen
const tables = [
  { name: 'products', operations: ['INSERT', 'UPDATE', 'DELETE'] },
  { name: 'categories', operations: ['INSERT', 'UPDATE', 'DELETE'] },
  { name: 'blog_posts', operations: ['INSERT', 'UPDATE', 'DELETE'] },
  { name: 'blog_categories', operations: ['INSERT', 'UPDATE', 'DELETE'] },
];

// Maak triggers en webhooks voor elke tabel en operatie
for (const table of tables) {
  for (const operation of table.operations) {
    // Maak een functie en trigger voor de tabel en operatie
    // ...
  }
}
```

## Revalidatie Script

Het revalidatie script `scripts/revalidate-pages.js` kan worden gebruikt om pagina's te revalideren vanuit de command line. Dit is handig voor het revalideren van meerdere pagina's tegelijk of voor het revalideren van pagina's in een CI/CD pipeline.

```javascript
// scripts/revalidate-pages.js
const fetch = require('node-fetch');

// Revalideer een specifiek pad
async function revalidatePath(path) {
  try {
    const response = await fetch(`${process.env.VERCEL_DEPLOYMENT_URL}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.REVALIDATION_SECRET,
        path,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error(`Error revalidating ${path}: ${error}`);
      return false;
    }
    
    console.log(`Successfully revalidated ${path}`);
    return true;
  } catch (error) {
    console.error(`Unexpected error revalidating ${path}: ${error.message}`);
    return false;
  }
}

// Revalideer alle productpagina's
async function revalidateAllProducts() {
  // ...
}

// Revalideer alle blogpagina's
async function revalidateAllBlogPosts() {
  // ...
}

// Revalideer de homepage
async function revalidateHomepage() {
  // ...
}

// Main functie om command line argumenten te verwerken
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage:');
    console.log('  node revalidate-pages.js all - Revalidate all pages');
    console.log('  node revalidate-pages.js products - Revalidate all product pages');
    console.log('  node revalidate-pages.js product [slug] - Revalidate a specific product');
    // ...
    process.exit(0);
  }
  
  const command = args[0];
  
  switch (command) {
    case 'all':
      await revalidateHomepage();
      await revalidateAllProducts();
      await revalidateAllBlogPosts();
      break;
    // ...
  }
}

// Run the main function
main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
```

## Configuratie

Het cache management systeem gebruikt de volgende omgevingsvariabelen:

- `REVALIDATION_SECRET`: Een geheim token dat wordt gebruikt om revalidatieverzoeken te valideren.
- `NEXT_PUBLIC_REVALIDATION_SECRET`: Hetzelfde geheime token, maar beschikbaar in de client-side code.
- `VERCEL_DEPLOYMENT_URL`: De URL van de Vercel deployment, gebruikt voor het aanroepen van de revalidatie API.

Deze variabelen moeten worden ingesteld in het `.env.local` bestand en in de Vercel omgevingsvariabelen.

## Gebruik

### Handmatig Revalideren via Admin Dashboard

1. Ga naar het admin dashboard
2. Klik op "Cache" in de sidebar
3. Gebruik de interface om pagina's te revalideren

### Automatische Revalidatie

Automatische revalidatie gebeurt wanneer producten of content worden bijgewerkt in de database. Dit wordt afgehandeld door de Supabase triggers en de webhook.

### Revalideren via Command Line

```bash
# Revalideer alle pagina's
node scripts/revalidate-pages.js all

# Revalideer alle productpagina's
node scripts/revalidate-pages.js products

# Revalideer een specifiek product
node scripts/revalidate-pages.js product product-slug

# Revalideer alle blogpagina's
node scripts/revalidate-pages.js blog

# Revalideer een specifieke blogpost
node scripts/revalidate-pages.js blogpost blog-post-slug

# Revalideer de homepage
node scripts/revalidate-pages.js homepage
```

## Conclusie

Het cache management systeem biedt een flexibele en krachtige manier om de cache van de SenseByCBD webshop te beheren. Het combineert automatische revalidatie met handmatige controle, waardoor de website altijd up-to-date blijft terwijl de prestaties worden geoptimaliseerd.
