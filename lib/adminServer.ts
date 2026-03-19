import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from './supabaseServer';

type AdminGuardResult =
  | { ok: true; email: string }
  | { ok: false; response: NextResponse };

const STORAGE_PUBLIC_PREFIX = '/storage/v1/object/public/product-images/';

export function getServerAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function requireAdmin(request: NextRequest): Promise<AdminGuardResult> {
  if (!supabaseServer) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Supabase server nao configurado.' },
        { status: 500 }
      ),
    };
  }

  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : '';

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Nao autenticado.' }, { status: 401 }),
    };
  }

  const { data, error } = await supabaseServer.auth.getUser(token);
  const email = data.user?.email?.toLowerCase();

  if (error || !email) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Sessao invalida.' }, { status: 401 }),
    };
  }

  const allowedEmails = getServerAdminEmails();
  if (allowedEmails.length === 0) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Nenhum administrador configurado em ADMIN_EMAILS.' },
        { status: 500 }
      ),
    };
  }

  if (!allowedEmails.includes(email)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: `Acesso negado para ${email}.` },
        { status: 403 }
      ),
    };
  }

  return { ok: true, email };
}

export function toStoragePathFromPublicUrl(url: string): string | null {
  if (!url) return null;

  const trimmed = url.trim();

  if (trimmed.startsWith('product-images/')) {
    return trimmed.replace(/^product-images\//, '');
  }

  if (!trimmed.startsWith('http')) {
    return null;
  }

  try {
    const parsed = new URL(trimmed);
    const idx = parsed.pathname.indexOf(STORAGE_PUBLIC_PREFIX);
    if (idx < 0) return null;
    return decodeURIComponent(parsed.pathname.slice(idx + STORAGE_PUBLIC_PREFIX.length));
  } catch {
    return null;
  }
}

export function sanitizeFileName(fileName: string): string {
  return fileName
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}
