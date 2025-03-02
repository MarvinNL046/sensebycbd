'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '../../../../utils/supabase/client';
import { Category } from '../../../../types/product';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  AlertCircle,
  Save,
  X
} from 'lucide-react';

interface CategoriesClientProps {
  initialCategories: Category[];
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState<Partial<Category> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    searchTerm === '' || 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Start editing a category
  const handleEdit = (category: Category) => {
    setEditingCategory({ ...category });
    setNewCategory(null);
  };

  // Start creating a new category
  const handleNew = () => {
    setNewCategory({
      name: '',
      slug: '',
      description: '',
      image_url: '',
      translations: {}
    });
    setEditingCategory(null);
  };

  // Cancel editing
  const handleCancel = () => {
    setEditingCategory(null);
    setNewCategory(null);
    setError(null);
  };

  // Handle form input changes for editing
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editingCategory) return;
    
    const { name, value } = e.target;
    setEditingCategory({
      ...editingCategory,
      [name]: value
    });
  };

  // Handle form input changes for new category
  const handleNewChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!newCategory) return;
    
    const { name, value } = e.target;
    setNewCategory({
      ...newCategory,
      [name]: value
    });
  };

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Auto-generate slug when name changes
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean) => {
    const { value } = e.target;
    
    if (isNew && newCategory) {
      setNewCategory({
        ...newCategory,
        name: value,
        slug: generateSlug(value)
      });
    } else if (!isNew && editingCategory) {
      setEditingCategory({
        ...editingCategory,
        name: value,
        slug: generateSlug(value)
      });
    }
  };

  // Save edited category
  const handleSaveEdit = async () => {
    if (!editingCategory) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('categories')
        .update({
          name: editingCategory.name,
          slug: editingCategory.slug,
          description: editingCategory.description,
          image_url: editingCategory.image_url,
          translations: editingCategory.translations
        })
        .eq('id', editingCategory.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setCategories(categories.map(c => 
        c.id === editingCategory.id ? editingCategory : c
      ));
      
      setEditingCategory(null);
    } catch (error: any) {
      console.error('Error updating category:', error);
      setError(error.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  // Save new category
  const handleSaveNew = async () => {
    if (!newCategory || !newCategory.name || !newCategory.slug) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('categories')
        .insert([
          {
            name: newCategory.name,
            slug: newCategory.slug,
            description: newCategory.description || '',
            image_url: newCategory.image_url || '',
            translations: newCategory.translations || {}
          }
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      // Update local state
      if (data && data[0]) {
        setCategories([...categories, data[0]]);
      }
      
      setNewCategory(null);
    } catch (error: any) {
      console.error('Error creating category:', error);
      setError(error.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const handleDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setCategories(categories.filter(c => c.id !== id));
      setDeleteConfirm(null);
    } catch (error: any) {
      console.error('Error deleting category:', error);
      setError(error.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-100 text-red-800 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}
      
      {/* Actions Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <Button onClick={handleNew} disabled={!!newCategory || !!editingCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      
      {/* New Category Form */}
      {newCategory && (
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Add New Category</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newCategory.name}
                onChange={(e) => handleNameChange(e, true)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={newCategory.slug}
                onChange={(e) => handleNewChange(e)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={newCategory.description || ''}
                onChange={(e) => handleNewChange(e)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                id="image_url"
                name="image_url"
                value={newCategory.image_url || ''}
                onChange={(e) => handleNewChange(e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleSaveNew}
                disabled={loading || !newCategory.name || !newCategory.slug}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Edit Category Form */}
      {editingCategory && (
        <Card className="p-6">
          <h2 className="text-lg font-medium mb-4">Edit Category: {editingCategory.name}</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                id="edit-name"
                name="name"
                value={editingCategory.name}
                onChange={(e) => handleNameChange(e, false)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="edit-slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                id="edit-slug"
                name="slug"
                value={editingCategory.slug}
                onChange={(e) => handleEditChange(e)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="edit-description"
                name="description"
                value={editingCategory.description || ''}
                onChange={(e) => handleEditChange(e)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="edit-image_url" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                id="edit-image_url"
                name="image_url"
                value={editingCategory.image_url || ''}
                onChange={(e) => handleEditChange(e)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={handleCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={loading || !editingCategory.name || !editingCategory.slug}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
      
      {/* Categories List */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Slug
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {category.image_url ? (
                        <div className="relative h-12 w-12 rounded overflow-hidden">
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-12 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{category.slug}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {category.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(category)}
                          disabled={!!editingCategory || !!newCategory}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {deleteConfirm === category.id ? (
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setDeleteConfirm(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                              disabled={loading}
                            >
                              {loading ? (
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setDeleteConfirm(category.id)}
                            disabled={!!editingCategory || !!newCategory}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
