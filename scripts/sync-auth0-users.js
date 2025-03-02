/**
 * Script om Auth0 gebruikers te synchroniseren met Supabase
 * 
 * Dit script kan worden gebruikt om:
 * 1. Bestaande Auth0 gebruikers te synchroniseren met Supabase
 * 2. Bestaande Supabase gebruikers te migreren naar Auth0
 * 
 * Gebruik:
 * node scripts/sync-auth0-users.js --mode=sync-to-supabase
 * node scripts/sync-auth0-users.js --mode=migrate-to-auth0
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const { ManagementClient } = require('auth0');
const fs = require('fs');
const path = require('path');

// Configuratie
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const AUTH0_DOMAIN = process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '');
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID;
const AUTH0_CLIENT_SECRET = process.env.AUTH0_CLIENT_SECRET;

// Initialiseer clients
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const auth0 = new ManagementClient({
  domain: AUTH0_DOMAIN,
  clientId: AUTH0_CLIENT_ID,
  clientSecret: AUTH0_CLIENT_SECRET,
});

// Hulpfuncties
function logMessage(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

function logError(message, error) {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error);
}

async function saveToJsonFile(data, filename) {
  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  logMessage(`Data opgeslagen in ${filePath}`);
}

// Hoofdfuncties
async function syncAuth0UsersToSupabase() {
  try {
    logMessage('Start synchronisatie van Auth0 gebruikers naar Supabase...');
    
    // Haal alle Auth0 gebruikers op
    const auth0Users = await auth0.getUsers();
    logMessage(`${auth0Users.length} Auth0 gebruikers gevonden`);
    
    // Sla Auth0 gebruikers op voor referentie
    await saveToJsonFile(auth0Users, 'auth0-users-backup.json');
    
    // Synchroniseer elke gebruiker
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
    
    for (const auth0User of auth0Users) {
      try {
        if (!auth0User.email) {
          logMessage(`Gebruiker ${auth0User.user_id} heeft geen e-mailadres, wordt overgeslagen`);
          results.skipped++;
          results.details.push({ id: auth0User.user_id, status: 'skipped', reason: 'No email' });
          continue;
        }
        
        // Controleer of de gebruiker al bestaat in Supabase
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', auth0User.email)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }
        
        if (existingUser) {
          // Update bestaande gebruiker
          const { data, error } = await supabase
            .from('users')
            .update({
              full_name: auth0User.name || auth0User.nickname,
              auth0_id: auth0User.user_id,
              last_sign_in: new Date().toISOString()
            })
            .eq('email', auth0User.email)
            .select()
            .single();
          
          if (error) throw error;
          
          logMessage(`Gebruiker ${auth0User.email} bijgewerkt in Supabase`);
          results.success++;
          results.details.push({ 
            id: auth0User.user_id, 
            email: auth0User.email, 
            status: 'updated', 
            supabase_id: data.id 
          });
        } else {
          // Maak nieuwe gebruiker aan
          const { data, error } = await supabase
            .from('users')
            .insert({
              email: auth0User.email,
              full_name: auth0User.name || auth0User.nickname,
              auth0_id: auth0User.user_id,
              loyalty_points: 0,
              last_sign_in: new Date().toISOString()
            })
            .select()
            .single();
          
          if (error) throw error;
          
          logMessage(`Nieuwe gebruiker ${auth0User.email} aangemaakt in Supabase`);
          results.success++;
          results.details.push({ 
            id: auth0User.user_id, 
            email: auth0User.email, 
            status: 'created', 
            supabase_id: data.id 
          });
        }
      } catch (error) {
        logError(`Fout bij synchroniseren van gebruiker ${auth0User.email || auth0User.user_id}`, error);
        results.failed++;
        results.details.push({ 
          id: auth0User.user_id, 
          email: auth0User.email, 
          status: 'failed', 
          error: error.message 
        });
      }
    }
    
    // Sla resultaten op
    await saveToJsonFile(results, 'auth0-sync-results.json');
    
    logMessage(`Synchronisatie voltooid: ${results.success} succesvol, ${results.failed} mislukt, ${results.skipped} overgeslagen`);
    return results;
  } catch (error) {
    logError('Fout bij synchroniseren van Auth0 gebruikers', error);
    throw error;
  }
}

async function migrateSupabaseUsersToAuth0() {
  try {
    logMessage('Start migratie van Supabase gebruikers naar Auth0...');
    
    // Haal alle Supabase gebruikers op
    const { data: supabaseUsers, error } = await supabase
      .from('users')
      .select('*');
    
    if (error) throw error;
    
    logMessage(`${supabaseUsers.length} Supabase gebruikers gevonden`);
    
    // Sla Supabase gebruikers op voor referentie
    await saveToJsonFile(supabaseUsers, 'supabase-users-backup.json');
    
    // Haal bestaande Auth0 gebruikers op voor controle op duplicaten
    const auth0Users = await auth0.getUsers();
    const auth0Emails = new Set(auth0Users.map(user => user.email?.toLowerCase()));
    
    // Migreer elke gebruiker
    const results = {
      success: 0,
      failed: 0,
      skipped: 0,
      details: []
    };
    
    for (const supabaseUser of supabaseUsers) {
      try {
        if (!supabaseUser.email) {
          logMessage(`Gebruiker ${supabaseUser.id} heeft geen e-mailadres, wordt overgeslagen`);
          results.skipped++;
          results.details.push({ id: supabaseUser.id, status: 'skipped', reason: 'No email' });
          continue;
        }
        
        // Controleer of de gebruiker al bestaat in Auth0
        if (auth0Emails.has(supabaseUser.email.toLowerCase())) {
          logMessage(`Gebruiker ${supabaseUser.email} bestaat al in Auth0, wordt overgeslagen`);
          results.skipped++;
          results.details.push({ 
            id: supabaseUser.id, 
            email: supabaseUser.email, 
            status: 'skipped', 
            reason: 'Already exists in Auth0' 
          });
          continue;
        }
        
        // Genereer een willekeurig wachtwoord (gebruiker moet 'wachtwoord vergeten' gebruiken)
        const tempPassword = Math.random().toString(36).slice(-10) + 
                            Math.random().toString(36).slice(-10).toUpperCase() + 
                            '!@#$%^&*()';
        
        // Maak gebruiker aan in Auth0
        const auth0User = await auth0.createUser({
          email: supabaseUser.email,
          name: supabaseUser.full_name,
          password: tempPassword,
          connection: 'Username-Password-Authentication',
          email_verified: true, // Ga ervan uit dat e-mails in Supabase geverifieerd zijn
          app_metadata: {
            supabase_id: supabaseUser.id,
            loyalty_points: supabaseUser.loyalty_points || 0
          },
          user_metadata: {
            address: supabaseUser.address,
            phone: supabaseUser.phone
          }
        });
        
        // Update Supabase gebruiker met Auth0 ID
        const { error: updateError } = await supabase
          .from('users')
          .update({
            auth0_id: auth0User.user_id
          })
          .eq('id', supabaseUser.id);
        
        if (updateError) throw updateError;
        
        // Stuur wachtwoord reset e-mail
        await auth0.createPasswordChangeTicket({
          user_id: auth0User.user_id,
          result_url: process.env.AUTH0_BASE_URL,
          ttl_sec: 86400 // 24 uur
        });
        
        logMessage(`Gebruiker ${supabaseUser.email} gemigreerd naar Auth0 en wachtwoord reset e-mail verzonden`);
        results.success++;
        results.details.push({ 
          id: supabaseUser.id, 
          email: supabaseUser.email, 
          status: 'migrated', 
          auth0_id: auth0User.user_id 
        });
      } catch (error) {
        logError(`Fout bij migreren van gebruiker ${supabaseUser.email || supabaseUser.id}`, error);
        results.failed++;
        results.details.push({ 
          id: supabaseUser.id, 
          email: supabaseUser.email, 
          status: 'failed', 
          error: error.message 
        });
      }
    }
    
    // Sla resultaten op
    await saveToJsonFile(results, 'supabase-migration-results.json');
    
    logMessage(`Migratie voltooid: ${results.success} succesvol, ${results.failed} mislukt, ${results.skipped} overgeslagen`);
    return results;
  } catch (error) {
    logError('Fout bij migreren van Supabase gebruikers', error);
    throw error;
  }
}

// Hoofdfunctie
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const modeArg = args.find(arg => arg.startsWith('--mode='));
    const mode = modeArg ? modeArg.split('=')[1] : 'sync-to-supabase';
    
    if (mode === 'sync-to-supabase') {
      await syncAuth0UsersToSupabase();
    } else if (mode === 'migrate-to-auth0') {
      await migrateSupabaseUsersToAuth0();
    } else {
      logError(`Onbekende modus: ${mode}. Gebruik 'sync-to-supabase' of 'migrate-to-auth0'.`);
      process.exit(1);
    }
    
    process.exit(0);
  } catch (error) {
    logError('Onverwachte fout', error);
    process.exit(1);
  }
}

// Start het script
main();
