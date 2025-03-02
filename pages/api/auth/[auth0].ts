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
 * 
 * NOTE: This file is temporarily disabled until Auth0 is installed
 * To enable, install @auth0/nextjs-auth0
 */

import { NextApiRequest, NextApiResponse } from 'next';

/**
 * Tijdelijke placeholder voor Auth0 API routes
 * Deze implementatie zal worden vervangen door de echte Auth0 implementatie
 * wanneer de Auth0 package is geïnstalleerd.
 */
export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { auth0 } = req.query;
  
  // Stuur een bericht dat Auth0 nog niet is geïnstalleerd
  res.status(200).json({
    message: 'Auth0 is nog niet geïnstalleerd. Installeer @auth0/nextjs-auth0 om deze functionaliteit te gebruiken.',
    requestedRoute: auth0
  });
}

/* Original implementation:
import { handleAuth, handleLogin, handleLogout, handleCallback, handleProfile, Session } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';
import { syncAuth0UserToSupabase } from '../../../lib/auth0-sync';

async function handleCallbackWithSync(req: NextApiRequest, res: NextApiResponse) {
  try {
    await handleCallback(req, res, {
      afterCallback: async (req, res, session: Session) => {
        if (session.user) {
          await syncAuth0UserToSupabase(session.user);
        }
        return session;
      }
    });
  } catch (error) {
    console.error('Error in Auth0 callback:', error);
    res.status(500).end('Internal Server Error');
  }
}

async function handleLoginWithOptions(req: NextApiRequest, res: NextApiResponse) {
  try {
    const returnTo = req.query.returnTo as string;
    await handleLogin(req, res, {
      returnTo: returnTo || '/',
      authorizationParams: {
        scope: 'openid profile email',
      }
    });
  } catch (error) {
    console.error('Error in Auth0 login:', error);
    res.status(500).end('Internal Server Error');
  }
}

async function handleLogoutWithOptions(req: NextApiRequest, res: NextApiResponse) {
  try {
    const returnTo = req.query.returnTo as string;
    await handleLogout(req, res, {
      returnTo: returnTo || '/'
    });
  } catch (error) {
    console.error('Error in Auth0 logout:', error);
    res.status(500).end('Internal Server Error');
  }
}

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
*/
