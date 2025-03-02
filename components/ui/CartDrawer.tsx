import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../lib/cart-context';
import { Button } from './button';
import { useTranslation } from '../../lib/useTranslation';

/**
 * Cart drawer component that slides in from the right
 */
export const CartDrawer = () => {
  const { t } = useTranslation();
  const { state, closeCart, removeItem, updateQuantity, getCartTotal, getCartCount } = useCart();
  const { items, isOpen } = state;
  const drawerRef = useRef<HTMLDivElement>(null);
  
  // Create a local translation object with the necessary properties
  const translations = {
    cart: {
      title: "Your Cart",
      empty: "Your cart is empty",
      continueShopping: "Continue Shopping",
      subtotal: "Subtotal",
      shipping: "Shipping",
      total: "Total",
      checkout: "Checkout",
      remove: "Remove",
      update: "Update"
    }
  };
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };
  
  // Handle click outside to close drawer
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        closeCart();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, closeCart]);
  
  // Prevent body scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  // Calculate shipping cost (free over €50)
  const subtotal = getCartTotal();
  const shippingCost = subtotal > 50 ? 0 : 4.95;
  const total = subtotal + shippingCost;
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
      <div 
        ref={drawerRef}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out"
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-heading font-bold">
            {translations.cart.title} ({getCartCount()})
          </h2>
          <button 
            onClick={closeCart}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close cart"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        {/* Cart items */}
        <div className="flex-1 overflow-y-auto p-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {items.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">{translations.cart.empty}</p>
              <Button variant="outline" onClick={closeCart}>
                {translations.cart.continueShopping}
              </Button>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex border-b pb-4">
                  {/* Product image */}
                  <div className="w-20 h-20 relative flex-shrink-0">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      className="object-cover rounded"
                    />
                  </div>
                  
                  {/* Product details */}
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 hover:text-red-500"
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        <span className="material-icons text-sm">close</span>
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-500 mb-2">
                      {item.product.sale_price ? (
                        <>
                          <span className="text-primary font-medium">
                            {formatPrice(item.product.sale_price)}
                          </span>
                          <span className="line-through ml-2">
                            {formatPrice(item.product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="text-primary font-medium">
                          {formatPrice(item.product.price)}
                        </span>
                      )}
                    </p>
                    
                    {/* Quantity controls */}
                    <div className="flex items-center">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-l text-gray-500 hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                        className="w-12 h-8 border-y border-gray-300 text-center focus:outline-none"
                      />
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded-r text-gray-500 hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Footer with totals and checkout button */}
        {items.length > 0 && (
          <div className="border-t p-4 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>{translations.cart.subtotal}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{translations.cart.shipping}</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-500">Free</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>{translations.cart.total}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            
            <Link href="/checkout" className="w-full">
              <Button className="w-full py-6">
                {translations.cart.checkout}
              </Button>
            </Link>
            
            <button
              onClick={closeCart}
              className="w-full text-center mt-4 text-primary hover:text-primary-dark"
            >
              {translations.cart.continueShopping}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
