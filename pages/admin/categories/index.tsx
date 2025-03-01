import { useState, useEffect } from 'react';
import AdminLayout from '../../../components/admin/AdminLayout';
import { supabase } from '../../../lib/supabase';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  translations: Record<string, any> | null;
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: '',
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [deleteCategory, setDeleteCategory] = useState<Category | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Available locales for translations
  const locales = ['nl', 'de', 'fr'];
  const [translations, setTranslations] = useState<Record<string, { name?: string; description?: string }>>({});

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('name');
        
        if (error) {
          throw error;
        }
        
        setCategories(data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCategories();
  }, []);

  // Filter categories based on search term
  const filteredCategories = categories.filter(category => 
    searchTerm === '' || 
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Auto-generate slug from name if slug is empty
    if (name === 'name' && (!formData.slug || formData.slug === '')) {
      setFormData(prev => ({
        ...prev,
        slug: value.toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
      }));
    }
  };

  // Handle translation changes
  const handleTranslationChange = (locale: string, field: 'name' | 'description', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [locale]: {
        ...(prev[locale] || {}),
        [field]: value
      }
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      image_url: '',
    });
    setTranslations({});
    setFormError('');
    setFormSuccess('');
  };

  // Open edit form
  const openEditForm = (category: Category) => {
    setCurrentCategory(category);
    setFormData({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      image_url: category.image_url || '',
    });
    setTranslations(category.translations || {});
    setShowEditForm(true);
    setFormError('');
    setFormSuccess('');
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    
    try {
      // Validate form
      if (!formData.name || !formData.slug) {
        throw new Error('Name and slug are required');
      }
      
      const categoryData = {
        ...formData,
        translations
      };
      
      if (showEditForm && currentCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', currentCategory.id);
        
        if (error) {
          throw error;
        }
        
        // Update local state
        setCategories(categories.map(c => 
          c.id === currentCategory.id ? { ...c, ...categoryData } : c
        ));
        
        setFormSuccess('Category updated successfully!');
        
        // Close form after a delay
        setTimeout(() => {
          setShowEditForm(false);
          resetForm();
        }, 2000);
      } else {
        // Create new category
        const { data, error } = await supabase
          .from('categories')
          .insert([categoryData])
          .select();
        
        if (error) {
          throw error;
        }
        
        // Update local state
        if (data && data.length > 0) {
          setCategories([...categories, data[0]]);
        }
        
        setFormSuccess('Category created successfully!');
        
        // Close form after a delay
        setTimeout(() => {
          setShowAddForm(false);
          resetForm();
        }, 2000);
      }
    } catch (err: any) {
      setFormError(err.message || 'An error occurred');
    }
  };

  // Handle delete category
  const handleDeleteCategory = async () => {
    if (!deleteCategory) return;
    
    try {
      setDeleteError('');
      
      // Check if category has products
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category_id', deleteCategory.id);
      
      if (countError) {
        throw countError;
      }
      
      if (count && count > 0) {
        throw new Error(`Cannot delete category with ${count} products. Please reassign or delete these products first.`);
      }
      
      // Delete category
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', deleteCategory.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setCategories(categories.filter(c => c.id !== deleteCategory.id));
      setShowDeleteConfirm(false);
      setDeleteCategory(null);
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setDeleteError(err.message || 'Failed to delete category');
    }
  };

  return (
    <AdminLayout title="Categories Management">
      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <Button 
          onClick={() => {
            resetForm();
            setShowAddForm(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>
      
      {/* Categories List */}
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
                    Translations
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
                          <div className="relative h-10 w-10 rounded overflow-hidden">
                            <Image
                              src={category.image_url}
                              alt={category.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-500">
                            <span className="text-xs">No img</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.slug}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {category.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.translations ? (
                          <div className="flex space-x-1">
                            {Object.keys(category.translations).map(locale => (
                              <span 
                                key={locale} 
                                className="px-2 py-1 bg-gray-100 rounded text-xs uppercase"
                                title={`${locale}: ${category.translations?.[locale]?.name || ''}`}
                              >
                                {locale}
                              </span>
                            ))}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openEditForm(category)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setDeleteCategory(category);
                              setShowDeleteConfirm(true);
                              setDeleteError('');
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No categories found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      
      {/* Add/Edit Category Modal */}
      {(showAddForm || showEditForm) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {showEditForm ? 'Edit Category' : 'Add New Category'}
              </h3>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setShowAddForm(false);
                  setShowEditForm(false);
                  resetForm();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Error and Success Messages */}
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-800 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{formError}</p>
              </div>
            )}
            
            {formSuccess && (
              <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-md flex items-start">
                <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <p>{formSuccess}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Used in the URL: /products/category/{formData.slug}
                  </p>
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
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
                    value={formData.image_url}
                    onChange={handleChange}
                    className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              
              {/* Translations */}
              <div>
                <h4 className="font-medium mb-2">Translations</h4>
                
                <div className="space-y-4">
                  {locales.map(locale => (
                    <div key={locale} className="p-4 border rounded-md">
                      <h5 className="font-medium mb-2 flex items-center">
                        <span className="uppercase mr-2">{locale}</span>
                        {locale === 'nl' && <span>- Dutch</span>}
                        {locale === 'de' && <span>- German</span>}
                        {locale === 'fr' && <span>- French</span>}
                      </h5>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={translations[locale]?.name || ''}
                            onChange={(e) => handleTranslationChange(locale, 'name', e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder={formData.name}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={translations[locale]?.description || ''}
                            onChange={(e) => handleTranslationChange(locale, 'description', e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent h-20"
                            placeholder={formData.description}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setShowEditForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {showEditForm ? 'Update Category' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Delete</h3>
            <p className="mb-4">
              Are you sure you want to delete the category &quot;{deleteCategory?.name}&quot;? This action cannot be undone.
            </p>
            
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
                  setDeleteCategory(null);
                  setDeleteError('');
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteCategory}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
