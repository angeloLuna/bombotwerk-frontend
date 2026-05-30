'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getProducts } from '@/lib/api';
import type { ApiProduct } from '@/types/api';
import ProductCard from '@/components/ui/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { Sparkles, SlidersHorizontal, Search } from 'lucide-react';

const CATEGORIES = [
  { label: 'Todos', value: null },
  { label: 'Básicos', value: 'Básicos' },
  { label: 'Falda mesh', value: 'Falda mesh' },
  { label: 'Estampados', value: 'Cacheteros estampados' },
  { label: 'Sets', value: 'Sets' },
  { label: 'Tops', value: 'Tops' },
  { label: 'Accesorios', value: 'Accesorios' },
];

const AVAILABILITIES = [
  { label: 'Envío inmediato', value: 'ready_to_ship' },
  { label: 'Bajo pedido', value: 'made_to_order' },
];

const SORT_OPTIONS = [
  { label: 'Recientes', value: 'recent' },
  { label: 'Precio menor', value: 'price_asc' },
  { label: 'Precio mayor', value: 'price_desc' },
];

export default function ShopPage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string>('recent');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts({
        category: selectedCategory ?? undefined,
        availability: selectedAvailability ?? undefined,
        sort: selectedSort,
        search: searchQuery || undefined,
      });
      setProducts(data);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar los productos de la tienda.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedAvailability, selectedSort, searchQuery]);

  // Debounced fetch to handle search typing smoothly
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="w-full min-h-[90vh] bg-brand-dark pb-24 text-left">
      {/* 1. Header Section */}
      <section className="pt-12 pb-8 px-4 text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] tracking-widest font-display text-brand-magenta font-black flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-magenta fill-brand-magenta/10" />
          ARCHIVO DE MODA
        </span>
        <h1 className="text-4xl md:text-6xl font-serif text-white tracking-wide uppercase">
          TODO EL <span className="italic font-normal text-brand-magenta text-glow-magenta">MOVIMIENTO</span>
        </h1>
        <p className="text-xs md:text-sm text-neutral-400 font-sans font-light max-w-xl mx-auto tracking-wide leading-relaxed">
          Explora piezas diseñadas para moverse contigo: básicos, mesh, estampados y drops limitados.
        </p>
        <div className="w-10 h-[1px] bg-brand-magenta/60 mx-auto mt-4" />
      </section>

      {/* 2. Filters & Controls Container */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 space-y-6 mb-10">
        <div className="border border-white/5 rounded-2xl bg-brand-charcoal/30 backdrop-blur-md p-5 md:p-6 space-y-4">
          
          {/* Header Row: Title & Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white">
              <SlidersHorizontal className="w-4 h-4 text-brand-magenta" />
              <span className="text-xs font-display font-bold tracking-widest uppercase">Filtros</span>
            </div>

            {/* Search Input widget */}
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-brand-dark/50 border border-white/10 rounded-lg px-9 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-magenta transition-colors font-sans"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white text-xs font-sans"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categories Pills Row */}
          <div className="space-y-2">
            <span className="block text-[10px] font-display font-bold tracking-widest text-neutral-500 uppercase">Categoría</span>
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar scroll-smooth">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat.value;
                return (
                  <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-4 py-2 border rounded-full text-xs font-display tracking-widest uppercase whitespace-nowrap transition-all duration-300 shrink-0 ${
                      isActive
                        ? 'bg-brand-magenta border-brand-magenta text-black shadow-magenta-glow font-black'
                        : 'border-white/10 text-white bg-transparent hover:border-white/30'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Availability & Sorting Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/5">
            {/* Availability pills */}
            <div className="space-y-2">
              <span className="block text-[10px] font-display font-bold tracking-widest text-neutral-500 uppercase">Disponibilidad</span>
              <div className="flex gap-2">
                {AVAILABILITIES.map((av) => {
                  const isActive = selectedAvailability === av.value;
                  return (
                    <button
                      key={av.label}
                      onClick={() => setSelectedAvailability(isActive ? null : av.value)}
                      className={`px-4 py-2 border rounded-full text-xs font-display tracking-widest uppercase whitespace-nowrap transition-all duration-300 ${
                        isActive
                          ? 'bg-brand-magenta border-brand-magenta text-black shadow-magenta-glow font-black'
                          : 'border-white/10 text-white bg-transparent hover:border-white/30'
                      }`}
                    >
                      {av.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sorting selector dropdown */}
            <div className="space-y-2 md:text-right">
              <span className="block text-[10px] font-display font-bold tracking-widest text-neutral-500 uppercase md:pr-1">Ordenar por</span>
              <div className="inline-flex gap-2 flex-wrap md:justify-end">
                {SORT_OPTIONS.map((opt) => {
                  const isActive = selectedSort === opt.value;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setSelectedSort(opt.value)}
                      className={`px-3 py-1.5 border text-[10px] font-display tracking-widest uppercase transition-all duration-300 ${
                        isActive
                          ? 'bg-white/10 border-brand-magenta text-brand-magenta font-black'
                          : 'border-white/5 text-neutral-400 bg-transparent hover:border-white/20'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Product Grid Area */}
      <section className="max-w-6xl mx-auto px-4 md:px-8">
        {loading ? (
          <div className="py-24">
            <LoadingSpinner message="EXPLORANDO EL ARCHIVO..." />
          </div>
        ) : error ? (
          <div className="py-16">
            <ErrorState message={error} onRetry={fetchProducts} />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 bg-brand-charcoal/20 border border-white/5 rounded-2xl">
            <EmptyState
              title="SIN PIEZAS"
              message="No encontramos piezas con estos filtros."
              actionLabel="Limpiar filtros"
              actionHref="#"
            />
            {/* Quick helper to reset filters */}
            <div className="text-center -mt-6 pb-12">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedAvailability(null);
                  setSearchQuery('');
                  setSelectedSort('recent');
                }}
                className="text-xs font-display font-bold tracking-widest text-brand-magenta hover:text-white transition-colors uppercase underline"
              >
                Restablecer Todo
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                className="rounded-2xl"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
