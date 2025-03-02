'use client';

import Link from 'next/link';

/**
 * Blog post not found component
 */
export default function BlogPostNotFound() {
  return (
    <div className="container-custom py-12 text-center">
      <h1 className="text-3xl font-heading font-bold mb-4">Blog Post Not Found</h1>
      <p className="mb-8">The blog post you are looking for does not exist or has been removed.</p>
      <Link 
        href="/blog" 
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
      >
        Back to Blog
      </Link>
    </div>
  );
}
