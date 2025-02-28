import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { CartState, CartAction, CartContextType } from '../types/cart';
import { Product } from '../types/product';
import { useAuth } from './auth-context';
import { supabase } from './supabase';

// Initial state for the cart
const initialState: CartState = {
  items: [],
  isOpen: false,
};

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart reducer function
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, quantity } = action.payload;
      const existingItemIndex = state.items.findIndex(item => item.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Item already exists, update quantity
        const updatedItems = [...state.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return { ...state, items: updatedItems };
      } else {
        // Add new item
        return {
          ...state,
          items: [...state.items, { id: product.id, product, quantity }],
        };
      }
    }
    
    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      
      if (quantity <= 0) {
        // If quantity is 0 or negative, remove the item
        return {
          ...state,
          items: state.items.filter(item => item.id !== id),
        };
      }
      
      // Update quantity
      return {
        ...state,
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        ),
      };
    }
    
    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
      };
    }
    
    case 'OPEN_CART': {
      return {
        ...state,
        isOpen: true,
      };
    }
    
    case 'CLOSE_CART': {
      return {
        ...state,
        isOpen: false,
      };
    }
    
    default:
      return state;
  }
}

/**
 * Cart provider component
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Only dispatch if there are items to avoid unnecessary renders
        if (parsedCart.items && parsedCart.items.length > 0) {
          // Replace the entire state
          parsedCart.items.forEach((item: any) => {
            dispatch({
              type: 'ADD_ITEM',
              payload: { product: item.product, quantity: item.quantity },
            });
          });
        }
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
        // If there's an error, clear localStorage
        localStorage.removeItem('cart');
      }
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify({ items: state.items }));
  }, [state.items]);
  
  // Sync with database for logged-in users
  useEffect(() => {
    if (user) {
      // TODO: Implement database sync when user logs in
      // This would fetch the user's cart from the database
      // and merge it with the local cart
    }
  }, [user]);
  
  // Helper functions
  const addItem = (product: Product, quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
  };
  
  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };
  
  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };
  
  const openCart = () => {
    dispatch({ type: 'OPEN_CART' });
  };
  
  const closeCart = () => {
    dispatch({ type: 'CLOSE_CART' });
  };
  
  // Calculate cart total
  const getCartTotal = () => {
    return state.items.reduce((total, item) => {
      const price = item.product.sale_price || item.product.price;
      return total + price * item.quantity;
    }, 0);
  };
  
  // Get total number of items in cart
  const getCartCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };
  
  // Context value
  const value: CartContextType = {
    state,
    dispatch,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    getCartTotal,
    getCartCount,
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/**
 * Hook to use the cart context
 */
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
