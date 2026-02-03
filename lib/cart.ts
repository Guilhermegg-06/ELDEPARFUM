import { CartItem } from './types';

const CART_STORAGE_KEY = 'eldeparfum_cart';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY);
    return cartData ? JSON.parse(cartData) : [];
  } catch {
    return [];
  }
}

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
  const cart = getCart();
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
  const cart = getCart();
  const filtered = cart.filter((item) => item.slug !== slug);
  saveCart(filtered);
  return filtered;
}

export function updateCartItemQty(slug: string, qty: number): CartItem[] {
  const cart = getCart();
  const item = cart.find((item) => item.slug === slug);

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
  const total = subtotal; // Sem taxa de envio por enquanto
  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  return { subtotal, total, totalItems };
}
