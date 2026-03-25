import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const listActiveProducts = vi.fn();

vi.mock('@/lib/productsRepo', () => ({
  listActiveProducts,
  getBySlug: vi.fn(),
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <section {...props}>{children}</section>,
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => <p {...props}>{children}</p>,
  },
}));

describe('Home page', () => {
  it('renders the empty state when listActiveProducts returns an empty array', async () => {
    listActiveProducts.mockResolvedValue([]);

    const HomePage = (await import('@/app/page')).default;
    render(await HomePage());

    expect(listActiveProducts).toHaveBeenCalled();
    expect(screen.getByText('Nenhum produto encontrado.')).toBeInTheDocument();
    expect(screen.queryByText(/Bleu de Chanel/i)).not.toBeInTheDocument();
  });
});
