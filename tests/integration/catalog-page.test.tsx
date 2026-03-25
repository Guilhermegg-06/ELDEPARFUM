import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const listActiveProducts = vi.fn();

vi.mock('@/lib/productsRepo', () => ({
  listActiveProducts,
  getBySlug: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  motion: {
    section: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => <section {...props}>{children}</section>,
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
}));

vi.mock('@/components/FiltersBar', () => ({
  default: () => <div data-testid="filters-bar" />,
}));

describe('Catalog page', () => {
  it('renders the empty state when listActiveProducts returns an empty array', async () => {
    listActiveProducts.mockResolvedValue([]);

    const CatalogPage = (await import('@/app/catalogo/page')).default;
    render(await CatalogPage());

    expect(listActiveProducts).toHaveBeenCalled();
    expect(screen.getByText('Nenhum produto encontrado.')).toBeInTheDocument();
    expect(screen.queryByText(/Bleu de Chanel/i)).not.toBeInTheDocument();
  });
});
