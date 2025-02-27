# Development Workflow - SenseBy CBD

Dit document beschrijft de ontwikkelworkflow voor het SenseBy CBD webshop project. Het dient als referentie voor alle ontwikkelaars die aan het project werken.

## Ontwikkelomgeving

### IDE Setup
- **Aanbevolen IDE**: Visual Studio Code
- **Extensies**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)
  - GitLens

### Configuratie
- Zorg ervoor dat je Node.js 18.x of hoger hebt geïnstalleerd
- Gebruik npm of yarn voor pakketbeheer
- Configureer je editor om te formatteren bij opslaan met Prettier

## Workflow voor nieuwe functies

### Nieuwe pagina toevoegen
1. Maak een nieuw bestand aan in de `pages` directory
2. Implementeer de pagina met de juiste SEO-componenten
3. Voeg vertalingen toe voor alle ondersteunde talen
4. Voeg routes toe aan de navigatie indien nodig
5. Test de pagina in alle talen

### Nieuwe component toevoegen
1. Bepaal in welke map de component moet komen:
   - `components/layout`: Voor layout-gerelateerde componenten
   - `components/ui`: Voor herbruikbare UI-elementen
   - `components/blocks`: Voor grotere content blokken
   - `components/sections`: Voor pagina-secties
2. Maak een nieuw TypeScript bestand aan met de componentnaam
3. Implementeer de component met TypeScript typedefinities
4. Voeg Tailwind CSS classes toe voor styling
5. Importeer en gebruik de component waar nodig

### Nieuwe API-route toevoegen
1. Maak een nieuw bestand aan in de `pages/api` directory
2. Implementeer de API-handler met de juiste request/response types
3. Voeg validatie toe voor request parameters
4. Implementeer error handling
5. Test de API-route met tools zoals Postman of Thunder Client

## Meertalige ontwikkeling

### Vertalingen toevoegen
1. Identificeer de te vertalen strings in je componenten
2. Voeg de strings toe aan de `public/locales/en/common.json` file
3. Voeg vertalingen toe aan de andere taalbestanden:
   - `public/locales/nl/common.json`
   - `public/locales/de/common.json`
   - `public/locales/fr/common.json`
4. Gebruik de `useTranslation` hook om de vertalingen te gebruiken in componenten

### Vertaalsleutels structuur
Organiseer vertaalsleutels in logische groepen:
```json
{
  "common": {
    "buttons": {
      "submit": "Submit",
      "cancel": "Cancel"
    }
  },
  "pages": {
    "home": {
      "title": "Welcome"
    }
  }
}
```

### Testen van vertalingen
1. Schakel tussen talen met de taalselector in de header
2. Controleer of alle tekst correct vertaald is
3. Controleer of de layout niet breekt bij langere teksten in andere talen

## Git workflow

### Branch strategie
- `main`: Productiecode, altijd stabiel
- `develop`: Ontwikkelingstak, integratie van features
- `feature/naam`: Voor nieuwe features
- `bugfix/naam`: Voor bugfixes
- `hotfix/naam`: Voor urgente fixes in productie

### Commit conventies
Gebruik conventionele commit berichten:
- `feat:` voor nieuwe features
- `fix:` voor bugfixes
- `docs:` voor documentatie
- `style:` voor styling en formatting
- `refactor:` voor code refactoring
- `test:` voor het toevoegen of aanpassen van tests
- `chore:` voor onderhoudstaken

Voorbeeld: `feat: add product filtering component`

### Pull request proces
1. Maak een nieuwe branch vanaf `develop`
2. Implementeer je wijzigingen
3. Voer tests uit en zorg dat de code lint-vrij is
4. Push je branch naar de repository
5. Maak een pull request aan naar `develop`
6. Vraag een code review aan
7. Verwerk feedback en pas je code aan indien nodig
8. Merge de pull request wanneer goedgekeurd

## Deployment proces

### Omgevingen
- **Development**: Lokale ontwikkelomgeving
- **Staging**: Voor testen en QA
- **Production**: Live website

### Deployment stappen
1. Zorg ervoor dat alle tests slagen
2. Voer `npm run build` uit om te controleren of de build succesvol is
3. Merge code naar de juiste branch (`develop` voor staging, `main` voor productie)
4. De CI/CD pipeline zal automatisch deployen naar de juiste omgeving

### Vercel deployment
1. Verbind je GitHub repository met Vercel
2. Configureer de volgende instellingen:
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Environment Variables: Voeg alle benodigde omgevingsvariabelen toe
3. Configureer domein instellingen

## Best practices

### Code stijl
- Volg de ESLint configuratie
- Gebruik TypeScript types voor alle variabelen en functies
- Gebruik functionele componenten met hooks
- Houd componenten klein en herbruikbaar
- Gebruik betekenisvolle namen voor variabelen en functies

### Performance optimalisatie
- Gebruik Next.js Image component voor afbeeldingen
- Implementeer lazy loading voor componenten onder de fold
- Minimaliseer het aantal externe dependencies
- Gebruik memoization voor zware berekeningen
- Implementeer code splitting waar mogelijk

### SEO optimalisatie
- Gebruik de SEO component voor alle pagina's
- Zorg voor unieke titels en beschrijvingen voor elke pagina
- Implementeer structured data waar relevant
- Zorg voor correcte canonical URLs
- Implementeer hreflang tags voor meertalige pagina's

### Toegankelijkheid
- Gebruik semantische HTML elementen
- Voeg alt tekst toe aan alle afbeeldingen
- Zorg voor voldoende kleurcontrast
- Implementeer keyboard navigatie
- Test met screenreaders

## Incrementele Static Regeneration (ISR)

Voor pagina's die regelmatig bijgewerkt moeten worden, gebruik ISR:

```typescript
export const getStaticProps: GetStaticProps = async (context) => {
  // Fetch data
  
  return {
    props: {
      // Your props here
    },
    revalidate: 60 * 60, // Revalidate every hour
  };
};
```

## Supabase integratie

### Authenticatie
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Sign up
const { user, error } = await supabase.auth.signUp({
  email: 'example@email.com',
  password: 'example-password',
});

// Sign in
const { user, error } = await supabase.auth.signIn({
  email: 'example@email.com',
  password: 'example-password',
});
```

### Database queries
```typescript
// Fetch data
const { data, error } = await supabase
  .from('products')
  .select('*')
  .eq('category', 'oils');

// Insert data
const { data, error } = await supabase
  .from('products')
  .insert([
    { name: 'CBD Oil', price: 29.99, category: 'oils' },
  ]);
```

## Viva.com integratie

Implementeer betalingen met de Viva.com API volgens de officiële documentatie. Gebruik de test-omgeving voor ontwikkeling en schakel over naar de productie-omgeving voor de live site.

## Troubleshooting

### Veelvoorkomende problemen
- **Build errors**: Controleer TypeScript types en imports
- **API errors**: Controleer omgevingsvariabelen en API-sleutels
- **Styling issues**: Controleer Tailwind configuratie en class names
- **Translation issues**: Controleer of alle vertaalsleutels aanwezig zijn in alle taalbestanden

### Debugging
- Gebruik `console.log` of browser devtools voor client-side debugging
- Gebruik `console.error` voor server-side debugging in API routes
- Controleer de Vercel logs voor deployment issues

## Nuttige commando's

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint

# Fix linting issues
npm run lint -- --fix
```

## Contactpersonen

- **Project Manager**: [pm@sensebycbd.com](mailto:pm@sensebycbd.com)
- **Lead Developer**: [dev@sensebycbd.com](mailto:dev@sensebycbd.com)
- **Design Team**: [design@sensebycbd.com](mailto:design@sensebycbd.com)
