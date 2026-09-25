// frontend/src/context/CartContext.jsx
import { createContext, useContext, useReducer, useEffect } from 'react';

const CART_KEY = 'dapurCart';
const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(i => i.id_menu_item === action.item.id_menu_item);
      if (existing) {
        return state.map(i =>
          i.id_menu_item === action.item.id_menu_item
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...state, { ...action.item, quantity: 1 }];
    }
    case 'REMOVE_ITEM':
      return state.filter(i => i.id_menu_item !== action.id);
    case 'UPDATE_QTY':
      return state.map(i =>
        i.id_menu_item === action.id ? { ...i, quantity: action.quantity } : i
      );
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [cart, dispatch] = useReducer(
    cartReducer,
    [],
    () => {
      try {
        return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      } catch {
        return [];
      }
    }
  );

  // Sinkronisasi ke localStorage setiap kali cart berubah
  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = cart.reduce((s, i) => s + Number(i.price) * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addItem:        (item) => dispatch({ type: 'ADD_ITEM', item }),
      removeItem:     (id)   => dispatch({ type: 'REMOVE_ITEM', id }),
      updateQuantity: (id, quantity) => dispatch({ type: 'UPDATE_QTY', id, quantity }),
      clearCart:      ()     => dispatch({ type: 'CLEAR' }),
      totalItems,
      totalPrice,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
