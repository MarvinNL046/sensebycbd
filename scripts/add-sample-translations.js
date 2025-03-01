/**
 * Script to add sample translations to products and categories
 * 
 * This script adds Dutch, German, and French translations for product and category
 * names and descriptions to demonstrate the multilingual functionality.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample translations for products
const productTranslations = {
  'full-spectrum-cbd-oil-1000mg': {
    nl: {
      name: 'Full Spectrum CBD Olie 1000mg',
      description: 'Onze premium full spectrum CBD-olie bevat het complete bereik aan cannabinoïden voor een maximaal effect. Deze sterkte van 1000mg is perfect voor ervaren gebruikers.'
    },
    de: {
      name: 'Full Spectrum CBD Öl 1000mg',
      description: 'Unser Premium Full Spectrum CBD-Öl enthält die vollständige Palette an Cannabinoiden für maximale Wirkung. Diese 1000mg-Stärke ist perfekt für erfahrene Anwender.'
    },
    fr: {
      name: 'Huile CBD Spectre Complet 1000mg',
      description: 'Notre huile CBD à spectre complet de qualité supérieure contient toute la gamme de cannabinoïdes pour un effet maximal. Cette concentration de 1000mg est parfaite pour les utilisateurs expérimentés.'
    }
  },
  'broad-spectrum-cbd-oil-500mg': {
    nl: {
      name: 'Breed Spectrum CBD Olie 500mg',
      description: 'Onze breed spectrum CBD-olie biedt alle voordelen van full spectrum zonder THC. Perfect voor degenen die het entourage-effect willen zonder THC.'
    },
    de: {
      name: 'Breitspektrum CBD Öl 500mg',
      description: 'Unser Breitspektrum-CBD-Öl bietet alle Vorteile des Vollspektrums ohne THC. Perfekt für diejenigen, die den Entourage-Effekt ohne THC wünschen.'
    },
    fr: {
      name: 'Huile CBD Large Spectre 500mg',
      description: 'Notre huile CBD à large spectre offre tous les avantages du spectre complet sans THC. Parfait pour ceux qui veulent l\'effet d\'entourage sans THC.'
    }
  },
  'cbd-relief-cream-250mg': {
    nl: {
      name: 'CBD Verzachtende Crème 250mg',
      description: 'Onze CBD-verzachtende crème biedt gerichte verlichting voor pijnlijke spieren en gewrichten. Breng direct aan op het getroffen gebied voor snelle verlichting.'
    },
    de: {
      name: 'CBD Erleichterungscreme 250mg',
      description: 'Unsere CBD-Erleichterungscreme bietet gezielte Linderung für schmerzende Muskeln und Gelenke. Direkt auf die betroffene Stelle auftragen für schnelle Linderung.'
    },
    fr: {
      name: 'Crème Soulagement CBD 250mg',
      description: 'Notre crème de soulagement CBD offre un soulagement ciblé pour les muscles et les articulations endoloris. Appliquez directement sur la zone affectée pour un soulagement rapide.'
    }
  },
  'cbd-gummies-300mg': {
    nl: {
      name: 'CBD Gummies 300mg',
      description: 'Onze heerlijke CBD-gummies zijn een smakelijke manier om je dagelijkse dosis CBD te krijgen. Elke gummy bevat 10 mg CBD.'
    },
    de: {
      name: 'CBD Gummis 300mg',
      description: 'Unsere köstlichen CBD-Gummis sind eine leckere Möglichkeit, Ihre tägliche Dosis CBD zu erhalten. Jeder Gummi enthält 10 mg CBD.'
    },
    fr: {
      name: 'Gummies CBD 300mg',
      description: 'Nos délicieuses gummies CBD sont un moyen savoureux d\'obtenir votre dose quotidienne de CBD. Chaque gummie contient 10 mg de CBD.'
    }
  },
  'cbd-massage-oil-500mg': {
    nl: {
      name: 'CBD Massage Olie 500mg',
      description: 'Onze CBD-massageolie is perfect voor een ontspannende massage. De CBD helpt ontstekingen te verminderen terwijl de essentiële oliën een kalmerende geur verspreiden.'
    },
    de: {
      name: 'CBD Massageöl 500mg',
      description: 'Unser CBD-Massageöl ist perfekt für eine entspannende Massage. Das CBD hilft, Entzündungen zu reduzieren, während die ätherischen Öle ein beruhigendes Aroma verbreiten.'
    },
    fr: {
      name: 'Huile de Massage CBD 500mg',
      description: 'Notre huile de massage CBD est parfaite pour un massage relaxant. Le CBD aide à réduire l\'inflammation tandis que les huiles essentielles procurent un arôme apaisant.'
    }
  },
  'pet-cbd-oil-250mg': {
    nl: {
      name: 'Huisdier CBD Olie 250mg',
      description: 'Onze huisdier CBD-olie is speciaal geformuleerd voor huisdieren. Het helpt bij angst, pijn en ontstekingen bij huisdieren.'
    },
    de: {
      name: 'Haustier CBD Öl 250mg',
      description: 'Unser Haustier-CBD-Öl ist speziell für Haustiere formuliert. Es hilft bei Angstzuständen, Schmerzen und Entzündungen bei Haustieren.'
    },
    fr: {
      name: 'Huile CBD Animaux 250mg',
      description: 'Notre huile CBD pour animaux est spécialement formulée pour les animaux de compagnie. Elle aide à soulager l\'anxiété, la douleur et l\'inflammation chez les animaux.'
    }
  }
};

// Sample translations for categories
const categoryTranslations = {
  'cbd-oils': {
    nl: {
      name: 'CBD Oliën',
      description: 'Premium CBD-oliën voor dagelijks gebruik'
    },
    de: {
      name: 'CBD Öle',
      description: 'Premium CBD-Öle für den täglichen Gebrauch'
    },
    fr: {
      name: 'Huiles CBD',
      description: 'Huiles CBD premium pour un usage quotidien'
    }
  },
  'topicals': {
    nl: {
      name: 'Topicals',
      description: 'Crèmes en balsems voor gerichte verlichting'
    },
    de: {
      name: 'Topika',
      description: 'Cremes und Balsame für gezielte Linderung'
    },
    fr: {
      name: 'Topiques',
      description: 'Crèmes et baumes pour un soulagement ciblé'
    }
  },
  'edibles': {
    nl: {
      name: 'Eetbare Producten',
      description: 'Heerlijke CBD-geïnfuseerde eetbare producten'
    },
    de: {
      name: 'Essbare Produkte',
      description: 'Köstliche CBD-infundierte Essbare Produkte'
    },
    fr: {
      name: 'Comestibles',
      description: 'Délicieux comestibles infusés au CBD'
    }
  }
};

/**
 * Update product translations
 */
async function updateProductTranslations() {
  console.log('Updating product translations...');
  
  // Get all products
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('id, slug');
  
  if (productsError) {
    console.error('Error fetching products:', productsError);
    return;
  }
  
  // Update each product with translations if available
  for (const product of products) {
    const translations = productTranslations[product.slug];
    
    if (translations) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ translations })
        .eq('id', product.id);
      
      if (updateError) {
        console.error(`Error updating translations for product ${product.slug}:`, updateError);
      } else {
        console.log(`Updated translations for product: ${product.slug}`);
      }
    }
  }
}

/**
 * Update category translations
 */
async function updateCategoryTranslations() {
  console.log('Updating category translations...');
  
  // Get all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, slug');
  
  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError);
    return;
  }
  
  // Update each category with translations if available
  for (const category of categories) {
    const translations = categoryTranslations[category.slug];
    
    if (translations) {
      const { error: updateError } = await supabase
        .from('categories')
        .update({ translations })
        .eq('id', category.id);
      
      if (updateError) {
        console.error(`Error updating translations for category ${category.slug}:`, updateError);
      } else {
        console.log(`Updated translations for category: ${category.slug}`);
      }
    }
  }
}

/**
 * Main function to run the script
 */
async function main() {
  try {
    await updateProductTranslations();
    await updateCategoryTranslations();
    console.log('Translation updates completed successfully!');
  } catch (error) {
    console.error('Error updating translations:', error);
  }
}

// Run the script
main();
