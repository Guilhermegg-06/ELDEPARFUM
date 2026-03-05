import { Product, Filter } from './types';
import fs from 'fs';
import path from 'path';

// supabase server client is only used on the server side (API routes)
import { supabaseServer } from './supabaseServer';

const PRODUCTS_DIR = path.join(process.cwd(), 'content', 'products');

export async function getAllProducts(): Promise<Product[]> {
  // if Supabase is configured, fetch from database instead of filesystem
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    supabaseServer
  ) {
    try {
      const { data, error } = await supabaseServer
        .from('products')
        .select(`*, product_images(url)`) // join images
        .eq('active', true);

      if (error) {
        console.error('Supabase error fetching products:', error);
        // fall back to filesystem below
      } else if (data) {
        // map product_images to images array
        const products: Product[] = (data as any[]).map((p) => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          brand: p.brand,
          price: Number(p.price),
          ml: p.ml,
          gender: p.gender,
          family: p.family,
          notes_top: p.notes_top || [],
          notes_heart: p.notes_heart || [],
          notes_base: p.notes_base || [],
          description: p.description || '',
          images: (p.product_images || []).map((img: any) => img.url),
          rating_avg: p.rating_avg || 0,
          rating_count: p.rating_count || 0,
          in_stock_label: p.in_stock_label || '',
          featured: p.featured || false,
          best_seller: p.best_seller || false,
        }));
        return products;
      }
    } catch (err) {
      console.error('Error querying supabase for products:', err);
    }
  }

  // fallback to filesystem-based mock
  try {
    const files = fs.readdirSync(PRODUCTS_DIR).filter((file) => file.endsWith('.json'));
    const products: Product[] = [];

    files.forEach((file) => {
      try {
        const filePath = path.join(PRODUCTS_DIR, file);
        const data = fs.readFileSync(filePath, 'utf-8');
        const product: Product = JSON.parse(data);
        products.push(product);
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
  // Supabase branch
  if (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    supabaseServer
  ) {
    try {
      const { data, error } = await supabaseServer
        .from('products')
        .select(`*, product_images(url)`) // include images
        .eq('slug', slug)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // no rows found
          return null;
        }
        console.error('Supabase error fetching product by slug:', error);
      } else if (data) {
        const product: Product = {
          id: data.id,
          slug: data.slug,
          name: data.name,
          brand: data.brand,
          price: Number(data.price),
          ml: data.ml,
          gender: data.gender,
          family: data.family,
          notes_top: data.notes_top || [],
          notes_heart: data.notes_heart || [],
          notes_base: data.notes_base || [],
          description: data.description || '',
          images: (data.product_images || []).map((img: any) => img.url),
          rating_avg: data.rating_avg || 0,
          rating_count: data.rating_count || 0,
          in_stock_label: data.in_stock_label || '',
          featured: data.featured || false,
          best_seller: data.best_seller || false,
        };
        return product;
      }
    } catch (err) {
      console.error('Error querying supabase for product by slug:', err);
    }
    return null;
  }

  // fallback to filesystem-based mock
  try {
    // Try exact filename first
    const filePath = path.join(PRODUCTS_DIR, `${slug}.json`);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as Product;
    }

    // Try to find by slug in content
    const files = fs.readdirSync(PRODUCTS_DIR).filter((file) => file.endsWith('.json'));
    for (const file of files) {
      const data = fs.readFileSync(path.join(PRODUCTS_DIR, file), 'utf-8');
      const product: Product = JSON.parse(data);
      if (product.slug === slug) {
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
