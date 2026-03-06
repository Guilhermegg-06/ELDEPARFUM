import { NextRequest, NextResponse } from 'next/server';
import slugify from 'slugify';
import { supabaseServer } from '@/lib/supabaseServer';
import { Product } from '@/lib/types';
import { requireAdmin, toStoragePathFromPublicUrl } from '@/lib/adminServer';

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

async function getProductAndImages(id: string): Promise<Product | null> {
  if (!supabaseServer) return null;

  const { data, error } = await supabaseServer
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const { data: imageRows, error: imageError } = await supabaseServer
    .from('product_images')
    .select('url, sort_order')
    .eq('product_id', id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (imageError) {
    throw imageError;
  }

  const images = (imageRows || []).map((row: { url: string }) => row.url);
  return mapProductRow(data as ProductRow, images);
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase server nao configurado.' }, { status: 500 });
  }

  const { id } = await context.params;

  try {
    const product = await getProductAndImages(id);
    if (!product) {
      return NextResponse.json({ error: 'Produto nao encontrado.' }, { status: 404 });
    }
    return NextResponse.json({ data: product });
  } catch (error) {
    console.error('Admin get product error:', error);
    return NextResponse.json({ error: 'Falha ao carregar produto.' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase server nao configurado.' }, { status: 500 });
  }

  const { id } = await context.params;

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
    const slugAvailable = await ensureSlugIsUnique(payload.slug, id);
    if (!slugAvailable) {
      return NextResponse.json({ error: 'Slug ja existe.' }, { status: 409 });
    }

    const { data, error } = await supabaseServer
      .from('products')
      .update({
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
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) {
      console.error('Admin update product error:', error);
      return NextResponse.json({ error: 'Falha ao atualizar produto.' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Produto nao encontrado.' }, { status: 404 });
    }

    await replaceProductImages(id, payload.images);
    const updatedProduct = mapProductRow(data as ProductRow, payload.images);

    return NextResponse.json({ data: updatedProduct });
  } catch (error) {
    console.error('Admin update product exception:', error);
    return NextResponse.json({ error: 'Falha ao atualizar produto.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase server nao configurado.' }, { status: 500 });
  }

  const { id } = await context.params;

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Payload invalido.' }, { status: 400 });
  }

  if (typeof body.active !== 'boolean') {
    return NextResponse.json({ error: 'Campo active obrigatorio.' }, { status: 400 });
  }

  const { data, error } = await supabaseServer
    .from('products')
    .update({ active: body.active })
    .eq('id', id)
    .select('id, active')
    .maybeSingle();

  if (error) {
    console.error('Admin patch product status error:', error);
    return NextResponse.json({ error: 'Falha ao atualizar status.' }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ error: 'Produto nao encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ data });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const admin = await requireAdmin(request);
  if (!admin.ok) return admin.response;

  if (!supabaseServer) {
    return NextResponse.json({ error: 'Supabase server nao configurado.' }, { status: 500 });
  }

  const { id } = await context.params;

  try {
    const { data: productData, error: productError } = await supabaseServer
      .from('products')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (productError) {
      console.error('Admin delete product load error:', productError);
      return NextResponse.json({ error: 'Falha ao excluir produto.' }, { status: 500 });
    }

    if (!productData) {
      return NextResponse.json({ error: 'Produto nao encontrado.' }, { status: 404 });
    }

    const { data: imageRows, error: imageRowsError } = await supabaseServer
      .from('product_images')
      .select('url')
      .eq('product_id', id);

    if (imageRowsError) {
      console.error('Admin delete load images error:', imageRowsError);
      return NextResponse.json({ error: 'Falha ao excluir produto.' }, { status: 500 });
    }

    const { error: deleteImagesError } = await supabaseServer
      .from('product_images')
      .delete()
      .eq('product_id', id);

    if (deleteImagesError) {
      console.error('Admin delete image rows error:', deleteImagesError);
      return NextResponse.json({ error: 'Falha ao excluir imagens do produto.' }, { status: 500 });
    }

    const { error: deleteProductError } = await supabaseServer
      .from('products')
      .delete()
      .eq('id', id);

    if (deleteProductError) {
      console.error('Admin delete product error:', deleteProductError);
      return NextResponse.json({ error: 'Falha ao excluir produto.' }, { status: 500 });
    }

    const storagePaths = (imageRows || [])
      .map((row: { url: string }) => toStoragePathFromPublicUrl(row.url))
      .filter((path): path is string => Boolean(path));

    if (storagePaths.length > 0) {
      const { error: storageError } = await supabaseServer.storage
        .from('product-images')
        .remove(storagePaths);

      if (storageError) {
        // best-effort: deletion of storage files should not block product deletion
        console.warn('Admin delete storage files warning:', storageError.message);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin delete product exception:', error);
    return NextResponse.json({ error: 'Falha ao excluir produto.' }, { status: 500 });
  }
}
