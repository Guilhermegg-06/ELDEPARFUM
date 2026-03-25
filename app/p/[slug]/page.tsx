import Link from 'next/link';
import ProductPageContent from '@/components/ProductPageContent';
import { listActiveProducts, getBySlug } from '@/lib/productsRepo';

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getBySlug(slug);

  if (!product) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Produto nao encontrado</h1>
            <Link href="/catalogo" className="text-[#292828] font-medium hover:underline">
              Voltar ao catalogo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const relatedProducts = (await listActiveProducts())
    .filter((item) => item.family === product.family && item.slug !== product.slug)
    .slice(0, 4);

  return <ProductPageContent product={product} relatedProducts={relatedProducts} />;
}
