'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ApiProduct as Product } from '@/types/api';
import AddToCartConfirmation from '@/components/ui/AddToCartConfirmation';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, size: string, quantity?: number) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  showConfirmation: boolean;
  setShowConfirmation: (show: boolean) => void;
  lastAddedItem: CartItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('bombotwerk_cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('bombotwerk_cart', JSON.stringify(cart));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [cart, isLoaded]);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);

  const addToCart = (product: Product, size: string, quantity = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );

      if (existingItemIndex > -1) {
        const newCart = [...prevCart];
        newCart[existingItemIndex] = {
          ...newCart[existingItemIndex],
          quantity: newCart[existingItemIndex].quantity + quantity,
        };
        return newCart;
      }

      return [...prevCart, { product, quantity, selectedSize: size }];
    });

    setLastAddedItem({ product, quantity, selectedSize: size });
    setShowConfirmation(true);
  };

  const removeFromCart = (productId: string, size: string) => {
    setCart((prevCart) =>
      prevCart.filter((item) => !(item.product.id === productId && item.selectedSize === size))
    );
  };

  const updateQuantity = (productId: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = typeof item.product.price === 'string'
      ? parseFloat(item.product.price)
      : Number(item.product.price);
    const itemPrice = isNaN(price) ? 0 : price;
    return total + itemPrice * item.quantity;
  }, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
        showConfirmation,
        setShowConfirmation,
        lastAddedItem,
      }}
    >
      {children}
      <AddToCartConfirmation
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        item={lastAddedItem}
        onChangeQuantity={(qty) => {
          if (lastAddedItem) {
            if (qty <= 0) {
              removeFromCart(lastAddedItem.product.id, lastAddedItem.selectedSize);
              setShowConfirmation(false);
            } else {
              updateQuantity(lastAddedItem.product.id, lastAddedItem.selectedSize, qty);
              setLastAddedItem(prev => prev ? { ...prev, quantity: qty } : null);
            }
          }
        }}
      />
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
