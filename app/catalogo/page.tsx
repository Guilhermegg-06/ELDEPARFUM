import CatalogPageClient from '@/components/CatalogPageClient';
import { buildFilters } from '@/lib/products';
import { listActiveProducts } from '@/lib/productsRepo';

export default async function CatalogPage() {
  const products = await listActiveProducts();
  const filters = buildFilters(products);

  return <CatalogPageClient initialProducts={products} filters={filters} />;
}
