'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getProducts } from '@/lib/api';
import type { ApiProduct } from '@/types/api';
import ProductCard from '@/components/ui/ProductCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import { Sparkles, SlidersHorizontal, Search, ChevronDown, X } from 'lucide-react';

const CATEGORIES = [
  { label: 'Todos', value: null },
  { label: 'Cacheteros', value: 'cacheteros' },
  { label: 'Bodys', value: 'bodys' },
  { label: 'Conjuntos', value: 'conjuntos' },
  { label: 'Básicos', value: 'Básicos' },
  { label: 'Faldas', value: 'faldas-flecos' },
  { label: 'Arneses', value: 'arneses' },
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

function ShopContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<string>('recent');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSale, setSelectedSale] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Calculate active filters
  const activeFilters = [];
  if (selectedCategory) {
    const catObj = CATEGORIES.find(c => c.value === selectedCategory);
    activeFilters.push({ key: 'category', label: catObj?.label || selectedCategory, value: selectedCategory });
  }
  if (selectedAvailability) {
    const avObj = AVAILABILITIES.find(a => a.value === selectedAvailability);
    activeFilters.push({ key: 'availability', label: avObj?.label || selectedAvailability, value: selectedAvailability });
  }
  if (selectedSale) {
    activeFilters.push({ key: 'sale', label: 'Oferta', value: true });
  }
  if (searchQuery) {
    activeFilters.push({ key: 'search', label: `"${searchQuery}"`, value: searchQuery });
  }
  const activeFiltersCount = activeFilters.length;

  // Handle URL parameters for category, sale, and sort
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam.toLowerCase());
    } else {
      setSelectedCategory(null);
    }

    const saleParam = searchParams.get('sale');
    if (saleParam === 'true') {
      setSelectedSale(true);
    } else {
      setSelectedSale(false);
    }

    const sortParam = searchParams.get('sort');
    if (sortParam && ['recent', 'price_asc', 'price_desc'].includes(sortParam)) {
      setSelectedSort(sortParam);
    }
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts({
        category: selectedCategory ?? undefined,
        availability: selectedAvailability ?? undefined,
        sort: selectedSort,
        search: searchQuery || undefined,
        sale: selectedSale || undefined,
      });
      setProducts(data);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar los productos de la tienda.');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedAvailability, selectedSort, searchQuery, selectedSale]);

  // Debounced fetch to handle search typing smoothly
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  return (
    <div className="w-full min-h-[90vh] bg-brand-dark pb-24 text-left">
      {/* Inline styles for slide-in animation */}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* ── MOBILE HEADER (COMPACT) ── */}
      <section className="block md:hidden px-4 pt-6 pb-2 text-left space-y-1">
        <h2 className="text-2xl font-serif text-white uppercase tracking-wide">
          Tienda
        </h2>
        <p className="text-xs text-neutral-400 font-sans font-light tracking-wide">
          Cacheteros, bodys, arneses y básicos para moverte.
        </p>
      </section>

      {/* ── MOBILE SEARCH (COMPACT) ── */}
      <div className="block md:hidden px-4 pb-3">
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#161616] border border-white/10 rounded-lg px-9 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-brand-magenta transition-colors font-sans"
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

      {/* ── MOBILE HORIZONTAL CATEGORY CHIPS ── */}
      <div className="block md:hidden px-4 pb-3 overflow-x-auto hide-scrollbar scroll-smooth">
        <div className="flex gap-2 whitespace-nowrap">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.label}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-1.5 border rounded-full text-xs font-display tracking-widest uppercase transition-all duration-300 shrink-0 ${
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

      {/* ── MOBILE FILTERS & SORT ROW ── */}
      <div className="flex md:hidden gap-3 px-4 pb-4 w-full">
        {/* Toggle Filters Drawer */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#161616] border border-white/10 rounded-lg px-4 py-2 text-xs font-display font-bold tracking-widest text-white hover:border-brand-magenta transition-colors flex-1"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-brand-magenta" />
          FILTROS {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </button>

        {/* Sort Select */}
        <div className="relative flex-1">
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="w-full appearance-none bg-[#161616] border border-white/10 rounded-lg px-4 py-2 pr-8 text-xs font-display font-bold tracking-widest text-white hover:border-brand-magenta transition-colors focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-brand-dark text-white text-xs">
                {opt.label.toUpperCase()}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500 pointer-events-none" />
        </div>
      </div>

      {/* ── MOBILE ACTIVE CHIPS & RESULTS COUNT ── */}
      <div className="block md:hidden px-4 space-y-2 mb-4">
        <div className="flex items-center justify-between text-neutral-400">
          <span className="text-[10px] font-mono font-bold tracking-widest uppercase">
            {products.length} {products.length === 1 ? 'producto' : 'productos'}
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedAvailability(null);
                setSelectedSale(false);
                setSearchQuery('');
              }}
              className="text-[10px] font-display font-black tracking-widest text-brand-magenta hover:text-white transition-colors uppercase underline"
            >
              Limpiar Todo
            </button>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {activeFilters.map((filter) => (
              <div
                key={`${filter.key}-${filter.label}`}
                className="flex items-center gap-1.5 bg-brand-charcoal border border-white/10 rounded-full px-3 py-1 text-[9px] font-display font-bold tracking-widest text-neutral-300 uppercase"
              >
                <span>{filter.label}</span>
                <button
                  onClick={() => {
                    if (filter.key === 'category') setSelectedCategory(null);
                    else if (filter.key === 'availability') setSelectedAvailability(null);
                    else if (filter.key === 'sale') setSelectedSale(false);
                    else if (filter.key === 'search') setSearchQuery('');
                  }}
                  className="text-neutral-500 hover:text-brand-magenta transition-colors text-[9px] font-sans ml-0.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── DESKTOP HEADER (EDITORIAL) ── */}
      <section className="hidden md:block pt-12 pb-8 px-4 text-center max-w-3xl mx-auto space-y-4">
        <span className="text-[10px] tracking-widest font-display text-brand-magenta font-black flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-magenta fill-brand-magenta/10" />
          ARCHIVO DE MODA
        </span>
        <h2 className="text-4xl md:text-6xl font-serif text-white tracking-wide uppercase">
          TODO EL <span className="italic font-normal text-brand-magenta text-glow-magenta">MOVIMIENTO</span>
        </h2>
        <p className="text-xs md:text-sm text-neutral-400 font-sans font-light max-w-xl mx-auto tracking-wide leading-relaxed">
          Explora piezas diseñadas para moverse contigo: cacheteros, bodys, conjuntos, arneses y faldas.
        </p>
        <div className="w-10 h-[1px] bg-brand-magenta/60 mx-auto mt-4" />
      </section>

      {/* ── DESKTOP FILTERS & CONTROLS ── */}
      <section className="hidden md:block max-w-6xl mx-auto px-4 md:px-8 space-y-6 mb-10">
        <div className="border border-white/5 rounded-2xl bg-brand-charcoal/30 backdrop-blur-md p-6 space-y-4">
          
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
            {/* Availability & Sales pills */}
            <div className="space-y-2">
              <span className="block text-[10px] font-display font-bold tracking-widest text-neutral-500 uppercase">Disponibilidad y Ofertas</span>
              <div className="flex flex-wrap gap-2">
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
                <button
                  onClick={() => setSelectedSale(!selectedSale)}
                  className={`px-4 py-2 border rounded-full text-xs font-display tracking-widest uppercase whitespace-nowrap transition-all duration-300 ${
                    selectedSale
                      ? 'bg-brand-magenta border-brand-magenta text-black shadow-magenta-glow font-black'
                      : 'border-brand-magenta/30 text-brand-magenta bg-transparent hover:border-brand-magenta/80'
                  }`}
                >
                  % Ofertas y Últimas Piezas
                </button>
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

      {/* ── DESKTOP ACTIVE CHIPS & RESULTS COUNT ── */}
      <section className="hidden md:block max-w-6xl mx-auto px-4 md:px-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 text-neutral-400">
          <span className="text-xs font-mono font-bold tracking-widest uppercase">
            {products.length} {products.length === 1 ? 'producto' : 'productos'} encontrado(s)
          </span>
          {activeFiltersCount > 0 && (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setSelectedAvailability(null);
                setSelectedSale(false);
                setSearchQuery('');
              }}
              className="text-xs font-display font-black tracking-widest text-brand-magenta hover:text-white transition-colors uppercase underline"
            >
              Limpiar Todo
            </button>
          )}
        </div>

        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-3">
            {activeFilters.map((filter) => (
              <div
                key={`${filter.key}-${filter.label}`}
                className="flex items-center gap-1.5 bg-brand-charcoal border border-white/10 rounded-full px-3 py-1 text-[10px] font-display font-bold tracking-widest text-neutral-300 uppercase"
              >
                <span>{filter.label}</span>
                <button
                  onClick={() => {
                    if (filter.key === 'category') setSelectedCategory(null);
                    else if (filter.key === 'availability') setSelectedAvailability(null);
                    else if (filter.key === 'sale') setSelectedSale(false);
                    else if (filter.key === 'search') setSearchQuery('');
                  }}
                  className="text-neutral-500 hover:text-brand-magenta transition-colors text-[9px] font-sans ml-0.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
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
                  setSelectedSale(false);
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

      {/* ── MOBILE DRAWER BOTTOM SHEET ── */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          
          {/* Drawer Panel */}
          <div 
            className="relative w-full max-w-xs bg-[#0d0d0d] border-l border-white/10 h-full flex flex-col justify-between p-6 shadow-2xl z-10 animate-slide-in"
          >
            <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-2 hide-scrollbar">
              
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-brand-magenta" />
                  <span className="text-sm font-display font-black tracking-widest text-white uppercase">Filtros</span>
                </div>
                <button 
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 hover:text-brand-magenta text-neutral-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category Selection */}
              <div className="space-y-3">
                <span className="block text-[10px] font-display font-bold tracking-widest text-neutral-500 uppercase">Categoría</span>
                <div className="flex flex-col gap-2">
                  {CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat.value;
                    return (
                      <button
                        key={cat.label}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`w-full text-left px-4 py-2.5 border rounded-lg text-xs font-display tracking-widest uppercase transition-all duration-300 ${
                          isActive
                            ? 'bg-brand-magenta border-brand-magenta text-black font-black'
                            : 'border-white/5 text-neutral-300 bg-transparent hover:border-white/20'
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Availability & Sales */}
              <div className="space-y-3">
                <span className="block text-[10px] font-display font-bold tracking-widest text-neutral-500 uppercase">Disponibilidad y Ofertas</span>
                <div className="flex flex-col gap-2">
                  {AVAILABILITIES.map((av) => {
                    const isActive = selectedAvailability === av.value;
                    return (
                      <button
                        key={av.label}
                        onClick={() => setSelectedAvailability(isActive ? null : av.value)}
                        className={`w-full text-left px-4 py-2.5 border rounded-lg text-xs font-display tracking-widest uppercase transition-all duration-300 ${
                          isActive
                            ? 'bg-brand-magenta border-brand-magenta text-black font-black'
                            : 'border-white/5 text-neutral-300 bg-transparent hover:border-white/20'
                        }`}
                      >
                        {av.label}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setSelectedSale(!selectedSale)}
                    className={`w-full text-left px-4 py-2.5 border rounded-lg text-xs font-display tracking-widest uppercase transition-all duration-300 ${
                      selectedSale
                        ? 'bg-brand-magenta border-brand-magenta text-black font-black'
                        : 'border-brand-magenta/25 text-brand-magenta bg-transparent hover:border-brand-magenta/40'
                    }`}
                  >
                    % Ofertas Especiales
                  </button>
                </div>
              </div>

              {/* Sort Option (Access inside drawer) */}
              <div className="space-y-3">
                <span className="block text-[10px] font-display font-bold tracking-widest text-neutral-500 uppercase">Ordenar por</span>
                <div className="flex flex-col gap-2">
                  {SORT_OPTIONS.map((opt) => {
                    const isActive = selectedSort === opt.value;
                    return (
                      <button
                        key={opt.label}
                        onClick={() => setSelectedSort(opt.value)}
                        className={`w-full text-left px-4 py-2.5 border rounded-lg text-xs font-display tracking-widest uppercase transition-all duration-300 ${
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

            {/* Actions Footer */}
            <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full bg-brand-magenta text-black text-xs font-display font-black tracking-widest py-3 rounded-lg hover:bg-brand-magenta/90 transition-colors uppercase text-center shadow-magenta-glow"
              >
                Aplicar filtros
              </button>
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedAvailability(null);
                  setSelectedSale(false);
                  setSearchQuery('');
                  setSelectedSort('recent');
                  setIsDrawerOpen(false);
                }}
                className="w-full border border-white/10 text-neutral-400 text-xs font-display font-bold tracking-widest py-3 rounded-lg hover:text-white hover:border-white/30 transition-all uppercase text-center"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopClient() {
  return (
    <Suspense fallback={<LoadingSpinner message="CARGANDO TIENDA..." />}>
      <ShopContent />
    </Suspense>
  );
}
