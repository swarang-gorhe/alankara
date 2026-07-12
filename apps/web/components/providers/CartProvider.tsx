"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addToCart as apiAddToCart,
  fetchCart,
  removeCartItem as apiRemoveCartItem,
  updateCartItem as apiUpdateCartItem,
  type CartResponse,
} from "@/lib/api/cart";

type CartContextValue = {
  cart: CartResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchCart();
      setCart(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cart");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addToCart = useCallback(async (variantId: string, quantity = 1) => {
    setError(null);
    const data = await apiAddToCart(variantId, quantity);
    setCart(data);
  }, []);

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    setError(null);
    const data = await apiUpdateCartItem(itemId, quantity);
    setCart(data);
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    setError(null);
    const data = await apiRemoveCartItem(itemId);
    setCart(data);
  }, []);

  const value = useMemo(
    () => ({ cart, loading, error, refresh, addToCart, updateQuantity, removeItem }),
    [cart, loading, error, refresh, addToCart, updateQuantity, removeItem],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
