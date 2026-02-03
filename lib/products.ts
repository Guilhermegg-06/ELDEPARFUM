import { Product, Filter } from './types';
import fs from 'fs';
import path from 'path';

const PRODUCTS_DIR = path.join(process.cwd(), 'content', 'products');

export async function getAllProducts(): Promise<Product[]> {
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
