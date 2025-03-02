'use client';

import { useState } from 'react';
import { createClient } from '../../../../utils/supabase/client';
import { Product, Category } from '../../../../types/product';
import { Card } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { AlertCircle, Check } from 'lucide-react';

interface TranslationsClientProps {
  initialProducts: Product[];
  initialCategories: Category[];
}

export default function TranslationsClient({ initialProducts, initialCategories }: TranslationsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedItem, setSelectedItem] = useState<Product | Category | null>(null);
  const [itemType, setItemType] = useState<'product' | 'category'>('product');
  const [translations, setTranslations] = useState<{
    [locale: string]: {
      name?: string;
      description?: string;
    }
  }>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Available locales
  const locales = ['nl', 'de', 'fr'];

  // Handle item selection
  const handleSelectItem = (item: Product | Category, type: 'product' | 'category') => {
    setSelectedItem(item);
    setItemType(type);
    setTranslations(item.translations || {});
    setMessage(null);
  };

  // Handle translation change
  const handleTranslationChange = (locale: string, field: 'name' | 'description', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [locale]: {
        ...prev[locale],
        [field]: value
      }
    }));
  };

  // Save translations
  const handleSaveTranslations = async () => {
    if (!selectedItem) return;
    
    setSaving(true);
    setMessage(null);
    
    try {
      const supabase = createClient();
      const table = itemType === 'product' ? 'products' : 'categories';
      
      const { error } = await supabase
        .from(table)
        .update({ translations })
        .eq('id', selectedItem.id);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      if (itemType === 'product') {
        setProducts(products.map(p => 
          p.id === selectedItem.id ? { ...p, translations } : p
        ));
      } else {
        setCategories(categories.map(c => 
          c.id === selectedItem.id ? { ...c, translations } : c
        ));
      }
      
      setMessage({ type: 'success', text: 'Translations saved successfully!' });
    } catch (error: any) {
      console.error('Error saving translations:', error);
      setMessage({ type: 'error', text: 'Error saving translations. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Item type selector */}
      <div className="mb-8">
        <div className="flex space-x-4">
          <Button
            onClick={() => setItemType('product')}
            variant={itemType === 'product' ? 'default' : 'outline'}
          >
            Products
          </Button>
          <Button
            onClick={() => setItemType('category')}
            variant={itemType === 'category' ? 'default' : 'outline'}
          >
            Categories
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Item list */}
        <Card className="p-6">
          <h2 className="text-xl font-medium mb-4">
            {itemType === 'product' ? 'Products' : 'Categories'}
          </h2>
          
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {itemType === 'product' ? (
              products.length > 0 ? (
                products.map(product => (
                  <div
                    key={product.id}
                    onClick={() => handleSelectItem(product, 'product')}
                    className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                      selectedItem?.id === product.id ? 'bg-primary/10 border border-primary' : ''
                    }`}
                  >
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.slug}</p>
                  </div>
                ))
              ) : (
                <p>No products found.</p>
              )
            ) : (
              categories.length > 0 ? (
                categories.map(category => (
                  <div
                    key={category.id}
                    onClick={() => handleSelectItem(category, 'category')}
                    className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                      selectedItem?.id === category.id ? 'bg-primary/10 border border-primary' : ''
                    }`}
                  >
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-gray-500">{category.slug}</p>
                  </div>
                ))
              ) : (
                <p>No categories found.</p>
              )
            )}
          </div>
        </Card>
        
        {/* Translation editor */}
        <Card className="p-6 md:col-span-2">
          {selectedItem ? (
            <>
              <h2 className="text-xl font-medium mb-4">
                Edit Translations: {selectedItem.name}
              </h2>
              
              {/* Message */}
              {message && (
                <div className="mb-4">
                  {message.type === 'success' ? (
                    <div className="p-4 bg-green-50 border-l-4 border-green-400 rounded-md flex items-start">
                      <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5" />
                      <p className="text-green-700">{message.text}</p>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-md flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                      <p className="text-red-700">{message.text}</p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-2">Original (English):</p>
                <div className="p-4 bg-gray-50 rounded-md mb-4">
                  <p className="font-medium">{selectedItem.name}</p>
                  <p className="text-sm mt-2">{selectedItem.description}</p>
                </div>
              </div>
              
              {/* Translation form */}
              <div className="space-y-6">
                {locales.map(loc => (
                  <div key={loc} className="p-4 border rounded-md">
                    <h3 className="font-medium mb-3 flex items-center">
                      <span className="uppercase mr-2">{loc}</span>
                      {loc === 'nl' && <span>- Dutch</span>}
                      {loc === 'de' && <span>- German</span>}
                      {loc === 'fr' && <span>- French</span>}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          value={translations[loc]?.name || ''}
                          onChange={(e) => handleTranslationChange(loc, 'name', e.target.value)}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                          placeholder={`${selectedItem.name} in ${loc}`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={translations[loc]?.description || ''}
                          onChange={(e) => handleTranslationChange(loc, 'description', e.target.value)}
                          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent h-24"
                          placeholder={`${selectedItem.description} in ${loc}`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Save button */}
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleSaveTranslations}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Translations'}
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Select an item from the list to edit translations
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
