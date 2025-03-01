import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '../../../lib/i18n/useTranslation';
import { Product } from '../../../types/product';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { useCart } from '../../../lib/cart-context';

interface ProductInfoProps {
  product: Product;
}

/**
 * Product information component that displays product details and add to cart functionality
 */
export const ProductInfo = ({ product }: ProductInfoProps) => {
  const { t, locale } = useTranslation();
  const { addItem, openCart } = useCart();
  
  // Create a local translations object with fallbacks
  const translations = {
    outOfStock: (t.product as any)?.outOfStock || "Out of Stock",
    lowStock: (t.product as any)?.lowStock || "Low Stock",
    inStock: (t.product as any)?.inStock || "In Stock",
    quantity: (t.product as any)?.quantity || "Quantity",
    addToCart: (t.product as any)?.addToCart || "Add to Cart",
    addedToCart: (t.product as any)?.addedToCart || "Added to Cart",
    viewCart: (t.product as any)?.viewCart || "View Cart"
  };
  
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  // Extract CBD percentage from specifications if available
  const getCbdPercentage = () => {
    if (product.specifications && product.specifications.strength) {
      const strength = product.specifications.strength;
      if (strength.includes('%')) {
        return strength;
      }
    }
    return null;
  };

  // Determine stock status
  const getStockStatus = () => {
    if (product.stock <= 0) {
      return { label: translations.outOfStock, color: 'destructive' };
    } else if (product.stock < 10) {
      return { label: translations.lowStock, color: 'warning' };
    } else {
      return { label: translations.inStock, color: 'success' };
    }
  };

  const stockStatus = getStockStatus();
  const cbdPercentage = getCbdPercentage();

  // Handle quantity change
  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  // Handle add to cart
  const handleAddToCart = () => {
    addItem(product, quantity);
    setAdded(true);
    
    // Reset added state after 3 seconds
    setTimeout(() => {
      setAdded(false);
    }, 3000);
  };

  return (
    <div className="w-full">
      {/* Category */}
      <div className="mb-2">
        <Link
          href={`/products/category/${product.categories?.slug}`}
          className="text-sm text-primary hover:underline"
        >
          {product.categories?.name}
        </Link>
      </div>

      {/* Product name */}
      <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
        {product.name}
      </h1>

      {/* Price */}
      <div className="flex items-center mb-4">
        {product.sale_price ? (
          <>
            <span className="text-2xl font-bold text-primary mr-2">
              {formatPrice(product.sale_price)}
            </span>
            <span className="text-lg text-gray-400 line-through">
              {formatPrice(product.price)}
            </span>
          </>
        ) : (
          <span className="text-2xl font-bold text-primary">
            {formatPrice(product.price)}
          </span>
        )}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant={stockStatus.color as any}>
          {stockStatus.label}
        </Badge>
        
        {cbdPercentage && (
          <Badge variant="info">
            CBD: {cbdPercentage}
          </Badge>
        )}
      </div>

      {/* Description */}
      <div className="mb-6">
        <p className="text-gray-600">{product.description}</p>
      </div>

      {/* Quantity selector */}
      <div className="mb-6">
        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
          {translations.quantity}
        </label>
        <div className="flex items-center">
          <button
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
            min="1"
            max={product.stock}
            className="w-16 h-10 border-y border-gray-300 text-center focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={increaseQuantity}
            disabled={quantity >= product.stock}
            className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to cart button */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={handleAddToCart}
          disabled={product.stock <= 0 || added}
          className={`w-full py-6 text-lg ${added ? 'bg-green-600 hover:bg-green-700' : ''}`}
          variant={added ? "secondary" : "default"}
        >
          {added ? (
            <span className="flex items-center">
              <span className="material-icons mr-2">check</span>
              {translations.addedToCart}
            </span>
          ) : (
            translations.addToCart
          )}
        </Button>
        
        {added && (
          <Button
            onClick={openCart}
            className="w-full py-6 text-lg"
            variant="outline"
          >
            {translations.viewCart}
          </Button>
        )}
      </div>
    </div>
  );
};
