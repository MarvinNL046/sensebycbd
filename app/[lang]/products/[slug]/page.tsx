import { Suspense } from 'react';
import { Metadata } from 'next';
import { supportedLanguages } from '../../../../middleware';
import { getProductBySlug, getProductReviews } from '../../../../lib/db';
import { notFound } from 'next/navigation';
import { generateMetadata as seoMetadata } from '../../../components/SEO';
import { ProductSchema } from '../../../../lib/schema/ProductSchema';
import { ProductGallery } from '../../../../components/blocks/product/ProductGallery';
import { ProductInfo } from '../../../../components/blocks/product/ProductInfo';
import { ProductSpecifications } from '../../../../components/blocks/product/ProductSpecifications';
import { RelatedProducts } from '../../../../components/blocks/product/RelatedProducts';
import { Product } from '../../../../types/product';

// Loading fallback
function ProductLoading() {
  return (
    <div className="container-custom py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Gallery Skeleton */}
        <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>
        
        {/* Product Info Skeleton */}
        <div className="space-y-4">
          <div className="animate-pulse bg-gray-200 h-10 w-3/4 rounded-lg"></div>
          <div className="animate-pulse bg-gray-200 h-6 w-1/4 rounded-lg"></div>
          <div className="animate-pulse bg-gray-200 h-4 w-full rounded-lg"></div>
          <div className="animate-pulse bg-gray-200 h-4 w-full rounded-lg"></div>
          <div className="animate-pulse bg-gray-200 h-4 w-3/4 rounded-lg"></div>
          <div className="mt-8 animate-pulse bg-gray-200 h-12 w-full rounded-lg"></div>
        </div>
      </div>
      
      {/* Product Specifications Skeleton */}
      <div className="mt-12 animate-pulse bg-gray-200 h-48 rounded-lg"></div>
      
      {/* Related Products Skeleton */}
      <div className="mt-12">
        <div className="animate-pulse bg-gray-200 h-8 w-1/3 rounded-lg mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Generate metadata for the page
export async function generateMetadata({ 
  params 
}: { 
  params: { lang: string; slug: string } 
}): Promise<Metadata> {
  // Validate that the language is supported
  const lang = supportedLanguages.includes(params.lang) ? params.lang : 'en';
  
  if (!params?.slug) {
    return seoMetadata({
      title: "Product Not Found | SenseBy CBD",
      description: "The requested product could not be found.",
      keywords: "CBD, product not found",
      canonicalPath: "/products"
    });
  }
  
  // Fetch product data
  const { data: productData, error } = await getProductBySlug(params.slug);
  
  if (error || !productData) {
    return seoMetadata({
      title: "Product Not Found | SenseBy CBD",
      description: "The requested product could not be found.",
      keywords: "CBD, product not found",
      canonicalPath: "/products"
    });
  }
  
  // Type assertion
  const product = productData as Product;
  
  return seoMetadata({
    title: `${product.name} | SenseBy CBD`,
    description: `Shop ${product.name} from SenseBy CBD. Premium quality, lab-tested CBD product for natural relief and wellness.`,
    keywords: `CBD, ${product.name}, ${product.categories?.name || ''}, buy CBD`,
    canonicalPath: `/${lang}/products/${params.slug}`,
    ogImage: product.image_url
  });
}

// Fetch product data
async function getProductData(slug: string, locale = 'en') {
  // Fetch product data
  const { data: productData, error } = await getProductBySlug(slug);
  
  if (error || !productData) {
    return { product: null, reviews: null };
  }
  
  // Type assertion
  const product = productData as Product;
  
  // Fetch product reviews if available
  let reviews = null;
  
  const { data: reviewsData } = await getProductReviews(product.id);
  
  if (reviewsData && reviewsData.length > 0) {
    // Calculate average rating
    const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviewsData.length;
    
    reviews = {
      averageRating,
      reviewCount: reviewsData.length
    };
  }
  
  return { product, reviews };
}

// Product page component
export default async function ProductPage({ 
  params 
}: { 
  params: { lang: string; slug: string } 
}) {
  // Validate that the language is supported
  const lang = supportedLanguages.includes(params.lang) ? params.lang : 'en';
  
  if (!params?.slug) {
    notFound();
  }
  
  // Fetch product data
  const { product, reviews } = await getProductData(params.slug, lang);
  
  // If product not found
  if (!product) {
    notFound();
  }
  
  return (
    <Suspense fallback={<ProductLoading />}>
      <ProductSchema product={product} reviews={reviews} />
      
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Product Gallery */}
          <ProductGallery product={product} />
          
          {/* Product Info */}
          <ProductInfo product={product} />
        </div>
        
        {/* Product Specifications */}
        <ProductSpecifications product={product} />
        
        {/* Related Products */}
        <RelatedProducts product={product} />
      </div>
    </Suspense>
  );
}
