import { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [discount, setDiscount] = useState(0);
  const TAX_RATE = 0.10; // 10% tax

  // Add item to cart
  const addToCart = (item) => {
    setCartItems(prev => [...prev, { ...item, id: Date.now() }]);
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  // Update item in cart
  const updateCartItem = (itemId, updatedItem) => {
    setCartItems(prev =>
      prev.map(item => (item.id === itemId ? { ...updatedItem, id: itemId } : item))
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
    setDiscount(0);
  };

  // Calculate subtotal
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const customizationTotal = item.customizations?.reduce(
        (sum, custom) => sum + (custom.price || 0),
        0
      ) || 0;
      return total + (item.price + customizationTotal) * item.quantity;
    }, 0);
  };

  // Calculate tax
  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * TAX_RATE;
  };

  // Calculate total
  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    return subtotal + tax - discount;
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    discount,
    setDiscount,
    calculateSubtotal,
    calculateTax,
    calculateTotal,
    TAX_RATE
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};