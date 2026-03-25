import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  listActiveProducts: vi.fn(),
}));

vi.mock('@/lib/productsRepo', () => ({
  listActiveProducts: mocks.listActiveProducts,
  getBySlug: vi.fn(),
}));

import { buildFilters, filterProducts, getFilters } from '@/lib/products';
import { Product } from '@/lib/types';

const products: Product[] = [
  {
    id: 'bleu',
    slug: 'bleu',
    name: 'Bleu de Chanel',
    brand: 'Chanel',
    price: 649.9,
    ml: 100,
    gender: 'masculino',
    family: 'Amadeirado',
    notes_top: ['Limao'],
    notes_heart: ['Gengibre'],
    notes_base: ['Incenso'],
    description: 'Perfume elegante amadeirado',
    images: [],
    rating_avg: 4.8,
    rating_count: 120,
    in_stock_label: 'Em estoque',
    featured: true,
    best_seller: true,
    active: true,
  },
  {
    id: 'eros',
    slug: 'eros',
    name: 'Eros',
    brand: 'Versace',
    price: 429.9,
    ml: 100,
    gender: 'masculino',
    family: 'Aromatico',
    notes_top: ['Menta'],
    notes_heart: ['Ambroxan'],
    notes_base: ['Baunilha'],
    description: 'Perfume fresco e aromatico',
    images: [],
    rating_avg: 4.6,
    rating_count: 90,
    in_stock_label: 'Em estoque',
    featured: false,
    best_seller: false,
    active: true,
  },
  {
    id: 'aventus',
    slug: 'aventus',
    name: 'Aventus',
    brand: 'Creed',
    price: 1299.9,
    ml: 100,
    gender: 'masculino',
    family: 'Frutado',
    notes_top: ['Abacaxi'],
    notes_heart: ['Jasmim'],
    notes_base: ['Musgo'],
    description: 'Perfume frutado com excelente projecao',
    images: [],
    rating_avg: 4.9,
    rating_count: 345,
    in_stock_label: 'Em estoque',
    featured: true,
    best_seller: true,
    active: true,
  },
];

describe('products helpers', () => {
  beforeEach(() => {
    mocks.listActiveProducts.mockReset();
  });

  it('builds sorted filters and the price range from products', () => {
    expect(buildFilters(products)).toEqual({
      brands: ['Chanel', 'Creed', 'Versace'],
      families: ['Amadeirado', 'Aromatico', 'Frutado'],
      priceRange: {
        min: 429.9,
        max: 1299.9,
      },
    });
  });

  it('delegates getFilters to the active products repo', async () => {
    mocks.listActiveProducts.mockResolvedValue(products);

    await expect(getFilters()).resolves.toEqual({
      brands: ['Chanel', 'Creed', 'Versace'],
      families: ['Amadeirado', 'Aromatico', 'Frutado'],
      priceRange: {
        min: 429.9,
        max: 1299.9,
      },
    });
  });

  it('filters products by text query, brand, family and price range', () => {
    const filtered = filterProducts(products, 'aromatico', 'Versace', 'Aromatico', 400, 500);

    expect(filtered).toEqual([products[1]]);
  });

  it('sorts products by price ascending and descending', () => {
    expect(
      filterProducts(products, undefined, undefined, undefined, undefined, undefined, 'price-asc').map(
        (product) => product.slug
      )
    ).toEqual(['eros', 'bleu', 'aventus']);
    expect(
      filterProducts(products, undefined, undefined, undefined, undefined, undefined, 'price-desc').map(
        (product) => product.slug
      )
    ).toEqual(['aventus', 'bleu', 'eros']);
  });

  it('sorts products by featured flag and best seller volume', () => {
    expect(
      filterProducts(products, undefined, undefined, undefined, undefined, undefined, 'featured').map(
        (product) => product.slug
      )
    ).toEqual(['bleu', 'aventus', 'eros']);
    expect(
      filterProducts(products, undefined, undefined, undefined, undefined, undefined, 'best-seller').map(
        (product) => product.slug
      )
    ).toEqual(['aventus', 'bleu', 'eros']);
  });
});
