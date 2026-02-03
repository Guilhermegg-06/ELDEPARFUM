'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Star, ArrowLeft, CheckCircle } from 'lucide-react';
import QuantitySelector from '@/components/QuantitySelector';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { addToCart } from '@/lib/cart';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(`/api/products?slug=${params.slug}`);
        if (!res.ok) throw new Error('Product not found');
        const prod = await res.json();
        
        setProduct(prod);
        setSelectedImage(0);

        // Get related products
        const allRes = await fetch('/api/products');
        const allData = await allRes.json();
        const related = allData.data
          .filter((p: Product) => p.family === prod.family && p.slug !== prod.slug)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [params.slug]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.slug, product.name, product.ml, product.price, qty);
      setIsAdded(true);
      window.dispatchEvent(new CustomEvent('cartUpdated'));

      setTimeout(() => {
        setIsAdded(false);
        setQty(1);
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-gray-200 rounded-lg h-96 animate-pulse" />
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Produto não encontrado</h1>
            <Link href="/catalogo" className="text-black font-medium hover:underline">
              Voltar ao catálogo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Back Button */}
      <section className="py-6 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao catálogo
          </Link>
        </div>
      </section>

      {/* Product Details */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Images */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-4">
                <div className="relative h-96 md:h-[500px] bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={product.images[selectedImage] || '/products/placeholder-1.jpg'}
                    alt={product.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-3">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === idx ? 'border-black' : 'border-gray-200'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${product.name} ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="flex flex-col justify-between"
            >
              {/* Header */}
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide font-medium mb-2">
                  {product.brand}
                </p>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{product.name}</h1>

                {/* Rating */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(product.rating_avg)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.rating_avg} ({product.rating_count} avaliações)
                  </span>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <p className="text-4xl font-bold text-black mb-2">
                    {formatPrice(product.price)}
                  </p>
                  <p className="text-green-600 font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {product.in_stock_label}
                  </p>
                </div>

                {/* Description */}
                <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                  {product.description}
                </p>

                {/* Key Info */}
                <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Volume</p>
                    <p className="text-lg font-bold">{product.ml}ml</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Gênero</p>
                    <p className="text-lg font-bold capitalize">{product.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Família</p>
                    <p className="text-lg font-bold">{product.family}</p>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 block mb-2">
                      Quantidade
                    </label>
                    <QuantitySelector value={qty} onChange={setQty} />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition ${
                    isAdded
                      ? 'bg-green-600 text-white'
                      : 'bg-black text-white hover:bg-gray-900'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isAdded ? 'Adicionado ao carrinho!' : 'Adicionar ao Carrinho'}
                </motion.button>
              </div>
            </motion.div>
          </div>

          {/* Notes Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Notas de Topo</h3>
              <ul className="space-y-2">
                {product.notes_top.map((note, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-black rounded-full" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Notas de Coração</h3>
              <ul className="space-y-2">
                {product.notes_heart.map((note, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-black rounded-full" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold mb-4">Notas de Fundo</h3>
              <ul className="space-y-2">
                {product.notes_base.map((note, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-gray-700">
                    <div className="w-2 h-2 bg-black rounded-full" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Related Products */}
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
                        <Image
                          src={related.images[0]}
                          alt={related.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                          {related.brand}
                        </p>
                        <h3 className="font-bold text-gray-900 mb-1">{related.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{related.family}</p>
                        <p className="text-lg font-bold text-black">
                          {formatPrice(related.price)}
                        </p>
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
