-- Create site_config table for storing whitelabel configuration
CREATE TABLE IF NOT EXISTS site_config (
  id BIGINT PRIMARY KEY,
  config JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO site_config (id, config)
VALUES (1, '{
  "name": "SenseBy CBD",
  "domain": "sensebycbd.com",
  "seo": {
    "defaultTitle": "SenseBy CBD | Premium CBD Products",
    "defaultDescription": "Premium CBD products for your wellbeing",
    "defaultKeywords": "CBD, wellness, health",
    "ogImage": "/images/og-image.jpg"
  },
  "branding": {
    "logo": "/images/logo.svg",
    "favicon": "/favicon.ico",
    "colors": {
      "primary": "#2D6A4F",
      "primaryLight": "#52B788",
      "primaryDark": "#1B4332",
      "secondary": "#74C69D",
      "secondaryLight": "#B7E4C7",
      "secondaryDark": "#40916C",
      "accent": "#D8F3DC"
    },
    "fonts": {
      "heading": "Montserrat, sans-serif",
      "body": "Inter, sans-serif",
      "accent": "Playfair Display, serif"
    }
  },
  "social": {
    "facebook": "https://facebook.com",
    "instagram": "https://instagram.com",
    "twitter": "https://twitter.com"
  },
  "contact": {
    "email": "info@sensebycbd.com",
    "phone": "+1234567890",
    "address": "123 CBD Street, Amsterdam, Netherlands"
  },
  "features": {
    "blog": true,
    "multilingual": true,
    "auth": true,
    "newsletter": true
  },
  "notificationBars": {
    "top": {
      "message": "Deze website is nog in ontwikkeling. Sommige functies werken mogelijk nog niet correct.",
      "bgColor": "bg-amber-100",
      "textColor": "text-amber-800"
    },
    "bottom": {
      "message": "SenseBy CBD - Website in ontwikkeling",
      "bgColor": "bg-primary-100",
      "textColor": "text-primary-800"
    }
  }
}')
ON CONFLICT (id) DO NOTHING;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_site_config_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function
CREATE TRIGGER update_site_config_updated_at
BEFORE UPDATE ON site_config
FOR EACH ROW
EXECUTE FUNCTION update_site_config_updated_at();

-- Create a function to create the site_config table if it doesn't exist
-- This is used by the API route when it needs to create the table
CREATE OR REPLACE FUNCTION create_site_config_table()
RETURNS VOID AS $$
BEGIN
  -- Create the table if it doesn't exist
  CREATE TABLE IF NOT EXISTS site_config (
    id BIGINT PRIMARY KEY,
    config JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Insert default configuration if not exists
  INSERT INTO site_config (id, config)
  VALUES (1, '{
    "name": "SenseBy CBD",
    "domain": "sensebycbd.com",
    "seo": {
      "defaultTitle": "SenseBy CBD | Premium CBD Products",
      "defaultDescription": "Premium CBD products for your wellbeing",
      "defaultKeywords": "CBD, wellness, health",
      "ogImage": "/images/og-image.jpg"
    },
    "branding": {
      "logo": "/images/logo.svg",
      "favicon": "/favicon.ico",
      "colors": {
        "primary": "#2D6A4F",
        "primaryLight": "#52B788",
        "primaryDark": "#1B4332",
        "secondary": "#74C69D",
        "secondaryLight": "#B7E4C7",
        "secondaryDark": "#40916C",
        "accent": "#D8F3DC"
      },
      "fonts": {
        "heading": "Montserrat, sans-serif",
        "body": "Inter, sans-serif",
        "accent": "Playfair Display, serif"
      }
    },
    "social": {
      "facebook": "https://facebook.com",
      "instagram": "https://instagram.com",
      "twitter": "https://twitter.com"
    },
    "contact": {
      "email": "info@sensebycbd.com",
      "phone": "+1234567890",
      "address": "123 CBD Street, Amsterdam, Netherlands"
    },
    "features": {
      "blog": true,
      "multilingual": true,
      "auth": true,
      "newsletter": true
    },
    "notificationBars": {
      "top": {
        "message": "Deze website is nog in ontwikkeling. Sommige functies werken mogelijk nog niet correct.",
        "bgColor": "bg-amber-100",
        "textColor": "text-amber-800"
      },
      "bottom": {
        "message": "SenseBy CBD - Website in ontwikkeling",
        "bgColor": "bg-primary-100",
        "textColor": "text-primary-800"
      }
    }
  }')
  ON CONFLICT (id) DO NOTHING;
  
  -- Create the trigger if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_site_config_updated_at'
  ) THEN
    CREATE TRIGGER update_site_config_updated_at
    BEFORE UPDATE ON site_config
    FOR EACH ROW
    EXECUTE FUNCTION update_site_config_updated_at();
  END IF;
END;
$$ LANGUAGE plpgsql;
