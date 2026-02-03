'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import { Product } from '@/lib/types';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products?q=&sort=featured');
        const data = await response.json();
        setProducts(data.data.slice(0, 8));
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  return (
    <main>
      {/* Hero Section */}
      <motion.section
        className="relative h-screen flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 z-0" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_black_1px,_transparent_1px)] bg-[length:40px_40px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Bem-vindo à ELDEPARFUM
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold mb-6 text-black leading-tight"
            >
              Descubra Fragrâncias<br />
              <span className="text-gray-600">que Contam Histórias</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
            >
              Explore nossa coleção curada de perfumes premium, desde clássicos intemporais até fragrâncias exclusivas que expressam sua personalidade.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-lg font-bold hover:bg-gray-900 transition transform hover:scale-105"
              >
                Explorar Catálogo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/sobre"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-black text-black rounded-lg font-bold hover:bg-black hover:text-white transition"
              >
                Saiba Mais
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        >
          <div className="w-6 h-10 border-2 border-black rounded-full flex items-start justify-center pt-2">
            <div className="w-1 h-2 bg-black rounded-full" />
          </div>
        </motion.div>
      </motion.section>

      {/* Destaques */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Destaques</h2>
            <p className="text-gray-600 text-lg">Nossas fragrâncias mais procuradas e avaliadas.</p>
          </motion.div>

          <ProductGrid products={products} isLoading={isLoading} />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-12 flex justify-center"
          >
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-lg font-bold hover:bg-gray-900 transition transform hover:scale-105"
            >
              Ver Todos os Produtos
              <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Por que escolher ELDEPARFUM?</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Qualidade Premium',
                description: 'Selecionamos apenas fragrâncias das melhores marcas do mundo.',
                icon: '✨',
              },
              {
                title: 'Descrições Detalhadas',
                description: 'Conheça notas olfativas, composição e origem de cada perfume.',
                icon: '👃',
              },
              {
                title: 'Compra Fácil',
                description: 'Carrinho simples e checkout rápido direto no WhatsApp.',
                icon: '💬',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
