'use client';

import Link from 'next/link';
import Image from 'next/image';
import { SEO } from '../../../components/SEO';
import { useTranslation } from '../../../lib/useTranslation';
import { BlogPost, BlogCategory } from '../../../../types/blog';
import { formatDate } from '../../../../lib/utils/formatDate';

interface BlogCategoryClientProps {
  category: BlogCategory;
  posts: BlogPost[];
  categories: BlogCategory[];
}

/**
 * Client component for Blog Category page
 */
export default function BlogCategoryClient({ category, posts, categories }: BlogCategoryClientProps) {
  const { t, locale } = useTranslation();
  
  return (
    <>
      <SEO 
        title={(t.seo?.blogCategoryTitle || 'Category: {categoryName}').replace('{categoryName}', category.name)}
        description={(t.seo?.blogCategoryDescription || 'Browse all CBD articles in the {categoryName} category').replace('{categoryName}', category.name.toLowerCase())}
        keywords={t.seo?.blogKeywords || 'CBD blog, CBD articles, CBD research, CBD benefits, CBD guides'}
        canonicalPath={`/blog/category/${category.slug}`}
      />
      
      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content */}
          <div className="w-full md:w-2/3">
            <Link 
              href="/blog"
              className="inline-flex items-center text-primary mb-6 hover:underline"
            >
              <span className="material-icons text-sm mr-1">arrow_back</span>
              {t.blog?.backToBlog || 'Back to Blog'}
            </Link>
            
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h1 className="text-3xl font-heading font-bold mb-3">{category.name}</h1>
              {category.description && (
                <p className="text-neutral-600">{category.description}</p>
              )}
            </div>
            
            {posts.length === 0 ? (
              <div className="bg-neutral-100 p-8 rounded-lg text-center">
                <p className="text-lg text-neutral-600">{t.blog?.noPosts || 'No posts found'}</p>
              </div>
            ) : (
              <div className="space-y-10">
                {posts.map((post) => (
                  <article key={post.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    {post.featured_image && (
                      <div className="relative h-60 w-full">
                        <Image
                          src={post.featured_image}
                          alt={post.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-3">
                        {post.published_at && (
                          <span className="text-sm text-neutral-500">
                            {formatDate(post.published_at, locale)}
                          </span>
                        )}
                      </div>
                      
                      <h2 className="text-xl font-heading font-bold mb-3">
                        <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                      </h2>
                      
                      {post.excerpt && (
                        <p className="text-neutral-600 mb-4">{post.excerpt}</p>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          {post.author && (
                            <span className="text-sm text-neutral-500">
                              {t.blog?.by || 'By'} {post.author.full_name}
                            </span>
                          )}
                        </div>
                        
                        <Link 
                          href={`/blog/${post.slug}`}
                          className="text-primary font-medium hover:underline"
                        >
                          {t.blog?.readMore || 'Read More'}
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-1/3">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-heading font-bold mb-4">{t.blog?.categories || 'Categories'}</h2>
              <ul className="space-y-2">
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link 
                      href={`/blog/category/${cat.slug}`}
                      className={`${
                        cat.id === category.id 
                          ? 'text-primary font-medium' 
                          : 'text-neutral-700 hover:text-primary'
                      } transition-colors`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-primary-50 rounded-lg p-6">
              <h2 className="text-xl font-heading font-bold mb-4">{t.newsletter?.title || 'Newsletter'}</h2>
              <p className="text-neutral-600 mb-4">{t.newsletter?.subtitle || 'Subscribe to our newsletter for the latest updates'}</p>
              
              <form className="space-y-3">
                <input
                  type="email"
                  placeholder={t.newsletter?.placeholder || 'Your email address'}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-white font-medium py-2 px-4 rounded-md hover:bg-primary-dark transition-colors"
                >
                  {t.newsletter?.button || 'Subscribe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
