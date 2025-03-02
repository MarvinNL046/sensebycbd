'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { SEO } from '../components/SEO';
import { useTranslation } from '../lib/useTranslation';
import { useCart } from '../../lib/cart-context';
import { useAuth } from '../../lib/auth-context';
import { createOrder } from '../../lib/db';
import { Button } from '../../components/ui/button';

// Checkout steps
type CheckoutStep = 'information' | 'shipping' | 'payment' | 'confirmation';

/**
 * Checkout client component
 */
export default function CheckoutClient() {
  const { locale } = useTranslation();
  const { state, getCartTotal, getCartCount, clearCart } = useCart();
  const { user } = useAuth();
  const { items } = state;
  
  // State for checkout process
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('information');
  const [email, setEmail] = useState(user?.email || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Netherlands');
  const [phone, setPhone] = useState('');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [saveInfo, setSaveInfo] = useState(false);
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  
  // Create a local translation object with the necessary properties
  const translations = {
    checkout: {
      title: "Checkout",
      steps: {
        information: "Information",
        shipping: "Shipping",
        payment: "Payment",
        confirmation: "Confirmation"
      },
      contactInformation: "Contact Information",
      email: "Email",
      shippingAddress: "Shipping Address",
      firstName: "First Name",
      lastName: "Last Name",
      address: "Address",
      city: "City",
      postalCode: "Postal Code",
      country: "Country",
      phone: "Phone (optional)",
      saveInfo: "Save this information for next time",
      shippingMethod: "Shipping Method",
      standard: "Standard Shipping",
      express: "Express Shipping",
      free: "Free",
      days: "days",
      paymentMethod: "Payment Method",
      creditCard: "Credit Card",
      paypal: "PayPal",
      ideal: "iDEAL",
      orderSummary: "Order Summary",
      subtotal: "Subtotal",
      shipping: "Shipping",
      total: "Total",
      continueShopping: "Continue Shopping",
      continueToShipping: "Continue to Shipping",
      continueToPayment: "Continue to Payment",
      placeOrder: "Place Order",
      processing: "Processing...",
      backToCart: "Back to Cart",
      backToInformation: "Back to Information",
      backToShipping: "Back to Shipping",
      orderConfirmation: "Order Confirmation",
      orderComplete: "Your order has been placed!",
      orderNumber: "Order Number",
      orderDetails: "Order Details",
      thankYou: "Thank you for your order!",
      emailConfirmation: "We've sent a confirmation email to",
      viewOrder: "View Order",
      emptyCart: "Your cart is empty",
      returnToShop: "Return to Shop"
    }
  };
  
  // Format price with currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };
  
  // Calculate shipping cost (free over €50)
  const subtotal = getCartTotal();
  const shippingCost = shippingMethod === 'express' ? 9.95 : (subtotal > 50 ? 0 : 4.95);
  const total = subtotal + shippingCost;
  
  // Handle form submission for each step
  const handleInformationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('shipping');
  };
  
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep('payment');
  };
  
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderProcessing(true);
    
    try {
      // Prepare shipping info
      const shippingInfo = {
        firstName,
        lastName,
        address,
        city,
        postalCode,
        country,
        phone,
        email,
      };
      
      // Prepare payment info
      const paymentInfo = {
        method: paymentMethod,
        // In a real app, you would include more payment details
      };
      
      // Create order in database
      const { data: order, error } = await createOrder(
        user?.id || null, // Pass user ID if logged in
        items,
        shippingInfo,
        paymentInfo,
        total
      );
      
      if (error) {
        throw error;
      }
      
      // Set order number from the created order
      setOrderNumber(order.id.slice(0, 8));
      
      // Clear the cart
      clearCart();
      
      // Set order complete
      setOrderComplete(true);
      setCurrentStep('confirmation');
    } catch (error: any) {
      console.error('Error processing order:', error);
      alert(`Error processing order: ${error.message || 'Unknown error'}`);
    } finally {
      setOrderProcessing(false);
    }
  };
  
  // If cart is empty and not on confirmation step, redirect to cart
  if (items.length === 0 && currentStep !== 'confirmation' && !orderComplete) {
    return (
      <div className="container-custom py-12">
        <SEO 
          title="Checkout | SenseBy CBD"
          description="Complete your purchase"
          keywords="checkout, payment, order"
          canonicalPath="/checkout"
        />
        
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="text-6xl mb-4">🛒</div>
          <h1 className="text-2xl font-heading font-bold mb-4">{translations.checkout.emptyCart}</h1>
          <p className="text-gray-600 mb-6">You need to add items to your cart before checking out.</p>
          <Link href="/products">
            <Button className="px-8 py-6">
              {translations.checkout.returnToShop}
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-12">
      <SEO 
        title="Checkout | SenseBy CBD"
        description="Complete your purchase"
        keywords="checkout, payment, order"
        canonicalPath="/checkout"
      />
      
      {/* Checkout header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-heading font-bold mb-6">
          {translations.checkout.title}
        </h1>
        
        {/* Checkout steps */}
        {!orderComplete && (
          <div className="flex justify-center items-center mb-8">
            <div className={`flex flex-col items-center ${currentStep === 'information' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentStep === 'information' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <span className="text-sm">{translations.checkout.steps.information}</span>
            </div>
            
            <div className="w-12 h-0.5 bg-gray-200 mx-2"></div>
            
            <div className={`flex flex-col items-center ${currentStep === 'shipping' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentStep === 'shipping' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <span className="text-sm">{translations.checkout.steps.shipping}</span>
            </div>
            
            <div className="w-12 h-0.5 bg-gray-200 mx-2"></div>
            
            <div className={`flex flex-col items-center ${currentStep === 'payment' ? 'text-primary' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${currentStep === 'payment' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
              <span className="text-sm">{translations.checkout.steps.payment}</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main checkout form */}
        <div className="lg:col-span-2">
          {/* Information step */}
          {currentStep === 'information' && (
            <form onSubmit={handleInformationSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-heading font-bold mb-4">
                {translations.checkout.contactInformation}
              </h2>
              
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.checkout.email}
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              
              <h2 className="text-xl font-heading font-bold mb-4">
                {translations.checkout.shippingAddress}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    {translations.checkout.firstName}
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    {translations.checkout.lastName}
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.checkout.address}
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    {translations.checkout.city}
                  </label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                    {translations.checkout.postalCode}
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                    {translations.checkout.country}
                  </label>
                  <select
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                    required
                  >
                    <option value="Netherlands">Netherlands</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  {translations.checkout.phone}
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">
                    {translations.checkout.saveInfo}
                  </span>
                </label>
              </div>
              
              <div className="flex justify-between">
                <Link href="/cart">
                  <Button variant="outline">
                    {translations.checkout.backToCart}
                  </Button>
                </Link>
                
                <Button type="submit">
                  {translations.checkout.continueToShipping}
                </Button>
              </div>
            </form>
          )}
          
          {/* Shipping step */}
          {currentStep === 'shipping' && (
            <form onSubmit={handleShippingSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-heading font-bold mb-4">
                {translations.checkout.shippingMethod}
              </h2>
              
              <div className="space-y-4 mb-6">
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:border-primary">
                  <input
                    type="radio"
                    name="shipping"
                    value="standard"
                    checked={shippingMethod === 'standard'}
                    onChange={() => setShippingMethod('standard')}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{translations.checkout.standard}</span>
                      <span>
                        {subtotal > 50 ? (
                          <span className="text-green-500">{translations.checkout.free}</span>
                        ) : (
                          formatPrice(4.95)
                        )}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">3-5 {translations.checkout.days}</p>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:border-primary">
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    checked={shippingMethod === 'express'}
                    onChange={() => setShippingMethod('express')}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{translations.checkout.express}</span>
                      <span>{formatPrice(9.95)}</span>
                    </div>
                    <p className="text-sm text-gray-500">1-2 {translations.checkout.days}</p>
                  </div>
                </label>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setCurrentStep('information')}
                >
                  {translations.checkout.backToInformation}
                </Button>
                
                <Button type="submit">
                  {translations.checkout.continueToPayment}
                </Button>
              </div>
            </form>
          )}
          
          {/* Payment step */}
          {currentStep === 'payment' && (
            <form onSubmit={handlePaymentSubmit} className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-heading font-bold mb-4">
                {translations.checkout.paymentMethod}
              </h2>
              
              <div className="space-y-4 mb-6">
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:border-primary">
                  <input
                    type="radio"
                    name="payment"
                    value="credit_card"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => setPaymentMethod('credit_card')}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <span className="font-medium">{translations.checkout.creditCard}</span>
                    <div className="flex space-x-2 mt-1">
                      <div className="w-10 h-6 bg-gray-200 rounded"></div>
                      <div className="w-10 h-6 bg-gray-200 rounded"></div>
                      <div className="w-10 h-6 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </label>
                
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:border-primary">
                  <input
                    type="radio"
                    name="payment"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={() => setPaymentMethod('paypal')}
                    className="mr-3"
                  />
                  <span className="font-medium">{translations.checkout.paypal}</span>
                </label>
                
                <label className="flex items-center p-4 border rounded-md cursor-pointer hover:border-primary">
                  <input
                    type="radio"
                    name="payment"
                    value="ideal"
                    checked={paymentMethod === 'ideal'}
                    onChange={() => setPaymentMethod('ideal')}
                    className="mr-3"
                  />
                  <span className="font-medium">{translations.checkout.ideal}</span>
                </label>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setCurrentStep('shipping')}
                >
                  {translations.checkout.backToShipping}
                </Button>
                
                <Button 
                  type="submit"
                  disabled={orderProcessing}
                >
                  {orderProcessing ? translations.checkout.processing : translations.checkout.placeOrder}
                </Button>
              </div>
            </form>
          )}
          
          {/* Confirmation step */}
          {currentStep === 'confirmation' && orderComplete && (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-6xl mb-4 text-green-500">✓</div>
              <h2 className="text-2xl font-heading font-bold mb-2">
                {translations.checkout.orderComplete}
              </h2>
              <p className="text-gray-600 mb-4">
                {translations.checkout.thankYou}
              </p>
              <p className="mb-6">
                {translations.checkout.emailConfirmation} <strong>{email}</strong>
              </p>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="text-sm text-gray-500 mb-1">
                  {translations.checkout.orderNumber}
                </div>
                <div className="text-lg font-medium">
                  #{orderNumber}
                </div>
              </div>
              
              <Link href="/products">
                <Button className="px-8 py-6">
                  {translations.checkout.continueShopping}
                </Button>
              </Link>
            </div>
          )}
        </div>
        
        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-heading font-bold mb-4">
              {translations.checkout.orderSummary}
            </h2>
            
            {/* Cart items */}
            <div className="divide-y mb-6">
              {items.map((item) => (
                <div key={item.id} className="py-3 flex">
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={item.product.image_url}
                      alt={item.product.name}
                      fill
                      sizes="64px"
                      className="object-cover rounded"
                    />
                    <span className="absolute -top-2 -right-2 bg-gray-200 text-gray-700 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium">{item.product.name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatPrice((item.product.sale_price || item.product.price) * item.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Totals */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span>{translations.checkout.subtotal}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              
              <div className="flex justify-between">
                <span>{translations.checkout.shipping}</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className="text-green-500">{translations.checkout.free}</span>
                  ) : (
                    formatPrice(shippingCost)
                  )}
                </span>
              </div>
              
              <div className="flex justify-between pt-4 border-t text-xl font-bold">
                <span>{translations.checkout.total}</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
