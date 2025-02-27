# SenseBy CBD Webshop

Een webshop voor CBD-producten om pijn en gemoedstoestanden te verbeteren.

## Projectoverzicht

SenseBy CBD is een moderne, meertalige webshop gericht op het aanbieden van premium CBD-producten voor mensen met fysieke en psychische klachten. De webshop biedt een gebruiksvriendelijke ervaring met uitgebreide productinformatie en een persoonlijke aanpak.

### Doelgroep
- Mensen met fysieke klachten zoals chronische pijn
- Mensen met psychische klachten zoals angst en stress
- Mensen die op zoek zijn naar natuurlijke wellness-producten

### Kernfunctionaliteiten
- Meertalige ondersteuning (Nederlands, Engels, Duits, Frans)
- Responsief ontwerp voor alle apparaten
- Productcategorieën en detailpagina's
- Gebruikersaccounts en registratie
- Puntenspaarsysteem voor loyaliteit
- Feedbacksysteem in het dashboard

## Technologiestack

- **Frontend**: Next.js 14.2.23, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Supabase
- **Database**: Supabase (PostgreSQL)
- **Authenticatie**: Supabase Auth
- **Betalingen**: Viva.com
- **Deployment**: Vercel (aanbevolen)

## Meertalige ondersteuning

De webshop ondersteunt vier talen:
- Nederlands (nl)
- Engels (en)
- Duits (de)
- Frans (fr)

Vertalingen worden beheerd via JSON-bestanden in de `public/locales/[locale]` map. De `useTranslation` hook in `lib/i18n/useTranslation.ts` zorgt voor het laden van de juiste vertalingen op basis van de huidige taal.

## Projectstructuur

```
sensebycbd/
├── components/           # UI componenten
│   ├── layout/           # Layout componenten (Header, Footer, etc.)
│   ├── ui/               # Herbruikbare UI elementen
│   ├── blocks/           # Grotere blokken content
│   └── sections/         # Secties voor pagina's
├── lib/                  # Utility functies en hooks
│   ├── i18n/             # Internationalisatie
│   ├── seo/              # SEO componenten
│   └── utils/            # Algemene utilities
├── pages/                # Next.js pagina's
│   ├── _app.tsx          # App component
│   ├── _document.tsx     # Document component
│   └── index.tsx         # Homepage
├── public/               # Statische bestanden
│   ├── images/           # Afbeeldingen
│   └── locales/          # Vertalingsbestanden
└── styles/               # CSS bestanden
    └── globals.css       # Globale stijlen
```

## Installatie

### Vereisten
- Node.js 18.x of hoger
- npm of yarn

### Installatiestappen

1. Clone de repository:
```bash
git clone https://github.com/yourusername/sensebycbd.git
cd sensebycbd
```

2. Installeer dependencies:
```bash
npm install
# of
yarn install
```

3. Maak een `.env.local` bestand aan met de volgende variabelen:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_VIVA_API_KEY=your_viva_api_key
```

4. Start de ontwikkelserver:
```bash
npm run dev
# of
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in je browser.

## Ontwikkelcommando's

- `npm run dev` - Start de ontwikkelserver
- `npm run build` - Bouwt de applicatie voor productie
- `npm run start` - Start de gebouwde applicatie
- `npm run lint` - Voert ESLint uit voor code kwaliteitscontrole

## Deployment

Voor deployment raden we Vercel aan, omdat dit naadloos werkt met Next.js:

1. Push je code naar een GitHub repository
2. Verbind je repository met Vercel
3. Configureer de omgevingsvariabelen in Vercel
4. Deploy de applicatie

## Licentie

Dit project is eigendom van SenseBy CBD en mag niet worden gebruikt zonder toestemming.

## Contact

Voor vragen of ondersteuning, neem contact op via [contact@sensebycbd.com](mailto:contact@sensebycbd.com).
