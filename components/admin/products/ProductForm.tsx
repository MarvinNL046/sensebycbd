import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { supabase } from '../../../lib/supabase';
import { supabaseAdmin } from '../../../lib/supabase-utils';
import { Product } from '../../../types/product';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { 
  Save, 
  ArrowLeft, 
  Upload, 
  Trash2, 
  Plus, 
  Minus,
  AlertCircle,
  Check
} from 'lucide-react';

interface ProductFormProps {
  product?: Product;
  isEditing?: boolean;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  stock: number;
  category_id: string;
  image_url: string;
  additional_images: string[];
  specifications: Record<string, any>;
  is_featured: boolean;
  translations: Record<string, any>;
}

export default function ProductForm({ product, isEditing = false }: ProductFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    slug: '',
    description: '',
    price: 0,
    sale_price: null,
    stock: 0,
    category_id: '',
    image_url: '',
    additional_images: [],
    specifications: {},
    is_featured: false,
    translations: {}
  });
  
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalImageFiles, setAdditionalImageFiles] = useState<File[]>([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  const [specs, setSpecs] = useState<{key: string, value: string}[]>([{ key: '', value: '' }]);
  
  // Available locales for translations
  const locales = ['nl', 'de', 'fr'];
  
  // Initialize form data from product if editing
  useEffect(() => {
    if (isEditing && product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price || 0,
        sale_price: product.sale_price || null,
        stock: product.stock || 0,
        category_id: product.category_id || '',
        image_url: product.image_url || '',
        additional_images: product.additional_images || [],
        specifications: product.specifications || {},
        is_featured: product.is_featured || false,
        translations: product.translations || {}
      });
      
      // Initialize specifications
      if (product.specifications) {
        const specEntries = Object.entries(product.specifications).map(([key, value]) => ({
          key,
          value: value as string
        }));
        
        setSpecs(specEntries.length > 0 ? specEntries : [{ key: '', value: '' }]);
      }
      
      // Set image preview
      if (product.image_url) {
        setImagePreview(product.image_url);
      }
      
      // Set additional image previews
      if (product.additional_images && product.additional_images.length > 0) {
        setAdditionalImagePreviews(product.additional_images);
      }
    }
  }, [isEditing, product]);
  
  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase
        .from('categories')
        .select('id, name')
        .order('name');
      
      setCategories(data || []);
    }
    
    fetchCategories();
  }, []);
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: value === '' ? null : parseFloat(value)
      });
    } else if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: target.checked
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
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
  
  // Handle main image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle additional images upload
  const handleAdditionalImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setAdditionalImageFiles(prev => [...prev, ...files]);
      
      // Create previews
      const newPreviews: string[] = [];
      
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target) {
            newPreviews.push(event.target.result as string);
            if (newPreviews.length === files.length) {
              setAdditionalImagePreviews(prev => [...prev, ...newPreviews]);
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };
  
  // Remove additional image
  const removeAdditionalImage = (index: number) => {
    if (isEditing) {
      // If editing, we need to update the formData.additional_images array
      const newAdditionalImages = [...formData.additional_images];
      newAdditionalImages.splice(index, 1);
      setFormData({
        ...formData,
        additional_images: newAdditionalImages
      });
    }
    
    // Update previews
    const newPreviews = [...additionalImagePreviews];
    newPreviews.splice(index, 1);
    setAdditionalImagePreviews(newPreviews);
    
    // Update files if it's a new file
    if (index < additionalImageFiles.length) {
      const newFiles = [...additionalImageFiles];
      newFiles.splice(index, 1);
      setAdditionalImageFiles(newFiles);
    }
  };
  
  // Handle specifications changes
  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = value;
    setSpecs(newSpecs);
  };
  
  // Add new specification field
  const addSpecField = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };
  
  // Remove specification field
  const removeSpecField = (index: number) => {
    const newSpecs = [...specs];
    newSpecs.splice(index, 1);
    setSpecs(newSpecs);
  };
  
  // Handle translation changes
  const handleTranslationChange = (locale: string, field: 'name' | 'description', value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [locale]: {
          ...(prev.translations[locale] || {}),
          [field]: value
        }
      }
    }));
  };
  
  // Upload image to Supabase Storage via API endpoint
  const uploadImage = async (file: File, path: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${path}/${fileName}`;
    
    try {
      // Create a FormData object
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', 'products');
      formData.append('path', filePath);
      
      // Send the file to our API endpoint
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error uploading image');
      }
      
      const data = await response.json();
      return data.url;
    } catch (error: any) {
      console.error('Upload error:', error);
      throw new Error(`Error uploading image: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Validate form
      if (!formData.name || !formData.slug || !formData.description || formData.price <= 0) {
        throw new Error('Please fill in all required fields');
      }
      
      // Prepare data
      const productData = {
        ...formData,
        specifications: specs.reduce((acc, { key, value }) => {
          if (key && value) {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, string>)
      };
      
      // Upload main image if changed
      if (imageFile) {
        const imageUrl = await uploadImage(imageFile, 'main');
        productData.image_url = imageUrl;
      }
      
      // Upload additional images if added
      if (additionalImageFiles.length > 0) {
        const additionalImageUrls = await Promise.all(
          additionalImageFiles.map(file => uploadImage(file, 'additional'))
        );
        
        if (isEditing) {
          // Combine existing and new images
          productData.additional_images = [
            ...formData.additional_images,
            ...additionalImageUrls
          ];
        } else {
          productData.additional_images = additionalImageUrls;
        }
      }
      
      // Save to database
      if (isEditing && product) {
        const { error: updateError } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        
        if (updateError) {
          throw new Error(`Error updating product: ${updateError.message}`);
        }
        
        setSuccess('Product updated successfully!');
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert([productData]);
        
        if (insertError) {
          throw new Error(`Error creating product: ${insertError.message}`);
        }
        
        setSuccess('Product created successfully!');
        
        // Reset form if adding new product
        if (!isEditing) {
          setFormData({
            name: '',
            slug: '',
            description: '',
            price: 0,
            sale_price: null,
            stock: 0,
            category_id: '',
            image_url: '',
            additional_images: [],
            specifications: {},
            is_featured: false,
            translations: {}
          });
          setImageFile(null);
          setImagePreview(null);
          setAdditionalImageFiles([]);
          setAdditionalImagePreviews([]);
          setSpecs([{ key: '', value: '' }]);
        }
      }
      
      // Redirect to products list after a short delay
      setTimeout(() => {
        router.push('/admin/products');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Back Button */}
      <div>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/admin/products')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-md flex items-start">
          <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
          <p className="text-green-700">{success}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Information */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name <span className="text-red-500">*</span>
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
              
              {/* Slug */}
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
                  Used in the URL: /products/{formData.slug}
                </p>
              </div>
              
              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
            </div>
          </Card>
          
          {/* Pricing and Inventory */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Pricing & Inventory</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Regular Price */}
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Regular Price (€) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>
              
              {/* Sale Price */}
              <div>
                <label htmlFor="sale_price" className="block text-sm font-medium text-gray-700 mb-1">
                  Sale Price (€)
                </label>
                <input
                  type="number"
                  id="sale_price"
                  name="sale_price"
                  value={formData.sale_price || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              {/* Stock */}
              <div>
                <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
              
              {/* Featured */}
              <div className="flex items-center h-full">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="is_featured" className="ml-2 block text-sm text-gray-700">
                  Featured Product
                </label>
              </div>
            </div>
          </Card>
          
          {/* Specifications */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Specifications</h2>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={addSpecField}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Specification
              </Button>
            </div>
            
            <div className="space-y-3">
              {specs.map((spec, index) => (
                <div key={index} className="flex gap-3">
                  <input
                    type="text"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                    placeholder="Name (e.g. Weight)"
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="text"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                    placeholder="Value (e.g. 100g)"
                    className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeSpecField(index)}
                    disabled={specs.length === 1}
                  >
                    <Minus className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
          
          {/* Translations */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Translations</h2>
            
            <div className="space-y-6">
              {locales.map(locale => (
                <div key={locale} className="p-4 border rounded-md">
                  <h3 className="font-medium mb-3 flex items-center">
                    <span className="uppercase mr-2">{locale}</span>
                    {locale === 'nl' && <span>- Dutch</span>}
                    {locale === 'de' && <span>- German</span>}
                    {locale === 'fr' && <span>- French</span>}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={formData.translations[locale]?.name || ''}
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
                        value={formData.translations[locale]?.description || ''}
                        onChange={(e) => handleTranslationChange(locale, 'description', e.target.value)}
                        className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent h-24"
                        placeholder={formData.description}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Category */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Category</h2>
            
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                Select Category
              </label>
              <select
                id="category_id"
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </Card>
          
          {/* Main Image */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Main Image</h2>
            
            {imagePreview ? (
              <div className="mb-4">
                <div className="relative h-48 w-full mb-2">
                  <Image
                    src={imagePreview}
                    alt="Product preview"
                    fill
                    className="object-contain"
                  />
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                    if (!isEditing) {
                      setFormData({...formData, image_url: ''});
                    }
                  }}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="mb-4 border-2 border-dashed border-gray-300 p-6 text-center rounded-md">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">
                  Click to upload or drag and drop
                </p>
              </div>
            )}
            
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
            />
          </Card>
          
          {/* Additional Images */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Additional Images</h2>
            
            <div className="grid grid-cols-2 gap-2 mb-4">
              {additionalImagePreviews.map((preview, index) => (
                <div key={index} className="relative">
                  <div className="relative h-24 w-full">
                    <Image
                      src={preview}
                      alt={`Additional image ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAdditionalImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
            
            <input
              type="file"
              id="additional_images"
              accept="image/*"
              multiple
              onChange={handleAdditionalImagesChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
            />
          </Card>
          
          {/* Save Button */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {isEditing ? 'Update Product' : 'Create Product'}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
