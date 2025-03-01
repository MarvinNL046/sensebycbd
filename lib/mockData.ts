import { Product, Category } from '../types/product';

/**
 * Mock categories data
 */
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'CBD Oils',
    slug: 'cbd-oils',
    description: 'Premium CBD oils for daily use',
    image_url: '/images/products/category-oils.jpg',
  },
  {
    id: '2',
    name: 'Topicals',
    slug: 'topicals',
    description: 'Creams and balms for targeted relief',
    image_url: '/images/products/category-topicals.jpg',
  },
  {
    id: '3',
    name: 'Edibles',
    slug: 'edibles',
    description: 'Delicious CBD-infused edibles',
    image_url: '/images/products/category-edibles.jpg',
  },
  {
    id: '4',
    name: 'Capsules',
    slug: 'capsules',
    description: 'Easy-to-take CBD capsules',
    image_url: '/images/products/category-capsules.jpg',
  },
  {
    id: '5',
    name: 'Pet CBD',
    slug: 'pet-cbd',
    description: 'CBD products for your furry friends',
    image_url: '/images/products/category-pet.jpg',
  },
];

/**
 * Mock products data
 */
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Full Spectrum CBD Oil 1000mg',
    slug: 'full-spectrum-cbd-oil-1000mg',
    description: 'Our premium full spectrum CBD oil contains the complete range of cannabinoids for maximum effect. This 1000mg strength is perfect for experienced users.',
    price: 89.99,
    sale_price: null,
    stock: 50,
    image_url: '/images/products/product-oil-1.jpg',
    category_id: '1',
    is_featured: true,
    specifications: {
      strength: '1000mg',
      volume: '30ml',
      ingredients: 'Hemp extract, MCT oil',
      usage: 'Place 1ml under tongue and hold for 60 seconds before swallowing',
    },
    created_at: '2025-01-01T00:00:00Z',
    categories: mockCategories[0],
  },
  {
    id: '2',
    name: 'Broad Spectrum CBD Oil 500mg',
    slug: 'broad-spectrum-cbd-oil-500mg',
    description: 'Our broad spectrum CBD oil offers all the benefits of full spectrum without THC. Perfect for those who want the entourage effect without THC.',
    price: 59.99,
    sale_price: 49.99,
    stock: 75,
    image_url: '/images/products/product-oil-2.jpg',
    category_id: '1',
    is_featured: true,
    specifications: {
      strength: '500mg',
      volume: '30ml',
      ingredients: 'Hemp extract, MCT oil',
      usage: 'Place 0.5ml under tongue and hold for 60 seconds before swallowing',
    },
    created_at: '2025-01-01T00:00:00Z',
    categories: mockCategories[0],
  },
  {
    id: '3',
    name: 'CBD Relief Cream 250mg',
    slug: 'cbd-relief-cream-250mg',
    description: 'Our CBD relief cream provides targeted relief for sore muscles and joints. Apply directly to the affected area for quick relief.',
    price: 39.99,
    sale_price: null,
    stock: 100,
    image_url: '/images/products/product-topical-1.jpg',
    category_id: '2',
    is_featured: true,
    specifications: {
      strength: '250mg',
      volume: '60ml',
      ingredients: 'Hemp extract, Shea butter, Aloe vera, Essential oils',
      usage: 'Apply a small amount to affected area and massage gently',
    },
    created_at: '2025-01-01T00:00:00Z',
    categories: mockCategories[1],
  },
  {
    id: '4',
    name: 'CBD Massage Oil 500mg',
    slug: 'cbd-massage-oil-500mg',
    description: 'Our CBD massage oil is perfect for a relaxing massage. The CBD helps to reduce inflammation while the essential oils provide a calming aroma.',
    price: 49.99,
    sale_price: null,
    stock: 60,
    image_url: '/images/products/product-topical-2.jpg',
    category_id: '2',
    is_featured: false,
    specifications: {
      strength: '500mg',
      volume: '100ml',
      ingredients: 'Hemp extract, Jojoba oil, Lavender essential oil',
      usage: 'Apply liberally to skin and massage',
    },
    created_at: '2025-01-01T00:00:00Z',
    categories: mockCategories[1],
  },
  {
    id: '5',
    name: 'CBD Gummies 300mg',
    slug: 'cbd-gummies-300mg',
    description: 'Our delicious CBD gummies are a tasty way to get your daily dose of CBD. Each gummy contains 10mg of CBD.',
    price: 29.99,
    sale_price: null,
    stock: 120,
    image_url: '/images/products/product-edible-1.jpg',
    category_id: '3',
    is_featured: true,
    specifications: {
      strength: '300mg',
      count: '30 gummies',
      ingredients: 'Hemp extract, Sugar, Corn syrup, Gelatin',
      usage: 'Take 1-2 gummies daily',
    },
    created_at: '2025-01-01T00:00:00Z',
    categories: mockCategories[2],
  },
  {
    id: '6',
    name: 'CBD Capsules 750mg',
    slug: 'cbd-capsules-750mg',
    description: 'Our CBD capsules are an easy and convenient way to take CBD. Each capsule contains 25mg of CBD.',
    price: 54.99,
    sale_price: null,
    stock: 90,
    image_url: '/images/products/product-capsule-1.jpg',
    category_id: '4',
    is_featured: false,
    specifications: {
      strength: '750mg',
      count: '30 capsules',
      ingredients: 'Hemp extract, MCT oil, Vegetable cellulose',
      usage: 'Take 1 capsule daily with water',
    },
    created_at: '2025-01-01T00:00:00Z',
    categories: mockCategories[3],
  },
  {
    id: '7',
    name: 'Pet CBD Oil 250mg',
    slug: 'pet-cbd-oil-250mg',
    description: 'Our pet CBD oil is specially formulated for pets. It helps with anxiety, pain, and inflammation in pets.',
    price: 44.99,
    sale_price: 39.99,
    stock: 80,
    image_url: '/images/products/product-pet-1.jpg',
    category_id: '5',
    is_featured: true,
    specifications: {
      strength: '250mg',
      volume: '30ml',
      ingredients: 'Hemp extract, MCT oil',
      usage: 'Add to pet food or directly into mouth. See dosing chart for weight-based dosing.',
    },
    created_at: '2025-01-01T00:00:00Z',
    categories: mockCategories[4],
  },
];

/**
 * Get all categories
 */
export const getCategories = async () => {
  return { data: mockCategories, error: null };
};

/**
 * Get all products
 */
export const getProducts = async () => {
  return { data: mockProducts, error: null };
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async () => {
  const featuredProducts = mockProducts.filter(product => product.is_featured);
  return { data: featuredProducts, error: null };
};

/**
 * Get a product by slug
 */
export const getProductBySlug = async (slug: string) => {
  const product = mockProducts.find(product => product.slug === slug);
  return { data: product || null, error: product ? null : new Error('Product not found') };
};

/**
 * Get products by category
 */
export const getProductsByCategory = async (categorySlug: string) => {
  const category = mockCategories.find(category => category.slug === categorySlug);
  if (!category) {
    return { data: [], error: new Error('Category not found') };
  }
  
  const products = mockProducts.filter(product => product.category_id === category.id);
  return { data: products, error: null };
};

/**
 * Search products
 */
export const searchProducts = async (query: string) => {
  const normalizedQuery = query.toLowerCase();
  const products = mockProducts.filter(product => 
    product.name.toLowerCase().includes(normalizedQuery) || 
    product.description.toLowerCase().includes(normalizedQuery)
  );
  return { data: products, error: null };
};
