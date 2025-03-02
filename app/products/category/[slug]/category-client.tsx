'use client';

import { Category, Product } from '../../../../types/product';
import { useTranslation } from '../../../lib/useTranslation';
import { Card, CardContent, CardFooter } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { getTranslatedCategorySlug } from '../../../../lib/utils/slugs';

interface CategoryClientProps {
  category: Category;
  products: Product[];
}

/**
 * Client component for Category page
 */
export default function CategoryClient({ category, products }: CategoryClientProps) {
  const { locale } = useTranslation();
  
  // Create a local translation object with the necessary properties
  const translations = {
    viewDetails: "View Details",
    noProducts: "No products found in this category."
  };
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };
  
  return (
    <>
      
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
