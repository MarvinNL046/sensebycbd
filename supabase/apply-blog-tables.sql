-- This script applies the blog tables migration directly
-- Copy and paste this into the Supabase SQL editor

-- Blog categories table
CREATE TABLE IF NOT EXISTS public.blog_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_categories table
CREATE POLICY "Blog categories are viewable by everyone" 
  ON public.blog_categories 
  FOR SELECT 
  USING (true);

CREATE POLICY "Blog categories are editable by admins only" 
  ON public.blog_categories 
  FOR ALL 
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));

-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  author_id UUID REFERENCES public.users(id),
  category_id UUID REFERENCES public.blog_categories(id),
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts table
CREATE POLICY "Published blog posts are viewable by everyone" 
  ON public.blog_posts 
  FOR SELECT 
  USING (published = true);

CREATE POLICY "Unpublished blog posts are viewable by their authors and admins" 
  ON public.blog_posts 
  FOR SELECT 
  USING (
    auth.uid() = author_id OR 
    auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
  );

CREATE POLICY "Blog posts are editable by their authors and admins" 
  ON public.blog_posts 
  FOR ALL 
  USING (
    auth.uid() = author_id OR 
    auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
  );

-- Blog tags table
CREATE TABLE IF NOT EXISTS public.blog_tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.blog_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_tags table
CREATE POLICY "Blog tags are viewable by everyone" 
  ON public.blog_tags 
  FOR SELECT 
  USING (true);

CREATE POLICY "Blog tags are editable by admins only" 
  ON public.blog_tags 
  FOR ALL 
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true));

-- Blog posts <-> tags junction table
CREATE TABLE IF NOT EXISTS public.blog_posts_tags (
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Enable Row Level Security
ALTER TABLE public.blog_posts_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_posts_tags table
CREATE POLICY "Blog post tags are viewable by everyone" 
  ON public.blog_posts_tags 
  FOR SELECT 
  USING (
    post_id IN (SELECT id FROM public.blog_posts WHERE published = true) OR
    post_id IN (
      SELECT id FROM public.blog_posts 
      WHERE auth.uid() = author_id OR 
            auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
    )
  );

CREATE POLICY "Blog post tags are editable by post authors and admins" 
  ON public.blog_posts_tags 
  FOR ALL 
  USING (
    post_id IN (
      SELECT id FROM public.blog_posts 
      WHERE auth.uid() = author_id OR 
            auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
    )
  );

-- Blog comments table
CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id),
  name TEXT, -- For non-logged in users
  email TEXT, -- For non-logged in users
  content TEXT NOT NULL,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for blog_comments table
CREATE POLICY "Approved blog comments are viewable by everyone" 
  ON public.blog_comments 
  FOR SELECT 
  USING (approved = true);

CREATE POLICY "Unapproved blog comments are viewable by admins only" 
  ON public.blog_comments 
  FOR SELECT 
  USING (
    auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
  );

CREATE POLICY "Blog comments are editable by their authors and admins" 
  ON public.blog_comments 
  FOR UPDATE 
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id) OR 
    auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
  );

CREATE POLICY "Blog comments are deletable by their authors, post authors, and admins" 
  ON public.blog_comments 
  FOR DELETE 
  USING (
    (user_id IS NOT NULL AND auth.uid() = user_id) OR 
    auth.uid() IN (
      SELECT author_id FROM public.blog_posts WHERE id = post_id
    ) OR 
    auth.uid() IN (SELECT id FROM public.users WHERE is_admin = true)
  );

CREATE POLICY "Users can create blog comments" 
  ON public.blog_comments 
  FOR INSERT 
  WITH CHECK (
    post_id IN (SELECT id FROM public.blog_posts WHERE published = true)
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON public.blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON public.blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON public.blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON public.blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON public.blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_id ON public.blog_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON public.blog_comments(approved);
