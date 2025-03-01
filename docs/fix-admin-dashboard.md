# Fix Admin Dashboard

Dit document legt uit hoe je het probleem kunt oplossen waarbij gebruikers niet zichtbaar zijn in het admin dashboard.

## Het Probleem

Het probleem is dat de Row Level Security (RLS) policies op de `users` tabel een oneindige recursie veroorzaken. Dit gebeurt omdat de policy probeert te controleren of de huidige gebruiker een admin is door de `users` tabel te bevragen, maar om de `users` tabel te bevragen, moet het eerst controleren of de gebruiker een admin is, wat een oneindige lus creëert.

## De Oplossing

We hebben een SQL-migratie gemaakt die dit probleem oplost door een functie te maken die controleert of een gebruiker een admin is zonder RLS te gebruiken.

### Stap 1: Voer de SQL-migratie uit

1. Ga naar het [Supabase Dashboard](https://app.supabase.com/)
2. Selecteer je project
3. Ga naar de SQL Editor (in de linker zijbalk)
4. Maak een nieuwe query
5. Kopieer en plak de volgende SQL:

```sql
-- Fix admin policies to avoid infinite recursion

-- First, drop the existing policies if they exist
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- Create a function to check if a user is an admin
CREATE OR REPLACE FUNCTION public.is_admin(uid uuid)
RETURNS boolean AS $$
DECLARE
  is_admin boolean;
BEGIN
  -- Direct query to avoid RLS
  SELECT u.is_admin INTO is_admin
  FROM public.users u
  WHERE u.id = uid;
  
  RETURN COALESCE(is_admin, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policies using the function
CREATE POLICY "Admins can view all users" 
  ON public.users 
  FOR SELECT 
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update all users" 
  ON public.users 
  FOR UPDATE 
  USING (public.is_admin(auth.uid()));

-- Make sure the admin user is set
UPDATE public.users
SET is_admin = true
WHERE email = 'marvinsmit1988@gmail.com';
```

6. Voer de query uit

### Stap 2: Verifieer de oplossing

1. Ga naar je admin dashboard op [https://www.sensebycbd.com/admin/users](https://www.sensebycbd.com/admin/users) of [http://localhost:3000/admin/users](http://localhost:3000/admin/users)
2. Controleer of je alle gebruikers kunt zien

## Toekomstige Overwegingen

Om ervoor te zorgen dat dit niet opnieuw gebeurt:

1. Zorg ervoor dat RLS-policies geen oneindige recursie veroorzaken
2. Gebruik SECURITY DEFINER functies om RLS te omzeilen wanneer nodig
3. Zorg ervoor dat er altijd minstens één admin gebruiker is

Als je in de toekomst meer admin gebruikers wilt toevoegen, kun je het volgende script gebruiken:

```bash
node scripts/make-user-admin.js your-email@example.com
```
