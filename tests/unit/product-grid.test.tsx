import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/lib/types';

vi.mock('@/components/ProductCard', () => ({
  default: ({ product }: { product: Product }) => <div>{product.name}</div>,
}));

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
    notes_top: [],
    notes_heart: [],
    notes_base: [],
    description: 'Perfume elegante',
    images: [],
    rating_avg: 4.8,
    rating_count: 120,
    in_stock_label: 'Em estoque',
    featured: true,
    best_seller: true,
    active: true,
  },
];

describe('ProductGrid', () => {
  it('renders loading skeletons when isLoading is true', () => {
    const { container } = render(<ProductGrid products={[]} isLoading />);

    expect(container.querySelectorAll('.animate-pulse')).toHaveLength(8);
  });

  it('renders the empty state when there are no products', () => {
    render(<ProductGrid products={[]} />);

    expect(screen.getByText('Nenhum produto encontrado.')).toBeInTheDocument();
    expect(screen.getByText('Tente ajustar seus filtros.')).toBeInTheDocument();
  });

  it('renders product cards when products are available', () => {
    render(<ProductGrid products={products} />);

    expect(screen.getByText('Bleu de Chanel')).toBeInTheDocument();
  });
});
