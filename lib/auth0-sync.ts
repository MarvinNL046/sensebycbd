import { supabase } from './supabase';
import logger from './utils/logger';

// NOTE: This file is temporarily disabled until Auth0 is installed
// To enable, install @auth0/nextjs-auth0

/**
 * Interface voor Auth0 gebruiker
 */
interface Auth0User {
  email?: string;
  name?: string;
  nickname?: string;
  picture?: string;
  user_id: string;
  sub?: string;
  [key: string]: any;
}

/**
 * Synchroniseert een Auth0 gebruiker met Supabase
 * 
 * Deze functie controleert of de gebruiker al bestaat in Supabase op basis van het e-mailadres.
 * Als de gebruiker bestaat, worden de gegevens bijgewerkt.
 * Als de gebruiker niet bestaat, wordt een nieuwe gebruiker aangemaakt.
 * 
 * @param auth0User De Auth0 gebruiker
 * @returns De gesynchroniseerde Supabase gebruiker of null bij een fout
 */
export async function syncAuth0UserToSupabase(auth0User: Auth0User) {
  if (!auth0User || !auth0User.email) {
    logger.error('Geen geldige Auth0 gebruiker om te synchroniseren');
    return null;
  }

  try {
    // Controleer of de gebruiker al bestaat in Supabase
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('email', auth0User.email)
      .single();
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 betekent "geen resultaten gevonden", andere fouten zijn echte fouten
      logger.error('Fout bij het ophalen van gebruiker:', fetchError);
      return null;
    }
    
    // Bepaal de Auth0 ID (user_id of sub)
    const auth0Id = auth0User.user_id || auth0User.sub;
    
    if (!auth0Id) {
      logger.error('Geen Auth0 ID gevonden in gebruiker');
      return null;
    }
    
    // Bereid gebruikersgegevens voor
    const userData = {
      email: auth0User.email,
      full_name: auth0User.name || auth0User.nickname || '',
      auth0_id: auth0Id,
      picture: auth0User.picture || null,
      last_sign_in: new Date().toISOString()
    };
    
    if (existingUser) {
      // Update bestaande gebruiker
      logger.log(`Bijwerken van bestaande gebruiker: ${auth0User.email}`);
      
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('email', auth0User.email)
        .select()
        .single();
      
      if (error) {
        logger.error('Fout bij het updaten van gebruiker:', error);
        return null;
      }
      
      logger.log(`Gebruiker ${auth0User.email} succesvol bijgewerkt`);
      return data;
    } else {
      // Maak nieuwe gebruiker aan
      logger.log(`Aanmaken van nieuwe gebruiker: ${auth0User.email}`);
      
      // Voeg extra velden toe voor nieuwe gebruikers
      const newUserData = {
        ...userData,
        loyalty_points: 0,
        is_admin: false,
        created_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert(newUserData)
        .select()
        .single();
      
      if (error) {
        logger.error('Fout bij het aanmaken van gebruiker:', error);
        return null;
      }
      
      logger.log(`Nieuwe gebruiker ${auth0User.email} succesvol aangemaakt`);
      return data;
    }
  } catch (error) {
    logger.error('Onverwachte fout bij synchroniseren van gebruiker:', error);
    return null;
  }
}

/**
 * Haalt een Supabase gebruiker op basis van een Auth0 gebruiker
 * 
 * @param auth0User De Auth0 gebruiker
 * @returns De Supabase gebruiker of null als deze niet bestaat
 */
export async function getSupabaseUserFromAuth0(auth0User: Auth0User) {
  if (!auth0User || !auth0User.email) {
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', auth0User.email)
      .single();
    
    if (error) {
      return null;
    }
    
    return data;
  } catch (error) {
    logger.error('Fout bij het ophalen van Supabase gebruiker:', error);
    return null;
  }
}

/**
 * Controleert of een Auth0 gebruiker een admin is in Supabase
 * 
 * @param auth0User De Auth0 gebruiker
 * @returns true als de gebruiker een admin is, anders false
 */
export async function isAdmin(auth0User: Auth0User): Promise<boolean> {
  if (!auth0User || !auth0User.email) {
    return false;
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('is_admin')
      .eq('email', auth0User.email)
      .single();
    
    if (error || !data) {
      return false;
    }
    
    return data.is_admin === true;
  } catch (error) {
    logger.error('Fout bij het controleren van admin status:', error);
    return false;
  }
}

/**
 * Haalt de loyaliteitspunten van een Auth0 gebruiker op uit Supabase
 * 
 * @param auth0User De Auth0 gebruiker
 * @returns Het aantal loyaliteitspunten of 0 bij een fout
 */
export async function getLoyaltyPoints(auth0User: Auth0User): Promise<number> {
  if (!auth0User || !auth0User.email) {
    return 0;
  }
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('loyalty_points')
      .eq('email', auth0User.email)
      .single();
    
    if (error || !data) {
      return 0;
    }
    
    return data.loyalty_points || 0;
  } catch (error) {
    logger.error('Fout bij het ophalen van loyaliteitspunten:', error);
    return 0;
  }
}

/**
 * Voegt loyaliteitspunten toe aan een Auth0 gebruiker in Supabase
 * 
 * @param auth0User De Auth0 gebruiker
 * @param points Het aantal toe te voegen punten
 * @returns true als de punten zijn toegevoegd, anders false
 */
export async function addLoyaltyPoints(auth0User: Auth0User, points: number): Promise<boolean> {
  if (!auth0User || !auth0User.email || points <= 0) {
    return false;
  }
  
  try {
    // Haal huidige punten op
    const currentPoints = await getLoyaltyPoints(auth0User);
    
    // Update punten
    const { error } = await supabase
      .from('users')
      .update({ loyalty_points: currentPoints + points })
      .eq('email', auth0User.email);
    
    if (error) {
      logger.error('Fout bij het toevoegen van loyaliteitspunten:', error);
      return false;
    }
    
    logger.log(`${points} loyaliteitspunten toegevoegd aan gebruiker ${auth0User.email}`);
    return true;
  } catch (error) {
    logger.error('Onverwachte fout bij het toevoegen van loyaliteitspunten:', error);
    return false;
  }
}
