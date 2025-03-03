import { SiteConfig } from '../lib/site-config';

/**
 * Example configuration for Dutch Seed Supply
 * This demonstrates how to customize the site for a different brand
 */
const dutchSeedSupplyConfig: SiteConfig = {
  name: "Dutch Seed Supply",
  domain: "dutchseedsupply.com",
  
  seo: {
    defaultTitle: "Dutch Seed Supply | Premium Seeds for Your Garden",
    defaultDescription: "High-quality seeds for vegetables, flowers, and herbs. Sourced from the Netherlands for optimal growth and yield.",
    defaultKeywords: "seeds, garden, vegetables, flowers, herbs, Dutch, Netherlands, organic",
    ogImage: "/images/og-image-seeds.jpg"
  },
  
  branding: {
    logo: "/images/dutch-seed-logo.svg",
    favicon: "/favicon-seeds.ico",
    colors: {
      primary: "#4D7C0F", // Olive green
      primaryLight: "#84CC16", // Lime green
      primaryDark: "#3F6212", // Dark olive
      secondary: "#F59E0B", // Amber
      secondaryLight: "#FBBF24", // Light amber
      secondaryDark: "#D97706", // Dark amber
      accent: "#ECFCCB" // Light lime
    },
    fonts: {
      heading: "Poppins, sans-serif",
      body: "Open Sans, sans-serif",
      accent: "Merriweather, serif"
    }
  },
  
  social: {
    facebook: "https://facebook.com/dutchseedsupply",
    instagram: "https://instagram.com/dutchseedsupply",
    twitter: "https://twitter.com/dutchseedsupply",
    youtube: "https://youtube.com/dutchseedsupply",
    linkedin: "https://linkedin.com/company/dutchseedsupply"
  },
  
  contact: {
    email: "info@dutchseedsupply.com",
    phone: "+31 20 123 4567",
    address: "Seed Street 42, 1012 AB Amsterdam, Netherlands"
  },
  
  features: {
    blog: true,
    auth: true,
    newsletter: true
  },
  
  // Domain-specific configuration for different languages
  domains: {
    "dutchseedsupply.com": {
      language: "en",
      title: "Dutch Seed Supply | Premium Seeds for Your Garden",
      description: "High-quality seeds for vegetables, flowers, and herbs. Sourced from the Netherlands for optimal growth and yield.",
      keywords: "seeds, garden, vegetables, flowers, herbs, Dutch, Netherlands, organic, english"
    },
    "dutchseedsupply.nl": {
      language: "nl",
      title: "Dutch Seed Supply | Premium Zaden voor Jouw Tuin",
      description: "Hoogwaardige zaden voor groenten, bloemen en kruiden. Afkomstig uit Nederland voor optimale groei en opbrengst.",
      keywords: "zaden, tuin, groenten, bloemen, kruiden, Nederlands, Nederland, biologisch"
    },
    "dutchseedsupply.de": {
      language: "de",
      title: "Dutch Seed Supply | Premium Samen für Ihren Garten",
      description: "Hochwertige Samen für Gemüse, Blumen und Kräuter. Aus den Niederlanden für optimales Wachstum und Ertrag.",
      keywords: "Samen, Garten, Gemüse, Blumen, Kräuter, Niederländisch, Niederlande, Bio"
    },
    "dutchseedsupply.fr": {
      language: "fr",
      title: "Dutch Seed Supply | Graines Premium pour Votre Jardin",
      description: "Graines de haute qualité pour légumes, fleurs et herbes. En provenance des Pays-Bas pour une croissance et un rendement optimaux.",
      keywords: "graines, jardin, légumes, fleurs, herbes, néerlandais, Pays-Bas, bio"
    }
  },
  
  notificationBars: {
    top: {
      message: "Free shipping on orders over €50",
      bgColor: "bg-lime-100",
      textColor: "text-lime-800"
    },
    bottom: {
      message: "Dutch Seed Supply - Premium seeds from the Netherlands",
      bgColor: "bg-primary-100",
      textColor: "text-primary-800"
    }
  }
};

export default dutchSeedSupplyConfig;
