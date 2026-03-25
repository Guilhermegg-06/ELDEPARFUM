import { describe, expect, it, vi } from 'vitest';

const redirect = vi.fn(() => {
  throw new Error('NEXT_REDIRECT');
});

vi.mock('next/navigation', () => ({
  redirect,
}));

describe('Produto slug page', () => {
  it('redirects /produto/[slug] to /p/[slug]', async () => {
    const ProdutoSlugPage = (await import('@/app/produto/[slug]/page')).default;

    await expect(
      ProdutoSlugPage({ params: Promise.resolve({ slug: 'bleu-de-chanel-edp' }) })
    ).rejects.toThrow('NEXT_REDIRECT');

    expect(redirect).toHaveBeenCalledWith('/p/bleu-de-chanel-edp');
  });
});
