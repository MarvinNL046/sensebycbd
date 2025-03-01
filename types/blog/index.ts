/**
 * Blog related types
 */

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface BlogAuthor {
  id: string;
  full_name: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image?: string;
  author_id: string;
  category_id: string;
  published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  
  // Joined fields
  author?: BlogAuthor;
  category?: BlogCategory;
  tags?: { tag: BlogTag }[];
}

export interface BlogComment {
  id: string;
  post_id: string;
  user_id?: string;
  name?: string;
  email?: string;
  content: string;
  approved: boolean;
  created_at: string;
  
  // Joined fields
  user?: {
    id: string;
    full_name: string;
  };
}

export interface BlogFilter {
  category?: string;
  tag?: string;
  search?: string;
  author?: string;
  limit?: number;
  offset?: number;
}
