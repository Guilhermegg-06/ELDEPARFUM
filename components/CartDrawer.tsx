'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { updateCartItemQty, removeFromCart as removeFromCartLib, clearCart } from '@/lib/cart';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import QuantitySelector from './QuantitySelector';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
}

export default function CartDrawer({ isOpen, onClose, items }: CartDrawerProps) {
  const [localItems, setLocalItems] = useState(items);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    city: '',
    delivery: 'entrega',
    payment: 'combinado',
  });
  const [showCustomerForm, setShowCustomerForm] = useState(false);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  const subtotal = localItems.reduce((sum, item) => sum + item.unitPrice * item.qty, 0);
  const total = subtotal;

  const handleQtyChange = (slug: string, qty: number) => {
    const updated = updateCartItemQty(slug, qty);
    setLocalItems(updated);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const handleRemove = (slug: string) => {
    const updated = removeFromCartLib(slug);
    setLocalItems(updated);
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  };

  const handleClearCart = () => {
    if (confirm('Tem certeza que deseja limpar o carrinho?')) {
      clearCart();
      setLocalItems([]);
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  };

  const handleFinalize = () => {
    if (showCustomerForm) {
      const link = generateWhatsAppLink(localItems, total, customerInfo);
      window.open(link, '_blank');
      handleClearCart();
      onClose();
      setShowCustomerForm(false);
      setCustomerInfo({
        name: '',
        city: '',
        delivery: 'entrega',
        payment: 'combinado',
      });
    } else {
      setShowCustomerForm(true);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 z-40 md:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white z-50 shadow-xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-bold">Carrinho</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {localItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-gray-600 font-medium mb-2">Carrinho vazio</p>
                  <p className="text-gray-500 text-sm mb-4">
                    Adicione produtos para começar suas compras.
                  </p>
                  <Link
                    href="/catalogo"
                    onClick={onClose}
                    className="text-black font-medium hover:underline"
                  >
                    Ir ao catálogo
                  </Link>
                </div>
              ) : (
                localItems.map((item) => (
                  <div
                    key={item.slug}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600 mb-2">{item.ml}ml</p>
                      <p className="text-sm font-bold mb-2">
                        {formatPrice(item.unitPrice * item.qty)}
                      </p>
                      <QuantitySelector
                        value={item.qty}
                        onChange={(qty) => handleQtyChange(item.slug, qty)}
                      />
                    </div>
                    <button
                      onClick={() => handleRemove(item.slug)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {localItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-gray-200 p-4 space-y-4"
              >
                {!showCustomerForm ? (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-medium">{formatPrice(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total:</span>
                        <span>{formatPrice(total)}</span>
                      </div>
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

                    <button
                      onClick={handleClearCart}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                    >
                      Limpar carrinho
                    </button>
                  </>
                ) : (
                  <>
                    <div className="space-y-3 bg-gray-50 p-3 rounded-lg">
                      <h3 className="font-bold text-sm">Informações de contato</h3>
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
                      onClick={() => setShowCustomerForm(false)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                    >
                      Voltar
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
