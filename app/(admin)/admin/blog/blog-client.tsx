'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '../../../../utils/supabase/client';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { 
  Search, 
  Filter, 
  ArrowUpDown,
  Plus,
  Pencil,
  Trash2,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
  category_id: string | null;
  author_id: string | null;
  blog_categories: any; // Using any to avoid TypeScript issues
  users: any; // Using any to avoid TypeScript issues
}

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
}

interface BlogClientProps {
  initialPosts: BlogPost[];
  initialCategories: BlogCategory[];
}

export default function BlogClient({ initialPosts, initialCategories }: BlogClientProps) {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [categories, setCategories] = useState(initialCategories);
  const [sortField, setSortField] = useState<'title' | 'created_at' | 'published_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Refresh posts
  const refreshPosts = useCallback(async () => {
    setLoading(true);
    
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('blog_posts')
        .select(`
          id, 
          title, 
          slug, 
          excerpt, 
          published, 
          published_at, 
          created_at,
          category_id,
          author_id,
          blog_categories (id, name),
          users (id, full_name)
        `)
        .order(sortField, { ascending: sortDirection === 'asc' });
      
      if (error) {
        throw error;
      }
      
      // Cast the data to the correct type
      setPosts((data || []) as BlogPost[]);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  }, [sortField, sortDirection]);

  // Effect to refresh posts when sort changes
  useEffect(() => {
    refreshPosts();
  }, [sortField, sortDirection, refreshPosts]);

  // Filter posts based on search term, category, and published status
  const filteredPosts = posts.filter(post => {
    const matchesSearch = searchTerm === '' || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt && post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = categoryFilter === '' || 
      post.category_id === categoryFilter;
    
    const matchesPublished = 
      publishedFilter === 'all' || 
      (publishedFilter === 'published' && post.published) || 
      (publishedFilter === 'draft' && !post.published);
    
    return matchesSearch && matchesCategory && matchesPublished;
  });

  // Handle sort
  const handleSort = (field: 'title' | 'created_at' | 'published_at') => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Handle toggle published status
  const handleTogglePublished = async (postId: string, currentStatus: boolean) => {
    setActionLoading(true);
    
    try {
      const supabase = createClient();
      const updateData = {
        published: !currentStatus,
        published_at: !currentStatus ? new Date().toISOString() : null
      };
      
      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);
      
      if (error) {
        throw error;
      }
      
      // Update post in state
      setPosts(posts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              published: !currentStatus,
              published_at: !currentStatus ? new Date().toISOString() : null
            } 
          : post
      ));
    } catch (error: any) {
      console.error('Error updating post published status:', error);
      alert(`Fout bij het bijwerken van publicatiestatus: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!deletePostId) return;
    
    setActionLoading(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', deletePostId);
      
      if (error) {
        throw error;
      }
      
      // Remove post from state
      setPosts(posts.filter(post => post.id !== deletePostId));
      setShowDeleteConfirm(false);
      setDeletePostId(null);
    } catch (error: any) {
      console.error('Error deleting post:', error);
      setDeleteError(error.message || 'Fout bij het verwijderen van blogpost');
    } finally {
      setActionLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    
    return new Date(dateString).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Zoek blogposts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          
          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
            >
              <option value="">Alle Categorieën</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Published Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={publishedFilter}
              onChange={(e) => setPublishedFilter(e.target.value as 'all' | 'published' | 'draft')}
              className="pl-10 pr-4 py-2 border rounded-md w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
            >
              <option value="all">Alle Posts</option>
              <option value="published">Gepubliceerd</option>
              <option value="draft">Concept</option>
            </select>
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          {/* Refresh Button */}
          <Button 
            onClick={refreshPosts}
            disabled={loading}
            variant="outline"
            className="w-full md:w-auto"
          >
            {loading ? 'Laden...' : 'Vernieuwen'}
          </Button>
          
          {/* Add Post Button */}
          <Link href="/admin/blog/new">
            <Button className="w-full md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Nieuwe Blogpost
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Blog Posts Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Titel
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categorie
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Auteur
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('published_at')}
                  >
                    <div className="flex items-center">
                      Gepubliceerd op
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('created_at')}
                  >
                    <div className="flex items-center">
                      Aangemaakt op
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acties
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPosts.length > 0 ? (
                  filteredPosts.map((post) => (
                    <tr key={post.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{post.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{post.excerpt || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.blog_categories?.name || 'Geen categorie'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {post.users?.full_name || 'Onbekend'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {post.published ? 'Gepubliceerd' : 'Concept'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(post.published_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(post.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/blog/${post.slug}`} target="_blank">
                            <Button variant="ghost" size="sm" title="Bekijk post">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/blog/${post.id}`}>
                            <Button variant="ghost" size="sm" title="Bewerk post">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleTogglePublished(post.id, post.published)}
                            disabled={actionLoading}
                            title={post.published ? "Zet als concept" : "Publiceer"}
                          >
                            {post.published ? (
                              <XCircle className="h-4 w-4 text-yellow-500" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setDeletePostId(post.id);
                              setShowDeleteConfirm(true);
                            }}
                            disabled={actionLoading}
                            title="Verwijder post"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      Geen blogposts gevonden
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Bevestig Verwijderen</h3>
            <p className="mb-4">Weet je zeker dat je deze blogpost wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.</p>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{deleteError}</p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePostId(null);
                  setDeleteError('');
                }}
                disabled={actionLoading}
              >
                Annuleren
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeletePost}
                disabled={actionLoading}
              >
                {actionLoading ? 'Bezig...' : 'Verwijderen'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
