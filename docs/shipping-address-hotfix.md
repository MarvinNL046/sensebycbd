# Shipping Address Hotfix

Dit document beschrijft het probleem met de `shipping_address` kolom in de orders tabel en de mogelijke oplossingen.

## Het Probleem

Er is een mismatch tussen de code en de database structuur:

1. De code verwacht een kolom genaamd `shipping_address` in de `orders` tabel
2. De database heeft echter alleen een kolom genaamd `shipping_info`

Dit veroorzaakt de volgende foutmelding:
```
Error updating order total: {code: '42703', details: null, hint: null, message: 'record "new" has no field "shipping_address"'}
```

## Oplossing 1: Code Aanpassen (Reeds Geïmplementeerd)

We hebben de code aangepast om `shipping_info` te gebruiken in plaats van `shipping_address`:

1. In `lib/db.ts` hebben we de `createOrder` functie aangepast
2. In `pages/admin/orders/index.tsx` hebben we de code aangepast die orders bijwerkt
3. In `pages/admin/index.tsx` hebben we vergelijkbare aanpassingen gedaan

Deze wijzigingen zijn gecommit en gepusht naar GitHub, maar moeten nog worden gedeployed naar de productieomgeving.

### Deployment Uitvoeren

Om de code-wijzigingen te deployen naar de productieomgeving, kun je het volgende doen:

1. **Automatische deployment via Vercel**
   - Als je GitHub repository is gekoppeld aan Vercel, zou een push naar de `main` branch automatisch een deployment moeten triggeren
   - Controleer de Vercel dashboard om te zien of de deployment is gestart of voltooid

2. **Handmatige deployment via Vercel CLI**
   - We hebben een script gemaakt om een handmatige deployment te triggeren:
   ```bash
   node scripts/trigger-vercel-deployment.js
   ```
   - Dit vereist dat de Vercel CLI is geïnstalleerd (`npm install -g vercel`)

## Oplossing 2: Database Aanpassen (Hotfix)

Als alternatief kunnen we de database aanpassen om een `shipping_address` kolom toe te voegen:

1. We hebben een SQL migratie gemaakt die:
   - Een `shipping_address` kolom toevoegt aan de `orders` tabel
   - Bestaande data kopieert van `shipping_info` naar `shipping_address`

2. Deze migratie kan worden toegepast op verschillende manieren:

   **Optie A: Gebruik het originele script (vereist pgmigrate RPC functie)**
   ```bash
   node scripts/apply-shipping-address-hotfix.js
   ```

   **Optie B: Gebruik het directe script (gebruikt pg_query RPC functie)**
   ```bash
   node scripts/apply-shipping-address-hotfix-direct.js
   ```

   **Optie C: Gebruik het REST API script (geen RPC functies nodig)**
   ```bash
   node scripts/execute-shipping-address-sql.js
   ```

3. Of handmatig via de Supabase SQL Editor:
   - Ga naar https://app.supabase.com
   - Selecteer je project
   - Ga naar de SQL Editor
   - Maak een nieuwe query
   - Plak de inhoud van `supabase/migrations/20250302_add_shipping_address_column_simplified.sql`:
   ```sql
   -- Add shipping_address column if it doesn't exist
   ALTER TABLE orders
   ADD COLUMN IF NOT EXISTS shipping_address JSONB;

   -- Copy data from shipping_info to shipping_address
   UPDATE orders
   SET shipping_address = shipping_info
   WHERE shipping_info IS NOT NULL AND shipping_address IS NULL;

   -- Add a comment to the column
   COMMENT ON COLUMN orders.shipping_address IS 'Shipping address information as a JSON object. Added as a hotfix to prevent errors with code that expects this column.';
   ```
   - Voer de query uit

## Aanbevolen Aanpak

1. **Korte termijn**: Pas de database aan met de hotfix om de foutmeldingen direct op te lossen
2. **Lange termijn**: Deploy de code-wijzigingen naar de productieomgeving

Dit zorgt ervoor dat de website blijft werken terwijl de code-wijzigingen worden gedeployed.

## Toekomstige Verbeteringen

Voor een meer robuuste oplossing op lange termijn, zouden we kunnen overwegen:

1. De database schema te standaardiseren zodat het consistent is met de code
2. Een migratie uit te voeren om beide velden (`shipping_address` en `shipping_info`) te ondersteunen
3. De code aan te passen om beide velden te controleren bij het ophalen van orders

## Gerelateerde Documenten

- [Guest Checkout Fix](./guest-checkout-fix.md)
- [Order Shipping Address Fix](./order-shipping-address-fix.md)
