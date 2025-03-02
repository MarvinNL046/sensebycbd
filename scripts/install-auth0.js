/**
 * Script om Auth0 te installeren en configureren
 * 
 * Dit script installeert de Auth0 Next.js SDK en configureert de benodigde omgevingsvariabelen.
 * 
 * Gebruik:
 * node scripts/install-auth0.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Maak een readline interface voor gebruikersinput
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Vraag om input
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Log berichten met timestamp
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Voer een commando uit en log de output
function execute(command) {
  log(`Uitvoeren: ${command}`);
  try {
    const output = execSync(command, { encoding: 'utf8' });
    log('Commando succesvol uitgevoerd');
    return output;
  } catch (error) {
    log(`Fout bij uitvoeren commando: ${error.message}`);
    throw error;
  }
}

// Controleer of een bestand bestaat
function fileExists(filePath) {
  return fs.existsSync(filePath);
}

// Lees een bestand
function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

// Schrijf naar een bestand
function writeFile(filePath, content) {
  fs.writeFileSync(filePath, content, 'utf8');
}

// Kopieer een bestand
function copyFile(source, destination) {
  fs.copyFileSync(source, destination);
}

// Hoofdfunctie
async function main() {
  try {
    log('Start Auth0 installatie en configuratie');

    // Stap 1: Installeer Auth0 Next.js SDK
    log('Stap 1: Installeren van Auth0 Next.js SDK');
    execute('npm install @auth0/nextjs-auth0');

    // Stap 2: Configureer omgevingsvariabelen
    log('Stap 2: Configureren van omgevingsvariabelen');
    
    const envExamplePath = path.join(process.cwd(), '.env.local.example');
    const envLocalPath = path.join(process.cwd(), '.env.local');
    
    if (!fileExists(envExamplePath)) {
      log('Fout: .env.local.example bestand niet gevonden');
      return;
    }
    
    // Controleer of .env.local al bestaat
    let envContent;
    if (fileExists(envLocalPath)) {
      log('.env.local bestand bestaat al, bestaande configuratie wordt bijgewerkt');
      envContent = readFile(envLocalPath);
    } else {
      log('.env.local bestand bestaat niet, nieuw bestand wordt aangemaakt');
      envContent = readFile(envExamplePath);
    }
    
    // Vraag om Auth0 configuratie
    log('Voer de Auth0 configuratie in:');
    
    const auth0Secret = await prompt('Auth0 Secret (genereer met: openssl rand -hex 32): ');
    const auth0BaseUrl = await prompt('Auth0 Base URL (standaard: http://localhost:3000): ') || 'http://localhost:3000';
    const auth0IssuerBaseUrl = await prompt('Auth0 Issuer Base URL: ');
    const auth0ClientId = await prompt('Auth0 Client ID: ');
    const auth0ClientSecret = await prompt('Auth0 Client Secret: ');
    
    // Update omgevingsvariabelen
    envContent = envContent
      .replace(/AUTH0_SECRET=.*/, `AUTH0_SECRET=${auth0Secret}`)
      .replace(/AUTH0_BASE_URL=.*/, `AUTH0_BASE_URL=${auth0BaseUrl}`)
      .replace(/AUTH0_ISSUER_BASE_URL=.*/, `AUTH0_ISSUER_BASE_URL=${auth0IssuerBaseUrl}`)
      .replace(/AUTH0_CLIENT_ID=.*/, `AUTH0_CLIENT_ID=${auth0ClientId}`)
      .replace(/AUTH0_CLIENT_SECRET=.*/, `AUTH0_CLIENT_SECRET=${auth0ClientSecret}`);
    
    // Schrijf naar .env.local
    writeFile(envLocalPath, envContent);
    log('.env.local bestand bijgewerkt met Auth0 configuratie');
    
    // Stap 3: Kopieer voorbeeld bestanden
    log('Stap 3: Kopiëren van voorbeeld bestanden');
    
    // Controleer of de benodigde mappen bestaan
    const apiAuthDir = path.join(process.cwd(), 'pages', 'api', 'auth');
    if (!fs.existsSync(apiAuthDir)) {
      fs.mkdirSync(apiAuthDir, { recursive: true });
      log('pages/api/auth map aangemaakt');
    }
    
    // Kopieer [auth0].ts bestand als het bestaat
    const auth0ApiPath = path.join(process.cwd(), 'pages', 'api', 'auth', '[auth0].ts');
    const auth0ApiExamplePath = path.join(process.cwd(), 'pages', 'api', 'auth', '[auth0].ts.example');
    
    if (fileExists(auth0ApiExamplePath)) {
      copyFile(auth0ApiExamplePath, auth0ApiPath);
      log('[auth0].ts bestand gekopieerd');
    } else {
      log('Waarschuwing: [auth0].ts.example bestand niet gevonden, handmatig aanmaken vereist');
    }
    
    // Stap 4: Controleer of _app.tsx is bijgewerkt
    log('Stap 4: Controleren van _app.tsx');
    
    const appPath = path.join(process.cwd(), 'pages', '_app.tsx');
    if (fileExists(appPath)) {
      const appContent = readFile(appPath);
      
      if (!appContent.includes('UserProvider')) {
        log('Waarschuwing: UserProvider niet gevonden in _app.tsx');
        log('Voeg de volgende code toe aan _app.tsx:');
        log(`
import { UserProvider } from '@auth0/nextjs-auth0/client';

function MyApp({ Component, pageProps }) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}
        `);
      } else {
        log('UserProvider gevonden in _app.tsx');
      }
    } else {
      log('Waarschuwing: _app.tsx bestand niet gevonden');
    }
    
    // Stap 5: Controleer Auth0 configuratie
    log('Stap 5: Controleren van Auth0 configuratie');
    
    log(`
Auth0 configuratie:
- Auth0 Secret: ${auth0Secret ? '✓ Ingesteld' : '✗ Niet ingesteld'}
- Auth0 Base URL: ${auth0BaseUrl}
- Auth0 Issuer Base URL: ${auth0IssuerBaseUrl}
- Auth0 Client ID: ${auth0ClientId ? '✓ Ingesteld' : '✗ Niet ingesteld'}
- Auth0 Client Secret: ${auth0ClientSecret ? '✓ Ingesteld' : '✗ Niet ingesteld'}
    `);
    
    log(`
Controleer de volgende instellingen in je Auth0 dashboard:
1. Allowed Callback URLs: ${auth0BaseUrl}/api/auth/callback
2. Allowed Logout URLs: ${auth0BaseUrl}
3. Allowed Web Origins: ${auth0BaseUrl}
    `);
    
    log('Auth0 installatie en configuratie voltooid');
    
  } catch (error) {
    log(`Fout bij Auth0 installatie: ${error.message}`);
  } finally {
    rl.close();
  }
}

// Start het script
main();
