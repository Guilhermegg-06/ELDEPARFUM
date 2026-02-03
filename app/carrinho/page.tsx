'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, ArrowLeft, MessageCircle } from 'lucide-react';
import QuantitySelector from '@/components/QuantitySelector';
import { CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { getCart, updateCartItemQty, removeFromCart, clearCart } from '@/lib/cart';
import { generateWhatsAppLink } from '@/lib/whatsapp';

interface CartItemWithDetails extends CartItem {
  image?: string;
}

export default function CarrinhoPage() {
  const [items, setItems] = useState<CartItemWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    city: '',
    delivery: 'entrega',
    payment: 'combinado',
  });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      try {
        const cart = getCart();
        // Enrich with product images from API
        const enriched = await Promise.all(
          cart.map(async (item) => {
            try {
              const res = await fetch(`/api/products?slug=${item.slug}`);
              const product = await res.json();
              return {
                ...item,
                image: product?.images[0],
              };
            } catch {
              return item;
            }
          })
        );
        setItems(enriched);
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const total = subtotal;

  const handleQtyChange = (slug: string, qty: number) => {
    const updated = updateCartItemQty(slug, qty);
    setItems(
      updated.map((item) => {
        const foundItem = items.find((i) => i.slug === item.slug);
        return foundItem || item;
      })
    );
  };

  const handleRemove = (slug: string) => {
    const updated = removeFromCart(slug);
    setItems(
      updated.map((item) => {
        const foundItem = items.find((i) => i.slug === item.slug);
        return foundItem || item;
      })
    );
  };

  const handleClearCart = () => {
    if (confirm('Tem certeza que deseja limpar o carrinho?')) {
      clearCart();
      setItems([]);
    }
  };

  const handleFinalize = () => {
    if (showForm) {
      const link = generateWhatsAppLink(items, total, customerInfo);
      window.open(link, '_blank');
      clearCart();
      setItems([]);
      setShowForm(false);
      setCustomerInfo({
        name: '',
        city: '',
        delivery: 'entrega',
        payment: 'combinado',
      });
    } else {
      setShowForm(true);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <section className="py-8 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao catálogo
          </Link>
          <h1 className="text-4xl font-bold">Meu Carrinho</h1>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <h2 className="text-2xl font-bold mb-4">Carrinho vazio</h2>
              <p className="text-gray-600 mb-8">Você ainda não adicionou nenhum produto.</p>
              <Link
                href="/catalogo"
                className="inline-block px-8 py-4 bg-black text-white rounded-lg font-bold hover:bg-gray-900 transition"
              >
                Explorar Catálogo
              </Link>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Items */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {items.map((item) => (
                    <motion.div
                      key={item.slug}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex gap-4"
                    >
                      {/* Image */}
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={96}
                            height={96}
                            className="object-cover"
                          />
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1">
                        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">{item.ml}ml</p>
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          {formatPrice(item.unitPrice)} cada
                        </p>

                        <div className="flex items-center gap-3">
                          <QuantitySelector
                            value={item.qty}
                            onChange={(qty) => handleQtyChange(item.slug, qty)}
                          />
                          <button
                            onClick={() => handleRemove(item.slug)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Total */}
                      <div className="text-right flex flex-col justify-center">
                        <p className="text-xl font-bold text-black">
                          {formatPrice(item.unitPrice * item.qty)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {items.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="mt-6 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                  >
                    Limpar carrinho
                  </button>
                )}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="sticky top-20 p-6 bg-gray-50 rounded-lg border border-gray-200 space-y-4"
                >
                  <h3 className="text-lg font-bold">Resumo</h3>

                  {!showForm ? (
                    <>
                      <div className="space-y-2 border-b border-gray-300 pb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-medium">{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Frete:</span>
                          <span>A combinar</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-xl font-bold mb-6">
                        <span>Total:</span>
                        <span>{formatPrice(total)}</span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleFinalize}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Finalizar no WhatsApp
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3 bg-white p-3 rounded border border-gray-300">
                        <h4 className="font-bold text-sm">Informações de Contato</h4>
                        <input
                          type="text"
                          placeholder="Nome completo"
                          value={customerInfo.name}
                          onChange={(e) =>
                            setCustomerInfo({ ...customerInfo, name: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <input
                          type="text"
                          placeholder="Cidade/Bairro"
                          value={customerInfo.city}
                          onChange={(e) =>
                            setCustomerInfo({ ...customerInfo, city: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                        />
                        <select
                          value={customerInfo.delivery}
                          onChange={(e) =>
                            setCustomerInfo({ ...customerInfo, delivery: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                        >
                          <option value="entrega">Entrega</option>
                          <option value="retirada">Retirada</option>
                        </select>
                        <select
                          value={customerInfo.payment}
                          onChange={(e) =>
                            setCustomerInfo({ ...customerInfo, payment: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
                        >
                          <option value="combinado">Combinado</option>
                          <option value="credito">Crédito</option>
                          <option value="debito">Débito</option>
                          <option value="pix">PIX</option>
                        </select>
                      </div>

                      <div className="flex justify-between text-xl font-bold">
                        <span>Total:</span>
                        <span>{formatPrice(total)}</span>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleFinalize}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition"
                      >
                        <MessageCircle className="w-5 h-5" />
                        Enviar no WhatsApp
                      </motion.button>

                      <button
                        onClick={() => setShowForm(false)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                      >
                        Voltar
                      </button>
                    </>
                  )}
                </motion.div>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
