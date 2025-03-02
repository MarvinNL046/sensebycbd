'use client';

import Link from 'next/link';

/**
 * Product not found component
 */
export default function ProductNotFound() {
  return (
    <div className="container-custom py-12 text-center">
      <h1 className="text-3xl font-heading font-bold mb-4">Product Not Found</h1>
      <p className="mb-8">The product you are looking for does not exist or has been removed.</p>
      <Link 
        href="/products" 
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
      >
        Browse All Products
      </Link>
    </div>
  );
}
