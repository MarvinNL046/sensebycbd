# Blog System Implementation

This document outlines the implementation of the blog system for SenseBy CBD.

## Database Schema

The blog system uses the following tables in Supabase:

- `blog_posts`: Stores blog post content and metadata
- `blog_categories`: Stores blog categories
- `blog_tags`: Stores blog tags
- `blog_posts_tags`: Junction table for the many-to-many relationship between posts and tags
- `blog_comments`: Stores comments on blog posts

## Features

The blog system includes the following features:

- Blog post listing page with filtering by category
- Blog post detail page with comments
- Blog category pages
- Related posts
- Recent posts sidebar
- Comment system (with moderation)
- SEO optimization with proper meta tags
- Multilingual support

## File Structure

```
├── types/
│   └── blog/
│       └── index.ts           # Blog-related TypeScript interfaces
├── components/
│   └── blocks/
│       └── blog/
│           ├── BlogPostCard.tsx    # Reusable blog post card component
│           └── BlogSidebar.tsx     # Sidebar component with categories and recent posts
├── pages/
│   └── blog/
│       ├── index.tsx          # Main blog listing page
│       ├── [slug].tsx         # Blog post detail page
│       └── category/
│           └── [slug].tsx     # Category-specific blog listing page
├── lib/
│   └── db.ts                  # Database functions for blog data
```

## Data Flow

1. The blog pages use Incremental Static Regeneration (ISR) to fetch data at build time and update it periodically.
2. Blog data is fetched from Supabase using the functions in `lib/db.ts`.
3. For development and testing, mock data is provided in `lib/mockData.ts`.

## Internationalization

The blog system supports multiple languages through Next.js internationalization features:

- Blog post URLs are localized (e.g., `/en/blog/post-slug`, `/nl/blog/post-slug`)
- UI elements are translated using the translation files in `public/locales/`
- Content is not translated automatically - separate blog posts should be created for each language

## SEO Optimization

Each blog page includes proper SEO metadata:

- Title and description meta tags
- Open Graph tags for social sharing
- Canonical URLs
- Structured data for blog posts

## Future Improvements

Potential future improvements to the blog system:

1. Add pagination to the blog listing page
2. Implement a search feature for blog posts
3. Add author pages to show posts by a specific author
4. Implement a related posts algorithm based on tags or content similarity
5. Add social sharing buttons
6. Implement an RSS feed
7. Add reading time estimation
8. Implement a "popular posts" section based on view count
