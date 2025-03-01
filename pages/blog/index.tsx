import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { SEO } from '../../lib/seo/SEO';
import { useTranslation } from '../../lib/i18n/useTranslation';
import { BlogPost, BlogCategory } from '../../types/blog';
import { getBlogPosts, getBlogCategories } from '../../lib/mockDb';
import { formatDate } from '../../lib/utils/formatDate';

interface BlogPageProps {
  posts: BlogPost[];
  categories: BlogCategory[];
}

export default function BlogPage({ posts, categories }: BlogPageProps) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  
  return (
    <>
      <SEO 
        title={t.seo?.blogTitle || 'Blog | SenseBy CBD'}
        description={t.seo?.blogDescription || 'Read the latest articles about CBD benefits, research, and product guides.'}
        keywords={t.seo?.blogKeywords || 'CBD blog, CBD articles, CBD research, CBD benefits, CBD guides'}
      />
      
      <div className="container-custom py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main content */}
          <div className="w-full md:w-2/3">
            <h1 className="text-3xl font-heading font-bold mb-8">{t.blog?.title || 'Blog'}</h1>
            
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
                        {post.category && (
                          <Link 
                            href={`/blog/category/${post.category.slug}`}
                            className="text-xs font-medium bg-primary-100 text-primary px-3 py-1 rounded-full"
                          >
                            {post.category.name}
                          </Link>
                        )}
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
                {categories.map((category) => (
                  <li key={category.id}>
                    <Link 
                      href={`/blog/category/${category.slug}`}
                      className="text-neutral-700 hover:text-primary transition-colors"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
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
        </div>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const { data: posts } = await getBlogPosts();
  const { data: categories } = await getBlogCategories();
  
  return {
    props: {
      posts: posts || [],
      categories: categories || [],
    },
    revalidate: 60 * 60, // Revalidate every hour
  };
};
