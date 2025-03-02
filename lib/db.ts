
import { supabase } from './supabase';
import { CartItem } from '../types/cart';
import { ProductFilter, Product, Category } from '../types/product';
import { BlogFilter } from '../types/blog';

/**
 * Helper function to localize a product based on the current locale
 * @param product The product to localize
 * @param locale The current locale
 * @returns The localized product
 */
function localizeProduct(product: Product, locale: string = 'en'): Product {
  if (locale === 'en' || !product.translations || !product.translations[locale]) {
    return product;
  }
  
  const localizedProduct = { ...product };
  const translations = product.translations[locale];
  
  if (translations.name) {
    localizedProduct.name = translations.name;
  }
  
  if (translations.description) {
    localizedProduct.description = translations.description;
  }
  
  // Localize the category if available
  if (product.categories) {
    localizedProduct.categories = localizeCategory(product.categories, locale);
  }
  
  return localizedProduct;
}

/**
 * Helper function to localize a category based on the current locale
 * @param category The category to localize
 * @param locale The current locale
 * @returns The localized category
 */
function localizeCategory(category: Category, locale: string = 'en'): Category {
  if (locale === 'en' || !category.translations || !category.translations[locale]) {
    return category;
  }
  
  const localizedCategory = { ...category };
  const translations = category.translations[locale];
  
  if (translations.name) {
    localizedCategory.name = translations.name;
  }
  
  if (translations.description) {
    localizedCategory.description = translations.description;
  }
  
  return localizedCategory;
}

/**
 * Product related database functions
 */
export async function getProducts(filters?: ProductFilter, locale: string = 'en') {
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
  
  const result = await query;
  
  // Localize products if we have data and a non-English locale
  if (result.data && locale !== 'en') {
    result.data = result.data.map(product => localizeProduct(product, locale));
  }
  
  return result;
}

export async function getProductBySlug(slug: string, locale: string = 'en') {
  // Use the wildcard selector to get all fields
  const result = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('slug', slug)
    .single();
  
  // Localize product if we have data and a non-English locale
  if (result.data && locale !== 'en') {
    result.data = localizeProduct(result.data, locale);
  }
  
  // Ensure additional_images is always an array
  if (result.data && !result.data.additional_images) {
    result.data.additional_images = [];
  }
  
  // Log the product data to help debug
  console.log('Product data:', JSON.stringify(result.data, null, 2));
  
  return result;
}

export async function getFeaturedProducts(locale: string = 'en') {
  const result = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_featured', true)
    .limit(6);
  
  // Localize products if we have data and a non-English locale
  if (result.data && locale !== 'en') {
    result.data = result.data.map(product => localizeProduct(product, locale));
  }
  
  return result;
}

export async function getRelatedProducts(productId: string, categoryId: string, limit: number = 4, locale: string = 'en') {
  const result = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('category_id', categoryId)
    .neq('id', productId)
    .limit(limit);
  
  // Localize products if we have data and a non-English locale
  if (result.data && locale !== 'en') {
    result.data = result.data.map(product => localizeProduct(product, locale));
  }
  
  return result;
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
export async function getCategories(locale: string = 'en') {
  const result = await supabase
    .from('categories')
    .select('*');
  
  // Localize categories if we have data and a non-English locale
  if (result.data && locale !== 'en') {
    result.data = result.data.map(category => localizeCategory(category, locale));
  }
  
  return result;
}

export async function getCategoryBySlug(slug: string, locale: string = 'en') {
  const result = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single();
  
  // Localize category if we have data and a non-English locale
  if (result.data && locale !== 'en') {
    result.data = localizeCategory(result.data, locale);
  }
  
  return result;
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
      shipping_address: JSON.stringify(shippingInfo),
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

/**
 * Blog related database functions
 */
export async function getBlogPosts(filters?: BlogFilter) {
  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      author:users(id, full_name),
      category:blog_categories(id, name, slug),
      tags:blog_posts_tags(tag:blog_tags(id, name, slug))
    `)
    .eq('published', true)
    .order('published_at', { ascending: false });
    
  if (filters) {
    // Category filter
    if (filters.category) {
      query = query.eq('category.slug', filters.category);
    }
    
    // Tag filter
    if (filters.tag) {
      query = query.contains('tags.tag.slug', [filters.tag]);
    }
    
    // Author filter
    if (filters.author) {
      query = query.eq('author_id', filters.author);
    }
    
    // Search filter
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }
    
    // Pagination
    if (filters.limit !== undefined && filters.offset !== undefined) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    } else if (filters.limit !== undefined) {
      query = query.limit(filters.limit);
    }
  }
  
  return query;
}

export async function getBlogPostBySlug(slug: string) {
  return supabase
    .from('blog_posts')
    .select(`
      *,
      author:users(id, full_name),
      category:blog_categories(id, name, slug),
      tags:blog_posts_tags(tag:blog_tags(id, name, slug))
    `)
    .eq('slug', slug)
    .single();
}

export async function getBlogCategories() {
  return supabase
    .from('blog_categories')
    .select('*')
    .order('name');
}

export async function getBlogCategoryBySlug(slug: string) {
  return supabase
    .from('blog_categories')
    .select('*')
    .eq('slug', slug)
    .single();
}

export async function getBlogTags() {
  return supabase
    .from('blog_tags')
    .select('*')
    .order('name');
}

export async function getBlogComments(postId: string) {
  return supabase
    .from('blog_comments')
    .select('*, user:users(id, full_name)')
    .eq('post_id', postId)
    .eq('approved', true)
    .order('created_at', { ascending: true });
}

export async function createBlogComment(comment: {
  post_id: string;
  user_id?: string;
  name?: string;
  email?: string;
  content: string;
}) {
  return supabase
    .from('blog_comments')
    .insert([comment]);
}

export async function getRecentBlogPosts(limit: number = 5) {
  return supabase
    .from('blog_posts')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      category:blog_categories(id, name, slug)
    `)
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(limit);
}
