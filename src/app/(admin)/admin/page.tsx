'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import type { AdminDashboardSummary } from '@/types/admin';
import {
  TrendingUp,
  ShoppingBag,
  AlertTriangle,
  Users,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Activity,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.dashboard.summary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el resumen del dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-brand-magenta animate-spin" />
          <p className="text-xs text-neutral-500 uppercase tracking-widest font-display font-bold">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <AlertCircle className="w-12 h-12 text-brand-magenta mb-4" />
        <h3 className="font-serif text-white text-lg uppercase tracking-wider mb-2">Error de Conexión</h3>
        <p className="text-xs text-neutral-400 max-w-sm mb-6">{error}</p>
        <button
          onClick={fetchSummary}
          className="px-6 py-2 border border-brand-magenta/30 hover:border-brand-magenta text-[10px] tracking-widest font-display font-bold text-brand-magenta hover:bg-brand-magenta/10 rounded transition-all"
        >
          REINTENTAR
        </button>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="space-y-8 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white uppercase tracking-wider">Dashboard Operativo</h1>
          <p className="text-xs text-neutral-500 mt-1 tracking-wide">
            Vista general en tiempo real del Atelier de Bombo Twerk
          </p>
        </div>
        <button
          onClick={fetchSummary}
          className="p-2 border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 rounded-lg transition-all bg-brand-charcoal"
          title="Refrescar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Sales grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas Hoy */}
        <div className="bg-brand-charcoal border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="absolute right-4 top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-16 h-16 text-white" />
          </div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-display font-bold block mb-1">
            Ventas de Hoy
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-white">
              {formatPrice(summary.sales.today)}
            </span>
          </div>
          <p className="text-[9px] text-neutral-500 mt-2 font-sans font-light">
            Basado en órdenes marcadas como pagadas hoy.
          </p>
        </div>

        {/* Ventas Mes */}
        <div className="bg-brand-charcoal border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="absolute right-4 top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-16 h-16 text-white" />
          </div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-display font-bold block mb-1">
            Ventas del Mes
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-brand-gold">
              {formatPrice(summary.sales.month)}
            </span>
          </div>
          <p className="text-[9px] text-neutral-500 mt-2 font-sans font-light">
            Acumulado del mes calendario actual.
          </p>
        </div>

        {/* Órdenes por preparar */}
        <div className="bg-brand-charcoal border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="absolute right-4 top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShoppingBag className="w-16 h-16 text-white" />
          </div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-display font-bold block mb-1">
            Órdenes Por Preparar
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-mono font-bold text-brand-magenta">
              {summary.orders.toPrepare}
            </span>
            <span className="text-[10px] text-neutral-500 uppercase font-bold">pendientes</span>
          </div>
          <p className="text-[9px] text-neutral-500 mt-2 font-sans font-light">
            Órdenes pagadas en fila de preparación o fabricación.
          </p>
        </div>

        {/* Alerta stock */}
        <div className="bg-brand-charcoal border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-white/10 transition-all">
          <div className="absolute right-4 top-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <AlertTriangle className="w-16 h-16 text-white" />
          </div>
          <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-display font-bold block mb-1">
            Alertas de Inventario
          </span>
          <div className="flex gap-4">
            <div>
              <span className="text-2xl font-mono font-bold text-red-500 block">
                {summary.inventory.outOfStock}
              </span>
              <span className="text-[9px] text-neutral-500 uppercase font-bold">Sin Stock</span>
            </div>
            <div className="border-l border-white/5 pl-4">
              <span className="text-2xl font-mono font-bold text-amber-500 block">
                {summary.inventory.lowStock}
              </span>
              <span className="text-[9px] text-neutral-500 uppercase font-bold">Stock Bajo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-status breakdown */}
      <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl">
        <h3 className="text-xs uppercase tracking-widest font-display font-bold text-white mb-4">
          Estado del Canal de Pedidos
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 text-center">
          <div className="bg-black/20 p-3 rounded-xl border border-white/5">
            <span className="text-lg font-mono font-bold text-white block">{summary.orders.total}</span>
            <span className="text-[9px] text-neutral-500 uppercase font-bold">Totales</span>
          </div>
          <div className="bg-black/20 p-3 rounded-xl border border-white/5">
            <span className="text-lg font-mono font-bold text-emerald-400 block">{summary.orders.paid}</span>
            <span className="text-[9px] text-neutral-500 uppercase font-bold">Pagadas</span>
          </div>
          <div className="bg-black/20 p-3 rounded-xl border border-white/5">
            <span className="text-lg font-mono font-bold text-amber-400 block">{summary.orders.pending}</span>
            <span className="text-[9px] text-neutral-500 uppercase font-bold">Pendientes</span>
          </div>
          <div className="bg-black/20 p-3 rounded-xl border border-white/5">
            <span className="text-lg font-mono font-bold text-red-400 block">{summary.orders.failedCancelled}</span>
            <span className="text-[9px] text-neutral-500 uppercase font-bold">Canceladas</span>
          </div>
          <div className="bg-black/20 p-3 rounded-xl border border-white/5">
            <span className="text-lg font-mono font-bold text-brand-magenta block">{summary.orders.madeToOrder}</span>
            <span className="text-[9px] text-neutral-500 uppercase font-bold">Bajo Pedido</span>
          </div>
          <div className="bg-black/20 p-3 rounded-xl border border-white/5">
            <span className="text-lg font-mono font-bold text-brand-gold block">{summary.orders.mixed}</span>
            <span className="text-[9px] text-neutral-500 uppercase font-bold">Mixtas</span>
          </div>
          <div className="bg-black/20 p-3 rounded-xl border border-white/5">
            <span className="text-lg font-mono font-bold text-cyan-400 block">{summary.inventory.madeToOrderActive}</span>
            <span className="text-[9px] text-neutral-500 uppercase font-bold">MTO Activos</span>
          </div>
        </div>
      </div>

      {/* Bottom section: Split orders and users */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Latest orders */}
        <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest font-display font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-magenta" /> Últimos Pedidos
            </h3>
            <Link
              href="/admin/orders"
              className="text-[10px] tracking-widest font-display font-bold text-brand-magenta hover:text-brand-magenta/80 flex items-center gap-1 transition-all"
            >
              VER TODOS <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {summary.latestOrders.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-500 uppercase tracking-widest font-mono">
              No hay pedidos registrados
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] text-neutral-500 tracking-widest uppercase font-bold font-display">
                    <th className="text-left pb-3 font-semibold">Orden</th>
                    <th className="text-left pb-3 font-semibold">Cliente</th>
                    <th className="text-left pb-3 font-semibold">Estado</th>
                    <th className="text-left pb-3 font-semibold">Preparación</th>
                    <th className="text-right pb-3 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-neutral-300">
                  {summary.latestOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-3.5 font-mono text-white">
                        <Link href={`/admin/orders/${order.id}`} className="hover:underline text-brand-magenta font-semibold">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3.5">
                        <div className="max-w-[150px] truncate">
                          <span className="block text-white font-medium truncate">
                            {order.customerName || 'Invitado'}
                          </span>
                          <span className="block text-[10px] text-neutral-500 font-mono truncate">
                            {order.customerEmail}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`inline-flex items-center text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                            order.status === 'paid'
                              ? 'text-green-400 bg-green-400/10 border-green-500/20'
                              : order.status === 'pending'
                              ? 'text-amber-400 bg-amber-400/10 border-amber-500/20'
                              : 'text-neutral-400 bg-neutral-400/10 border-neutral-500/20'
                          }`}
                        >
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="text-[10px] uppercase font-semibold text-neutral-400 font-display">
                          {order.fulfillmentStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-white">
                        {formatPrice(order.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Latest registered users */}
        <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs uppercase tracking-widest font-display font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-gold" /> Nuevos Usuarios
            </h3>
            <Link
              href="/admin/users"
              className="text-[10px] tracking-widest font-display font-bold text-brand-gold hover:text-brand-gold/80 flex items-center gap-1 transition-all"
            >
              VER TODOS <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {summary.latestUsers.length === 0 ? (
            <div className="text-center py-8 text-xs text-neutral-500 uppercase tracking-widest font-mono">
              No hay usuarios registrados
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {summary.latestUsers.map((user) => (
                <div key={user.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="min-w-0 pr-3">
                    <span className="block text-xs font-semibold text-white truncate">
                      {user.name || 'Sin Nombre'}
                    </span>
                    <span className="block text-[10px] text-neutral-500 font-mono truncate">
                      {user.email}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block text-[9px] px-2 py-0.5 rounded border border-white/10 text-neutral-400 font-mono uppercase bg-white/5">
                      {new Date(user.createdAt).toLocaleDateString('es-MX', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
