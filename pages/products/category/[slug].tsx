import { GetStaticProps, GetStaticPaths } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { SEO } from '../../../lib/seo/SEO';
import { getCategoryBySlug, getCategories, getProducts } from '../../../lib/db';
import { Category, Product, ProductFilter } from '../../../types/product';
import { getBaseCategorySlug, getTranslatedCategorySlug } from '../../../lib/utils/slugs';
import { useTranslation } from '../../../lib/i18n/useTranslation';
import { Card, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryPageProps {
  category: Category;
  products: Product[];
}

/**
 * Category page that displays products in a specific category
 */
export default function CategoryPage({ category, products: initialProducts }: CategoryPageProps) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const [products] = useState<Product[]>(initialProducts);
  
  // Create a local translation object with the necessary properties
  const translations = {
    viewDetails: "View Details",
    noProducts: "No products found in this category."
  };
  
  // Handle fallback state
  if (router.isFallback) {
    return (
      <div className="container-custom py-12">
        <SEO 
          title="Loading Category | SenseBy CBD"
          description="Loading category products..."
          keywords="CBD, loading"
        />
        
        {/* Category Header Skeleton */}
        <div className="mb-8 text-center">
          <div className="animate-pulse bg-gray-200 h-10 w-1/3 mx-auto rounded-lg mb-4"></div>
          <div className="animate-pulse bg-gray-200 h-4 w-1/2 mx-auto rounded-lg"></div>
        </div>
        
        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  // If category not found
  if (!category) {
    return (
      <>
        <SEO 
          title="Category Not Found | SenseBy CBD"
          description="The requested category could not be found."
          keywords="CBD, category not found"
        />
        <div className="container-custom py-12 text-center">
          <h1 className="text-3xl font-heading font-bold mb-4">Category Not Found</h1>
          <p className="mb-8">The category you are looking for does not exist or has been removed.</p>
        </div>
      </>
    );
  }

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  return (
    <>
      <SEO 
        title={`${category.name} | SenseBy CBD Products`}
        description={`Browse our selection of premium ${category.name} products. High-quality, lab-tested CBD for natural relief and wellness.`}
        keywords={`CBD, ${category.name}, buy CBD, CBD products`}
        canonicalPath={`/products/category/${getTranslatedCategorySlug(category.slug, locale)}`}
        ogImage={category.image_url || ''}
      />
      
      <div className="container-custom py-12">
        {/* Category Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-heading font-bold mb-4">{category.name}</h1>
          {category.description && (
            <p className="text-gray-600 max-w-3xl mx-auto">{category.description}</p>
          )}
        </div>
        
        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative h-48 w-full">
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover"
                  />
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-heading font-bold text-lg mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  
                  <div className="flex items-center mb-2">
                    {product.sale_price ? (
                      <>
                        <span className="font-bold text-primary mr-2">
                          {formatPrice(product.sale_price)}
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {formatPrice(product.price)}
                        </span>
                      </>
                    ) : (
                      <span className="font-bold text-primary">
                        {formatPrice(product.price)}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {product.description}
                  </p>
                </CardContent>
                
                <CardFooter className="p-4 pt-0">
                  <Link 
                    href={`/products/${product.slug}`}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full">
                      {translations.viewDetails}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">{translations.noProducts}</p>
          </div>
        )}
      </div>
    </>
  );
}

/**
 * Get static paths for all categories
 */
export const getStaticPaths: GetStaticPaths = async ({ locales = ['en'] }) => {
  const { data: categories } = await getCategories();
  
  // Generate paths for all categories in all locales
  const paths = categories?.flatMap(category => 
    locales.map(locale => ({
      params: { 
        slug: getTranslatedCategorySlug(category.slug, locale) 
      },
      locale
    }))
  ) || [];
  
  return {
    paths,
    // Fallback true enables ISR
    fallback: true,
  };
};

/**
 * Get static props for a category
 */
export const getStaticProps: GetStaticProps<CategoryPageProps> = async ({ params, locale = 'en' }) => {
  if (!params?.slug || typeof params.slug !== 'string') {
    return { notFound: true };
  }
  
  // Convert translated slug to base slug if needed
  const baseSlug = getBaseCategorySlug(params.slug, locale);
  
  // Fetch category data
  const { data: category, error: categoryError } = await getCategoryBySlug(baseSlug);
  
  if (categoryError || !category) {
    return { notFound: true };
  }
  
  // Fetch products in this category
  const filter: ProductFilter = {
    category: category.slug,
  };
  
  const { data: products, error: productsError } = await getProducts(filter);
  
  if (productsError) {
    return { notFound: true };
  }
  
  return {
    props: {
      category,
      products: products || [],
    },
    // Revalidate every 30 minutes (1800 seconds) for category pages
    // Category pages change less frequently than individual product pages
    revalidate: 1800,
  };
};
