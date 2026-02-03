'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FiltersBarProps {
  brands: string[];
  families: string[];
  priceRange: { min: number; max: number };
  onBrandChange: (brands: string[]) => void;
  onFamilyChange: (families: string[]) => void;
  onPriceChange: (min: number, max: number) => void;
  onSort: (sort: string) => void;
  onSearch: (query: string) => void;
  onClear: () => void;
  selectedBrands: string[];
  selectedFamilies: string[];
  searchQuery: string;
}

export default function FiltersBar({
  brands,
  families,
  priceRange,
  onBrandChange,
  onFamilyChange,
  onPriceChange,
  onSort,
  onSearch,
  onClear,
  selectedBrands,
  selectedFamilies,
  searchQuery,
}: FiltersBarProps) {
  const [minPrice, setMinPrice] = useState(priceRange.min);
  const [maxPrice, setMaxPrice] = useState(priceRange.max);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleBrandToggle = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      onBrandChange(selectedBrands.filter((b) => b !== brand));
    } else {
      onBrandChange([...selectedBrands, brand]);
    }
  };

  const handleFamilyToggle = (family: string) => {
    if (selectedFamilies.includes(family)) {
      onFamilyChange(selectedFamilies.filter((f) => f !== family));
    } else {
      onFamilyChange([...selectedFamilies, family]);
    }
  };

  const handlePriceChange = () => {
    onPriceChange(minPrice, maxPrice);
  };

  const hasFilters =
    selectedBrands.length > 0 ||
    selectedFamilies.length > 0 ||
    minPrice > priceRange.min ||
    maxPrice < priceRange.max ||
    searchQuery;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Buscar por nome, marca..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
        />
      </div>

      {/* Sort */}
      <div>
        <select
          onChange={(e) => onSort(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent bg-white"
        >
          <option value="">Ordenar por</option>
          <option value="featured">Destaque</option>
          <option value="best-seller">Mais vendido</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
        </select>
      </div>

      {/* Mobile Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden w-full px-4 py-2.5 border border-gray-300 rounded-lg font-medium text-sm bg-white hover:bg-gray-50 transition"
      >
        {isExpanded ? 'Ocultar filtros' : 'Mostrar filtros'}
      </button>

      {/* Filters */}
      <AnimatePresence>
        {(isExpanded || window.innerWidth >= 768) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 md:block"
          >
            {/* Price Filter */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Preço</h4>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    placeholder="Mín"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                  <input
                    type="number"
                    min={priceRange.min}
                    max={priceRange.max}
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value))}
                    placeholder="Máx"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <button
                  onClick={handlePriceChange}
                  className="w-full px-3 py-2 bg-black text-white rounded text-sm font-medium hover:bg-gray-900 transition"
                >
                  Aplicar
                </button>
              </div>
            </div>

            {/* Brands */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Marcas</h4>
              <div className="space-y-2">
                {brands.map((brand) => (
                  <label key={brand} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                      className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{brand}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Families */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Famílias</h4>
              <div className="space-y-2">
                {families.map((family) => (
                  <label key={family} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFamilies.includes(family)}
                      onChange={() => handleFamilyToggle(family)}
                      className="w-4 h-4 rounded border-gray-300 accent-black cursor-pointer"
                    />
                    <span className="text-sm text-gray-700">{family}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={onClear}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
        >
          <X className="w-4 h-4" />
          Limpar filtros
        </button>
      )}
    </div>
  );
}
