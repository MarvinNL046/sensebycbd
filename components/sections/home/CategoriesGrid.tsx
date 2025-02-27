import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '../../../lib/i18n/useTranslation';
import { getCategories } from '../../../lib/db';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
};

/**
 * Categories grid for the homepage
 */
export const CategoriesGrid = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await getCategories();
        
        if (error) throw error;
        
        setCategories(data as Category[]);
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Map category slug to icon name
  const getCategoryIcon = (slug: string): string => {
    const iconMap: Record<string, string> = {
      'cbd-oils': 'spa',
      'topicals': 'healing',
      'edibles': 'restaurant',
      'capsules': 'medication',
      'pet-cbd': 'pets'
    };
    
    return iconMap[slug] || 'category';
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-heading font-bold text-center text-primary mb-12">
            {t.categories.title}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white rounded-lg shadow-md h-64"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || categories.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <h2 className="text-3xl font-heading font-bold text-center text-primary mb-12">
            {t.categories.title}
          </h2>
          <p className="text-center text-gray-600">
            {error || 'No categories available at the moment.'}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        <h2 className="text-3xl font-heading font-bold text-center text-primary mb-12">
          {t.categories.title}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((category) => (
            <Link 
              key={category.id} 
              href={`/products/category/${category.slug}`}
              className="block group"
            >
              <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 group-hover:shadow-lg group-hover:-translate-y-1">
                {category.image_url ? (
                  <div className="relative h-48 w-full">
                    <Image
                      src={category.image_url}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 bg-accent">
                    <span className="material-icons text-primary text-6xl">
                      {getCategoryIcon(category.slug)}
                    </span>
                  </div>
                )}
                <div className="p-6 text-center">
                  <h3 className="text-xl font-heading font-bold text-primary mb-2">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-gray-600 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
