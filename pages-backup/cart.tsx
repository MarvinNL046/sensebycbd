import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { SEO } from '../lib/seo/SEO';
import { useTranslation } from '../lib/i18n/useTranslation';
import { useCart } from '../lib/cart-context';
import { Button } from '../components/ui/button';

/**
 * Cart page component
 */
export default function CartPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { state, removeItem, updateQuantity, getCartTotal, getCartCount } = useCart();
  const { items } = state;
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  
  // Create a local translation object with the necessary properties
  const translations = {
    cart: {
      title: "Shopping Cart",
      empty: "Your cart is empty",
      continueShopping: "Continue Shopping",
      product: "Product",
      price: "Price",
      quantity: "Quantity",
      total: "Total",
      remove: "Remove",
      subtotal: "Subtotal",
      shipping: "Shipping",
      shippingFree: "Free",
      couponCode: "Coupon Code",
      applyCoupon: "Apply",
      invalidCoupon: "Invalid coupon code",
      estimatedTotal: "Estimated Total",
      checkout: "Proceed to Checkout",
      backToShopping: "Continue Shopping"
    }
  };
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };
  
  // Handle coupon code application
  const handleApplyCoupon = () => {
    // This would be implemented with a real coupon system
    // For now, just show an error
    setCouponError(translations.cart.invalidCoupon);
    setTimeout(() => setCouponError(null), 3000);
  };
  
  // Calculate shipping cost (free over €50)
  const subtotal = getCartTotal();
  const shippingCost = subtotal > 50 ? 0 : 4.95;
  const total = subtotal + shippingCost;
  
  // If cart is empty, show empty state
  if (items.length === 0) {
    return (
      <div className="container-custom py-12">
        <SEO 
          title="Cart | SenseBy CBD"
          description="Your shopping cart"
          keywords="cart, shopping cart, checkout"
          canonicalPath="/cart"
        />
        
        <h1 className="text-3xl font-heading font-bold mb-8 text-center">
          {translations.cart.title}
        </h1>
        
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="text-6xl mb-4">🛒</div>
          <p className="text-xl text-gray-600 mb-6">{translations.cart.empty}</p>
          <Link href="/products">
            <Button className="px-8 py-6">
              {translations.cart.continueShopping}
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-12">
      <SEO 
        title="Cart | SenseBy CBD"
        description="Your shopping cart"
        keywords="cart, shopping cart, checkout"
        canonicalPath="/cart"
      />
      
      <h1 className="text-3xl font-heading font-bold mb-8 text-center">
        {translations.cart.title}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b">
              <div className="col-span-6 font-medium">{translations.cart.product}</div>
              <div className="col-span-2 font-medium text-center">{translations.cart.price}</div>
              <div className="col-span-2 font-medium text-center">{translations.cart.quantity}</div>
              <div className="col-span-2 font-medium text-right">{translations.cart.total}</div>
            </div>
            
            {/* Cart items */}
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id} className="p-4 md:grid md:grid-cols-12 md:gap-4 md:items-center">
                  {/* Product info */}
                  <div className="col-span-6 flex items-center mb-4 md:mb-0">
                    <div className="w-20 h-20 relative flex-shrink-0">
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        sizes="80px"
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">
                        <Link href={`/products/${item.product.slug}`} className="hover:text-primary">
                          {item.product.name}
                        </Link>
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-sm text-red-500 hover:text-red-700 mt-1"
                      >
                        {translations.cart.remove}
                      </button>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="col-span-2 text-center mb-2 md:mb-0">
                    <div className="md:hidden text-sm text-gray-500 mb-1">{translations.cart.price}</div>
                    {item.product.sale_price ? (
                      <div>
                        <span className="text-primary font-medium">
                          {formatPrice(item.product.sale_price)}
                        </span>
                        <span className="line-through text-sm text-gray-400 ml-2">
                          {formatPrice(item.product.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-700">
                        {formatPrice(item.product.price)}
                      </span>
                    )}
                  </div>
                  
                  {/* Quantity */}
                  <div className="col-span-2 flex justify-center mb-2 md:mb-0">
                    <div className="md:hidden text-sm text-gray-500 mb-1 mr-2">{translations.cart.quantity}</div>
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
                  
                  {/* Total */}
                  <div className="col-span-2 text-right">
                    <div className="md:hidden text-sm text-gray-500 mb-1">{translations.cart.total}</div>
                    <span className="font-medium">
                      {formatPrice((item.product.sale_price || item.product.price) * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-heading font-bold mb-4">
              {translations.cart.estimatedTotal}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span>{translations.cart.subtotal}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>{translations.cart.shipping}</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-500">{translations.cart.shippingFree}</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              
              {/* Coupon code input */}
              <div className="pt-4 border-t">
                <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.cart.couponCode}
                </label>
                <div className="flex">
                  <input
                    type="text"
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-r-md hover:bg-gray-300"
                  >
                    {translations.cart.applyCoupon}
                  </button>
                </div>
                {couponError && (
                  <p className="text-red-500 text-sm mt-1">{couponError}</p>
                )}
              </div>
              
              <div className="flex justify-between pt-4 border-t text-xl font-bold">
                <span>{translations.cart.total}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            
            <Link href="/checkout" className="w-full">
              <Button className="w-full py-6">
                {translations.cart.checkout}
              </Button>
            </Link>
            
            <Link href="/products" className="block text-center mt-4 text-primary hover:text-primary-dark">
              {translations.cart.backToShopping}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
