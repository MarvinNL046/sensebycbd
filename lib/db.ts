import { supabase } from './supabase';
import { CartItem } from '../types/cart';
import { ProductFilter } from '../types/product';

/**
 * Product related database functions
 */
export async function getProducts(filters?: ProductFilter) {
  let query = supabase
    .from('products')
    .select('*, categories(*)');
  
  if (filters) {
    // Category filter
    if (filters.category) {
      query = query.eq('categories.slug', filters.category);
    }
    
    // Price range filter
    if (filters.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    
    if (filters.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }
    
    // CBD percentage filter (using LIKE on the specifications JSON)
    if (filters.cbdPercentage && filters.cbdPercentage.length > 0) {
      const percentageConditions = filters.cbdPercentage.map(percentage => {
        return `specifications->>'strength' ilike '%${percentage}%'`;
      });
      
      query = query.or(percentageConditions.join(','));
    }
    
    // Search filter
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    
    // Sorting
    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          query = query.order('price', { ascending: true });
          break;
        case 'price_desc':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }
    } else {
      // Default sorting
      query = query.order('created_at', { ascending: false });
    }
  }
  
  return query;
}

export async function getProductBySlug(slug: string) {
  return supabase
    .from('products')
    .select('*, categories(*)')
    .eq('slug', slug)
    .single();
}

export async function getFeaturedProducts() {
  return supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_featured', true)
    .limit(6);
}

export async function getRelatedProducts(productId: string, categoryId: string, limit: number = 4) {
  return supabase
    .from('products')
    .select('*, categories(*)')
    .eq('category_id', categoryId)
    .neq('id', productId)
    .limit(limit);
}

export async function extractCbdPercentages() {
  const { data, error } = await supabase
    .from('products')
    .select('specifications');
  
  if (error || !data) {
    return { data: [], error };
  }
  
  // Extract unique CBD percentages from specifications
  const percentages = new Set<string>();
  
  data.forEach(product => {
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
  return supabase
    .from('categories')
    .select('*');
}

export async function getCategoryBySlug(slug: string) {
  return supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();
}

/**
 * User related database functions
 */
export async function getUserProfile(userId: string) {
  return supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
}

export async function updateUserProfile(userId: string, data: any) {
  return supabase
    .from('users')
    .update(data)
    .eq('id', userId);
}

/**
 * Loyalty points related functions
 */
export async function getLoyaltyPoints(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('loyalty_points')
    .eq('id', userId)
    .single();
  
  if (error) {
    return { data: 0, error };
  }
  
  return { data: data?.loyalty_points || 0, error: null };
}

export async function addLoyaltyPoints(userId: string, points: number) {
  // Get current points
  const { data: currentPoints, error: getError } = await getLoyaltyPoints(userId);
  
  if (getError) {
    return { data: null, error: getError };
  }
  
  // Calculate new points
  const newPoints = currentPoints + points;
  
  // Update points
  return supabase
    .from('users')
    .update({ loyalty_points: newPoints })
    .eq('id', userId);
}

export async function useLoyaltyPoints(userId: string, points: number) {
  // Get current points
  const { data: currentPoints, error: getError } = await getLoyaltyPoints(userId);
  
  if (getError) {
    return { data: null, error: getError };
  }
  
  // Check if user has enough points
  if (currentPoints < points) {
    return { 
      data: null, 
      error: { message: 'Not enough loyalty points' } 
    };
  }
  
  // Calculate new points
  const newPoints = currentPoints - points;
  
  // Update points
  return supabase
    .from('users')
    .update({ loyalty_points: newPoints })
    .eq('id', userId);
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
  // Calculate loyalty points to award (1 point per €20 spent)
  const loyaltyPointsToAward = userId ? Math.floor(totalAmount / 20) : 0;
  
  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: userId,
      status: 'pending',
      total_amount: totalAmount,
      shipping_info: shippingInfo,
      payment_info: paymentInfo,
      loyalty_points_earned: loyaltyPointsToAward,
    })
    .select()
    .single();
  
  if (orderError) {
    return { data: null, error: orderError };
  }
  
  // Create order items
  const orderItems = items.map(item => ({
    order_id: order.id,
    product_id: item.product.id,
    quantity: item.quantity,
    price: item.product.sale_price || item.product.price,
  }));
  
  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
  
  if (itemsError) {
    return { data: null, error: itemsError };
  }
  
  // Award loyalty points if user is logged in
  if (userId) {
    await addLoyaltyPoints(userId, loyaltyPointsToAward);
  }
  
  return { data: order, error: null };
}

export async function getUserOrders(userId: string) {
  return supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
}

export async function getOrderById(orderId: string) {
  return supabase
    .from('orders')
    .select(`
      *,
      order_items (
        *,
        product:products (*)
      )
    `)
    .eq('id', orderId)
    .single();
}

/**
 * Review related database functions
 */
export async function getProductReviews(productId: string) {
  return supabase
    .from('reviews')
    .select('*, users(full_name)')
    .eq('product_id', productId);
}

export async function createReview(review: {
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
}) {
  return supabase
    .from('reviews')
    .insert([review]);
}
