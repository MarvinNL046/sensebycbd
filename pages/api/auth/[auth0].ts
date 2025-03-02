/**
 * Auth0 API routes
 * 
 * Dit bestand bevat de API routes voor Auth0 authenticatie.
 * Het handelt de volgende routes af:
 * - /api/auth/login: Inloggen met Auth0
 * - /api/auth/logout: Uitloggen uit Auth0
 * - /api/auth/callback: Callback URL voor Auth0 na inloggen
 * - /api/auth/me: Ophalen van de huidige gebruiker
 * 
 * Zie de Auth0 Next.js SDK documentatie voor meer informatie:
 * https://auth0.github.io/nextjs-auth0/
 */

import { handleAuth, handleLogin, handleLogout, handleCallback, handleProfile, Session } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { syncAuth0UserToSupabase } from '../../../lib/auth0-sync';

/**
 * Aangepaste callback handler die de Auth0 gebruiker synchroniseert met Supabase
 * 
 * @param req De API request
 * @param res De API response
 */
async function handleCallbackWithSync(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Gebruik de standaard Auth0 callback handler
    await handleCallback(req, res, {
      afterCallback: async (req, res, session: Session) => {
        // Synchroniseer de Auth0 gebruiker met Supabase
        if (session.user) {
          await syncAuth0UserToSupabase(session.user);
        }
        
        // Geef de sessie terug
        return session;
      }
    });
  } catch (error) {
    console.error('Error in Auth0 callback:', error);
    res.status(500).end('Internal Server Error');
  }
}

/**
 * Aangepaste login handler met extra opties
 * 
 * @param req De API request
 * @param res De API response
 */
async function handleLoginWithOptions(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Haal de redirect URL uit de query parameters
    const returnTo = req.query.returnTo as string;
    
    // Gebruik de standaard Auth0 login handler met extra opties
    await handleLogin(req, res, {
      returnTo: returnTo || '/',
      authorizationParams: {
        // Voeg extra parameters toe aan de Auth0 login URL
        // Bijvoorbeeld: scope, prompt, etc.
        scope: 'openid profile email',
        // Voeg een prompt toe om de gebruiker te dwingen opnieuw in te loggen
        // prompt: 'login',
      }
    });
  } catch (error) {
    console.error('Error in Auth0 login:', error);
    res.status(500).end('Internal Server Error');
  }
}

/**
 * Aangepaste logout handler met extra opties
 * 
 * @param req De API request
 * @param res De API response
 */
async function handleLogoutWithOptions(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Haal de redirect URL uit de query parameters
    const returnTo = req.query.returnTo as string;
    
    // Gebruik de standaard Auth0 logout handler met extra opties
    await handleLogout(req, res, {
      returnTo: returnTo || '/'
    });
  } catch (error) {
    console.error('Error in Auth0 logout:', error);
    res.status(500).end('Internal Server Error');
  }
}

/**
 * Exporteer de Auth0 API routes
 */
export default handleAuth({
  async login(req, res) {
    await handleLoginWithOptions(req, res);
  },
  async logout(req, res) {
    await handleLogoutWithOptions(req, res);
  },
  async callback(req, res) {
    await handleCallbackWithSync(req, res);
  },
  async me(req, res) {
    await handleProfile(req, res);
  }
});
