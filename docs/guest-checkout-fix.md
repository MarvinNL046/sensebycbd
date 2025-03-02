# Guest Checkout Fix

Dit document legt uit hoe het probleem is opgelost waarbij gastbestellingen een foutmelding gaven.

## Het Probleem

Bij het plaatsen van een gastbestelling werd de volgende foutmelding weergegeven:

```
Error processing order: Could not find the 'shipping_address' column of 'orders' in the schema cache
```

Dit probleem werd veroorzaakt door een mismatch tussen de code en de database structuur:

1. In de `createOrder` functie in `lib/db.ts` probeerden we de verzendgegevens op te slaan in een kolom genaamd `shipping_address`:
   ```javascript
   const { data: order, error: orderError } = await supabase
     .from('orders')
     .insert({
       user_id: userId,
       status: 'pending',
       total_amount: totalAmount,
       shipping_address: JSON.stringify(shippingInfo), // Hier was het probleem
       payment_info: paymentInfo,
       loyalty_points_earned: loyaltyPointsToAward,
     })
   ```

2. Maar in de database bestond deze kolom niet. In plaats daarvan gebruikte de database een kolom genaamd `shipping_info`.

## De Oplossing

We hebben de `createOrder` functie in `lib/db.ts` aangepast om `shipping_info` te gebruiken in plaats van `shipping_address`:

```javascript
const { data: order, error: orderError } = await supabase
  .from('orders')
  .insert({
    user_id: userId,
    status: 'pending',
    total_amount: totalAmount,
    shipping_info: shippingInfo, // Aangepast naar shipping_info
    payment_info: paymentInfo,
    loyalty_points_earned: loyaltyPointsToAward,
  })
```

Merk op dat we ook de `JSON.stringify()` hebben verwijderd, omdat `shipping_info` al een JSON object verwacht.

## Waarom Deze Aanpak?

We hebben gekozen voor deze aanpak omdat:

1. Het een minimale wijziging is die het probleem direct oplost
2. Het geen database migraties vereist
3. Het compatibel is met de bestaande code die `shipping_info` gebruikt

## Gerelateerde Problemen

Dit probleem is gerelateerd aan het probleem waarbij verzendadresgegevens niet werden weergegeven in de admin omgeving bij orders. Zie `docs/order-shipping-address-fix.md` voor meer informatie over dat probleem.

## Toekomstige Verbeteringen

Voor een meer robuuste oplossing op lange termijn, zouden we kunnen overwegen:

1. De database schema te standaardiseren zodat het consistent is met de code
2. Een migratie uit te voeren om beide velden (`shipping_address` en `shipping_info`) te ondersteunen
3. De code aan te passen om beide velden te controleren bij het ophalen van orders

Voor nu is de huidige oplossing voldoende om gastbestellingen correct te laten werken.
