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

describe('/api/admin/me', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.ADMIN_EMAILS = 'eldeparfum@gmail.com';
    process.env.NEXT_PUBLIC_ADMIN_EMAILS = '';
  });

  it('responds with 200 when token is valid and the email is authorized', async () => {
    getUser.mockResolvedValue({
      data: { user: { email: 'eldeparfum@gmail.com' } },
      error: null,
    });

    const { GET } = await import('@/app/api/admin/me/route');
    const request = new NextRequest('http://localhost/api/admin/me', {
      headers: { authorization: 'Bearer valid-token' },
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ email: 'eldeparfum@gmail.com' });
  });

  it('responds with 403 when token is valid but the email is not authorized', async () => {
    getUser.mockResolvedValue({
      data: { user: { email: 'guest@example.com' } },
      error: null,
    });

    const { GET } = await import('@/app/api/admin/me/route');
    const request = new NextRequest('http://localhost/api/admin/me', {
      headers: { authorization: 'Bearer valid-token' },
    });

    const response = await GET(request);

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toEqual({ error: 'Acesso negado.' });
  });
});
