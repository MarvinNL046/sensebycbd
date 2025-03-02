# Guest Checkout Fix

Dit document legt uit hoe je het probleem kunt oplossen waarbij gasten (niet-ingelogde gebruikers) niet kunnen afrekenen.

## Het Probleem

Het probleem is dat wanneer een gast probeert af te rekenen, de volgende foutmelding verschijnt:

```
Error processing order: new row violates row-level security policy for table "orders"
```

Dit komt door twee problemen in de database structuur:

1. De `orders` tabel vereist een `user_id` die niet null mag zijn en moet verwijzen naar een bestaande gebruiker in de `users` tabel
2. De Row Level Security (RLS) policies staan alleen toe dat ingelogde gebruikers orders kunnen aanmaken

## De Oplossing

We hebben een SQL-migratie gemaakt die dit probleem oplost door:

1. De `user_id` kolom nullable te maken, zodat gastbestellingen geen gebruiker hoeven te hebben
2. De RLS-policies aan te passen om gastbestellingen toe te staan

### Stap 1: Voer de SQL-migratie uit

1. Ga naar het [Supabase Dashboard](https://app.supabase.com/)
2. Selecteer je project
3. Ga naar de SQL Editor (in de linker zijbalk)
4. Maak een nieuwe query
5. Kopieer en plak de volgende SQL:

```sql
-- Migration to allow guest orders by making user_id nullable and updating RLS policies

-- First, drop the existing foreign key constraint
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Make user_id column nullable
ALTER TABLE public.orders ALTER COLUMN user_id DROP NOT NULL;

-- Add the foreign key constraint back, but allow NULL values
ALTER TABLE public.orders
  ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES public.users(id);

-- Add a new RLS policy to allow guest orders (where user_id is NULL)
CREATE POLICY "Guests can create orders"
  ON public.orders
  FOR INSERT
  WITH CHECK (user_id IS NULL);

-- Add a policy to allow guests to view their own orders
CREATE POLICY "Guests can view their own orders"
  ON public.orders
  FOR SELECT
  USING (user_id IS NULL);

-- Update the order_items policies to allow guest orders
CREATE POLICY "Guests can create order items"
  ON public.order_items
  FOR INSERT
  WITH CHECK (order_id IN (SELECT id FROM public.orders WHERE user_id IS NULL));

CREATE POLICY "Guests can view their own order items"
  ON public.order_items
  FOR SELECT
  USING (order_id IN (SELECT id FROM public.orders WHERE user_id IS NULL));
```

6. Voer de query uit

### Stap 2: Verifieer de oplossing

1. Ga naar je webshop en probeer als gast af te rekenen
2. Controleer of het afrekenen nu succesvol is zonder foutmeldingen

## Technische Details

### Database Wijzigingen

1. **Nullable user_id**: De `user_id` kolom in de `orders` tabel is nu nullable, wat betekent dat orders kunnen worden aangemaakt zonder een gebruiker.

2. **RLS Policies**: We hebben nieuwe RLS policies toegevoegd die specifiek gastbestellingen toestaan:
   - `Guests can create orders`: Staat toe dat orders worden aangemaakt met een null `user_id`
   - `Guests can view their own orders`: Staat toe dat orders met een null `user_id` worden bekeken
   - `Guests can create order items`: Staat toe dat order items worden aangemaakt voor orders met een null `user_id`
   - `Guests can view their own order items`: Staat toe dat order items worden bekeken voor orders met een null `user_id`

### Overwegingen

Deze oplossing maakt het mogelijk voor gasten om af te rekenen zonder een account aan te maken. Er zijn echter enkele overwegingen:

1. **Ordergeschiedenis**: Gastbestellingen zijn niet gekoppeld aan een gebruiker, dus er is geen ordergeschiedenis voor gasten.
2. **Identificatie**: Gastbestellingen worden geïdentificeerd door hun e-mailadres en verzendgegevens, maar er is geen authenticatie.
3. **Conversie**: Het is nog steeds aan te raden om gebruikers aan te moedigen een account aan te maken voor een betere gebruikerservaring en om de conversie te verhogen.

## Toekomstige Verbeteringen

In de toekomst kunnen we overwegen om:

1. Een mechanisme toe te voegen om gastbestellingen te koppelen aan een gebruiker als ze later een account aanmaken
2. Een sessie-gebaseerd systeem te implementeren om gastbestellingen beter te kunnen volgen
3. Een "checkout als gast" optie toe te voegen naast de "maak een account aan" optie tijdens het afrekenen
