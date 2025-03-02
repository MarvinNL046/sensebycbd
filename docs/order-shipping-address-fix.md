# Order Shipping Address Fix

Dit document legt uit hoe het probleem is opgelost waarbij verzendadresgegevens niet werden weergegeven in de admin omgeving bij orders.

## Het Probleem

Het probleem was dat verzendadresgegevens niet werden weergegeven in de admin omgeving bij orders. Dit kwam door een mismatch tussen de veldnamen in de database en de code:

1. In de database schema (`supabase/schema.sql`) werd het veld `shipping_address` genoemd:
```sql
CREATE TABLE IF NOT EXISTS public.orders (
  ...
  shipping_address TEXT NOT NULL,
  ...
);
```

2. Maar in de `createOrder` functie (`lib/db.ts`) werd het opgeslagen als `shipping_info`:
```javascript
const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert({
    ...
    shipping_info: shippingInfo,  // Hier was de mismatch
    ...
  })
```

3. En in de admin orders pagina (`pages/admin/orders/index.tsx`) werd geprobeerd het te lezen als `shipping_address`:
```jsx
<div className="text-sm whitespace-pre-line">{selectedOrder.shipping_address}</div>
```

Dit verklaart waarom de verzendadresgegevens niet werden weergegeven - ze werden opgeslagen onder een andere veldnaam dan waar de admin pagina naar zocht.

## De Oplossing

We hebben de volgende stappen ondernomen om dit probleem op te lossen:

1. **Code Aanpassing**: De `createOrder` functie in `lib/db.ts` is aangepast om `shipping_address` te gebruiken in plaats van `shipping_info`:
```javascript
const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert({
    ...
    shipping_address: JSON.stringify(shippingInfo),  // Aangepast naar shipping_address
    ...
  })
```

2. **Bestaande Orders Fixen**: Een script gemaakt (`scripts/fix-order-shipping-address.js`) om bestaande orders te updaten door de gegevens van `shipping_info` naar `shipping_address` te kopiëren.

3. **Backward Compatibility**: Een database migratie gemaakt (`supabase/migrations/20250302_add_shipping_info_column.sql`) die:
   - Een `shipping_info` kolom toevoegt aan de `orders` tabel (als deze nog niet bestaat)
   - Een trigger maakt die `shipping_info` en `shipping_address` gesynchroniseerd houdt

## Hoe te Gebruiken

### 1. Bestaande Orders Fixen

Om bestaande orders te fixen, voer het volgende script uit:

```bash
node scripts/fix-order-shipping-address.js [SUPABASE_URL] [SERVICE_ROLE_KEY]
```

Of als je de omgevingsvariabelen hebt ingesteld in `.env.local`:

```bash
node scripts/fix-order-shipping-address.js
```

### 2. Database Migratie Toepassen

Voer de SQL-migratie uit in het Supabase dashboard:

1. Ga naar het [Supabase Dashboard](https://app.supabase.com/)
2. Selecteer je project
3. Ga naar de SQL Editor (in de linker zijbalk)
4. Maak een nieuwe query
5. Kopieer en plak de inhoud van `supabase/migrations/20250302_add_shipping_info_column.sql`
6. Voer de query uit

## Verificatie

Na het toepassen van deze fixes:

1. Ga naar het admin dashboard en bekijk een order
2. Controleer of de verzendadresgegevens correct worden weergegeven

## Technische Details

### Trigger Functionaliteit

De trigger die we hebben toegevoegd zorgt ervoor dat:

1. Wanneer `shipping_address` wordt bijgewerkt, wordt `shipping_info` automatisch bijgewerkt
2. Wanneer `shipping_info` wordt bijgewerkt, wordt `shipping_address` automatisch bijgewerkt

Dit zorgt ervoor dat beide velden altijd gesynchroniseerd blijven, wat backward compatibility garandeert met eventuele code die nog steeds `shipping_info` gebruikt.

### JSON Opslag

De verzendadresgegevens worden opgeslagen als een JSON string in `shipping_address`, wat het gemakkelijk maakt om de gegevens te structureren en weer te geven in de admin interface.
