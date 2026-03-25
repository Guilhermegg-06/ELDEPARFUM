import { CartItem } from './types';

export const CART_STORAGE_KEY = 'eldeparfum_cart_v1';

export function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    if (!cartData) return [];

    const parsed = JSON.parse(cartData);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const getCart = loadCart;

export function saveCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save cart:', error);
  }
}

export function addToCart(
  slug: string,
  name: string,
  ml: number,
  unitPrice: number,
  qty: number = 1
): CartItem[] {
  const cart = loadCart();
  const existingItem = cart.find((item) => item.slug === slug);

  if (existingItem) {
    existingItem.qty += qty;
  } else {
    cart.push({ slug, name, ml, qty, unitPrice });
  }

  saveCart(cart);
  return cart;
}

export function removeFromCart(slug: string): CartItem[] {
  const cart = loadCart();
  const filtered = cart.filter((item) => item.slug !== slug);
  saveCart(filtered);
  return filtered;
}

export function updateCartItemQty(slug: string, qty: number): CartItem[] {
  const cart = loadCart();
  const item = cart.find((entry) => entry.slug === slug);

  if (item) {
    if (qty <= 0) {
      return removeFromCart(slug);
    }

    item.qty = qty;
  }

  saveCart(cart);
  return cart;
}

export function clearCart(): void {
  saveCart([]);
}

export function calculateCartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const total = subtotal;
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  return { subtotal, total, totalItems };
}
