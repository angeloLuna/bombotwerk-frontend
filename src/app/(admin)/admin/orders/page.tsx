'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import type { AdminOrder } from '@/types/admin';
import Price from '@/components/ui/Price';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import {
  RefreshCw,
  Search,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Loader2,
  Calendar,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [status, setStatus] = useState('');
  const [email, setEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.orders.list({
        status: status || undefined,
        email: email || undefined,
        orderNumber: orderNumber || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setOrders(data);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar las órdenes.');
    } finally {
      setLoading(false);
    }
  }, [status, email, orderNumber, startDate, endDate]);

  useEffect(() => {
    loadOrders();
  }, [status, startDate, endDate]); // Trigger auto-reload when status or date range changes

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleClearFilters = () => {
    setStatus('');
    setEmail('');
    setOrderNumber('');
    setStartDate('');
    setEndDate('');
  };

  // Helper to style status badges
  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-500/20">
            <CheckCircle2 className="w-3 h-3" /> APROBADO
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full border border-brand-gold/20">
            <Clock className="w-3 h-3" /> PENDIENTE
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            <XCircle className="w-3 h-3" /> RECHAZADO
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            <XCircle className="w-3 h-3" /> CANCELADO
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            {orderStatus.toUpperCase()}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white uppercase tracking-wider">Órdenes y Transacciones</h1>
          <p className="text-xs text-neutral-500 mt-1 tracking-wide">
            {orders.length} órdenes encontradas · Administra tus ventas y transacciones del Atelier
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadOrders}
            className="p-2 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-all bg-brand-charcoal"
            title="Refrescar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="bg-brand-charcoal border border-white/5 p-4 rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Order Number */}
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Orden</label>
            <input
              type="text"
              placeholder="e.g. BT-2026-000035"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="w-full bg-[#141416] border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-brand-magenta/40"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Email Cliente</label>
            <input
              type="text"
              placeholder="e.g. comprador@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#141416] border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-brand-magenta/40"
            />
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Estado de Pago</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-[#141416] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-magenta/40 appearance-none"
            >
              <option value="">TODOS</option>
              <option value="paid">APROBADO</option>
              <option value="pending">PENDIENTE</option>
              <option value="failed">RECHAZADO</option>
              <option value="cancelled">CANCELADO</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Fecha Inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-[#141416] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-magenta/40"
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Fecha Fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-[#141416] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-magenta/40"
            />
          </div>
        </div>

        {/* Action Buttons inside Filters */}
        <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleClearFilters}
            className="text-[10px] tracking-widest font-display py-1.5"
          >
            LIMPIAR FILTROS
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            className="text-[10px] tracking-widest font-display py-1.5 shadow-magenta-glow"
          >
            <Search className="w-3 h-3 inline mr-1" /> BUSCAR
          </Button>
        </div>
      </form>

      {/* Main Table Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-brand-magenta animate-spin" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <XCircle className="w-10 h-10 text-brand-magenta" />
          <p className="text-sm text-neutral-400">{error}</p>
          <button onClick={loadOrders} className="text-xs text-brand-magenta border-b border-brand-magenta pb-0.5">
            REINTENTAR
          </button>
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="SIN ÓRDENES REGISTRADAS"
          message="No se encontraron órdenes ni transacciones que coincidan con los filtros seleccionados."
          actionLabel="VER TODAS LAS ÓRDENES"
          actionHref="#"
        />
      ) : (
        <div className="rounded-xl border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="bg-white/[0.03] border-b border-white/5 text-[10px] tracking-widest text-neutral-500 font-display font-bold">
                  <th className="text-left px-4 py-3">ORDEN</th>
                  <th className="text-left px-4 py-3">CLIENTE</th>
                  <th className="text-center px-4 py-3">ESTADO PAGO</th>
                  <th className="text-right px-4 py-3">TOTAL</th>
                  <th className="text-left px-4 py-3">MÉTODO PAGO</th>
                  <th className="text-left px-4 py-3">FECHA</th>
                  <th className="text-right px-4 py-3">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Order Number */}
                    <td className="px-4 py-3.5 font-bold font-mono text-white text-xs">
                      {order.orderNumber}
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3.5">
                      <div className="space-y-0.5 text-xs">
                        <p className="font-semibold text-white">{order.customerName || 'Invitado'}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">{order.customerEmail || 'N/A'}</p>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="px-4 py-3.5 text-center">
                      {getStatusBadge(order.status)}
                    </td>

                    {/* Total paid */}
                    <td className="px-4 py-3.5 text-right font-bold text-white font-mono">
                      <Price amount={order.total} />
                    </td>

                    {/* Payment Method */}
                    <td className="px-4 py-3.5 text-left text-xs text-neutral-300">
                      <span className="uppercase bg-white/5 border border-white/5 px-2 py-0.5 rounded font-mono text-[10px]">
                        {order.payment?.paymentMethod || 'N/A'}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3.5 text-left text-xs text-neutral-400 font-mono">
                      {new Date(order.createdAt).toLocaleString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 bg-brand-charcoal border border-white/10 hover:border-brand-magenta/40 hover:text-brand-magenta text-[10px] font-display font-bold tracking-widest px-3 py-1.5 rounded transition-all"
                        title="Ver detalle"
                      >
                        <Eye className="w-3.5 h-3.5" /> DETALLE
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
