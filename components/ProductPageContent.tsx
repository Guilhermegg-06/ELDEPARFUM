'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, ArrowLeft, CheckCircle } from 'lucide-react';
import QuantitySelector from '@/components/QuantitySelector';
import { addToCart } from '@/lib/cart';
import { formatPrice } from '@/lib/format';
import { Product } from '@/lib/types';

function NotesList({ notes }: { notes: string[] }) {
  if (!notes.length) {
    return <p className="text-sm text-[#292828]">Nao informado.</p>;
  }

  return (
    <ul className="space-y-2">
      {notes.map((note, idx) => (
        <li key={`${note}-${idx}`} className="flex items-center gap-2 text-[#292828]">
          <div className="w-2 h-2 bg-black rounded-full" />
          {note}
        </li>
      ))}
    </ul>
  );
}

type ProductPageContentProps = {
  product: Product;
  relatedProducts: Product[];
};

export default function ProductPageContent({
  product,
  relatedProducts,
}: ProductPageContentProps) {
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const galleryImages = useMemo<(string | null)[]>(() => {
    if (product.images.length === 0) {
      return [null];
    }

    return product.images;
  }, [product.images]);

  const selectedImageUrl = galleryImages[selectedImage] || null;

  const handleAddToCart = () => {
    addToCart(product.slug, product.name, product.ml, product.price, qty);
    setIsAdded(true);
    window.dispatchEvent(new CustomEvent('cartUpdated'));

    setTimeout(() => {
      setIsAdded(false);
      setQty(1);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-[#292828] hover:text-[#292828] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao catalogo
          </Link>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4">
                <div className="relative h-96 md:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                  {selectedImageUrl ? (
                    <Image
                      src={selectedImageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-[#292828] text-sm">
                      Imagem indisponivel
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                {galleryImages.map((imageUrl, idx) => (
                  <button
                    key={`${imageUrl || 'placeholder'}-${idx}`}
                    type="button"
                    aria-label={`Selecionar imagem ${idx + 1}`}
                    aria-pressed={selectedImage === idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      selectedImage === idx ? 'border-black' : 'border-gray-200'
                    }`}
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] text-[#292828] bg-gray-100">
                        Sem imagem
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col justify-between"
            >
              <div>
                <p className="text-sm text-[#292828] uppercase tracking-wide font-medium mb-2">
                  {product.brand}
                </p>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(product.rating_avg)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-[#292828]/30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[#292828]">
                    {product.rating_avg} ({product.rating_count} avaliacoes)
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-4xl font-bold text-[#292828] mb-2">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-green-600 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {product.in_stock_label}
                  </p>
                </div>

                <p className="text-[#292828] text-lg mb-8 leading-relaxed">
                  {product.description || 'Descricao indisponivel.'}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-[#292828] mb-1">Marca</p>
                    <p className="text-lg font-bold">{product.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#292828] mb-1">Familia</p>
                    <p className="text-lg font-bold">{product.family || 'Nao informado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#292828] mb-1">Volume</p>
                    <p className="text-lg font-bold">{product.ml}ml</p>
                  </div>
                  <div>
                    <p className="text-sm text-[#292828] mb-1">Status</p>
                    <p className="text-lg font-bold">{product.active ? 'Ativo' : 'Inativo'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-[#292828] block mb-2">
                      Quantidade
                    </label>
                    <QuantitySelector value={qty} onChange={setQty} />
                  </div>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition ${
                    isAdded ? 'bg-green-600 text-white' : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isAdded ? 'Adicionado ao carrinho!' : 'Adicionar ao Carrinho'}
                </motion.button>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Notas de Topo</h3>
              <NotesList notes={product.notes_top} />
            </div>

            <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Notas de Coracao</h3>
              <NotesList notes={product.notes_heart} />
            </div>

            <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Notas de Fundo</h3>
              <NotesList notes={product.notes_base} />
            </div>
          </motion.div>

          {relatedProducts.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mt-16"
            >
              <h2 className="text-3xl font-bold mb-8">Produtos Relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((related) => (
                  <Link key={related.slug} href={`/p/${related.slug}`}>
                    <motion.div
                      whileHover={{ y: -8 }}
                      className="rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer h-full"
                    >
                      <div className="relative h-48 bg-gray-100">
                        {related.images[0] ? (
                          <Image
                            src={related.images[0]}
                            alt={related.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-sm text-[#292828]">
                            Sem imagem
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-[#292828] uppercase tracking-wide mb-1">
                          {related.brand}
                        </p>
                        <h3 className="font-bold text-[#292828] mb-1">{related.name}</h3>
                        <p className="text-sm text-[#292828] mb-3">{related.family}</p>
                        <p className="text-lg font-bold text-[#292828]">{formatPrice(related.price)}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.section>
          )}
        </div>
      </section>
    </main>
  );
}
