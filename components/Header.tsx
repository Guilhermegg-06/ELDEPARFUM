'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    // Get cart count
    const cart = localStorage.getItem('eldeparfum_cart');
    if (cart) {
      const items = JSON.parse(cart);
      const count = items.reduce((sum: number, item: any) => sum + item.qty, 0);
      setCartCount(count);
    }

    // Listen for scroll
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm'
          : 'bg-white border-b border-gray-100'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg md:text-xl">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">EP</span>
          </div>
          <span className="hidden sm:inline text-black">ELDEPARFUM</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/catalogo" className="text-sm font-medium text-gray-700 hover:text-black transition">
            Catálogo
          </Link>
          <Link href="/sobre" className="text-sm font-medium text-gray-700 hover:text-black transition">
            Sobre
          </Link>
          <Link href="/contato" className="text-sm font-medium text-gray-700 hover:text-black transition">
            Contato
          </Link>
        </div>

        {/* Cart Icon */}
        <div className="flex items-center gap-4">
          <Link href="/carrinho" className="relative">
            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-gray-700 hover:text-black transition" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-black transition"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden border-t border-gray-100 bg-white"
        >
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/catalogo"
              className="block text-sm font-medium text-gray-700 hover:text-black transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Catálogo
            </Link>
            <Link
              href="/sobre"
              className="block text-sm font-medium text-gray-700 hover:text-black transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Sobre
            </Link>
            <Link
              href="/contato"
              className="block text-sm font-medium text-gray-700 hover:text-black transition py-2"
              onClick={() => setIsOpen(false)}
            >
              Contato
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}
