import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LazyImage } from '../../ui/LazyImage';
import { useTranslation } from '../../../lib/i18n/useTranslation';
import { getProducts, getFeaturedProducts } from '../../../lib/db';
import { Card, CardContent, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

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
 * Modern featured products section for the homepage
 */
export const FeaturedProducts = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true); // Set to true by default
  
  // Intersection observer to trigger animation when section is visible
  useEffect(() => {
    // Set isVisible to true immediately to ensure content is visible
    setIsVisible(true);
    
    // Original Intersection Observer code (commented out for now)
    /*
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (carouselRef.current) {
      observer.observe(carouselRef.current);
    }
    
    return () => observer.disconnect();
    */
  }, []);

  // Fetch featured products from Supabase
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        // Use the dedicated getFeaturedProducts function instead of filtering client-side
        const { data, error } = await getFeaturedProducts();
        
        if (error) throw error;
        
        console.log('Featured products:', data); // Debug log
        setProducts(data as Product[] || []);
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
  const goToSlide = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setActiveIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  };

  const nextSlide = () => {
    goToSlide((activeIndex + 1) % products.length);
  };

  const prevSlide = () => {
    goToSlide((activeIndex - 1 + products.length) % products.length);
  };

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Calculate discount percentage
  const calculateDiscount = (original: number, sale: number) => {
    return Math.round(((original - sale) / original) * 100);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex flex-col items-center mb-12">
            <Badge variant="outline" className="mb-4">Featured Products</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary">
              {t.categories.title}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-t-lg"></div>
                <div className="bg-gray-100 p-6 rounded-b-lg">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded mt-6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || products.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="flex flex-col items-center mb-12">
            <Badge variant="outline" className="mb-4">Featured Products</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary">
              {t.categories.title}
            </h2>
          </div>
          <div className="bg-accent/30 rounded-xl p-12 text-center">
            <span className="material-icons text-4xl text-primary mb-4">inventory_2</span>
            <p className="text-primary-dark text-lg">
              {error || 'No featured products available at the moment.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-accent/20 to-transparent -z-10"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-secondary/10 to-transparent rounded-full -z-10"></div>
      
      <div className="container-custom">
        <div className="flex flex-col items-center mb-12">
          <Badge variant="outline" className="mb-4">Featured Products</Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary">
            {t.categories.title}
          </h2>
        </div>
        
        {/* Desktop view - Grid layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6" ref={carouselRef}>
          {products.map((product, index) => (
            <Card 
              key={product.id} 
              className={`group overflow-hidden transition-all duration-500 hover:shadow-xl ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Link href={`/products/${product.slug}`} className="cursor-pointer">
                <div className="relative">
                <div className="relative h-64 w-full overflow-hidden">
                  <LazyImage
                    src={product.image_url}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  
                  {/* Quick view button */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button variant="secondary" size="sm" className="bg-white/80 backdrop-blur-sm text-primary hover:bg-white">
                      Quick View
                    </Button>
                  </div>
                </div>
                
                {/* Product badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-2">
                  {product.is_featured && (
                    <Badge className="bg-primary text-white">Featured</Badge>
                  )}
                  {product.sale_price && (
                    <Badge className="bg-secondary text-white">
                      {calculateDiscount(product.price, product.sale_price)}% OFF
                    </Badge>
                  )}
                </div>
              </div>
              
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-heading font-bold text-primary line-clamp-1">
                    {product.name}
                  </h3>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                  {product.description}
                </p>
                
                <div className="flex items-center mb-2">
                  {product.sale_price ? (
                    <>
                      <span className="text-primary font-bold text-lg mr-2">
                        {formatPrice(product.sale_price)}
                      </span>
                      <span className="text-gray-400 line-through text-sm">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-primary font-bold text-lg">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </CardContent>
              
              <CardFooter className="p-6 pt-0 flex gap-2">
                <Button className="w-full group relative overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center">
                    <span className="material-icons text-sm mr-1">add_shopping_cart</span>
                    Add to Cart
                  </span>
                  <span className="absolute inset-0 bg-primary-light transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
                </Button>
              </CardFooter>
              </Link>
            </Card>
          ))}
        </div>
        
        {/* Mobile view - Carousel */}
        <div className="md:hidden relative" ref={carouselRef}>
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {products.map((product, index) => (
                <div key={product.id} className="w-full flex-shrink-0 px-4">
                  <Card className="overflow-hidden">
                    <Link href={`/products/${product.slug}`} className="cursor-pointer">
                    <div className="relative">
                      <div className="relative h-64 w-full overflow-hidden">
                        <LazyImage
                          src={product.image_url}
                          alt={product.name}
                          fill
                          sizes="100vw"
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Product badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-2">
                        {product.is_featured && (
                          <Badge className="bg-primary text-white">Featured</Badge>
                        )}
                        {product.sale_price && (
                          <Badge className="bg-secondary text-white">
                            {calculateDiscount(product.price, product.sale_price)}% OFF
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <CardContent className="p-6">
                      <h3 className="text-lg font-heading font-bold text-primary mb-2 line-clamp-1">
                        {product.name}
                      </h3>
                      
                      <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center mb-2">
                        {product.sale_price ? (
                          <>
                            <span className="text-primary font-bold text-lg mr-2">
                              {formatPrice(product.sale_price)}
                            </span>
                            <span className="text-gray-400 line-through text-sm">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="text-primary font-bold text-lg">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </CardContent>
                    
                    <CardFooter className="p-6 pt-0">
                      <Button className="w-full">
                        <span className="material-icons text-sm mr-1">add_shopping_cart</span>
                        Add to Cart
                      </Button>
                    </CardFooter>
                    </Link>
                  </Card>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation Arrows */}
          {products.length > 1 && (
            <>
              <Button 
                onClick={prevSlide}
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full h-10 w-10 p-0 shadow-md z-10 border-0"
                aria-label="Previous product"
                disabled={isAnimating}
              >
                <span className="material-icons text-primary">chevron_left</span>
              </Button>
              <Button 
                onClick={nextSlide}
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm rounded-full h-10 w-10 p-0 shadow-md z-10 border-0"
                aria-label="Next product"
                disabled={isAnimating}
              >
                <span className="material-icons text-primary">chevron_right</span>
              </Button>
            </>
          )}
          
          {/* Dots */}
          {products.length > 1 && (
            <div className="flex justify-center mt-6">
              {products.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 w-2 rounded-full mx-1 transition-colors duration-300 ${
                    activeIndex === index ? 'bg-primary w-4' : 'bg-gray-300'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  disabled={isAnimating}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* View all products button */}
        <div className="flex justify-center mt-12">
          <Link href="/products">
            <Button variant="outline" size="lg" className="group relative overflow-hidden border-2">
              <span className="relative z-10 flex items-center">
                View All Products
                <span className="material-icons ml-2 transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};
