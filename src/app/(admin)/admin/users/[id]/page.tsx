'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import type { AdminUserDetail } from '@/types/admin';
import Price from '@/components/ui/Price';
import Button from '@/components/ui/Button';
import {
  ArrowLeft,
  Loader2,
  XCircle,
  User,
  ShoppingBag,
  CreditCard,
  MapPin,
  Package,
  Activity,
  Phone,
  Mail,
  Calendar,
  Layers,
  CheckCircle2,
  Clock,
  X,
} from 'lucide-react';

interface UserDetailPageProps {
  params: any;
}

export default function UserDetailPage({ params }: UserDetailPageProps) {
  const [id, setId] = useState<string>(() => {
    if (params && typeof (params as any).then !== 'function') {
      return (params as any).id || '';
    }
    return '';
  });

  useEffect(() => {
    if (params && typeof (params as any).then === 'function') {
      (params as any).then((resolvedParams: any) => {
        if (resolvedParams?.id) {
          setId(resolvedParams.id);
        }
      });
    } else if (params && (params as any).id) {
      setId((params as any).id);
    }
  }, [params]);

  const [user, setUser] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminApi.users
      .get(id)
      .then((data) => setUser(data))
      .catch((e) => setError(e.message ?? 'Error al cargar el detalle del cliente.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-brand-magenta/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-magenta animate-spin" />
        </div>
        <p className="text-xs text-neutral-500 font-display tracking-widest">CARGANDO DETALLE DEL CLIENTE...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <XCircle className="w-10 h-10 text-brand-magenta" />
        <p className="text-sm text-neutral-400">{error ?? 'Cliente no encontrado.'}</p>
        <Link href="/admin/users">
          <Button variant="secondary" size="sm" className="font-display text-[10px] tracking-widest">
            VOLVER AL DIRECTORIO
          </Button>
        </Link>
      </div>
    );
  }

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-display font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-500/20">
            <CheckCircle2 className="w-2.5 h-2.5" /> APROBADO
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-display font-bold text-brand-gold bg-brand-gold/10 px-2 py-0.5 rounded-full border border-brand-gold/20">
            <Clock className="w-2.5 h-2.5" /> PENDIENTE
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-display font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
            <X className="w-2.5 h-2.5" /> RECHAZADO
          </span>
        );
      case 'cancelled':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[9px] font-display font-bold text-neutral-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">
            CANCELADO
          </span>
        );
    }
  };

  const getUserTypeLabel = (type: string) => {
    switch (type) {
      case 'admin':
        return 'Administrador';
      case 'registered':
        return 'Usuario Registrado';
      case 'guest':
      default:
        return 'Comprador Invitado';
    }
  };

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> VOLVER AL DIRECTORIO
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <h1 className="text-2xl font-serif text-white uppercase tracking-wider">
              {user.name || 'Invitado sin nombre'}
            </h1>
            <span className="text-[9px] bg-brand-magenta/15 text-brand-magenta border border-brand-magenta/25 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
              {getUserTypeLabel(user.userType)}
            </span>
          </div>
          <p className="text-[10px] text-neutral-500 font-mono tracking-widest">
            ID: {user.id}
          </p>
        </div>

        <div className="text-xs text-neutral-400 font-mono sm:text-right">
          <p className="font-bold text-white uppercase tracking-widest text-[9px] mb-1">REGISTRO / INTERACCIÓN</p>
          {user.createdAt ? (
            new Date(user.createdAt).toLocaleString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })
          ) : 'N/A'}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Spent */}
        <div className="bg-brand-charcoal border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-magenta-glow/5">
          <div className="space-y-1">
            <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest block">Total Compras</span>
            <span className="text-2xl font-mono font-black text-brand-magenta">
              <Price amount={user.metrics.totalSpent} />
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-brand-magenta/5 border border-brand-magenta/10 text-brand-magenta">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>

        {/* Orders Count */}
        <div className="bg-brand-charcoal border border-white/5 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest block">Pedidos Completados</span>
            <span className="text-2xl font-mono font-black text-white">
              {user.metrics.orderCount}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-neutral-300">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* Average Ticket */}
        <div className="bg-brand-charcoal border border-white/5 p-4 rounded-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest block">Ticket Promedio</span>
            <span className="text-2xl font-mono font-black text-brand-gold">
              <Price amount={user.metrics.averageTicket} />
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-brand-gold/5 border border-brand-gold/10 text-brand-gold">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column - 7 Cols */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Basic Info */}
          <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-4">
            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-magenta" />
              PERFIL Y DATOS BÁSICOS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Email</span>
                <span className="text-white font-mono flex items-center gap-1.5 select-all">
                  <Mail className="w-3.5 h-3.5 text-neutral-600" />
                  {user.email}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Teléfono de contacto</span>
                <span className="text-white font-mono flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-600" />
                  {user.phone || 'No registrado'}
                </span>
              </div>
              {user.provider && (
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Método de registro</span>
                  <span className="text-white uppercase font-mono">{user.provider}</span>
                </div>
              )}
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Última interacción</span>
                <span className="text-white font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                  {user.lastActivity ? (
                    new Date(user.lastActivity).toLocaleString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  ) : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Unique products bought */}
          <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-4">
            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand-magenta" />
              ARTÍCULOS COMPRADOS
            </h3>
            {user.productsBought.length === 0 ? (
              <p className="text-xs text-neutral-500 italic text-center py-4 font-light">Este cliente aún no ha comprado ningún producto.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-[9px] tracking-widest text-neutral-500 font-display font-bold pb-2">
                      <th className="py-2">PRODUCTO</th>
                      <th className="text-center py-2">TALLA</th>
                      <th className="text-center py-2">UNIDADES</th>
                      <th className="text-right py-2">PRECIO UNITARIO</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-white">
                    {user.productsBought.map((prod, i) => (
                      <tr key={i} className="hover:bg-white/[0.01]">
                        <td className="py-2.5 font-semibold">
                          <Link href={`/admin/products`} className="hover:text-brand-magenta transition-colors">
                            {prod.name}
                          </Link>
                        </td>
                        <td className="text-center py-2.5 font-mono text-neutral-400 font-bold">{prod.size}</td>
                        <td className="text-center py-2.5 font-mono">{prod.quantity}</td>
                        <td className="text-right py-2.5 font-mono text-neutral-300">
                          <Price amount={prod.unitPrice} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Used Shipping Addresses */}
          <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-3">
            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-magenta" />
              DIRECCIONES DE ENVÍO DETECTADAS
            </h3>
            {user.shippingAddresses.length === 0 ? (
              <p className="text-xs text-neutral-500 italic text-center py-4 font-light">Sin direcciones de envío registradas.</p>
            ) : (
              <ul className="divide-y divide-white/5 text-xs text-neutral-300 font-light space-y-1">
                {user.shippingAddresses.map((address, idx) => (
                  <li key={idx} className="py-2.5 flex items-start gap-2">
                    <span className="text-[10px] font-mono text-neutral-600 bg-white/5 px-1.5 py-0.5 rounded leading-none mt-0.5 shrink-0">#{idx + 1}</span>
                    <span className="select-all leading-relaxed">{address}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* User Activity Logs timeline */}
          <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-4">
            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-magenta" />
              REGISTRO DE ACTIVIDAD COMERCIAL (STOREFRONT)
            </h3>
            {user.activityLogs.length === 0 ? (
              <p className="text-xs text-neutral-500 italic text-center py-4 font-light">Sin registros de actividad comercial para este cliente.</p>
            ) : (
              <div className="relative border-l border-white/5 ml-3 pl-4 space-y-6 pt-2">
                {user.activityLogs.map((log) => {
                  let eventLabel = log.eventType;
                  let eventDesc = '';
                  if (log.eventType === 'add_to_cart') {
                    eventLabel = 'Añadió al carrito';
                    eventDesc = `Producto: ${log.metadata?.name || 'N/A'} (Talla: ${log.metadata?.size || 'N/A'}, Qty: ${log.metadata?.quantity || 1})`;
                  } else if (log.eventType === 'begin_checkout') {
                    eventLabel = 'Inició checkout';
                    eventDesc = `Monto total: $${log.metadata?.totalValue || 0} MXN · ${log.metadata?.items?.length || 0} artículos`;
                  } else if (log.eventType === 'whatsapp_clicked') {
                    eventLabel = 'Asistencia WhatsApp';
                    eventDesc = `Ubicación: ${log.metadata?.location || 'N/A'}`;
                  } else if (log.eventType === 'view_product') {
                    eventLabel = 'Visualizó producto';
                    eventDesc = `Producto: ${log.metadata?.name || 'N/A'}`;
                  } else if (log.eventType === 'order_created') {
                    eventLabel = 'Orden creada';
                    eventDesc = `Pedido: ${log.metadata?.orderNumber || 'N/A'} · Esperando acreditación`;
                  } else if (log.eventType === 'order_paid') {
                    eventLabel = 'Pago aprobado';
                    eventDesc = `Pedido: ${log.metadata?.orderNumber || 'N/A'} · Transacción finalizada`;
                  } else if (log.eventType === 'payment_failed') {
                    eventLabel = 'Pago rechazado';
                    eventDesc = `Intento fallido para pedido ${log.metadata?.orderNumber || 'N/A'}`;
                  }

                  return (
                    <div key={log.id} className="relative">
                      {/* Timeline dot */}
                      <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-brand-magenta border-2 border-brand-charcoal ring-4 ring-brand-magenta/15 shrink-0" />
                      
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-white uppercase tracking-wider text-[10px]">{eventLabel}</span>
                          <span className="text-[9px] text-neutral-500 font-mono">
                            {new Date(log.createdAt).toLocaleTimeString('es-MX', {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })} · {new Date(log.createdAt).toLocaleDateString('es-MX', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        {eventDesc && <p className="text-neutral-400 font-light leading-normal">{eventDesc}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Right Column - 5 Cols */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Linked Orders List */}
          <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-4">
            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-brand-magenta" />
              HISTORIAL DE COMPRAS ({user.orders.length})
            </h3>
            {user.orders.length === 0 ? (
              <div className="text-xs text-neutral-500 italic py-6 text-center font-sans">
                Aún no existen transacciones ni pedidos cargados.
              </div>
            ) : (
              <div className="space-y-3">
                {user.orders.map((order) => (
                  <div key={order.id} className="bg-black/20 border border-white/5 hover:border-white/10 transition-all p-3.5 rounded-xl flex items-center justify-between gap-4 group">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-white text-xs select-all">
                          {order.orderNumber}
                        </span>
                        {getOrderStatusBadge(order.status)}
                      </div>
                      <p className="text-[10px] text-neutral-500 font-mono">
                        {new Date(order.createdAt).toLocaleDateString('es-MX', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <span className="font-bold text-white font-mono text-xs">
                        <Price amount={order.total} />
                      </span>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="p-1.5 bg-brand-charcoal border border-white/10 text-neutral-400 hover:text-brand-magenta hover:border-brand-magenta/30 rounded-lg transition-all"
                        title="Ver detalle del pedido"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
