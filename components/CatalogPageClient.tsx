'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import FiltersBar from '@/components/FiltersBar';
import ProductGrid from '@/components/ProductGrid';
import { filterProducts } from '@/lib/products';
import { Filter, Product } from '@/lib/types';

type CatalogPageClientProps = {
  initialProducts: Product[];
  filters: Filter;
};

export default function CatalogPageClient({
  initialProducts,
  filters,
}: CatalogPageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFamilies, setSelectedFamilies] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState(filters.priceRange.min);
  const [maxPrice, setMaxPrice] = useState(filters.priceRange.max);
  const [sort, setSort] = useState('');

  const products = useMemo(
    () =>
      filterProducts(
        initialProducts,
        searchQuery || undefined,
        selectedBrands[0],
        selectedFamilies[0],
        minPrice,
        maxPrice,
        sort || undefined
      ),
    [initialProducts, maxPrice, minPrice, searchQuery, selectedBrands, selectedFamilies, sort]
  );

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedBrands([]);
    setSelectedFamilies([]);
    setMinPrice(filters.priceRange.min);
    setMaxPrice(filters.priceRange.max);
    setSort('');
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="py-12 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Catalogo de Perfumes</h1>
            <p className="text-[#292828] text-lg">{products.length} produtos encontrados</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="sticky top-20"
              >
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
              </motion.div>
            </div>

            <div className="lg:col-span-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ProductGrid products={products} />
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
