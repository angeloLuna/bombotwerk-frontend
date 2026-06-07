'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '@/lib/admin-api';
import type { AdminAuditLog } from '@/types/admin';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import {
  RefreshCw,
  Search,
  Loader2,
  XCircle,
  ClipboardList,
  Calendar,
  FileCode,
  User,
} from 'lucide-react';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Details Expanded State
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.logs.auditList({
        page,
        limit,
        action: action || undefined,
        entityType: entityType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setLogs(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (e: any) {
      setError(e.message ?? 'Error al cargar la bitácora de auditoría.');
    } finally {
      setLoading(false);
    }
  }, [page, limit, action, entityType, startDate, endDate]);

  useEffect(() => {
    loadLogs();
  }, [page, limit, action, entityType]); // auto load when these change

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadLogs();
  };

  const handleClearFilters = () => {
    setAction('');
    setEntityType('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const getActionBadge = (act: string) => {
    let colorClass = 'text-neutral-400 bg-white/5 border-white/10';
    let text = act.replace('admin_', '').replace(/_/g, ' ').toUpperCase();

    if (act.includes('create')) {
      colorClass = 'text-green-400 bg-green-400/10 border-green-500/20';
    } else if (act.includes('update')) {
      if (act.includes('inventory')) {
        colorClass = 'text-brand-gold bg-brand-gold/10 border-brand-gold/20';
      } else {
        colorClass = 'text-cyan-400 bg-cyan-400/10 border-cyan-500/20';
      }
    } else if (act.includes('delete') || act.includes('deactivate')) {
      colorClass = 'text-red-400 bg-red-400/10 border-red-500/20';
    } else if (act.includes('upload')) {
      colorClass = 'text-brand-magenta bg-brand-magenta/10 border-brand-magenta/20';
    }

    return (
      <span className={`inline-flex items-center text-[9px] font-display font-bold px-2 py-0.5 rounded-full border ${colorClass}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-white uppercase tracking-wider">Bitácora de Auditoría</h1>
          <p className="text-xs text-neutral-500 mt-1 tracking-wide">
            {total} acciones administrativas registradas · Monitorea las operaciones en el Atelier
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadLogs}
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
          {/* Action */}
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Acción</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full bg-[#141416] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-magenta/40 appearance-none"
            >
              <option value="">TODAS</option>
              <option value="admin_created_product">CREAR PRODUCTO</option>
              <option value="admin_updated_product">ACTUALIZAR PRODUCTO</option>
              <option value="admin_updated_inventory">ACTUALIZAR INVENTARIO</option>
              <option value="admin_updated_order_status">ACTUALIZAR ESTADO PEDIDO</option>
              <option value="admin_created_collection">CREAR COLECCIÓN</option>
              <option value="admin_updated_collection">ACTUALIZAR COLECCIÓN</option>
              <option value="admin_uploaded_image">SUBIR IMAGEN</option>
              <option value="admin_deleted_image">ELIMINAR IMAGEN</option>
            </select>
          </div>

          {/* Entity Type */}
          <div className="space-y-1">
            <label className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold block">Tipo Entidad</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full bg-[#141416] border border-white/5 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-magenta/40 appearance-none"
            >
              <option value="">TODOS</option>
              <option value="Product">PRODUCTO</option>
              <option value="ProductImage">IMAGEN PRODUCTO</option>
              <option value="Collection">COLECCIÓN</option>
              <option value="Order">PEDIDO</option>
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
          <button onClick={loadLogs} className="text-xs text-brand-magenta border-b border-brand-magenta pb-0.5">
            REINTENTAR
          </button>
        </div>
      ) : logs.length === 0 ? (
        <EmptyState
          title="BITÁCORA VACÍA"
          message="No se encontraron registros de auditoría administrativa que coincidan con los filtros."
          actionLabel="VER TODAS LAS ACCIONES"
          onClick={handleClearFilters}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[750px]">
                <thead>
                  <tr className="bg-white/[0.03] border-b border-white/5 text-[10px] tracking-widest text-neutral-500 font-display font-bold">
                    <th className="text-left px-4 py-3">ADMINISTRADOR</th>
                    <th className="text-left px-4 py-3">ACCIÓN</th>
                    <th className="text-left px-4 py-3">ENTIDAD</th>
                    <th className="text-left px-4 py-3">ID ENTIDAD</th>
                    <th className="text-left px-4 py-3">FECHA Y HORA</th>
                    <th className="text-right px-4 py-3">DETALLES</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs text-neutral-300">
                  {logs.map((log) => {
                    const isExpanded = expandedLogId === log.id;
                    return (
                      <React.Fragment key={log.id}>
                        <tr className="hover:bg-white/[0.01] transition-colors">
                          {/* Admin */}
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2">
                              {log.adminUser?.image ? (
                                <img
                                  src={log.adminUser.image}
                                  alt={log.adminUser.name || 'Admin'}
                                  className="w-5 h-5 rounded-full border border-white/10"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-brand-charcoal border border-white/10 flex items-center justify-center">
                                  <User className="w-3 h-3 text-brand-magenta/80" />
                                </div>
                              )}
                              <div className="space-y-0.5">
                                <span className="font-semibold text-white block leading-none">{log.adminUser?.name || 'Administrador'}</span>
                                <span className="text-[9px] text-neutral-500 font-mono">{log.adminUser?.email || 'N/A'}</span>
                              </div>
                            </div>
                          </td>

                          {/* Action badge */}
                          <td className="px-4 py-3.5">
                            {getActionBadge(log.action)}
                          </td>

                          {/* Entity Type */}
                          <td className="px-4 py-3.5 font-bold uppercase tracking-wider text-[9px] text-neutral-400">
                            {log.entityType}
                          </td>

                          {/* Entity ID */}
                          <td className="px-4 py-3.5 font-mono text-neutral-500 select-all">
                            {log.entityId}
                          </td>

                          {/* Date */}
                          <td className="px-4 py-3.5 font-mono text-neutral-400">
                            {new Date(log.createdAt).toLocaleString('es-MX', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </td>

                          {/* Detail toggle */}
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                              className="inline-flex items-center gap-1 bg-brand-charcoal border border-white/10 hover:border-brand-magenta/40 hover:text-brand-magenta text-[9px] font-display font-bold tracking-widest px-2.5 py-1 rounded transition-all"
                            >
                              <FileCode className="w-3 h-3" /> {isExpanded ? 'OCULTAR' : 'VER JSON'}
                            </button>
                          </td>
                        </tr>

                        {/* Collapsible Details Row */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={6} className="bg-black/40 border-y border-white/5 px-6 py-4 text-left">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] text-neutral-500 uppercase tracking-widest font-bold">
                                  <span>DATOS DE AUDITORÍA COMPLETA</span>
                                  <span>ID LOG: {log.id}</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {log.before && (
                                    <div className="space-y-1">
                                      <span className="text-[9px] text-neutral-400 uppercase tracking-wider block font-bold">Estado Anterior (Before)</span>
                                      <pre className="overflow-auto max-h-60 text-[10px] font-mono bg-[#141416] border border-white/5 p-3 rounded-lg text-neutral-400 leading-relaxed">
                                        {JSON.stringify(log.before, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                  <div className="space-y-1 md:col-span-1">
                                    <span className="text-[9px] text-neutral-400 uppercase tracking-wider block font-bold">Estado Posterior / Payload (After)</span>
                                    <pre className="overflow-auto max-h-60 text-[10px] font-mono bg-[#141416] border border-white/5 p-3 rounded-lg text-neutral-400 leading-relaxed">
                                      {JSON.stringify(log.after || log.metadata || {}, null, 2)}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-xs text-neutral-500 font-mono">
                Página {page} de {totalPages} · Mostrando {logs.length} de {total} registros
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
