'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '../../../lib/useTranslation';
import { BlogPost, BlogComment } from '../../../types/blog';
import { formatDate } from '../../../lib/utils/formatDate';
import { useAuth } from '../../../lib/auth-context';

interface BlogPostClientProps {
  post: BlogPost;
  comments: BlogComment[];
  recentPosts: Partial<BlogPost>[];
}

/**
 * Client component for Blog Post page
 */
export default function BlogPostClient({ post, comments, recentPosts }: BlogPostClientProps) {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const [commentForm, setCommentForm] = useState({
    name: '',
    email: '',
    content: ''
  });
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCommentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle comment submission
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real implementation, this would call the API to submit the comment
    // For now, we'll just simulate a successful submission
    setCommentSubmitted(true);
  };
  
  return (
    <>
      
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
            
            <article className="bg-white rounded-lg shadow-sm overflow-hidden">
              {post.featured_image && (
                <div className="relative h-80 w-full">
                  <Image
                    src={post.featured_image}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div className="p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-4 mb-4">
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
                      {t.blog?.publishedOn || 'Published on'} {formatDate(post.published_at, locale)}
                    </span>
                  )}
                  
                  {post.author && (
                    <span className="text-sm text-neutral-500">
                      {t.blog?.by || 'By'} {post.author.full_name}
                    </span>
                  )}
                </div>
                
                <h1 className="text-3xl font-heading font-bold mb-6">{post.title}</h1>
                
                <div 
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-neutral-200">
                    <h3 className="text-lg font-medium mb-3">{t.blog?.tags || 'Tags'}</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(({ tag }) => (
                        <Link 
                          key={tag.id}
                          href={`/blog?tag=${tag.slug}`}
                          className="text-xs bg-neutral-100 text-neutral-700 px-3 py-1 rounded-full hover:bg-neutral-200 transition-colors"
                        >
                          {tag.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">{t.blog?.share || 'Share'}</h3>
                    <div className="flex gap-2">
                      <button className="text-neutral-700 hover:text-primary transition-colors">
                        <span className="material-icons">facebook</span>
                      </button>
                      <button className="text-neutral-700 hover:text-primary transition-colors">
                        <span className="material-icons">twitter</span>
                      </button>
                      <button className="text-neutral-700 hover:text-primary transition-colors">
                        <span className="material-icons">link</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </article>
            
            {/* Comments section */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h2 className="text-2xl font-heading font-bold mb-6">
                {t.blog?.comments || 'Comments'} ({comments.length})
              </h2>
              
              {comments.length === 0 ? (
                <div className="bg-neutral-50 p-4 rounded-lg text-center">
                  <p className="text-neutral-600">{t.blog?.noComments || 'No comments yet. Be the first to comment!'}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b border-neutral-200 pb-6 last:border-0">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium">
                          {comment.user ? comment.user.full_name : comment.name}
                        </div>
                        <div className="text-sm text-neutral-500">
                          {formatDate(comment.created_at, locale)}
                        </div>
                      </div>
                      <p className="text-neutral-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Comment form */}
              <div className="mt-8 pt-6 border-t border-neutral-200">
                <h3 className="text-xl font-heading font-bold mb-4">
                  {t.blog?.leaveComment || 'Leave a Comment'}
                </h3>
                
                {commentSubmitted ? (
                  <div className="bg-green-50 text-green-700 p-4 rounded-lg">
                    <p>{t.blog?.thankYouComment || 'Thank you for your comment! It will be visible after approval.'}</p>
                  </div>
                ) : user ? (
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <div>
                      <textarea
                        name="content"
                        value={commentForm.content}
                        onChange={handleInputChange}
                        placeholder={t.blog?.commentPlaceholder || 'Your comment...'}
                        rows={4}
                        className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-primary text-white font-medium py-2 px-6 rounded-md hover:bg-primary-dark transition-colors"
                    >
                      {t.blog?.submitComment || 'Submit Comment'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-neutral-50 p-4 rounded-lg">
                    <p className="text-neutral-700 mb-2">{t.blog?.loginToComment || 'Please login to leave a comment'}</p>
                    <Link 
                      href="/account"
                      className="text-primary font-medium hover:underline"
                    >
                      {t.navigation?.account || 'Account'}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="w-full md:w-1/3">
            {/* Recent posts */}
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
            
            {/* Newsletter signup */}
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
