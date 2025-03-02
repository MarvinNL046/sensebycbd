# Handmatige RLS Setup Instructies

Omdat de scripts niet automatisch kunnen worden uitgevoerd vanwege ontbrekende omgevingsvariabelen, volg deze stappen om de RLS-policies handmatig in te stellen in de Supabase interface.

## 1. Voer de SQL-functies uit

1. Log in op je [Supabase dashboard](https://app.supabase.io)
2. Ga naar de SQL Editor
3. Maak een nieuwe query en plak de inhoud van `supabase/exec-sql-function.sql`:

```sql
-- Function to execute SQL directly from JavaScript
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
```

4. Voer de query uit door op de "Run" knop te klikken
5. Maak een nieuwe query en plak de inhoud van `supabase/admin-rls-functions.sql` (de volledige inhoud)
6. Voer de query uit door op de "Run" knop te klikken

## 2. Stel RLS-policies in voor elke tabel

Voor elke tabel in je database (products, categories, orders, enz.), voer de volgende stappen uit:

1. Ga naar de "Authentication" sectie in het Supabase dashboard
2. Klik op "Policies"
3. Selecteer de tabel waarvoor je RLS wilt inschakelen
4. Klik op "Enable RLS" als dat nog niet is ingeschakeld
5. Klik op "New Policy" om een nieuwe policy toe te voegen
6. Kies "Custom policy" voor maximale controle
7. Geef de policy een naam, bijvoorbeeld "admin_all_products"
8. Kies "All" voor de operatie (of maak aparte policies voor select, insert, update, delete)
9. Voer de volgende definitie in voor de policy:

```sql
(
  auth.uid() IN (
    SELECT id FROM users WHERE is_admin = true
  ) OR 
  auth.email() IN (
    SELECT unnest(string_to_array(current_setting('app.admin_emails', true), ','))
  )
)
```

10. Klik op "Save Policy"

## 3. Stel admin e-mails in

Voer de volgende SQL uit in de SQL Editor om je admin e-mails in te stellen:

```sql
SELECT set_admin_emails('jouw-email@voorbeeld.com');
```

Vervang 'jouw-email@voorbeeld.com' door je eigen e-mailadres of een komma-gescheiden lijst van e-mailadressen.

## 4. Test de CRUD-functionaliteit

Nadat je de RLS-policies hebt ingesteld, test de CRUD-functionaliteit in het admin dashboard om te controleren of alles werkt zoals verwacht.

## Tabellen die RLS-policies nodig hebben

- products
- categories
- orders
- order_items
- users
- blog_posts
- blog_categories
- translations

Voor elke tabel, zorg ervoor dat je RLS inschakelt en de juiste policies instelt om admin gebruikers toe te staan CRUD-operaties uit te voeren.
