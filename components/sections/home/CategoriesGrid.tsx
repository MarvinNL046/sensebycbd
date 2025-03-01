import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LazyImage } from '../../ui/LazyImage';
import { useTranslation } from '../../../lib/i18n/useTranslation';
import { getCategories } from '../../../lib/db';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  // Added properties for UI enhancement
  productCount?: number;
  isPopular?: boolean;
  isNew?: boolean;
};

/**
 * Modern categories grid for the homepage
 */
export const CategoriesGrid = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isVisible, setIsVisible] = useState(true); // Set to true by default
  const sectionRef = useRef<HTMLDivElement>(null);
  
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
    
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    
    return () => observer.disconnect();
    */
  }, []);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await getCategories();
        
        if (error) throw error;
        
        // Enhance categories with additional UI properties
        const enhancedCategories = (data as Category[]).map(category => ({
          ...category,
          productCount: Math.floor(Math.random() * 20) + 5, // Mock product count
          isPopular: Math.random() > 0.7,
          isNew: Math.random() > 0.8,
        }));
        
        setCategories(enhancedCategories);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Map category slug to icon name and color
  const getCategoryDetails = (slug: string): { icon: string; color: string; gradient: string } => {
    const detailsMap: Record<string, { icon: string; color: string; gradient: string }> = {
      'cbd-oils': { 
        icon: 'spa', 
        color: 'text-primary', 
        gradient: 'from-primary/10 to-primary/5' 
      },
      'topicals': { 
        icon: 'healing', 
        color: 'text-secondary', 
        gradient: 'from-secondary/10 to-secondary/5' 
      },
      'edibles': { 
        icon: 'restaurant', 
        color: 'text-accent-dark', 
        gradient: 'from-accent-dark/10 to-accent-dark/5' 
      },
      'capsules': { 
        icon: 'medication', 
        color: 'text-primary-light', 
        gradient: 'from-primary-light/10 to-primary-light/5' 
      },
      'pet-cbd': { 
        icon: 'pets', 
        color: 'text-secondary-light', 
        gradient: 'from-secondary-light/10 to-secondary-light/5' 
      }
    };
    
    return detailsMap[slug] || { 
      icon: 'category', 
      color: 'text-primary', 
      gradient: 'from-primary/10 to-primary/5' 
    };
  };
  
  // Filter categories based on active filter
  const filteredCategories = categories.filter(category => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'popular') return category.isPopular;
    if (activeFilter === 'new') return category.isNew;
    return true;
  });

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-white to-accent/10 relative overflow-hidden">
        <div className="container-custom">
          <div className="flex flex-col items-center mb-12">
            <Badge variant="outline" className="mb-4">Explore</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary">
              {t.categories.title}
            </h2>
            <p className="mt-4 text-center text-gray-600 max-w-2xl">
              Browse our carefully curated selection of premium CBD products
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-lg"></div>
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

  if (error || categories.length === 0) {
    return (
      <section className="py-20 bg-gradient-to-br from-white to-accent/10 relative overflow-hidden">
        <div className="container-custom">
          <div className="flex flex-col items-center mb-12">
            <Badge variant="outline" className="mb-4">Explore</Badge>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary">
              {t.categories.title}
            </h2>
          </div>
          <div className="bg-accent/30 rounded-xl p-12 text-center">
            <span className="material-icons text-4xl text-primary mb-4">category</span>
            <p className="text-primary-dark text-lg">
              {error || 'No categories available at the moment.'}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-white to-accent/10 relative overflow-hidden" ref={sectionRef}>
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 opacity-50">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(215,243,220,0.3),transparent_70%)]"></div>
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(215,243,220,0.3),transparent_70%)]"></div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-20 right-10 text-primary/5 -z-5 rotate-12">
        <span className="material-icons text-[150px]">spa</span>
      </div>
      <div className="absolute bottom-20 left-10 text-primary/5 -z-5 -rotate-12">
        <span className="material-icons text-[100px]">healing</span>
      </div>
      
      <div className="container-custom relative z-10">
        <div className="flex flex-col items-center mb-12">
          <Badge variant="outline" className="mb-4">Explore</Badge>
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-center text-primary mb-4">
            {t.categories.title}
          </h2>
          <p className="mt-2 text-center text-gray-600 max-w-2xl">
            Browse our carefully curated selection of premium CBD products
          </p>
        </div>
        
        {/* Category filters */}
        <div className={`flex justify-center mb-8 transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeFilter === 'all' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-primary hover:bg-gray-100'
              }`}
            >
              All Categories
            </button>
            <button
              onClick={() => setActiveFilter('popular')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeFilter === 'popular' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-primary hover:bg-gray-100'
              }`}
            >
              Popular
            </button>
            <button
              onClick={() => setActiveFilter('new')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                activeFilter === 'new' 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 hover:text-primary hover:bg-gray-100'
              }`}
            >
              New Arrivals
            </button>
          </div>
        </div>
        
        {/* Categories grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCategories.map((category, index) => {
            const { icon, color, gradient } = getCategoryDetails(category.slug);
            
            return (
              <Link 
                key={category.id} 
                href={`/products/category/${category.slug}`}
                className="block group"
              >
                <Card 
                  className={`overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-500 ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    {category.image_url ? (
                      <div className="relative h-48 w-full overflow-hidden">
                        <LazyImage
                          src={category.image_url}
                          alt={category.name}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                    ) : (
                      <div className={`flex items-center justify-center h-48 bg-gradient-to-br ${gradient}`}>
                        <span className={`material-icons ${color} text-6xl transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                          {icon}
                        </span>
                      </div>
                    )}
                    
                    {/* Category badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-2">
                      {category.isNew && (
                        <Badge className="bg-secondary text-white">New</Badge>
                      )}
                      {category.isPopular && (
                        <Badge className="bg-primary text-white">Popular</Badge>
                      )}
                    </div>
                    
                    {/* Product count badge */}
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="outline" className="bg-white/80 backdrop-blur-sm">
                        {category.productCount} Products
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-heading font-bold text-primary mb-2 group-hover:text-primary-dark transition-colors duration-300">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-gray-600 line-clamp-2 mb-4">
                        {category.description}
                      </p>
                    )}
                    <Button variant="outline" size="sm" className="w-full group">
                      <span className="relative z-10 flex items-center justify-center">
                        Browse Products
                        <span className="material-icons text-sm ml-1 transition-transform duration-300 group-hover:translate-x-1">arrow_forward</span>
                      </span>
                    </Button>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
        
        {/* View all button */}
        <div className={`flex justify-center mt-12 transition-all duration-700 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
        }`}>
          <Link href="/products">
            <Button variant="default" size="lg" className="group relative overflow-hidden">
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
