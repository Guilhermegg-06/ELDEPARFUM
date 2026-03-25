import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getUser = vi.fn();

vi.mock('@/lib/supabaseServer', () => ({
  supabaseServer: {
    auth: {
      getUser,
    },
  },
}));

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.ADMIN_EMAILS = ' admin@example.com , owner@example.com ';
    process.env.NEXT_PUBLIC_ADMIN_EMAILS = '';
  });

  it('returns 401 when the request has no bearer token', async () => {
    const { requireAdmin } = await import('@/lib/adminServer');
    const request = new NextRequest('http://localhost/api/admin/me');

    const result = await requireAdmin(request);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
    expect(getUser).not.toHaveBeenCalled();
  });

  it('returns 401 when the authenticated session is invalid', async () => {
    getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'invalid token' },
    });

    const { requireAdmin } = await import('@/lib/adminServer');
    const request = new NextRequest('http://localhost/api/admin/me', {
      headers: { authorization: 'Bearer invalid-token' },
    });

    const result = await requireAdmin(request);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
  });

  it('returns 403 when the authenticated email is not in the allowlist', async () => {
    getUser.mockResolvedValue({
      data: { user: { email: 'visitor@example.com' } },
      error: null,
    });

    const { requireAdmin } = await import('@/lib/adminServer');
    const request = new NextRequest('http://localhost/api/admin/me', {
      headers: { authorization: 'Bearer valid-token' },
    });

    const result = await requireAdmin(request);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
    }
  });

  it('returns ok when the authenticated email matches the allowlist with trim and case-insensitive comparison', async () => {
    getUser.mockResolvedValue({
      data: { user: { email: 'Owner@Example.com' } },
      error: null,
    });

    const { requireAdmin } = await import('@/lib/adminServer');
    const request = new NextRequest('http://localhost/api/admin/me', {
      headers: { authorization: 'Bearer valid-token' },
    });

    const result = await requireAdmin(request);

    expect(result).toEqual({ ok: true, email: 'owner@example.com' });
  });

  it('returns a defined server error when ADMIN_EMAILS is missing', async () => {
    process.env.ADMIN_EMAILS = '';
    process.env.NEXT_PUBLIC_ADMIN_EMAILS = '';
    getUser.mockResolvedValue({
      data: { user: { email: 'owner@example.com' } },
      error: null,
    });

    const { requireAdmin } = await import('@/lib/adminServer');
    const request = new NextRequest('http://localhost/api/admin/me', {
      headers: { authorization: 'Bearer valid-token' },
    });

    const result = await requireAdmin(request);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(500);
    }
  });
});

describe('admin helpers', () => {
  beforeEach(() => {
    process.env.ADMIN_EMAILS = '';
    process.env.NEXT_PUBLIC_ADMIN_EMAILS = ' owner@example.com , admin@example.com ';
  });

  it('reads admin emails from NEXT_PUBLIC_ADMIN_EMAILS when ADMIN_EMAILS is empty', async () => {
    const { getServerAdminEmails } = await import('@/lib/adminServer');

    expect(getServerAdminEmails()).toEqual(['owner@example.com', 'admin@example.com']);
  });

  it('extracts a storage path from a public Supabase URL', async () => {
    const { toStoragePathFromPublicUrl } = await import('@/lib/adminServer');

    expect(
      toStoragePathFromPublicUrl(
        'https://example.supabase.co/storage/v1/object/public/product-images/produtos/bleu.jpg'
      )
    ).toBe('produtos/bleu.jpg');
  });

  it('extracts a storage path from a direct bucket path', async () => {
    const { toStoragePathFromPublicUrl } = await import('@/lib/adminServer');

    expect(toStoragePathFromPublicUrl('product-images/pastas/imagem.png')).toBe('pastas/imagem.png');
  });

  it('returns null when the public URL cannot be parsed as a storage path', async () => {
    const { toStoragePathFromPublicUrl } = await import('@/lib/adminServer');

    expect(toStoragePathFromPublicUrl('nota-valid-url')).toBeNull();
    expect(toStoragePathFromPublicUrl('https://example.com/outro-bucket/imagem.png')).toBeNull();
  });

  it('sanitizes file names for storage uploads', async () => {
    const { sanitizeFileName } = await import('@/lib/adminServer');

    expect(sanitizeFileName('Bleu de Chanel.png')).toBe('bleu-de-chanel.png');
    expect(sanitizeFileName('Aventus   100ML.JPG')).toBe('aventus-100ml.jpg');
  });
});
