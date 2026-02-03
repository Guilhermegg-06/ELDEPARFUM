'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { addToCart } from '@/lib/cart';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsAdding(true);
    addToCart(product.slug, product.name, product.ml, product.price, 1);
    
    setTimeout(() => {
      setIsAdding(false);
      // Trigger a custom event to update cart in header
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }, 300);
  };

  return (
    <Link href={`/p/${product.slug}`}>
      <motion.div
        whileHover={{ y: -8 }}
        className="group h-full rounded-lg overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
      >
        {/* Image Container */}
        <div className="relative h-64 bg-gray-100 overflow-hidden">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-full h-full relative"
          >
            <Image
              src={product.images[0] || '/products/placeholder-1.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {product.featured && (
              <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full">
                Destaque
              </span>
            )}
            {product.best_seller && (
              <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full">
                Mais vendido
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col h-[calc(100%-16rem)]">
          {/* Brand */}
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-2">
            {product.brand}
          </p>

          {/* Name */}
          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{product.name}</h3>

          {/* Family */}
          <p className="text-xs text-gray-600 mb-3">{product.family}</p>

          {/* Rating */}
          <div className="flex items-center gap-1 mb-3">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.round(product.rating_avg)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-600 ml-1">
              ({product.rating_count})
            </span>
          </div>

          {/* ML Info */}
          <p className="text-xs text-gray-600 mb-3">{product.ml}ml</p>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Price & Stock */}
          <div className="mb-3">
            <p className="text-lg font-bold text-black mb-1">
              {formatPrice(product.price)}
            </p>
            <p className="text-xs text-green-600 font-medium">
              {product.in_stock_label}
            </p>
          </div>

          {/* Add to Cart Button */}
          <motion.button
            onClick={handleAddToCart}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isAdding}
            className="w-full bg-black text-white py-2.5 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-gray-900 transition disabled:opacity-70"
          >
            <ShoppingCart className="w-4 h-4" />
            {isAdding ? 'Adicionando...' : 'Adicionar'}
          </motion.button>
        </div>
      </motion.div>
    </Link>
  );
}
