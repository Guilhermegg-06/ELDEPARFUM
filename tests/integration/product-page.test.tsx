/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Product } from '@/lib/types';

const getBySlug = vi.fn();
const listActiveProducts = vi.fn();

vi.mock('@/lib/productsRepo', () => ({
  getBySlug,
  listActiveProducts,
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: ({ fill, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) => {
    void fill;
    return <img {...props} alt={props.alt || ''} />;
  },
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, ...props }: React.HTMLAttributes<HTMLDivElement> & { whileHover?: unknown; whileTap?: unknown }) => {
      void whileHover;
      void whileTap;
      return <div {...props}>{children}</div>;
    },
    section: ({ children, whileHover, whileTap, ...props }: React.HTMLAttributes<HTMLElement> & { whileHover?: unknown; whileTap?: unknown }) => {
      void whileHover;
      void whileTap;
      return <section {...props}>{children}</section>;
    },
    button: ({ children, whileHover, whileTap, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { whileHover?: unknown; whileTap?: unknown }) => {
      void whileHover;
      void whileTap;
      return <button {...props}>{children}</button>;
    },
  },
}));

const product: Product = {
  id: 'bleu-de-chanel-edp',
  slug: 'bleu-de-chanel-edp',
  name: 'Bleu de Chanel Eau de Parfum',
  brand: 'Chanel',
  price: 649.9,
  ml: 100,
  gender: 'masculino',
  family: 'Amadeirado Aromatico',
  notes_top: ['Limao'],
  notes_heart: ['Gengibre'],
  notes_base: ['Incenso'],
  description: 'Um perfume elegante e versatil.',
  images: ['https://example.com/bleu-1.jpg', 'https://example.com/bleu-2.jpg'],
  rating_avg: 4.8,
  rating_count: 120,
  in_stock_label: 'Em estoque',
  featured: true,
  best_seller: true,
  active: true,
};

describe('Product page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the product details and allows changing the main gallery image', async () => {
    const user = userEvent.setup();

    getBySlug.mockResolvedValue(product);
    listActiveProducts.mockResolvedValue([product]);

    const ProductPage = (await import('@/app/p/[slug]/page')).default;
    render(
      await ProductPage({
        params: Promise.resolve({ slug: product.slug }),
      })
    );

    expect(getBySlug).toHaveBeenCalledWith(product.slug);
    expect(screen.getByRole('heading', { name: product.name })).toBeInTheDocument();
    expect(screen.getByText(product.description)).toBeInTheDocument();
    expect(screen.getByText('R$ 649,90')).toBeInTheDocument();
    expect(screen.getByAltText(product.name)).toHaveAttribute('src', 'https://example.com/bleu-1.jpg');

    await user.click(screen.getByRole('button', { name: 'Selecionar imagem 2' }));

    expect(screen.getByAltText(product.name)).toHaveAttribute('src', 'https://example.com/bleu-2.jpg');
  });

  it('renders a gallery placeholder when the product has no images', async () => {
    getBySlug.mockResolvedValue({
      ...product,
      images: [],
    });
    listActiveProducts.mockResolvedValue([{ ...product, images: [] }]);

    const ProductPage = (await import('@/app/p/[slug]/page')).default;
    render(
      await ProductPage({
        params: Promise.resolve({ slug: product.slug }),
      })
    );

    expect(screen.getByText('Imagem indisponivel')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Selecionar imagem 1' })).toBeInTheDocument();
    expect(screen.getByText('Sem imagem')).toBeInTheDocument();
  });

  it('renders the not found state when the slug does not exist', async () => {
    getBySlug.mockResolvedValue(null);
    listActiveProducts.mockResolvedValue([]);

    const ProductPage = (await import('@/app/p/[slug]/page')).default;
    render(
      await ProductPage({
        params: Promise.resolve({ slug: 'slug-inexistente' }),
      })
    );

    expect(screen.getByText('Produto nao encontrado')).toBeInTheDocument();
    expect(screen.getByText('Voltar ao catalogo')).toBeInTheDocument();
  });
});
