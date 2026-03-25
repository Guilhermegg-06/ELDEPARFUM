'use client';

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

type HomePageContentProps = {
  products: Product[];
};

export default function HomePageContent({ products }: HomePageContentProps) {
  return (
    <main>
      <motion.section
        className="relative h-screen flex items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 z-0" />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_black_1px,_transparent_1px)] bg-[length:40px_40px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Bem-vindo a ELDEPARFUM
              </span>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold mb-6 text-[#292828] leading-tight"
            >
              Descubra Fragrancias
              <br />
              <span className="text-[#292828]">que Contam Historias</span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-[#292828] mb-8 max-w-2xl mx-auto"
            >
              Explore nossa colecao curada de perfumes premium, de classicos intemporais a
              fragrancias exclusivas que expressam sua personalidade.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-black text-white rounded-lg font-bold hover:bg-gray-900 transition transform hover:scale-105"
              >
                Explorar Catalogo
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/sobre"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-black text-[#292828] rounded-lg font-bold hover:bg-black hover:text-white transition"
              >
                Saiba Mais
              </Link>
            </motion.div>
          </motion.div>
        </div>

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

      <section className="py-20 bg-white text-[#292828]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#292828]">Destaques</h2>
            <p className="text-[#292828] text-lg">Nossas fragrancias mais procuradas e avaliadas.</p>
          </motion.div>

          <ProductGrid products={products} />

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

      <section className="py-20 bg-gray-50 text-[#292828]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-[#292828]">
              Por que escolher ELDEPARFUM?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Qualidade Premium',
                description: 'Selecionamos apenas fragrancias das melhores marcas do mundo.',
                icon: 'Qualidade',
              },
              {
                title: 'Descricoes Detalhadas',
                description: 'Conheca notas olfativas, composicao e origem de cada perfume.',
                icon: 'Notas',
              },
              {
                title: 'Compra Facil',
                description: 'Carrinho simples e checkout rapido direto no WhatsApp.',
                icon: 'Compra',
              },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-8 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition"
              >
                <div className="text-sm font-semibold uppercase tracking-[0.2em] mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-[#292828]">{feature.title}</h3>
                <p className="text-[#292828]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
