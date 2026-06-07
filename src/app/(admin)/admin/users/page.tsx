'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import type { AdminUser } from '@/types/admin';
import Price from '@/components/ui/Price';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import {
  RefreshCw,
  Search,
  Eye,
  Loader2,
  XCircle,
  User,
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState(''); // 'registered', 'guest', 'admin'
  const [hasOrders, setHasOrders] = useState(''); // 'true', 'false'

  // Sorting States
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.users.list({
        page,
        limit,
        email: email || undefined,
        name: name || undefined,
        isRegistered: userType === 'registered' ? true : userType === 'admin' ? true : undefined, // Handled server-side or by isGuest
        isGuest: userType === 'guest' ? true : undefined,
        hasOrders: hasOrders === 'true' ? true : hasOrders === 'false' ? false : undefined,
        sortBy,
        sortOrder,
      });
      setUsers(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar los clientes.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, email, name, userType, hasOrders, sortBy, sortOrder]);

  useEffect(() => {
    loadUsers();
  }, [page, limit, sortBy, sortOrder, userType, hasOrders]); // auto load when these change

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadUsers();
  };

  const handleClearFilters = () => {
    setEmail('');
    setName('');
    setUserType('');
    setHasOrders('');
    setPage(1);
  };

  const getUserTypeBadge = (type: string) => {
    switch (type) {
      case 'admin':
        return (
          <span className="inline-flex items-center text-[9px] font-display font-bold text-brand-magenta bg-brand-magenta/10 px-2 py-0.5 rounded-full border border-brand-magenta/20">
            ADMIN
          </span>
        );
      case 'registered':
        return (
          <span className="inline-flex items-center text-[9px] font-display font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-500/20">
            REGISTRADO
          </span>
        );
      case 'guest':
      default:
        return (
          <span className="inline-flex items-center text-[9px] font-display font-bold text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            INVITADO
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white uppercase tracking-wider">Clientes y Usuarios</h1>
          <p className="text-xs text-neutral-500 mt-1 tracking-wide">
            {total} clientes unificados · Administra el directorio de compradores del Atelier
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadUsers}
            className="p-2 rounded-lg border border-white/10 text-neutral-400 hover:text-white hover:border-white/30 transition-all bg-brand-charcoal"
            title="Refrescar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filters Form */}
      <form onSubmit={handleSearchSubmit} className="bg-brand-charcoal border border-white/5 p-4 rounded-xl space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Name */}
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Nombre</label>
            <input
              type="text"
              placeholder="e.g. María Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#141416] border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-brand-magenta/40"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Email</label>
            <input
              type="text"
              placeholder="e.g. cliente@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#141416] border border-white/5 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-brand-magenta/40"
            />
          </div>

          {/* User Type */}
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Tipo Usuario</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              className="w-full bg-[#141416] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-magenta/40 appearance-none"
            >
              <option value="">TODOS</option>
              <option value="registered">REGISTRADOS</option>
              <option value="guest">INVITADOS</option>
              <option value="admin">ADMINS</option>
            </select>
          </div>

          {/* Has Orders */}
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Con Compras</label>
            <select
              value={hasOrders}
              onChange={(e) => setHasOrders(e.target.value)}
              className="w-full bg-[#141416] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-magenta/40 appearance-none"
            >
              <option value="">TODOS</option>
              <option value="true">SÍ (Compradores)</option>
              <option value="false">NO (Registrados sin compra)</option>
            </select>
          </div>
        </div>

        {/* Sort controls & actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="text-neutral-500 uppercase font-display text-[9px] tracking-wider">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#141416] border border-white/5 rounded px-2.5 py-1 text-xs text-neutral-300 focus:outline-none"
            >
              <option value="createdAt">Fecha de registro</option>
              <option value="totalSpent">Total gastado</option>
              <option value="orderCount">Número de órdenes</option>
              <option value="lastOrderDate">Última compra</option>
              <option value="email">Email</option>
              <option value="name">Nombre</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-[#141416] border border-white/5 rounded px-2.5 py-1 text-xs text-neutral-300 focus:outline-none"
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 w-full sm:w-auto">
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
              <Search className="w-3 h-3 inline mr-1" /> FILTRAR
            </Button>
          </div>
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
          <button onClick={loadUsers} className="text-xs text-brand-magenta border-b border-brand-magenta pb-0.5">
            REINTENTAR
          </button>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title="SIN CLIENTES REGISTRADOS"
          message="No se encontraron clientes ni usuarios que coincidan con la búsqueda."
          actionLabel="VER TODOS"
          actionHref="/admin/users"
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/5 text-[10px] tracking-widest text-neutral-500 font-display font-bold">
                    <th className="text-left px-4 py-3">CLIENTE</th>
                    <th className="text-center px-4 py-3">TIPO</th>
                    <th className="text-left px-4 py-3">REGISTRO / PRIMERA ORDEN</th>
                    <th className="text-center px-4 py-3">ÓRDENES</th>
                    <th className="text-right px-4 py-3">TOTAL GASTADO</th>
                    <th className="text-right px-4 py-3">TICKET PROMEDIO</th>
                    <th className="text-left px-4 py-3">ÚLTIMA ACTIVIDAD</th>
                    <th className="text-right px-4 py-3">ACCIONES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.email} className="hover:bg-white/[0.02] transition-colors group">
                      {/* Name / Email */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-brand-charcoal border border-white/5 flex items-center justify-center">
                            <User className="w-4 h-4 text-brand-magenta/80" />
                          </div>
                          <div className="space-y-0.5 text-xs">
                            <p className="font-semibold text-white">{user.name || 'Invitado sin nombre'}</p>
                            <p className="text-[10px] text-neutral-500 font-mono">{user.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-3.5 text-center">
                        {getUserTypeBadge(user.userType)}
                      </td>

                      {/* Created At */}
                      <td className="px-4 py-3.5 text-left text-xs text-neutral-400 font-mono">
                        {user.createdAt ? (
                          new Date(user.createdAt).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        ) : 'N/A'}
                      </td>

                      {/* Orders Count */}
                      <td className="px-4 py-3.5 text-center font-bold font-mono text-white text-xs">
                        {user.orderCount}
                      </td>

                      {/* Total Spent */}
                      <td className="px-4 py-3.5 text-right font-bold text-white font-mono">
                        <Price amount={user.totalSpent} />
                      </td>

                      {/* Average Ticket */}
                      <td className="px-4 py-3.5 text-right font-mono text-neutral-300">
                        <Price amount={user.averageTicket} />
                      </td>

                      {/* Last Activity */}
                      <td className="px-4 py-3.5 text-left text-xs text-neutral-400 font-mono">
                        {user.lastActivity ? (
                          new Date(user.lastActivity).toLocaleDateString('es-MX', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        ) : 'N/A'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          href={`/admin/users/${user.userId || user.customerId || encodeURIComponent(user.email)}`}
                          className="inline-flex items-center gap-1 bg-brand-charcoal border border-white/10 hover:border-brand-magenta/40 hover:text-brand-magenta text-[10px] font-display font-bold tracking-widest px-3 py-1.5 rounded transition-all"
                          title="Ver ficha de cliente"
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-xs text-neutral-500 font-mono">
                Página {page} de {totalPages} · Mostrando {users.length} de {total} clientes
              </span>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="text-[10px] font-display tracking-wider font-bold py-1 px-3"
                >
                  ANTERIOR
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="text-[10px] font-display tracking-wider font-bold py-1 px-3"
                >
                  SIGUIENTE
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
