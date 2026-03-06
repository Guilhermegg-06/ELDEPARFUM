import { NextRequest, NextResponse } from 'next/server';
import slugify from 'slugify';
import { supabaseServer } from '@/lib/supabaseServer';
import { Product } from '@/lib/types';
import { requireAdmin } from '@/lib/adminServer';

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number | string;
  ml: number;
  gender: string | null;
  family: string | null;
  description: string | null;
  notes_top: string[] | null;
  notes_heart: string[] | null;
  notes_base: string[] | null;
  rating_avg: number | string | null;
  rating_count: number | null;
  in_stock_label: string | null;
  featured: boolean | null;
  best_seller: boolean | null;
  active: boolean | null;
};

type ProductPayload = {
  name: string;
  slug: string;
  brand: string;
  price: number;
  ml: number;
  gender: string;
  family: string;
  description: string;
  notes_top: string[];
  notes_heart: string[];
  notes_base: string[];
  in_stock_label: string;
  featured: boolean;
  best_seller: boolean;
  active: boolean;
  images: string[];
};

function parseStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => String(entry).trim())
    .filter(Boolean);
}

function toNumber(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function toInteger(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isInteger(parsed) ? parsed : NaN;
}

function normalizePayload(raw: Record<string, unknown>): ProductPayload {
  const normalizedSlug = slugify(String(raw.slug || ''), {
    lower: true,
    strict: true,
    trim: true,
  });

  return {
    name: String(raw.name || '').trim(),
    slug: normalizedSlug,
    brand: String(raw.brand || '').trim(),
    price: toNumber(raw.price),
    ml: toInteger(raw.ml),
    gender: String(raw.gender || '').trim(),
    family: String(raw.family || '').trim(),
    description: String(raw.description || '').trim(),
    notes_top: parseStringArray(raw.notes_top),
    notes_heart: parseStringArray(raw.notes_heart),
    notes_base: parseStringArray(raw.notes_base),
    in_stock_label: String(raw.in_stock_label || '').trim() || 'Em estoque',
    featured: Boolean(raw.featured),
    best_seller: Boolean(raw.best_seller),
    active: raw.active === undefined ? true : Boolean(raw.active),
    images: parseStringArray(raw.images),
  };
}

function validatePayload(payload: ProductPayload): string | null {
  if (!payload.name) return 'Nome obrigatorio.';
  if (!payload.slug) return 'Slug obrigatorio.';
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)) {
    return 'Slug invalido. Use letras minusculas, numeros e hifens.';
  }
  if (!payload.brand) return 'Marca obrigatoria.';
  if (!Number.isFinite(payload.price) || payload.price <= 0) {
    return 'Preco deve ser maior que zero.';
  }
  if (!Number.isInteger(payload.ml) || payload.ml <= 0) {
    return 'ml deve ser um inteiro maior que zero.';
  }
  if (!payload.family) return 'Familia obrigatoria.';
  return null;
}

function escapeSearchTerm(query: string): string {
  return query.replace(/[,%]/g, ' ').trim();
}

function mapProductRow(row: ProductRow, images: string[]): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    price: Number(row.price),
    ml: row.ml,
    gender: row.gender || '',
    family: row.family || '',
    notes_top: row.notes_top || [],
    notes_heart: row.notes_heart || [],
    notes_base: row.notes_base || [],
    description: row.description || '',
    images,
    rating_avg: Number(row.rating_avg || 0),
    rating_count: row.rating_count || 0,
    in_stock_label: row.in_stock_label || 'Em estoque',
    featured: Boolean(row.featured),
    best_seller: Boolean(row.best_seller),
    active: row.active ?? true,
  };
}

async function ensureSlugIsUnique(slug: string, exceptId?: string): Promise<boolean> {
  if (!supabaseServer) return false;

  let query = supabaseServer.from('products').select('id').eq('slug', slug);
  if (exceptId) {
    query = query.neq('id', exceptId);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    throw error;
  }

  return !data;
}

async function replaceProductImages(productId: string, images: string[]) {
  if (!supabaseServer) return;

  const { error: deleteError } = await supabaseServer
    .from('product_images')
    .delete()
    .eq('product_id', productId);

  if (deleteError) {
    throw deleteError;
  }

  if (images.length === 0) return;

  const rows = images.map((url, index) => ({
    product_id: productId,
    url,
    sort_order: index,
  }));

  const { error: insertError } = await supabaseServer.from('product_images').insert(rows);
  if (insertError) {
    throw insertError;
  }
}

async function getImagesByProductIds(productIds: string[]): Promise<Map<string, string[]>> {
  const map = new Map<string, string[]>();
  if (!supabaseServer || productIds.length === 0) return map;

  const { data, error } = await supabaseServer
    .from('product_images')
    .select('product_id, url, sort_order')
    .in('product_id', productIds)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  (data || []).forEach((row: { product_id: string; url: string }) => {
    const current = map.get(row.product_id) || [];
    current.push(row.url);
    map.set(row.product_id, current);
  });

  return map;
}

export async function GET(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase server nao configurado.' }, { status: 500 });
  }

  const query = request.nextUrl.searchParams.get('q')?.trim() || '';

  let productsQuery = supabaseServer
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  const sanitizedQuery = escapeSearchTerm(query);

  if (sanitizedQuery) {
    productsQuery = productsQuery.or(
      `name.ilike.%${sanitizedQuery}%,brand.ilike.%${sanitizedQuery}%,slug.ilike.%${sanitizedQuery}%`
    );
  }

  const { data, error } = await productsQuery;

  if (error) {
    console.error('Admin list products error:', error);
    return NextResponse.json({ error: 'Falha ao carregar produtos.' }, { status: 500 });
  }

  const rows = (data || []) as ProductRow[];
  const imageMap = await getImagesByProductIds(rows.map((row) => row.id));
  const products = rows.map((row) => mapProductRow(row, imageMap.get(row.id) || []));

  return NextResponse.json({ data: products, total: products.length });
}

export async function POST(request: NextRequest) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase server nao configurado.' }, { status: 500 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Payload invalido.' }, { status: 400 });
  }

  const payload = normalizePayload(body);
  const validationError = validatePayload(payload);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const slugAvailable = await ensureSlugIsUnique(payload.slug);
    if (!slugAvailable) {
      return NextResponse.json({ error: 'Slug ja existe.' }, { status: 409 });
    }

    const { data, error } = await supabaseServer
      .from('products')
      .insert({
        name: payload.name,
        slug: payload.slug,
        brand: payload.brand,
        price: payload.price,
        ml: payload.ml,
        gender: payload.gender,
        family: payload.family,
        description: payload.description,
        notes_top: payload.notes_top,
        notes_heart: payload.notes_heart,
        notes_base: payload.notes_base,
        in_stock_label: payload.in_stock_label,
        featured: payload.featured,
        best_seller: payload.best_seller,
        active: payload.active,
      })
      .select('*')
      .single();

    if (error || !data) {
      console.error('Admin create product error:', error);
      return NextResponse.json({ error: 'Falha ao criar produto.' }, { status: 500 });
    }

    await replaceProductImages(data.id, payload.images);
    const product = mapProductRow(data as ProductRow, payload.images);

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error) {
    console.error('Admin create product exception:', error);
    return NextResponse.json({ error: 'Falha ao criar produto.' }, { status: 500 });
  }
}
