'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle } from 'lucide-react';

export default function ContatoPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

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
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Entre em Contato</h1>
            <p className="text-gray-600 text-lg">Estamos aqui para ajudar! Fale conosco pelo WhatsApp ou preencha o formulário abaixo.</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-3xl font-bold mb-8">Informações de Contato</h2>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">WhatsApp</h3>
                  <p className="text-gray-600 mb-2">+55 11 99999-9999</p>
                  <a
                    href="https://wa.me/5511999999999?text=Olá%20ELDEPARFUM%21%20Gostaria%20de%20fazer%20um%20pedido."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 font-medium hover:text-green-700 transition"
                  >
                    Enviar mensagem →
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Mail className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Email</h3>
                  <p className="text-gray-600">contato@eldeparfum.com</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <Phone className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Telefone</h3>
                  <p className="text-gray-600">+55 11 3000-0000</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <MapPin className="w-6 h-6 text-black" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">Localização</h3>
                  <p className="text-gray-600">São Paulo, SP</p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="pt-8 border-t border-gray-200">
                <h3 className="font-bold mb-4">Atendimento Rápido</h3>
                <div className="space-y-2">
                  <a
                    href="https://wa.me/5511999999999?text=Olá%21%20Qual%20é%20a%20sua%20recomendação%20de%20perfume%20para%20mim?"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition font-medium text-green-700"
                  >
                    Pedir Recomendação 💬
                  </a>
                  <a
                    href="https://wa.me/5511999999999?text=Olá%21%20Gostaria%20de%20saber%20se%20tem%20em%20estoque..."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition font-medium text-blue-700"
                  >
                    Verificar Estoque 📦
                  </a>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-gray-50 rounded-lg border border-gray-200">
                <h2 className="text-3xl font-bold">Envie sua mensagem</h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    placeholder="seu.email@exemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mensagem
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                    placeholder="Escreva sua mensagem aqui..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-900 transition transform hover:scale-105"
                >
                  {submitted ? '✓ Mensagem Enviada!' : 'Enviar Mensagem'}
                </button>

                {submitted && (
                  <p className="text-green-600 text-sm text-center font-medium">
                    Obrigado! Responderemos em breve.
                  </p>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
