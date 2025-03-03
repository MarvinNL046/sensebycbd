export interface SiteConfig {
  // Basic site info
  name: string;
  domain: string;
  
  // SEO
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    defaultKeywords: string;
    ogImage: string;
  };
  
  // Branding
  branding: {
    logo: string;
    favicon: string;
    colors: {
      primary: string;
      primaryLight: string;
      primaryDark: string;
      secondary: string;
      secondaryLight: string;
      secondaryDark: string;
      accent: string;
    };
    fonts: {
      heading: string;
      body: string;
      accent: string;
    };
  };
  
  // Social media
  social: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
  };
  
  // Contact info
  contact: {
    email: string;
    phone?: string;
    address?: string;
  };
  
  // Features to enable/disable
  features: {
    blog: boolean;
    auth: boolean;
    newsletter: boolean;
  };
  
  // Domain-specific configuration
  domains?: {
    [key: string]: {
      language: string;
      title: string;
      description: string;
      keywords: string;
    };
  };
  
  // Notification bars
  notificationBars?: {
    top?: {
      message: string;
      bgColor: string;
      textColor: string;
    };
    bottom?: {
      message: string;
      bgColor: string;
      textColor: string;
    };
  };
}

// Default configuration
const siteConfig: SiteConfig = {
  name: "SenseBy CBD",
  domain: "sensebycbd.com",
  
  seo: {
    defaultTitle: "SenseBy CBD | Premium CBD Products",
    defaultDescription: "Premium CBD products for your wellbeing",
    defaultKeywords: "CBD, wellness, health",
    ogImage: "/images/og-image.jpg"
  },
  
  branding: {
    logo: "/images/logo.svg",
    favicon: "/favicon.ico",
    colors: {
      primary: "#2D6A4F",
      primaryLight: "#52B788",
      primaryDark: "#1B4332",
      secondary: "#74C69D",
      secondaryLight: "#B7E4C7",
      secondaryDark: "#40916C",
      accent: "#D8F3DC"
    },
    fonts: {
      heading: "Montserrat, sans-serif",
      body: "Inter, sans-serif",
      accent: "Playfair Display, serif"
    }
  },
  
  social: {
    facebook: "https://facebook.com",
    instagram: "https://instagram.com",
    twitter: "https://twitter.com"
  },
  
  contact: {
    email: "info@sensebycbd.com",
    phone: "+1234567890",
    address: "123 CBD Street, Amsterdam, Netherlands"
  },
  
  features: {
    blog: true,
    auth: true,
    newsletter: true
  },
  
  // Domain-specific configuration for different languages
  domains: {
    "sensebycbd.com": {
      language: "en",
      title: "SenseBy CBD | Premium CBD Products",
      description: "Premium CBD products for your wellbeing",
      keywords: "CBD, wellness, health, english"
    },
    "sensebycbd.nl": {
      language: "nl",
      title: "SenseBy CBD | Premium CBD Producten",
      description: "Premium CBD producten voor uw welzijn",
      keywords: "CBD, welzijn, gezondheid, nederlands"
    },
    "sensebycbd.de": {
      language: "de",
      title: "SenseBy CBD | Premium CBD Produkte",
      description: "Premium CBD Produkte für Ihr Wohlbefinden",
      keywords: "CBD, Wellness, Gesundheit, deutsch"
    },
    "sensebycbd.fr": {
      language: "fr",
      title: "SenseBy CBD | Produits CBD Premium",
      description: "Produits CBD premium pour votre bien-être",
      keywords: "CBD, bien-être, santé, français"
    }
  },
  
  notificationBars: {
    top: {
      message: "Deze website is nog in ontwikkeling. Sommige functies werken mogelijk nog niet correct.",
      bgColor: "bg-amber-100",
      textColor: "text-amber-800"
    },
    bottom: {
      message: "SenseBy CBD - Website in ontwikkeling",
      bgColor: "bg-primary-100",
      textColor: "text-primary-800"
    }
  }
};

export default siteConfig;
