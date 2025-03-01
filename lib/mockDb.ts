import { CartItem } from '../types/cart';
import { ProductFilter } from '../types/product';
import { 
  mockProducts, 
  mockCategories, 
  getProducts as getMockProducts,
  getProductBySlug as getMockProductBySlug,
  getFeaturedProducts as getMockFeaturedProducts,
  getProductsByCategory as getMockProductsByCategory,
  searchProducts as searchMockProducts
} from './mockData';

/**
 * Product related database functions
 */
export async function getProducts(filters?: ProductFilter) {
  let { data: products, error } = await getMockProducts();
  
  if (error || !products) {
    return { data: [], error };
  }
  
  if (filters) {
    // Category filter
    if (filters.category) {
      const { data: categoryProducts, error: categoryError } = await getMockProductsByCategory(filters.category);
      if (!categoryError) {
        products = categoryProducts;
      }
    }
    
    // Price range filter
    if (filters.minPrice !== undefined) {
      products = products.filter(product => 
        (product.sale_price || product.price) >= filters.minPrice!
      );
    }
    
    if (filters.maxPrice !== undefined) {
      products = products.filter(product => 
        (product.sale_price || product.price) <= filters.maxPrice!
      );
    }
    
    // CBD percentage filter
    if (filters.cbdPercentage && filters.cbdPercentage.length > 0) {
      products = products.filter(product => {
        const strength = product.specifications?.strength;
        if (!strength) return false;
        
        return filters.cbdPercentage!.some(percentage => 
          strength.includes(percentage)
        );
      });
    }
    
    // Search filter
    if (filters.search) {
      const { data: searchResults, error: searchError } = await searchMockProducts(filters.search);
      if (!searchError) {
        products = searchResults;
      }
    }
    
    // Sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          products.sort((a, b) => 
            (a.sale_price || a.price) - (b.sale_price || b.price)
          );
          break;
        case 'price_desc':
          products.sort((a, b) => 
            (b.sale_price || b.price) - (a.sale_price || a.price)
          );
          break;
        case 'newest':
          products.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          break;
      }
    } else {
      // Default sorting
      products.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  }
  
  return { data: products, error: null };
}

export async function getProductBySlug(slug: string) {
  return getMockProductBySlug(slug);
}

export async function getFeaturedProducts() {
  return getMockFeaturedProducts();
}

export async function getRelatedProducts(productId: string, categoryId: string, limit: number = 4) {
  const { data: products, error } = await getMockProducts();
  
  if (error || !products) {
    return { data: [], error };
  }
  
  const relatedProducts = products
    .filter(product => 
      product.category_id === categoryId && product.id !== productId
    )
    .slice(0, limit);
  
  return { data: relatedProducts, error: null };
}

export async function extractCbdPercentages() {
  const { data: products, error } = await getMockProducts();
  
  if (error || !products) {
    return { data: [], error };
  }
  
  // Extract unique CBD percentages from specifications
  const percentages = new Set<string>();
  
  products.forEach(product => {
    if (product.specifications && product.specifications.strength) {
      const strength = product.specifications.strength;
      // Extract percentage values (e.g., "500mg" -> we don't add it, "5%" -> we add "5%")
      if (strength.includes('%')) {
        percentages.add(strength);
      }
    }
  });
  
  return { 
    data: Array.from(percentages).sort(), 
    error: null 
  };
}

/**
 * Category related database functions
 */
export async function getCategories() {
  return { data: mockCategories, error: null };
}

export async function getCategoryBySlug(slug: string) {
  const category = mockCategories.find(category => category.slug === slug);
  return { 
    data: category || null, 
    error: category ? null : new Error('Category not found') 
  };
}

/**
 * User related database functions
 */
export async function getUserProfile(userId: string) {
  // Mock user profile
  return { 
    data: {
      id: userId,
      email: 'user@example.com',
      full_name: 'Test User',
      loyalty_points: 100,
      is_admin: false,
      created_at: new Date().toISOString()
    }, 
    error: null 
  };
}

export async function updateUserProfile(userId: string, data: any) {
  // Mock update user profile
  return { data: null, error: null };
}

/**
 * Loyalty points related functions
 */
export async function getLoyaltyPoints(userId: string) {
  // Mock loyalty points
  return { data: 100, error: null };
}

export async function addLoyaltyPoints(userId: string, points: number) {
  // Mock add loyalty points
  return { data: null, error: null };
}

export async function useLoyaltyPoints(userId: string, points: number) {
  // Mock use loyalty points
  return { data: null, error: null };
}

/**
 * Order related database functions
 */
export async function createOrder(
  userId: string | null, 
  items: CartItem[], 
  shippingInfo: any, 
  paymentInfo: any,
  totalAmount: number
) {
  // Mock create order
  const orderId = `order-${Date.now()}`;
  
  return { 
    data: {
      id: orderId,
      user_id: userId,
      status: 'pending',
      total_amount: totalAmount,
      shipping_info: shippingInfo,
      payment_info: paymentInfo,
      loyalty_points_earned: Math.floor(totalAmount / 20),
      created_at: new Date().toISOString()
    }, 
    error: null 
  };
}

export async function getUserOrders(userId: string) {
  // Mock user orders
  return { data: [], error: null };
}

export async function getOrderById(orderId: string) {
  // Mock order by ID
  return { 
    data: {
      id: orderId,
      user_id: 'user-id',
      status: 'pending',
      total_amount: 100,
      shipping_info: {},
      payment_info: {},
      loyalty_points_earned: 5,
      created_at: new Date().toISOString(),
      order_items: []
    }, 
    error: null 
  };
}

/**
 * Review related database functions
 */
export async function getProductReviews(productId: string) {
  // Mock product reviews
  return { 
    data: [
      {
        id: 'review-1',
        product_id: productId,
        user_id: 'user-id',
        rating: 5,
        comment: 'Great product!',
        created_at: new Date().toISOString(),
        users: {
          full_name: 'Test User'
        }
      }
    ], 
    error: null 
  };
}

export async function createReview(review: {
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
}) {
  // Mock create review
  return { data: null, error: null };
}
