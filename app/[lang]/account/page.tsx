import { Suspense } from 'react';
import { Metadata } from 'next';
import { supportedLanguages } from '../../../middleware';
import AccountClient from './account-client';

// Define metadata for the account page
export async function generateMetadata({ 
  params 
}: { 
  params: { lang: string } 
}): Promise<Metadata> {
  // Validate that the language is supported
  const lang = supportedLanguages.includes(params.lang) ? params.lang : 'en';
  
  return {
    title: 'My Account | SenseBy CBD',
    description: 'Manage your SenseBy CBD account, view orders, and track loyalty points.',
  };
}

// Loading fallback
function AccountLoading() {
  return (
    <div className="container-custom py-12">
      <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-8 animate-pulse"></div>
      
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          
          <div className="p-4 bg-gray-100 rounded-lg mb-6">
            <div className="h-5 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
          </div>
          
          <div className="space-y-2 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          
          <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Main content skeleton */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
            ))}
            
            <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
            
            <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
            
            <div className="pt-4">
              <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Define translations for the account page
const translations = {
  en: {
    account: {
      title: "My Account",
      profile: "Profile",
      orders: "Orders",
      loyaltyPoints: "Loyalty Points",
      signOut: "Sign Out",
      profileInfo: "Profile Information",
      updateSuccess: "Profile updated successfully!",
      fullName: "Full Name",
      address: "Address",
      phone: "Phone",
      updateProfile: "Update Profile",
      orderHistory: "Order History",
      noOrders: "You haven't placed any orders yet.",
      orderNumber: "Order Number",
      orderDate: "Order Date",
      orderStatus: "Status",
      orderTotal: "Total",
      viewOrder: "View Order",
      pointsInfo: "Loyalty Points Information",
      pointsBalance: "Current Balance",
      pointsEarned: "Points Earned",
      pointsUsed: "Points Used",
      howToEarn: "How to Earn Points",
      earnRule1: "Earn 1 point for every €20 spent",
      earnRule2: "Earn 5 points for creating an account",
      earnRule3: "Earn 2 points for writing a product review",
      howToUse: "How to Use Points",
      useRule1: "1 point = €1 discount on your next order",
      useRule2: "Minimum 5 points required to redeem",
      useRule3: "Points can be redeemed at checkout"
    }
  },
  nl: {
    account: {
      title: "Mijn Account",
      profile: "Profiel",
      orders: "Bestellingen",
      loyaltyPoints: "Loyaliteitspunten",
      signOut: "Uitloggen",
      profileInfo: "Profielinformatie",
      updateSuccess: "Profiel succesvol bijgewerkt!",
      fullName: "Volledige Naam",
      address: "Adres",
      phone: "Telefoon",
      updateProfile: "Profiel Bijwerken",
      orderHistory: "Bestelgeschiedenis",
      noOrders: "Je hebt nog geen bestellingen geplaatst.",
      orderNumber: "Bestelnummer",
      orderDate: "Besteldatum",
      orderStatus: "Status",
      orderTotal: "Totaal",
      viewOrder: "Bekijk Bestelling",
      pointsInfo: "Loyaliteitspunten Informatie",
      pointsBalance: "Huidige Saldo",
      pointsEarned: "Punten Verdiend",
      pointsUsed: "Punten Gebruikt",
      howToEarn: "Hoe Punten te Verdienen",
      earnRule1: "Verdien 1 punt voor elke €20 besteed",
      earnRule2: "Verdien 5 punten voor het aanmaken van een account",
      earnRule3: "Verdien 2 punten voor het schrijven van een productreview",
      howToUse: "Hoe Punten te Gebruiken",
      useRule1: "1 punt = €1 korting op je volgende bestelling",
      useRule2: "Minimaal 5 punten vereist om in te wisselen",
      useRule3: "Punten kunnen worden ingewisseld bij het afrekenen"
    }
  },
  de: {
    account: {
      title: "Mein Konto",
      profile: "Profil",
      orders: "Bestellungen",
      loyaltyPoints: "Treuepunkte",
      signOut: "Abmelden",
      profileInfo: "Profilinformationen",
      updateSuccess: "Profil erfolgreich aktualisiert!",
      fullName: "Vollständiger Name",
      address: "Adresse",
      phone: "Telefon",
      updateProfile: "Profil Aktualisieren",
      orderHistory: "Bestellverlauf",
      noOrders: "Sie haben noch keine Bestellungen aufgegeben.",
      orderNumber: "Bestellnummer",
      orderDate: "Bestelldatum",
      orderStatus: "Status",
      orderTotal: "Gesamt",
      viewOrder: "Bestellung Anzeigen",
      pointsInfo: "Treuepunkte Informationen",
      pointsBalance: "Aktuelles Guthaben",
      pointsEarned: "Verdiente Punkte",
      pointsUsed: "Verwendete Punkte",
      howToEarn: "Wie man Punkte verdient",
      earnRule1: "Verdienen Sie 1 Punkt für je €20 Ausgaben",
      earnRule2: "Verdienen Sie 5 Punkte für die Erstellung eines Kontos",
      earnRule3: "Verdienen Sie 2 Punkte für das Schreiben einer Produktbewertung",
      howToUse: "Wie man Punkte verwendet",
      useRule1: "1 Punkt = €1 Rabatt auf Ihre nächste Bestellung",
      useRule2: "Mindestens 5 Punkte erforderlich zum Einlösen",
      useRule3: "Punkte können beim Checkout eingelöst werden"
    }
  },
  fr: {
    account: {
      title: "Mon Compte",
      profile: "Profil",
      orders: "Commandes",
      loyaltyPoints: "Points de Fidélité",
      signOut: "Déconnexion",
      profileInfo: "Informations du Profil",
      updateSuccess: "Profil mis à jour avec succès!",
      fullName: "Nom Complet",
      address: "Adresse",
      phone: "Téléphone",
      updateProfile: "Mettre à Jour le Profil",
      orderHistory: "Historique des Commandes",
      noOrders: "Vous n'avez pas encore passé de commande.",
      orderNumber: "Numéro de Commande",
      orderDate: "Date de Commande",
      orderStatus: "Statut",
      orderTotal: "Total",
      viewOrder: "Voir la Commande",
      pointsInfo: "Informations sur les Points de Fidélité",
      pointsBalance: "Solde Actuel",
      pointsEarned: "Points Gagnés",
      pointsUsed: "Points Utilisés",
      howToEarn: "Comment Gagner des Points",
      earnRule1: "Gagnez 1 point pour chaque €20 dépensés",
      earnRule2: "Gagnez 5 points pour la création d'un compte",
      earnRule3: "Gagnez 2 points pour la rédaction d'un avis sur un produit",
      howToUse: "Comment Utiliser les Points",
      useRule1: "1 point = €1 de réduction sur votre prochaine commande",
      useRule2: "Minimum 5 points requis pour échanger",
      useRule3: "Les points peuvent être échangés lors du paiement"
    }
  }
};

// Account page component
export default function AccountPage({ 
  params 
}: { 
  params: { lang: string } 
}) {
  // Validate that the language is supported
  const lang = supportedLanguages.includes(params.lang) ? params.lang : 'en';
  
  // Get translations for the current language
  const langTranslations = translations[lang as keyof typeof translations] || translations.en;
  
  return (
    <Suspense fallback={<AccountLoading />}>
      <AccountClient translations={langTranslations} />
    </Suspense>
  );
}
