import Link from 'next/link';
import Image from 'next/image';
import { BlogCategory, BlogPost } from '../../../types/blog';
import { useTranslation } from '../../../lib/i18n/useTranslation';
import { formatDate } from '../../../lib/utils/formatDate';

interface BlogSidebarProps {
  categories: BlogCategory[];
  recentPosts?: Partial<BlogPost>[];
  currentCategoryId?: string;
}

export const BlogSidebar = ({ 
  categories, 
  recentPosts = [],
  currentCategoryId 
}: BlogSidebarProps) => {
  const { t, locale } = useTranslation();
  
  return (
    <div className="w-full md:w-1/3">
      {/* Categories */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-heading font-bold mb-4">{t.blog?.categories || 'Categories'}</h2>
        <ul className="space-y-2">
          {categories.map((category) => (
            <li key={category.id}>
              <Link 
                href={`/blog/category/${category.slug}`}
                className={`${
                  currentCategoryId && category.id === currentCategoryId 
                    ? 'text-primary font-medium' 
                    : 'text-neutral-700 hover:text-primary'
                } transition-colors`}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      
      {/* Recent posts */}
      {recentPosts.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-heading font-bold mb-4">{t.blog?.recentPosts || 'Recent Posts'}</h2>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <div key={post.id} className="flex gap-3">
                {post.featured_image && (
                  <div className="relative h-16 w-16 flex-shrink-0">
                    <Image
                      src={post.featured_image}
                      alt={post.title || ''}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div>
                  <h3 className="font-medium line-clamp-2">
                    <Link 
                      href={`/blog/${post.slug}`}
                      className="hover:text-primary transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h3>
                  {post.published_at && (
                    <span className="text-xs text-neutral-500">
                      {formatDate(post.published_at, locale)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Newsletter signup */}
      <div className="bg-primary-50 rounded-lg p-6">
        <h2 className="text-xl font-heading font-bold mb-4">{t.newsletter.title}</h2>
        <p className="text-neutral-600 mb-4">{t.newsletter.subtitle}</p>
        
        <form className="space-y-3">
          <input
            type="email"
            placeholder={t.newsletter.placeholder}
            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            type="submit"
            className="w-full bg-primary text-white font-medium py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
          >
            {t.newsletter.button}
          </button>
        </form>
      </div>
    </div>
  );
};
