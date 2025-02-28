/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://sensebycbd.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  changefreq: 'daily',
  priority: 0.7,
  exclude: ['/account', '/cart', '/checkout'],
  alternateRefs: [
    {
      href: 'https://sensebycbd.com/en',
      hreflang: 'en',
    },
    {
      href: 'https://sensebycbd.com/nl',
      hreflang: 'nl',
    },
    {
      href: 'https://sensebycbd.com/de',
      hreflang: 'de',
    },
    {
      href: 'https://sensebycbd.com/fr',
      hreflang: 'fr',
    },
  ],
  transform: async (config, path) => {
    // Custom transformation for URLs
    // Add alternateRefs for each page based on the path
    
    // Skip excluded paths
    if (config.exclude.includes(path)) {
      return null;
    }
    
    // Extract locale from path if present
    const localeMatch = path.match(/^\/(en|nl|de|fr)(\/|$)/);
    const locale = localeMatch ? localeMatch[1] : 'en';
    const pathWithoutLocale = localeMatch ? path.replace(/^\/(en|nl|de|fr)/, '') : path;
    
    // Create alternateRefs for this specific page
    const alternateRefs = ['en', 'nl', 'de', 'fr'].map(lang => ({
      href: `${config.siteUrl}/${lang}${pathWithoutLocale}`,
      hreflang: lang,
    }));
    
    // Set higher priority for important pages
    let priority = config.priority;
    if (path === '/' || path === '/en' || path === '/nl' || path === '/de' || path === '/fr') {
      priority = 1.0;
    } else if (path.includes('/products/') && !path.includes('/category/')) {
      // Product detail pages
      priority = 0.9;
    } else if (path.includes('/products/category/')) {
      // Category pages
      priority = 0.8;
    } else if (path === '/products' || path.startsWith('/products/')) {
      // Product listing pages
      priority = 0.8;
    }
    
    return {
      loc: path,
      changefreq: config.changefreq,
      priority,
      alternateRefs,
      lastmod: new Date().toISOString(),
    };
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/account', '/cart', '/checkout'],
      },
    ],
    additionalSitemaps: [
      'https://sensebycbd.com/sitemap.xml',
      'https://sensebycbd.com/server-sitemap.xml', // For dynamically generated pages
    ],
  },
};
