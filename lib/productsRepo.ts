import { Product } from './types';
import { supabaseServer } from './supabaseServer';

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  price: number | string;
  ml: number;
  gender: string | null;
  family: string | null;
  notes_top: string[] | null;
  notes_heart: string[] | null;
  notes_base: string[] | null;
  description: string | null;
  rating_avg: number | string | null;
  rating_count: number | null;
  in_stock_label: string | null;
  featured: boolean | null;
  best_seller: boolean | null;
  active: boolean | null;
};

type ProductImageRow = {
  product_id: string;
  url: string;
};

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

async function getImagesByProductIds(productIds: string[]): Promise<Map<string, string[]>> {
  const imageMap = new Map<string, string[]>();

  if (!supabaseServer || productIds.length === 0) {
    return imageMap;
  }

  const { data, error } = await supabaseServer
    .from('product_images')
    .select('product_id, url, sort_order, created_at')
    .in('product_id', productIds)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  (data || []).forEach((row: ProductImageRow) => {
    const images = imageMap.get(row.product_id) || [];
    images.push(row.url);
    imageMap.set(row.product_id, images);
  });

  return imageMap;
}

export async function listActiveProducts(): Promise<Product[]> {
  if (!supabaseServer) {
    return [];
  }

  const { data, error } = await supabaseServer
    .from('products')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data || []) as ProductRow[];
  const imageMap = await getImagesByProductIds(rows.map((row) => row.id));

  return rows.map((row) => mapProductRow(row, imageMap.get(row.id) || []));
}

export async function getBySlug(slug: string): Promise<Product | null> {
  if (!supabaseServer) {
    return null;
  }

  const { data, error } = await supabaseServer
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const { data: imageRows, error: imageError } = await supabaseServer
    .from('product_images')
    .select('url, sort_order, created_at')
    .eq('product_id', data.id)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (imageError) {
    throw imageError;
  }

  return mapProductRow(
    data as ProductRow,
    (imageRows || []).map((row: { url: string }) => row.url)
  );
}
