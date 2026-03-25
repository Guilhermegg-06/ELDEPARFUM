import { Product, Filter } from './types';
import { getBySlug, listActiveProducts } from './productsRepo';

export const getAllProducts = listActiveProducts;
export const getProductBySlug = getBySlug;

export function buildFilters(products: Product[]): Filter {
  const brands = Array.from(new Set(products.map((product) => product.brand).filter(Boolean))).sort();
  const families = Array.from(new Set(products.map((product) => product.family).filter(Boolean))).sort();
  const prices = products.map((product) => product.price).sort((a, b) => a - b);

  return {
    brands,
    families,
    priceRange: {
      min: prices[0] || 0,
      max: prices[prices.length - 1] || 0,
    },
  };
}

export async function getFilters(): Promise<Filter> {
  const products = await getAllProducts();
  return buildFilters(products);
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

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q)
    );
  }

  if (brand) {
    filtered = filtered.filter((product) => product.brand === brand);
  }

  if (family) {
    filtered = filtered.filter((product) => product.family === family);
  }

  if (minPrice !== undefined) {
    filtered = filtered.filter((product) => product.price >= minPrice);
  }

  if (maxPrice !== undefined) {
    filtered = filtered.filter((product) => product.price <= maxPrice);
  }

  if (sort === 'price-asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-desc') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (sort === 'featured') {
    filtered.sort((a, b) => {
      if (a.featured === b.featured) {
        return 0;
      }

      return a.featured ? -1 : 1;
    });
  } else if (sort === 'best-seller') {
    filtered.sort((a, b) => b.rating_count - a.rating_count);
  }

  return filtered;
}
