import { Product } from './product';

/**
 * Represents an item in the shopping cart
 */
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

/**
 * Represents the state of the shopping cart
 */
export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

/**
 * Actions that can be performed on the cart
 */
export type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' };

/**
 * Context for the shopping cart
 */
export interface CartContextType {
  state: CartState;
  dispatch: React.Dispatch<CartAction>;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}
