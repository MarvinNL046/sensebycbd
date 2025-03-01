import { CartItem } from '../types/cart';
import { ProductFilter } from '../types/product';
import { BlogFilter, BlogPost, BlogCategory, BlogTag, BlogComment } from '../types/blog';
import { 
  mockBlogPosts,
  mockBlogCategories,
  mockBlogTags,
  mockBlogComments
} from './mockData';

/**
 * Blog related database functions
 */
export async function getBlogPosts(filters?: BlogFilter) {
  let posts = [...mockBlogPosts];
  
  if (filters) {
    // Category filter
    if (filters.category) {
      posts = posts.filter(post => 
        post.category?.slug === filters.category
      );
    }
    
    // Tag filter
    if (filters.tag) {
      posts = posts.filter(post => 
        post.tags?.some(tagObj => tagObj.tag.slug === filters.tag)
      );
    }
    
    // Author filter
    if (filters.author) {
      posts = posts.filter(post => post.author_id === filters.author);
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(searchLower) || 
        post.content.toLowerCase().includes(searchLower)
      );
    }
    
    // Pagination
    if (filters.limit !== undefined) {
      const offset = filters.offset || 0;
      posts = posts.slice(offset, offset + filters.limit);
    }
  }
  
  // Only return published posts
  posts = posts.filter(post => post.published);
  
  // Sort by published_at date (newest first)
  posts.sort((a, b) => 
    new Date(b.published_at || b.created_at).getTime() - 
    new Date(a.published_at || a.created_at).getTime()
  );
  
  return { data: posts, error: null };
}

export async function getBlogPostBySlug(slug: string) {
  const post = mockBlogPosts.find(post => post.slug === slug);
  return { 
    data: post || null, 
    error: post ? null : new Error('Blog post not found') 
  };
}

export async function getBlogCategories() {
  return { data: mockBlogCategories, error: null };
}

export async function getBlogCategoryBySlug(slug: string) {
  const category = mockBlogCategories.find(category => category.slug === slug);
  return { 
    data: category || null, 
    error: category ? null : new Error('Blog category not found') 
  };
}

export async function getBlogTags() {
  return { data: mockBlogTags, error: null };
}

export async function getBlogComments(postId: string) {
  const comments = mockBlogComments.filter(
    comment => comment.post_id === postId && comment.approved
  );
  
  return { data: comments, error: null };
}

export async function createBlogComment(comment: {
  post_id: string;
  user_id?: string;
  name?: string;
  email?: string;
  content: string;
}) {
  // Mock create comment
  const newComment: BlogComment = {
    id: `comment-${Date.now()}`,
    post_id: comment.post_id,
    user_id: comment.user_id,
    name: comment.name,
    email: comment.email,
    content: comment.content,
    approved: false, // New comments require approval
    created_at: new Date().toISOString()
  };
  
  return { data: newComment, error: null };
}

export async function getRecentBlogPosts(limit: number = 5) {
  const posts = mockBlogPosts
    .filter(post => post.published)
    .sort((a, b) => 
      new Date(b.published_at || b.created_at).getTime() - 
      new Date(a.published_at || a.created_at).getTime()
    )
    .slice(0, limit)
    .map(post => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      featured_image: post.featured_image,
      published_at: post.published_at,
      category: post.category
    }));
  
  return { data: posts, error: null };
}

/**
 * Product related database functions
 */
export async function getProducts(filters?: ProductFilter) {
  // Return empty products for now
  return { data: [], error: null };
}

export async function getProductBySlug(slug: string) {
  return { data: null, error: new Error('Product not found') };
}

export async function getFeaturedProducts() {
  return { data: [], error: null };
}

export async function getRelatedProducts(productId: string, categoryId: string, limit: number = 4) {
  return { data: [], error: null };
}

export async function extractCbdPercentages() {
  return { data: [], error: null };
}

/**
 * Category related database functions
 */
export async function getCategories() {
  return { data: [], error: null };
}

export async function getCategoryBySlug(slug: string) {
  return { data: null, error: new Error('Category not found') };
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
  return { data: null, error: null };
}

/**
 * Loyalty points related functions
 */
export async function getLoyaltyPoints(userId: string) {
  return { data: 100, error: null };
}

export async function addLoyaltyPoints(userId: string, points: number) {
  return { data: null, error: null };
}

export async function useLoyaltyPoints(userId: string, points: number) {
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
  return { data: [], error: null };
}

export async function getOrderById(orderId: string) {
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
  return { data: null, error: null };
}
