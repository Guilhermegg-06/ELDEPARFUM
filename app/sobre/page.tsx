'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Target, Zap } from 'lucide-react';

export default function SobrePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Sobre ELDEPARFUM</h1>
            <p className="text-gray-600 text-lg">Conheça nossa história e missão</p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="prose prose-lg max-w-none"
          >
            <h2 className="text-3xl font-bold mb-6">Nossa História</h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              ELDEPARFUM nasceu da paixão por fragrâncias e da vontade de compartilhar 
              experiências sensoriais únicas com nossos clientes. Somos um catálogo 
              curado de perfumes premium, trazendo o melhor das marcas mais renomadas 
              do mundo para sua casa.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Nossa missão é simplificar a jornada de descoberta de fragrâncias perfeitas, 
              oferecendo descrições detalhadas, recomendações e um processo de compra 
              fácil e seguro.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-12"
          >
            Nossos Valores
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Heart,
                title: 'Paixão',
                description: 'Amamos perfumes e compartilhamos essa paixão com cada cliente por meio dos nossos contratipos, cuidados e atenção.',
              },
              {
                icon: Target,
                title: 'Qualidade',
                description: 'Selecionamos apenas as melhores fragrâncias contratipos do mercado.',
              },
              {
                icon: Zap,
                title: 'Inovação',
                description: 'Constantemente buscamos melhorar a experiência de compra.',
              },
            ].map((value, idx) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="p-8 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition"
                >
                  <Icon className="w-12 h-12 text-black mb-4" />
                  <h3 className="text-xl font-bold mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-12"
          >
            Perguntas Frequentes
          </motion.h2>

          <div className="space-y-6">
            {[
              {
                q: 'Como funcionam as compras?',
                a: 'Você adiciona os produtos ao carrinho e finaliza a compra direto no WhatsApp, facilitando a comunicação direta e negociação.',
              },
              {
                q: 'Qual é o prazo de entrega?',
                a: 'O prazo varia conforme a localização. Após confirmação do pedido no WhatsApp, nossa equipe informará o prazo exato.',
              },
              {
                q: 'Aceita devoluções?',
                a: 'Sim! Temos política de devolução de 7 dias se o produto chegar com defeito. Consulte nossa equipe no WhatsApp.',
              },
              {
                q: 'Perfumes contratipos. Como eles funcionam?',
                a: 'A marca do contratipo cria uma fórmula própria para ficar parecida com o perfume de referência. Normalmente usam fragrâncias/aromas (óleos aromáticos) + álcool + fixadores, em concentrações tipo EDT/EDP. O objetivo é entregar um cheiro semelhante por um preço bem menor.',
              },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-gray-50 rounded-lg border border-gray-200"
              >
                <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                <p className="text-gray-700">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
