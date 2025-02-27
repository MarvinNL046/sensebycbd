import { supabase } from './supabase';

/**
 * Product related database functions
 */
export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)');
  
  return { data, error };
}

export async function getProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('slug', slug)
    .single();
  
  return { data, error };
}

export async function getFeaturedProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_featured', true)
    .limit(6);
  
  return { data, error };
}

/**
 * Category related database functions
 */
export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*');
  
  return { data, error };
}

export async function getCategoryBySlug(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();
  
  return { data, error };
}

/**
 * Order related database functions
 */
export async function getUserOrders(userId: string) {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(*))')
    .eq('user_id', userId);
  
  return { data, error };
}

export async function createOrder(order: {
  user_id: string;
  total: number;
  shipping_address: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
}) {
  // First create the order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        user_id: order.user_id,
        total: order.total,
        shipping_address: order.shipping_address,
        status: 'pending',
      },
    ])
    .select()
    .single();
  
  if (orderError || !orderData) {
    return { data: null, error: orderError };
  }
  
  // Then create the order items
  const orderItems = order.items.map(item => ({
    order_id: orderData.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));
  
  const { data: itemsData, error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);
  
  if (itemsError) {
    return { data: null, error: itemsError };
  }
  
  return { data: orderData, error: null };
}

/**
 * Review related database functions
 */
export async function getProductReviews(productId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, users(full_name)')
    .eq('product_id', productId);
  
  return { data, error };
}

export async function createReview(review: {
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
}) {
  const { data, error } = await supabase
    .from('reviews')
    .insert([review]);
  
  return { data, error };
}

/**
 * Feedback related database functions
 */
export async function submitFeedback(feedback: {
  user_id?: string;
  message: string;
  type: 'suggestion' | 'bug' | 'question' | 'other';
}) {
  const { data, error } = await supabase
    .from('feedback')
    .insert([
      {
        ...feedback,
        status: 'new',
      },
    ]);
  
  return { data, error };
}

/**
 * User related database functions
 */
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  return { data, error };
}

export async function updateUserProfile(userId: string, profile: {
  full_name?: string;
  address?: string;
  phone?: string;
}) {
  const { data, error } = await supabase
    .from('users')
    .update(profile)
    .eq('id', userId);
  
  return { data, error };
}

export async function updateLoyaltyPoints(userId: string, points: number) {
  const { data, error } = await supabase
    .from('users')
    .update({
      loyalty_points: points,
    })
    .eq('id', userId);
  
  return { data, error };
}
