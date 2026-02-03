import { NextResponse } from 'next/server';
import { getAllProducts, getProductBySlug, getFilters, filterProducts } from '@/lib/products';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const q = searchParams.get('q');
  const brand = searchParams.get('brand');
  const family = searchParams.get('family');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const sort = searchParams.get('sort');
  const filters = searchParams.get('filters') === 'true';

  try {
    // Get filters
    if (filters) {
      const filtersData = await getFilters();
      return NextResponse.json(filtersData);
    }

    // Get single product by slug
    if (slug) {
      const product = await getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json(product);
    }

    // Get all products with filtering
    const allProducts = await getAllProducts();
    const filteredProducts = filterProducts(
      allProducts,
      q || undefined,
      brand || undefined,
      family || undefined,
      minPrice ? parseInt(minPrice) : undefined,
      maxPrice ? parseInt(maxPrice) : undefined,
      sort || undefined
    );

    return NextResponse.json({
      data: filteredProducts,
      total: filteredProducts.length,
    });
  } catch (error) {
    console.error('Error in products API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
