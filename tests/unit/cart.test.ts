import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  addToCart,
  calculateCartTotals,
  clearCart,
  loadCart,
  removeFromCart,
  updateCartItemQty,
} from '@/lib/cart';

const CART_STORAGE_KEY = 'eldeparfum_cart_v1';

describe('cart storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('returns an empty array when localStorage has no cart key', () => {
    expect(loadCart()).toEqual([]);
  });

  it('returns an empty array when stored JSON is invalid', () => {
    window.localStorage.setItem(CART_STORAGE_KEY, '{invalid-json');

    expect(loadCart()).toEqual([]);
  });

  it('returns an empty array when stored data is not an array', () => {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ slug: 'x' }));

    expect(loadCart()).toEqual([]);
  });

  it('adds an item correctly', () => {
    const cart = addToCart('bleu-de-chanel-edp', 'Bleu de Chanel Eau de Parfum', 100, 649.9, 1);

    expect(cart).toEqual([
      {
        slug: 'bleu-de-chanel-edp',
        name: 'Bleu de Chanel Eau de Parfum',
        ml: 100,
        qty: 1,
        unitPrice: 649.9,
      },
    ]);
    expect(loadCart()).toEqual(cart);
  });

  it('increments quantity when the same product is added again', () => {
    addToCart('bleu-de-chanel-edp', 'Bleu de Chanel Eau de Parfum', 100, 649.9, 1);

    const cart = addToCart('bleu-de-chanel-edp', 'Bleu de Chanel Eau de Parfum', 100, 649.9, 2);

    expect(cart[0]?.qty).toBe(3);
  });

  it('removes an item from the cart', () => {
    addToCart('bleu-de-chanel-edp', 'Bleu de Chanel Eau de Parfum', 100, 649.9, 1);
    addToCart('aventus', 'Aventus', 100, 1299.9, 1);

    const cart = removeFromCart('bleu-de-chanel-edp');

    expect(cart).toEqual([
      {
        slug: 'aventus',
        name: 'Aventus',
        ml: 100,
        qty: 1,
        unitPrice: 1299.9,
      },
    ]);
  });

  it('updates the quantity of an existing item', () => {
    addToCart('bleu-de-chanel-edp', 'Bleu de Chanel Eau de Parfum', 100, 649.9, 1);

    const cart = updateCartItemQty('bleu-de-chanel-edp', 4);

    expect(cart[0]?.qty).toBe(4);
    expect(loadCart()[0]?.qty).toBe(4);
  });

  it('removes the item when updateCartItemQty receives zero or less', () => {
    addToCart('bleu-de-chanel-edp', 'Bleu de Chanel Eau de Parfum', 100, 649.9, 1);

    const cart = updateCartItemQty('bleu-de-chanel-edp', 0);

    expect(cart).toEqual([]);
    expect(loadCart()).toEqual([]);
  });

  it('returns totals for the current cart items', () => {
    const totals = calculateCartTotals([
      { slug: 'bleu', name: 'Bleu', ml: 100, qty: 2, unitPrice: 649.9 },
      { slug: 'eros', name: 'Eros', ml: 100, qty: 1, unitPrice: 429.9 },
    ]);

    expect(totals.totalItems).toBe(3);
    expect(totals.subtotal).toBeCloseTo(1729.7, 5);
    expect(totals.total).toBeCloseTo(1729.7, 5);
  });

  it('clears the cart and persists an empty array', () => {
    addToCart('bleu-de-chanel-edp', 'Bleu de Chanel Eau de Parfum', 100, 649.9, 1);

    clearCart();

    expect(loadCart()).toEqual([]);
    expect(window.localStorage.getItem(CART_STORAGE_KEY)).toBe(JSON.stringify([]));
  });
});
