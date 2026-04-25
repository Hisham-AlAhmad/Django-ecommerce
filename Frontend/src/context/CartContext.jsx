import {
  createContext, useContext, useState, useEffect, useCallback, useRef,
} from 'react';
import { cartApi } from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const GUEST_KEY = 'dh_guest_cart';

/* ─── helpers ──────────────────────────────────────────────── */
function readGuest() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY)) || [];
  } catch {
    return [];
  }
}
function saveGuest(items) {
  localStorage.setItem(GUEST_KEY, JSON.stringify(items));
}

/* ─── provider ─────────────────────────────────────────────── */
export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  // server cart state
  const [serverCart, setServerCart] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  // guest cart state (array of { product, quantity })
  const [guestItems, setGuestItems] = useState(readGuest);

  const mergedRef = useRef(false);

  /* ── Fetch server cart ─────────────────────────────────── */
  const fetchCart = useCallback(async () => {
    if (!user) return;
    setCartLoading(true);
    try {
      const { data } = await cartApi.get();
      setServerCart(data);
    } catch (_) {
      setServerCart(null);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  /* ── On auth change: merge guest → server ──────────────── */
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      mergedRef.current = false;
      setServerCart(null);
      return;
    }

    if (mergedRef.current) {
      fetchCart();
      return;
    }

    mergedRef.current = true;
    const guest = readGuest();

    const doMerge = async () => {
      setCartLoading(true);
      try {
        for (const item of guest) {
          try {
            await cartApi.add(item.product.id, item.quantity);
          } catch (_) { /* ignore individual merge errors */ }
        }
      } finally {
        localStorage.removeItem(GUEST_KEY);
        setGuestItems([]);
        await fetchCart();
        setCartLoading(false);
      }
    };

    if (guest.length > 0) {
      doMerge();
    } else {
      fetchCart();
    }
  }, [user, authLoading, fetchCart]);

  /* ── Computed values ───────────────────────────────────── */
  const items = user
    ? (serverCart?.items ?? [])
    : guestItems;

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);

  const totalPrice = user
    ? Number(serverCart?.total_price ?? 0)
    : guestItems.reduce((s, i) => s + (Number(i.product.price) * i.quantity), 0);

  /* ── Actions ───────────────────────────────────────────── */
  const addToCart = useCallback(async (product, quantity = 1) => {
    if (user) {
      setCartLoading(true);
      try {
        const { data } = await cartApi.add(product.id, quantity);
        setServerCart(data);
      } finally {
        setCartLoading(false);
      }
    } else {
      setGuestItems((prev) => {
        const idx = prev.findIndex((i) => i.product.id === product.id);
        let updated;
        if (idx >= 0) {
          updated = prev.map((i, n) =>
            n === idx ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          updated = [...prev, { product, quantity }];
        }
        saveGuest(updated);
        return updated;
      });
    }
  }, [user]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (user) {
      setCartLoading(true);
      try {
        const { data } = await cartApi.update(itemId, quantity);
        setServerCart(data);
      } finally {
        setCartLoading(false);
      }
    } else {
      setGuestItems((prev) => {
        const updated = prev.map((i) =>
          i.product.id === itemId ? { ...i, quantity } : i
        );
        saveGuest(updated);
        return updated;
      });
    }
  }, [user]);

  const removeItem = useCallback(async (itemId) => {
    if (user) {
      setCartLoading(true);
      try {
        await cartApi.remove(itemId);
        await fetchCart();
      } finally {
        setCartLoading(false);
      }
    } else {
      setGuestItems((prev) => {
        const updated = prev.filter((i) => i.product.id !== itemId);
        saveGuest(updated);
        return updated;
      });
    }
  }, [user, fetchCart]);

  const clearCart = useCallback(() => {
    if (user) {
      fetchCart();
    } else {
      localStorage.removeItem(GUEST_KEY);
      setGuestItems([]);
    }
  }, [user, fetchCart]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        cartLoading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
