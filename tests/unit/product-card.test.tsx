/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/lib/types';

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  addToCart: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mocks.push,
  }),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt || ''} />,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, ...props }: React.HTMLAttributes<HTMLDivElement> & { whileHover?: unknown; whileTap?: unknown }) => {
      void whileHover;
      void whileTap;
      return <div {...props}>{children}</div>;
    },
    button: ({ children, whileHover, whileTap, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { whileHover?: unknown; whileTap?: unknown }) => {
      void whileHover;
      void whileTap;
      return <button {...props}>{children}</button>;
    },
  },
}));

vi.mock('@/lib/cart', () => ({
  addToCart: mocks.addToCart,
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
  images: ['https://example.com/bleu.jpg'],
  rating_avg: 4.8,
  rating_count: 120,
  in_stock_label: 'Em estoque',
  featured: true,
  best_seller: true,
  active: true,
};

describe('ProductCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('navigates to the product page when the card area is clicked', async () => {
    const user = userEvent.setup();

    render(<ProductCard product={product} />);

    await user.click(screen.getByText('Bleu de Chanel Eau de Parfum'));

    expect(mocks.push).toHaveBeenCalledWith('/p/bleu-de-chanel-edp');
  });

  it('adds to cart without navigating when the add button is clicked', async () => {
    const user = userEvent.setup();

    render(<ProductCard product={product} />);

    await user.click(screen.getByRole('button', { name: 'Adicionar' }));

    expect(mocks.addToCart).toHaveBeenCalledWith(
      'bleu-de-chanel-edp',
      'Bleu de Chanel Eau de Parfum',
      100,
      649.9,
      1
    );
    expect(mocks.push).not.toHaveBeenCalled();
  });
});
