import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '../../../types/blog';
import { useTranslation } from '../../../lib/useTranslation';
import { formatDate } from '../../../lib/utils/formatDate';

interface BlogPostCardProps {
  post: BlogPost;
}

export const BlogPostCard = ({ post }: BlogPostCardProps) => {
  const { t, locale } = useTranslation();
  
  return (
    <article className="bg-white rounded-lg shadow-sm overflow-hidden">
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
  );
};
