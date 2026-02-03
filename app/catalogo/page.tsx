'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import FiltersBar from '@/components/FiltersBar';
import ProductGrid from '@/components/ProductGrid';
import { Product, Filter } from '@/lib/types';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Filter | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(2000);
  const [sort, setSort] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();
        setProducts(productsData.data);

        const filtersRes = await fetch('/api/products?filters=true');
        const filtersData = await filtersRes.json();
        setFilters(filtersData);
        setMaxPrice(filtersData.priceRange.max);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters via API
  useEffect(() => {
    const buildQueryString = () => {
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (selectedBrands.length > 0) params.append('brand', selectedBrands[0]);
      if (selectedFamilies.length > 0) params.append('family', selectedFamilies[0]);
      if (minPrice > (filters?.priceRange.min || 0)) params.append('minPrice', minPrice.toString());
      if (maxPrice < (filters?.priceRange.max || 2000)) params.append('maxPrice', maxPrice.toString());
      if (sort) params.append('sort', sort);
      return params.toString();
    };

    const fetchFiltered = async () => {
      try {
        const queryString = buildQueryString();
        const url = `/api/products${queryString ? '?' + queryString : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        setProducts(data.data);
      } catch (error) {
        console.error('Error filtering products:', error);
      }
    };

    if (filters) {
      fetchFiltered();
    }
  }, [searchQuery, selectedBrands, selectedFamilies, minPrice, maxPrice, sort, filters]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedFamilies([]);
    setMinPrice(filters?.priceRange.min || 0);
    setMaxPrice(filters?.priceRange.max || 2000);
    setSort('');
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
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Catálogo de Perfumes</h1>
            <p className="text-gray-600 text-lg">
              {products.length} produtos encontrados
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="sticky top-20"
              >
                {filters && (
                  <FiltersBar
                    brands={filters.brands}
                    families={filters.families}
                    priceRange={filters.priceRange}
                    onBrandChange={setSelectedBrands}
                    onFamilyChange={setSelectedFamilies}
                    onPriceChange={(min, max) => {
                      setMinPrice(min);
                      setMaxPrice(max);
                    }}
                    onSort={setSort}
                    onSearch={setSearchQuery}
                    onClear={handleClearFilters}
                    selectedBrands={selectedBrands}
                    selectedFamilies={selectedFamilies}
                    searchQuery={searchQuery}
                  />
                )}
              </motion.div>
            </div>

            {/* Products Grid */}
            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ProductGrid products={products} isLoading={isLoading} />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
