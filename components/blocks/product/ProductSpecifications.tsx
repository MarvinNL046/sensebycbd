import { useTranslation } from '../../../lib/i18n/useTranslation';
import { Product } from '../../../types/product';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';

interface ProductSpecificationsProps {
  product: Product;
}

/**
 * Product specifications component that displays product details in a tabbed interface
 */
export const ProductSpecifications = ({ product }: ProductSpecificationsProps) => {
  const { t } = useTranslation();
  
  // Create a local translation object with the necessary properties
  // This is a workaround for TypeScript errors with the translation object
  const translations = {
    description: "Description",
    specifications: "Specifications",
    reviews: "Reviews",
    strength: "Strength",
    volume: "Volume",
    count: "Count",
    ingredients: "Ingredients",
    usage: "Usage Instructions"
  };

  // Format specifications for display
  const formatSpecifications = () => {
    if (!product.specifications) return null;

    const specs = product.specifications;
    
    return (
      <div className="space-y-4">
        {specs.strength && (
          <div>
            <h4 className="font-medium text-gray-700">{translations.strength}</h4>
            <p>{specs.strength}</p>
          </div>
        )}
        
        {specs.volume && (
          <div>
            <h4 className="font-medium text-gray-700">{translations.volume}</h4>
            <p>{specs.volume}</p>
          </div>
        )}
        
        {specs.count && (
          <div>
            <h4 className="font-medium text-gray-700">{translations.count}</h4>
            <p>{specs.count}</p>
          </div>
        )}
        
        {specs.ingredients && (
          <div>
            <h4 className="font-medium text-gray-700">{translations.ingredients}</h4>
            <p>{specs.ingredients}</p>
          </div>
        )}
        
        {specs.usage && (
          <div>
            <h4 className="font-medium text-gray-700">{translations.usage}</h4>
            <p>{specs.usage}</p>
          </div>
        )}
        
        {/* Display any additional specifications */}
        {Object.entries(specs).map(([key, value]) => {
          // Skip the ones we've already handled
          if (['strength', 'volume', 'count', 'ingredients', 'usage'].includes(key)) {
            return null;
          }
          
          return (
            <div key={key}>
              <h4 className="font-medium text-gray-700">{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
              <p>{value}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="w-full mt-8">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="w-full border-b mb-4">
          <TabsTrigger value="description" className="flex-1">
            {translations.description}
          </TabsTrigger>
          <TabsTrigger value="specifications" className="flex-1">
            {translations.specifications}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="py-4">
          <div className="prose max-w-none">
            <p>{product.description}</p>
          </div>
        </TabsContent>
        
        <TabsContent value="specifications" className="py-4">
          {formatSpecifications()}
        </TabsContent>
      </Tabs>
    </div>
  );
};
