import HomePageContent from '@/components/HomePageContent';
import { filterProducts } from '@/lib/products';
import { listActiveProducts } from '@/lib/productsRepo';

export default async function Home() {
  const products = await listActiveProducts();
  const featuredProducts = filterProducts(
    products,
    undefined,
    undefined,
    undefined,
    undefined,
    undefined,
    'featured'
  ).slice(0, 8);

  return <HomePageContent products={featuredProducts} />;
}
