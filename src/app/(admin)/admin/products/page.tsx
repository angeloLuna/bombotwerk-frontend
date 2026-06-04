'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import type { AdminProduct } from '@/types/admin';
import {
  Plus,
  Pencil,
  RefreshCw,
  PackageX,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';

function totalStock(p: AdminProduct): number {
  return p.variants.flatMap((v) => v.stocks).reduce((sum, s) => sum + s.quantity, 0);
}

function hasMTO(p: AdminProduct): boolean {
  return p.variants.some((v) => v.availabilityMode === 'stock_and_made_to_order' || v.availabilityMode === 'made_to_order_only');
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setProducts(await adminApi.products.list());
    } catch (e: any) {
      setError(e.message ?? 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Deactivate "${name}"? It will be hidden from the storefront.`)) return;
    try {
      await adminApi.products.deactivate(id);
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isActive: false } : p));
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white">Products</h1>
          <p className="text-xs text-neutral-500 mt-1 tracking-wide">
            {products.length} total · manage your catalogue
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={load}
            className="p-2 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-brand-magenta text-black text-xs font-display font-black tracking-widest px-4 py-2.5 rounded-lg hover:bg-brand-magenta/90 transition-colors shadow-magenta-glow"
          >
            <Plus className="w-4 h-4" /> NEW PRODUCT
          </Link>
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
            RETRY
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center border border-dashed border-white/10 rounded-xl">
          <PackageX className="w-10 h-10 text-neutral-600" />
          <p className="text-sm text-neutral-500">No products yet.</p>
          <Link href="/admin/products/new" className="text-xs text-brand-magenta border-b border-brand-magenta pb-0.5">
            CREATE FIRST PRODUCT →
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/[0.03] border-b border-white/5 text-[10px] tracking-widest text-neutral-500 font-display font-bold">
                <th className="text-left px-4 py-3">PRODUCT</th>
                <th className="text-left px-4 py-3 hidden md:table-cell">COLLECTION</th>
                <th className="text-right px-4 py-3">PRICE</th>
                <th className="text-center px-4 py-3 hidden sm:table-cell">STATUS</th>
                <th className="text-center px-4 py-3 hidden lg:table-cell">STOCK</th>
                <th className="text-center px-4 py-3 hidden lg:table-cell">MTO</th>
                <th className="text-right px-4 py-3">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                  {/* Name + slug */}
                  <td className="px-4 py-3.5">
                    <div className="space-y-0.5">
                      <p className="font-sans font-semibold text-white text-xs">{p.name}</p>
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
                  <td className="px-4 py-3.5 text-center hidden sm:table-cell">
                    {p.isActive ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] text-neutral-500 bg-white/5 px-2 py-0.5 rounded-full">
                        <XCircle className="w-3 h-3" /> Inactive
                      </span>
                    )}
                  </td>
                  {/* Total stock */}
                  <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                    <span className={`text-xs font-mono ${totalStock(p) > 0 ? 'text-white' : 'text-neutral-600'}`}>
                      {totalStock(p)}
                    </span>
                  </td>
                  {/* MTO */}
                  <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                    {hasMTO(p) ? (
                      <span className="text-[10px] text-brand-magenta">YES</span>
                    ) : (
                      <span className="text-[10px] text-neutral-600">—</span>
                    )}
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${p.id}/edit`}
                        className="p-1.5 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-all"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      {p.isActive && (
                        <button
                          onClick={() => handleDeactivate(p.id, p.name)}
                          className="p-1.5 rounded-lg border border-white/10 text-neutral-600 hover:text-red-400 hover:border-red-400/30 transition-all"
                          title="Deactivate"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
