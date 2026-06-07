'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import type { AdminProduct } from '@/types/admin';
import Button from '@/components/ui/Button';
import {
  Plus,
  Pencil,
  RefreshCw,
  PackageX,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  AlertTriangle,
} from 'lucide-react';

function totalStock(p: AdminProduct): number {
  return p.variants.flatMap((v) => v.stocks).reduce((sum, s) => sum + s.quantity, 0);
}

function hasMTO(p: AdminProduct): boolean {
  return p.variants.some((v) => v.availabilityMode === 'stock_and_made_to_order' || v.availabilityMode === 'made_to_order_only');
}

function isDiscontinued(p: AdminProduct): boolean {
  return p.variants.some((v) => v.availabilityMode === 'discontinued');
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Client-side Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await adminApi.products.list());
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`¿Desactivar "${name}"? Se ocultará del storefront público.`)) return;
    try {
      await adminApi.products.deactivate(id);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isActive: false } : p));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const filteredProducts = products.filter((p) => {
    // 1. Search Query (name, slug, variant SKU)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSlug = p.slug.toLowerCase().includes(q);
      const matchSku = p.variants.some((v) => v.sku.toLowerCase().includes(q));
      if (!matchName && !matchSlug && !matchSku) return false;
    }

    // 2. Inventory Filter type
    const stock = totalStock(p);
    switch (filterType) {
      case 'published':
        return p.isActive;
      case 'hidden':
        return !p.isActive;
      case 'out_of_stock':
        return stock === 0;
      case 'low_stock':
        return stock <= 2 && stock > 0;
      case 'made_to_order':
        return hasMTO(p);
      case 'discontinued':
        return isDiscontinued(p);
      case 'no_images':
        return !p.images || p.images.length === 0;
      case 'no_price':
        return !p.price || Number(p.price) === 0;
      case 'no_description':
        return !p.description || p.description.trim() === '';
      case 'all':
      default:
        return true;
    }
  });

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white uppercase tracking-wider">Productos</h1>
          <p className="text-xs text-neutral-500 mt-1 tracking-wide">
            {products.length} productos en catálogo · {filteredProducts.length} filtrados
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="p-2 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-all bg-brand-charcoal"
            title="Refrescar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-brand-magenta text-black text-xs font-display font-black tracking-widest px-4 py-2.5 rounded-lg hover:bg-brand-magenta/90 transition-colors shadow-magenta-glow"
          >
            <Plus className="w-4 h-4" /> NUEVO PRODUCTO
          </Link>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-brand-charcoal border border-white/5 p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, SKU, slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#141416] border border-white/5 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-brand-magenta/40"
          />
        </div>

        {/* Filter Type */}
        <div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full bg-[#141416] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-magenta/40 appearance-none"
          >
            <option value="all">TODOS LOS PRODUCTOS</option>
            <option value="published">PUBLICADOS (ACTIVOS)</option>
            <option value="hidden">OCULTOS (INACTIVOS)</option>
            <option value="out_of_stock">SIN STOCK (0 PIEZAS)</option>
            <option value="low_stock">STOCK BAJO (HASTA 2 PIEZAS)</option>
            <option value="made_to_order">BAJO PEDIDO (MTO)</option>
            <option value="discontinued">DISCONTINUADOS</option>
            <option value="no_images">SIN IMÁGENES</option>
            <option value="no_price">SIN PRECIO</option>
            <option value="no_description">SIN DESCRIPCIÓN</option>
          </select>
        </div>

        {/* Quick clear button */}
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setSearchQuery('');
              setFilterType('all');
            }}
            disabled={searchQuery === '' && filterType === 'all'}
            className="text-[10px] tracking-widest font-display py-1.5 w-full md:w-auto"
          >
            LIMPIAR FILTROS
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-brand-magenta animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <XCircle className="w-10 h-10 text-brand-magenta" />
          <p className="text-sm text-neutral-400">{error}</p>
          <button onClick={load} className="text-xs text-brand-magenta border-b border-brand-magenta pb-0.5">
            REINTENTAR
          </button>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center border border-dashed border-white/10 rounded-xl">
          <PackageX className="w-10 h-10 text-neutral-600" />
          <p className="text-sm text-neutral-500">No se encontraron productos con los filtros seleccionados.</p>
          <button
            onClick={() => { setSearchQuery(''); setFilterType('all'); }}
            className="text-xs text-brand-magenta border-b border-brand-magenta pb-0.5"
          >
            LIMPIAR BÚSQUEDA Y FILTROS
          </button>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5 text-[10px] tracking-widest text-neutral-500 font-display font-bold">
                  <th className="text-left px-4 py-3">PRODUCTO</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">COLECCIÓN</th>
                  <th className="text-right px-4 py-3">PRECIO</th>
                  <th className="text-center px-4 py-3">ESTADO</th>
                  <th className="text-center px-4 py-3">STOCK TOTAL</th>
                  <th className="text-center px-4 py-3">MTO</th>
                  <th className="text-right px-4 py-3">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((p) => {
                  const stock = totalStock(p);
                  let stockColor = 'text-neutral-400 font-mono';
                  let stockLabel = `${stock} pz`;
                  
                  if (stock === 0) {
                    stockColor = 'text-red-500 font-bold font-display text-[10px]';
                    stockLabel = 'SIN STOCK';
                  } else if (stock <= 2) {
                    stockColor = 'text-amber-500 font-bold font-display text-[10px]';
                    stockLabel = `${stock} pz (BAJO)`;
                  }

                  const hasImages = p.images && p.images.length > 0;

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Name + slug */}
                      <td className="px-4 py-3.5">
                        <div className="space-y-0.5">
                          <p className="font-sans font-semibold text-white text-xs flex items-center gap-1.5">
                            {p.name}
                            {!hasImages && (
                              <span className="inline-flex items-center gap-0.5 text-[8px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 py-0.5 rounded font-display font-bold" title="Sin imágenes">
                                SIN IMÁGENES
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-neutral-600 font-mono">{p.slug}</p>
                        </div>
                      </td>
                      {/* Collection */}
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-xs text-neutral-400">
                          {p.collection?.name ?? <span className="text-neutral-700">—</span>}
                        </span>
                      </td>
                      {/* Price */}
                      <td className="px-4 py-3.5 text-right">
                        <span className="text-xs font-mono text-white">
                          ${Number(p.price).toLocaleString('es-MX')}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3.5 text-center">
                        {p.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-500/20 font-bold uppercase tracking-wider text-[8px]">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full border border-white/10 font-bold uppercase tracking-wider text-[8px]">
                            <XCircle className="w-2.5 h-2.5" /> Oculto
                          </span>
                        )}
                      </td>
                      {/* Total stock */}
                      <td className="px-4 py-3.5 text-center">
                        <span className={stockColor}>
                          {stockLabel}
                        </span>
                      </td>
                      {/* MTO */}
                      <td className="px-4 py-3.5 text-center">
                        {hasMTO(p) ? (
                          <span className="text-[9px] bg-brand-magenta/10 text-brand-magenta border border-brand-magenta/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">SÍ</span>
                        ) : (
                          <span className="text-[10px] text-neutral-600">—</span>
                        )}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${p.id}/edit`}
                            className="p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-all bg-brand-charcoal"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Link>
                          {p.isActive && (
                            <button
                              onClick={() => handleDeactivate(p.id, p.name)}
                              className="p-1.5 rounded-lg border border-white/10 text-neutral-600 hover:text-red-400 hover:border-red-400/30 transition-all bg-brand-charcoal"
                              title="Desactivar"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
