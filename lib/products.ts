import { Product, Filter } from './types';
import fs from 'fs';
import path from 'path';

import { supabaseServer } from './supabaseServer';

const PRODUCTS_DIR = path.join(process.cwd(), 'content', 'products');

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
  const map = new Map<string, string[]>();

  if (!supabaseServer || productIds.length === 0) {
    return map;
  }

  const { data, error } = await supabaseServer
    .from('product_images')
    .select('product_id, url, sort_order')
    .in('product_id', productIds)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  (data || []).forEach((row: ProductImageRow) => {
    const current = map.get(row.product_id) || [];
    current.push(row.url);
    map.set(row.product_id, current);
  });

  return map;
}

export async function getAllProducts(): Promise<Product[]> {
  if (supabaseServer) {
    try {
      const { data: productsData, error: productsError } = await supabaseServer
        .from('products')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Supabase error fetching products:', productsError);
      } else if (productsData) {
        const rows = productsData as ProductRow[];
        const imageMap = await getImagesByProductIds(rows.map((row) => row.id));
        return rows.map((row) => mapProductRow(row, imageMap.get(row.id) || []));
      }
    } catch (err) {
      console.error('Error querying supabase for products:', err);
    }
  }

  try {
    const files = fs.readdirSync(PRODUCTS_DIR).filter((file) => file.endsWith('.json'));
    const products: Product[] = [];

    files.forEach((file) => {
      try {
        const filePath = path.join(PRODUCTS_DIR, file);
        const data = fs.readFileSync(filePath, 'utf-8');
        const product: Product = JSON.parse(data);
        if (product.active !== false) {
          products.push(product);
        }
      } catch (error) {
        console.error(`Error reading product file ${file}:`, error);
      }
    });

    return products;
  } catch (error) {
    console.error('Error reading products directory:', error);
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (supabaseServer) {
    try {
      const { data, error } = await supabaseServer
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Supabase error fetching product by slug:', error);
      } else if (data) {
        const { data: imageRows, error: imageError } = await supabaseServer
          .from('product_images')
          .select('url, sort_order')
          .eq('product_id', data.id)
          .order('sort_order', { ascending: true })
          .order('created_at', { ascending: true });

        if (imageError) {
          console.error('Supabase error fetching product images by slug:', imageError);
        }

        const images = (imageRows || []).map((row: { url: string }) => row.url);
        return mapProductRow(data as ProductRow, images);
      }
    } catch (err) {
      console.error('Error querying supabase for product by slug:', err);
    }
    return null;
  }

  try {
    const filePath = path.join(PRODUCTS_DIR, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const product = JSON.parse(data) as Product;
      return product.active === false ? null : product;
    }

    const files = fs.readdirSync(PRODUCTS_DIR).filter((file) => file.endsWith('.json'));
    for (const file of files) {
      const data = fs.readFileSync(path.join(PRODUCTS_DIR, file), 'utf-8');
      const product: Product = JSON.parse(data);
      if (product.slug === slug) {
        if (product.active === false) return null;
        return product;
      }
    }
    return null;
  } catch (error) {
    console.error(`Error reading product ${slug}:`, error);
    return null;
  }
}

export async function getFilters(): Promise<Filter> {
  const products = await getAllProducts();

  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();
  const families = Array.from(new Set(products.map((p) => p.family))).sort();
  const prices = products.map((p) => p.price).sort((a, b) => a - b);

  return {
    brands,
    families,
    priceRange: {
      min: prices[0] || 0,
      max: prices[prices.length - 1] || 1000,
    },
  };
}

export function filterProducts(
  products: Product[],
  query?: string,
  brand?: string,
  family?: string,
  minPrice?: number,
  maxPrice?: number,
  sort?: string
): Product[] {
  let filtered = [...products];

  // Text search
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  // Brand filter
  if (brand) {
    filtered = filtered.filter((p) => p.brand === brand);
  }

  // Family filter
  if (family) {
    filtered = filtered.filter((p) => p.family === family);
  }

  // Price filter
  if (minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= minPrice);
  }

  if (maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= maxPrice);
  }

  // Sort
  if (sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'featured') {
    filtered.sort((a, b) => {
      if (a.featured === b.featured) return 0;
      return a.featured ? -1 : 1;
    });
  } else if (sort === 'best-seller') {
    filtered.sort((a, b) => b.rating_count - a.rating_count);
  }

  return filtered;
}
