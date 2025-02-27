import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '../../../lib/i18n/useTranslation';
import { getProducts } from '../../../lib/db';

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  image_url: string;
  is_featured: boolean;
  category_id: string;
  categories: {
    name: string;
    slug: string;
  };
};

/**
 * Featured products carousel for the homepage
 */
export const FeaturedProducts = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch featured products from Supabase
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const { data, error } = await getProducts();
        
        if (error) throw error;
        
        // Filter featured products
        const featuredProducts = data?.filter(product => product.is_featured) || [];
        setProducts(featuredProducts as Product[]);
      } catch (err: any) {
        console.error('Error fetching featured products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Handle carousel navigation
  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === products.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? products.length - 1 : prevIndex - 1
    );
  };

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-heading font-bold text-center text-primary mb-12">
            {t.categories.title}
          </h2>
          <div className="flex justify-center">
            <div className="animate-pulse bg-gray-200 h-64 w-full max-w-md rounded"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="text-3xl font-heading font-bold text-center text-primary mb-12">
            {t.categories.title}
          </h2>
          <p className="text-center text-gray-600">
            {error || 'No featured products available at the moment.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <h2 className="text-3xl font-heading font-bold text-center text-primary mb-12">
          {t.categories.title}
        </h2>
        
        <div className="relative">
          {/* Carousel */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {products.map((product) => (
                <div key={product.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="relative h-64 w-full">
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-heading font-bold text-primary">
                          {product.name}
                        </h3>
                        <div>
                          {product.sale_price ? (
                            <>
                              <span className="text-gray-400 line-through mr-2">
                                {formatPrice(product.price)}
                              </span>
                              <span className="text-primary font-bold">
                                {formatPrice(product.sale_price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-primary font-bold">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <Link 
                          href={`/products/${product.slug}`}
                          className="text-primary hover:text-primary-dark"
                        >
                          View Details
                        </Link>
                        <button className="btn-primary-sm">
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Arrows */}
          {products.length > 1 && (
            <>
              <button 
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
                aria-label="Previous product"
              >
                <span className="material-icons text-primary">chevron_left</span>
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-md z-10"
                aria-label="Next product"
              >
                <span className="material-icons text-primary">chevron_right</span>
              </button>
            </>
          )}
          
          {/* Dots */}
          {products.length > 1 && (
            <div className="flex justify-center mt-6">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-2 w-2 rounded-full mx-1 ${
                    currentIndex === index ? 'bg-primary' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
