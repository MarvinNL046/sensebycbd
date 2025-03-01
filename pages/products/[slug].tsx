import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { SEO } from '../../lib/seo/SEO';
import { ProductGallery } from '../../components/blocks/product/ProductGallery';
import { ProductInfo } from '../../components/blocks/product/ProductInfo';
import { ProductSpecifications } from '../../components/blocks/product/ProductSpecifications';
import { RelatedProducts } from '../../components/blocks/product/RelatedProducts';
import { getProductBySlug, getProducts, getProductReviews } from '../../lib/db';
import { Product } from '../../types/product';
import { getBaseProductSlug, getTranslatedProductSlug } from '../../lib/utils/slugs';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { ProductSchema } from '../../lib/schema/ProductSchema';

interface ProductPageProps {
  product: Product;
  reviews?: {
    averageRating: number;
    reviewCount: number;
  } | null;
}

/**
 * Product detail page
 */
export default function ProductPage({ product, reviews }: ProductPageProps) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  
  // Handle fallback state
  if (router.isFallback) {
    return (
      <div className="container-custom py-12">
        <SEO 
          title="Loading Product | SenseBy CBD"
          description="Loading product details..."
          keywords="CBD, loading"
        />
        
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

  // If product not found
  if (!product) {
    return (
      <>
        <SEO 
          title="Product Not Found | SenseBy CBD"
          description="The requested product could not be found."
          keywords="CBD, product not found"
        />
        <div className="container-custom py-12 text-center">
          <h1 className="text-3xl font-heading font-bold mb-4">Product Not Found</h1>
          <p className="mb-8">The product you are looking for does not exist or has been removed.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO 
        title={`${product.name} | SenseBy CBD`}
        description={`Shop ${product.name} from SenseBy CBD. Premium quality, lab-tested CBD product for natural relief and wellness.`}
        keywords={`CBD, ${product.name}, ${product.categories?.name || ''}, buy CBD`}
        canonicalPath={`/products/${getTranslatedProductSlug(product.slug, locale)}`}
        ogImage={product.image_url}
      />
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
    </>
  );
}

/**
 * Generate static params for all products (Next.js 13+ App Router compatibility)
 * This function is used by the App Router to generate static pages at build time
 */
export async function generateStaticParams() {
  const { data: products } = await getProducts();
  
  if (!products || products.length === 0) return [];
  
  // For each product, generate params for each locale
  return products.flatMap(product => {
    if (!product || !product.slug) return [];
    
    return ['en', 'nl', 'de', 'fr'].map(locale => ({
      slug: getTranslatedProductSlug(product.slug, locale)
    }));
  });
}

/**
 * Get static paths for all products (Next.js Pages Router)
 */
export const getStaticPaths: GetStaticPaths = async ({ locales = ['en'] }) => {
  const { data: products } = await getProducts();
  
  // Generate paths for all products in all locales
  const paths = products && products.length > 0
    ? products.flatMap(product => {
        if (!product || !product.slug) return [];
        
        return locales.map(locale => ({
          params: { 
            slug: getTranslatedProductSlug(product.slug, locale) 
          },
          locale
        }));
      })
    : [];
  
  return {
    paths,
    // Fallback true enables ISR
    fallback: true,
  };
};

/**
 * Get static props for a product
 */
export const getStaticProps: GetStaticProps<ProductPageProps> = async ({ params, locale = 'en' }) => {
  if (!params?.slug || typeof params.slug !== 'string') {
    return { notFound: true };
  }
  
  // Convert translated slug to base slug if needed
  const baseSlug = getBaseProductSlug(params.slug, locale);
  
  // Fetch product data
  const { data, error } = await getProductBySlug(baseSlug);
  
  if (error || !data) {
    return { notFound: true };
  }
  
  // Fetch product reviews if available
  let reviews = null; // Initialize as null instead of undefined
  
  const { data: reviewsData } = await getProductReviews(data.id);
  
  if (reviewsData && reviewsData.length > 0) {
    // Calculate average rating
    const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviewsData.length;
    
    reviews = {
      averageRating,
      reviewCount: reviewsData.length
    };
  }
  
  return {
    props: {
      product: data,
      reviews, // This will now be null instead of undefined if there are no reviews
    },
    // Revalidate every 10 minutes (600 seconds) for product pages
    // Product details are more critical to keep up-to-date
    revalidate: 600,
  };
};
