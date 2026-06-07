'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/admin-api';
import type { AdminOrder } from '@/types/admin';
import Price from '@/components/ui/Price';
import Button from '@/components/ui/Button';
import EmailReceiptPreview from '@/components/checkout/EmailReceiptPreview';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  User,
  MapPin,
  ReceiptText,
  CreditCard,
  History,
  FileCode,
  Mail,
  Check,
  MessageSquare,
  Truck,
  Edit,
} from 'lucide-react';

interface OrderDetailPageProps {
  params: any;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
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

  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSuccessMsg, setEmailSuccessMsg] = useState<string | null>(null);
  const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);

  // Status update states
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingStatusMsg, setUpdatingStatusMsg] = useState<string | null>(null);

  // Fulfillment update states
  const [fulfillmentUpdate, setFulfillmentUpdate] = useState<string>('');
  const [updatingFulfillment, setUpdatingFulfillment] = useState(false);
  const [updatingFulfillmentMsg, setUpdatingFulfillmentMsg] = useState<string | null>(null);

  // Shipping form states
  const [carrier, setCarrier] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [shippedAt, setShippedAt] = useState('');
  const [updatingShipping, setUpdatingShipping] = useState(false);
  const [updatingShippingMsg, setUpdatingShippingMsg] = useState<string | null>(null);

  // Notes state
  const [noteContent, setNoteContent] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [addingNoteMsg, setAddingNoteMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    adminApi.orders
      .get(id)
      .then((data) => {
        setOrder(data);
        setStatusUpdate(data.status);
        setFulfillmentUpdate(data.fulfillmentStatus || 'pending_review');
        setCarrier(data.carrier || '');
        setTrackingNumber(data.trackingNumber || '');
        setTrackingUrl(data.trackingUrl || '');
        setShippedAt(data.shippedAt ? new Date(data.shippedAt).toISOString().split('T')[0] : '');
      })
      .catch((e) => setError(e.message ?? 'Error al cargar el detalle de la orden.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!order) return;
    setUpdatingStatus(true);
    setUpdatingStatusMsg(null);
    try {
      await adminApi.orders.updateStatus(order.id, statusUpdate);
      setUpdatingStatusMsg('Estado actualizado con éxito.');
      const updated = await adminApi.orders.get(order.id);
      setOrder(updated);
    } catch (err: any) {
      setUpdatingStatusMsg(err.message || 'Error al actualizar el estado.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateFulfillment = async () => {
    if (!order) return;
    setUpdatingFulfillment(true);
    setUpdatingFulfillmentMsg(null);
    try {
      await adminApi.orders.updateFulfillmentStatus(order.id, fulfillmentUpdate);
      setUpdatingFulfillmentMsg('Estado operativo actualizado con éxito.');
      const updated = await adminApi.orders.get(order.id);
      setOrder(updated);
    } catch (err: any) {
      setUpdatingFulfillmentMsg(err.message || 'Error al actualizar el estado operativo.');
    } finally {
      setUpdatingFulfillment(false);
    }
  };

  const handleUpdateShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    if (!carrier || !trackingNumber) {
      setUpdatingShippingMsg('Paquetería y número de guía son obligatorios.');
      return;
    }
    setUpdatingShipping(true);
    setUpdatingShippingMsg(null);
    try {
      await adminApi.orders.updateShipping(order.id, {
        carrier,
        trackingNumber,
        trackingUrl,
        shippedAt: shippedAt || undefined,
      });
      setUpdatingShippingMsg('Datos de envío registrados.');
      const updated = await adminApi.orders.get(order.id);
      setOrder(updated);
      setFulfillmentUpdate(updated.fulfillmentStatus);
    } catch (err: any) {
      setUpdatingShippingMsg(err.message || 'Error al actualizar datos de envío.');
    } finally {
      setUpdatingShipping(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order || !noteContent.trim()) return;
    setAddingNote(true);
    setAddingNoteMsg(null);
    try {
      await adminApi.orders.addNote(order.id, noteContent.trim());
      setNoteContent('');
      setAddingNoteMsg('Nota agregada con éxito.');
      const updated = await adminApi.orders.get(order.id);
      setOrder(updated);
    } catch (err: any) {
      setAddingNoteMsg(err.message || 'Error al guardar la nota.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleResendEmail = async () => {
    if (!order) return;
    setSendingEmail(true);
    setEmailSuccessMsg(null);
    setEmailErrorMsg(null);
    try {
      const res = await adminApi.orders.resendEmail(order.id);
      if (res.success) {
        setEmailSuccessMsg('Correo de confirmación enviado con éxito.');
      } else {
        setEmailErrorMsg(res.confirmationEmailError || 'El envío del correo falló.');
      }
      // Refresh order data to get latest DB fields
      const updated = await adminApi.orders.get(order.id);
      setOrder(updated);
    } catch (err: any) {
      setEmailErrorMsg(err.message || 'Error al conectar con la API de reenvío.');
    } finally {
      setSendingEmail(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-brand-magenta/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-magenta animate-spin" />
        </div>
        <p className="text-xs text-neutral-500 font-display tracking-widest">CARGANDO DETALLE DE ORDEN...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <XCircle className="w-10 h-10 text-brand-magenta" />
        <p className="text-sm text-neutral-400">{error ?? 'Orden no encontrada.'}</p>
        <Link href="/admin/orders">
          <Button variant="secondary" size="sm" className="font-display text-[10px] tracking-widest">
            VOLVER AL LISTADO
          </Button>
        </Link>
      </div>
    );
  }

  // Get status color and settings
  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          bg: 'bg-green-500/10 border-green-500/20 text-green-400 shadow-green-glow',
          icon: <CheckCircle2 className="w-5 h-5 text-green-400" />,
          label: 'PAGO APROBADO Y CONFECCIÓN CONFIRMADA',
          desc: 'La transacción se acreditó correctamente. La orden está lista para confección o envío.',
        };
      case 'pending':
        return {
          bg: 'bg-brand-gold/10 border-brand-gold/20 text-brand-gold shadow-gold-glow',
          icon: <Clock className="w-5 h-5 text-brand-gold" />,
          label: 'PAGO EN PROCESO / PENDIENTE',
          desc: 'El pago está en validación por el procesador o requiere acción del comprador.',
        };
      case 'failed':
        return {
          bg: 'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-glow',
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          label: 'PAGO RECHAZADO / TRANSACCIÓN FALLIDA',
          desc: 'La transacción fue rechazada por el banco o por la plataforma de pagos.',
        };
      case 'cancelled':
      default:
        return {
          bg: 'bg-neutral-500/10 border-neutral-500/20 text-neutral-400',
          icon: <XCircle className="w-5 h-5 text-neutral-400" />,
          label: 'ORDEN CANCELADA',
          desc: 'El pedido fue cancelado de forma manual o por expirar el plazo de pago.',
        };
    }
  };

  const getFulfillmentLabel = (fStatus: string) => {
    const map: Record<string, string> = {
      pending_review: 'Pendiente de Revisión',
      paid: 'Pagado / Recibido',
      preparing: 'Preparando',
      in_production: 'En Fabricación',
      ready_to_ship: 'Listo para Enviar',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado',
    };
    return map[fStatus] || fStatus;
  };

  const statusInfo = getStatusDetails(order.status);

  return (
    <div className="space-y-6 text-left pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-[10px] font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> VOLVER AL LISTADO
          </Link>
          <h1 className="text-2xl font-serif text-white uppercase tracking-wider mt-2">
            Detalle Orden: {order.orderNumber}
          </h1>
          <p className="text-[10px] text-neutral-500 font-mono tracking-widest">
            ID EN BASE DE DATOS: {order.id}
          </p>
        </div>
        <div className="text-xs text-neutral-400 font-mono sm:text-right">
          <p className="font-bold text-white uppercase tracking-widest text-[9px] mb-1">FECHA DE REGISTRO</p>
          {new Date(order.createdAt).toLocaleString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Status Banner */}
          <div className={`p-5 rounded-xl border flex gap-4 ${statusInfo.bg}`}>
            <div className="shrink-0 mt-0.5">{statusInfo.icon}</div>
            <div className="space-y-1 text-xs">
              <h3 className="font-display font-black tracking-wider uppercase leading-none">{statusInfo.label}</h3>
              <p className="text-neutral-300 font-light leading-relaxed">{statusInfo.desc}</p>
            </div>
          </div>

          {/* 2. Customer Information */}
          <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-4">
            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-brand-magenta" />
              DATOS DE FACTURACIÓN Y CLIENTE
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Nombre</span>
                <span className="text-white font-medium">{order.customerName || 'Invitado'}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Teléfono</span>
                <span className="text-white font-mono">{order.customerPhone || 'N/A'}</span>
              </div>
              <div className="space-y-1 md:col-span-2">
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Email</span>
                <span className="text-white font-mono">{order.customerEmail || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* 3. Shipping / Logistics */}
          {order.shippingAddress && (
            <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-4">
              <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-magenta" />
                LOGÍSTICA Y DESTINO DE ENVÍO
              </h3>
              <div className="text-xs space-y-3">
                <div className="space-y-1">
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Dirección de Entrega</span>
                  <span className="text-neutral-200 font-light">{order.shippingAddress}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Método de Envío</span>
                    <span className="text-white uppercase font-mono text-[10px]">
                      {order.shippingLabel || order.shippingMethod || 'Estándar'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Envío Gratis</span>
                    <span className={`font-mono text-[10px] font-bold ${order.isFreeShipping ? 'text-brand-gold' : 'text-neutral-400'}`}>
                      {order.isFreeShipping ? 'SÍ (Compra >= $1000 MXN)' : 'NO'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Costo Envío Estándar</span>
                    <span className="text-white font-mono">
                      {order.shippingCost !== undefined ? (
                        order.shippingCost > 0 ? <Price amount={order.shippingCost} /> : 'GRATIS'
                      ) : (
                        order.shippingTotal > 0 ? <Price amount={order.shippingTotal} /> : 'GRATIS'
                      )}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Envío Dividido</span>
                    <span className="text-white font-mono uppercase text-[10px]">
                      {order.splitShippingSelected ? (
                        <span className="text-brand-magenta font-bold">SÍ (+ <Price amount={order.splitShippingCost ?? 150} />)</span>
                      ) : 'NO'}
                    </span>
                  </div>
                </div>

                {/* Tracking status snapshot if shipped */}
                {order.carrier && (
                  <div className="bg-black/20 border border-white/5 p-3 rounded-lg grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Paquetería / Guía</span>
                      <span className="text-white uppercase font-bold">{order.carrier}</span> · <span className="font-mono text-neutral-300">{order.trackingNumber}</span>
                    </div>
                    {order.trackingUrl && (
                      <div className="sm:text-right self-center">
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] tracking-widest font-display font-bold text-brand-magenta border-b border-brand-magenta/40 hover:border-brand-magenta transition-colors"
                        >
                          RASTREAR ENVÍO →
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-white/5 pt-3 space-y-2">
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Composición del Carrito</span>
                  <div className="flex flex-wrap gap-1.5">
                    {order.hasInStockItems && (
                      <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-display font-bold">
                        Contiene Stock disponible
                      </span>
                    )}
                    {order.hasMadeToOrderItems && (
                      <span className="text-[8px] bg-brand-magenta/10 text-brand-magenta border border-brand-magenta/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-display font-bold">
                        Contiene piezas bajo demanda
                      </span>
                    )}
                    {order.isMixedFulfillmentCart && (
                      <span className="text-[8px] bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-display font-bold">
                        Cargamento Mixto (Stock + Bajo Demanda)
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-white/5 pt-3 space-y-2">
                  <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Estimaciones de Entrega</span>
                  {order.splitShippingSelected ? (
                    <div className="bg-brand-dark/30 p-3 rounded-lg border border-white/5 space-y-2 text-[10px] font-mono">
                      <div>
                        <p className="font-bold text-white uppercase text-[9px]">Paquete 1 (Piezas Disponibles):</p>
                        <p className="text-neutral-400">{order.firstPackageEstimatedMinBusinessDays ?? 2} a {order.firstPackageEstimatedMaxBusinessDays ?? 5} días hábiles.</p>
                      </div>
                      <div className="border-t border-white/5 pt-2">
                        <p className="font-bold text-white uppercase text-[9px]">Paquete 2 (Piezas Bajo Demanda):</p>
                        <p className="text-neutral-400">{order.secondPackageEstimatedMinBusinessDays ?? 9} a {order.secondPackageEstimatedMaxBusinessDays ?? 14} días hábiles.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-brand-dark/30 p-3 rounded-lg border border-white/5 space-y-1 text-[10px] font-mono">
                      <p className="text-neutral-400">
                        Entrega estimada general: <span className="text-white font-bold">{order.estimatedDeliveryMinBusinessDays ?? 2} a {order.estimatedDeliveryMaxBusinessDays ?? 14} días hábiles.</span>
                      </p>
                    </div>
                  )}
                </div>

                {(order.fulfillmentNotes || order.shippingNotes) && (
                  <div className="border-t border-white/5 pt-3 space-y-1.5 bg-black/20 p-3 rounded-lg">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Notas de Cumplimiento / Envío</span>
                    {order.fulfillmentNotes && <p className="text-[10px] text-neutral-300 font-sans italic">{order.fulfillmentNotes}</p>}
                    {order.shippingNotes && <p className="text-[10px] text-neutral-400 font-sans leading-none">{order.shippingNotes}</p>}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 4. Products Table */}
          <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-4">
            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
              <ReceiptText className="w-4 h-4 text-brand-magenta" />
              ARTÍCULOS DEL PEDIDO ({order.items.length})
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] tracking-widest text-neutral-500 font-display font-bold pb-2">
                    <th className="py-2">PRODUCTO / VARIANTE</th>
                    <th className="text-center py-2">TALLA</th>
                    <th className="text-center py-2">CANTIDAD</th>
                    <th className="text-right py-2">PRECIO UNITARIO</th>
                    <th className="text-right py-2">TOTAL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {order.items.map((item) => (
                    <tr key={item.id} className="text-white">
                      <td className="py-3">
                        <p className="font-semibold">{item.productName || 'Producto sin nombre'}</p>
                        <div className="flex flex-wrap gap-1.5 items-center mt-1">
                          <span className="text-[9px] text-neutral-500 font-mono uppercase">{item.variantName || 'Estándar'}</span>
                          {item.fulfillmentType === 'made_to_order' ? (
                            <span className="text-[8px] bg-brand-magenta/10 text-brand-magenta border border-brand-magenta/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-display font-bold">
                              Bajo pedido ({item.madeToOrderMinDays ?? 7}-{item.madeToOrderMaxDays ?? 9} días)
                            </span>
                          ) : (
                            <span className="text-[8px] bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded uppercase tracking-wider font-display font-bold">
                              Stock inmediato
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="text-center py-3 font-mono font-bold text-neutral-400">
                        {item.size || 'N/A'}
                      </td>
                      <td className="text-center py-3 font-mono">
                        {item.quantity}
                      </td>
                      <td className="text-right py-3 font-mono">
                        <Price amount={item.unitPrice} />
                      </td>
                      <td className="text-right py-3 font-mono font-bold text-brand-magenta">
                        <Price amount={item.total} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Subtotal & Total */}
            <div className="border-t border-white/5 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-400">
                <span>SUBTOTAL PRENDAS</span>
                <Price amount={order.subtotal} className="font-mono" />
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>ENVÍO ESTÁNDAR</span>
                <Price amount={order.shippingCost !== undefined ? order.shippingCost : order.shippingTotal} className="font-mono" />
              </div>
              {order.splitShippingSelected && (
                <div className="flex justify-between text-neutral-400 animate-fade-in">
                  <span>ENVÍO DIVIDIDO</span>
                  <Price amount={order.splitShippingCost ?? 150} className="font-mono" />
                </div>
              )}
              <div className="flex justify-between text-white font-bold border-t border-white/5 pt-3 text-sm">
                <span className="font-display tracking-widest text-neutral-400">TOTAL ORDEN</span>
                <Price amount={order.total} className="text-lg text-brand-magenta font-black font-mono" />
              </div>
            </div>
          </div>

          {/* 5. Collapsible Audit Panel */}
          {order.payment?.rawResponse && (
            <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-3">
              <details className="group">
                <summary className="text-xs tracking-widest font-display text-neutral-400 font-bold flex items-center justify-between cursor-pointer list-none select-none">
                  <span className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-brand-magenta" />
                    PANEL DE AUDITORÍA: RESPUESTA API MERCADO PAGO
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono group-open:hidden">VER [+]</span>
                  <span className="text-[10px] text-neutral-500 font-mono hidden group-open:inline">OCULTAR [-]</span>
                </summary>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <pre className="overflow-auto max-h-96 text-[10px] font-mono bg-black/40 border border-white/5 p-4 rounded-lg text-left text-neutral-400 leading-relaxed">
                    {JSON.stringify(order.payment.rawResponse, null, 2)}
                  </pre>
                </div>
              </details>
            </div>
          )}

        </div>

        {/* Right Column (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Internal Notes Card */}
          <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-4">
            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-magenta" />
              NOTAS INTERNAS DE LA ORDEN
            </h3>

            {/* List notes */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {!order.notes || order.notes.length === 0 ? (
                <p className="text-xs text-neutral-500 italic py-2">Sin notas internas registradas para este pedido.</p>
              ) : (
                order.notes.map((note) => (
                  <div key={note.id} className="bg-black/20 border border-white/5 p-3 rounded-lg text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[9px] text-neutral-500">
                      <span className="font-bold uppercase text-white truncate max-w-[120px]">{note.adminUser?.name || 'Admin'}</span>
                      <span className="font-mono">{new Date(note.createdAt).toLocaleString('es-MX', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-neutral-300 font-sans leading-relaxed break-words whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add note form */}
            <form onSubmit={handleAddNote} className="space-y-3 border-t border-white/5 pt-3">
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Escribe una nota interna (ej. Cliente solicitó cambio de talla por WhatsApp)..."
                rows={3}
                className="w-full bg-[#141416] border border-white/5 rounded px-2.5 py-1.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-brand-magenta/40"
              />
              {addingNoteMsg && (
                <div className={`p-2 rounded text-[10px] ${addingNoteMsg.includes('éxito') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {addingNoteMsg}
                </div>
              )}
              <Button
                type="submit"
                variant="secondary"
                fullWidth
                size="sm"
                disabled={addingNote || !noteContent.trim()}
                className="text-[9px] tracking-widest font-display font-bold uppercase py-1.5"
              >
                {addingNote ? 'GUARDANDO...' : 'AÑADIR NOTA INTERNA'}
              </Button>
            </form>
          </div>

          {/* Operational Fulfillment Status Control Card */}
          <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-4">
            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
              <Edit className="w-4 h-4 text-brand-magenta" />
              ESTADO OPERATIVO (FULFILLMENT)
            </h3>
            <div className="text-xs space-y-3">
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Estado actual:</span>
                <span className="text-brand-magenta font-mono uppercase font-bold text-[10px] bg-brand-magenta/10 border border-brand-magenta/20 px-2 py-0.5 rounded-full inline-block">
                  {getFulfillmentLabel(order.fulfillmentStatus)}
                </span>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Cambiar estado operativo a:</label>
                <select
                  value={fulfillmentUpdate}
                  onChange={(e) => setFulfillmentUpdate(e.target.value)}
                  className="w-full bg-[#141416] border border-white/5 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-magenta/40"
                >
                  <option value="pending_review">PENDIENTE DE REVISIÓN</option>
                  <option value="paid">PAGADO / RECIBIDO</option>
                  <option value="preparing">PREPARANDO</option>
                  <option value="in_production">EN FABRICACIÓN</option>
                  <option value="ready_to_ship">LISTO PARA ENVIAR</option>
                  <option value="shipped">ENVIADO</option>
                  <option value="delivered">ENTREGADO</option>
                  <option value="cancelled">CANCELADO</option>
                  <option value="refunded">REEMBOLSADO</option>
                </select>
              </div>

              {updatingFulfillmentMsg && (
                <div className={`p-2 rounded text-[10px] ${updatingFulfillmentMsg.includes('éxito') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {updatingFulfillmentMsg}
                </div>
              )}

              <Button
                variant="primary"
                fullWidth
                size="sm"
                onClick={handleUpdateFulfillment}
                disabled={updatingFulfillment || fulfillmentUpdate === order.fulfillmentStatus}
                className="text-[10px] tracking-widest font-display font-black uppercase flex items-center justify-center gap-1.5 py-2"
              >
                {updatingFulfillment ? 'ACTUALIZANDO...' : 'ACTUALIZAR ESTADO OPERATIVO'}
              </Button>
            </div>
          </div>

          {/* Shipping & Tracking capture Card */}
          <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-4">
            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-magenta" />
              REGISTRAR GUÍA DE ENVÍO
            </h3>
            <form onSubmit={handleUpdateShipping} className="text-xs space-y-3 font-sans">
              <div className="space-y-1">
                <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Paquetería</label>
                <input
                  type="text"
                  placeholder="e.g. DHL, FedEx, Estafeta"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full bg-[#141416] border border-white/5 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-magenta/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Número de Guía</label>
                <input
                  type="text"
                  placeholder="e.g. 1234567890"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-[#141416] border border-white/5 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-magenta/40"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">URL de Rastreo (Opcional)</label>
                <input
                  type="url"
                  placeholder="e.g. https://www.dhl.com/track..."
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  className="w-full bg-[#141416] border border-white/5 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-magenta/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Fecha de Envío</label>
                <input
                  type="date"
                  value={shippedAt}
                  onChange={(e) => setShippedAt(e.target.value)}
                  className="w-full bg-[#141416] border border-white/5 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-magenta/40"
                />
              </div>

              {updatingShippingMsg && (
                <div className={`p-2 rounded text-[10px] ${updatingShippingMsg.includes('registrados') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {updatingShippingMsg}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="sm"
                disabled={updatingShipping}
                className="shadow-magenta-glow text-[10px] tracking-widest font-display font-black uppercase py-2"
              >
                {updatingShipping ? 'GUARDANDO...' : 'REGISTRAR GUÍA Y MARCAR ENVIADO'}
              </Button>
            </form>
          </div>

          {/* Order Payment Status Control Card */}
          <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-4">
            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
              <History className="w-4 h-4 text-brand-magenta" />
              ESTADO DE PAGO (CAJA)
            </h3>
            <div className="text-xs space-y-3">
              <div className="space-y-1">
                <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Estado actual:</span>
                <span className="text-white font-mono uppercase font-bold">{order.status}</span>
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Cambiar estado de pago a:</label>
                <select
                  value={statusUpdate}
                  onChange={(e) => setStatusUpdate(e.target.value)}
                  className="w-full bg-[#141416] border border-white/5 rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-magenta/40"
                >
                  <option value="pending">PENDIENTE</option>
                  <option value="paid">PAGADO (APROBADO)</option>
                  <option value="failed">FALLIDO (RECHAZADO)</option>
                  <option value="cancelled">CANCELADO</option>
                </select>
              </div>

              {updatingStatusMsg && (
                <div className={`p-2 rounded text-[10px] ${updatingStatusMsg.includes('éxito') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                  {updatingStatusMsg}
                </div>
              )}

              <Button
                variant="primary"
                fullWidth
                size="sm"
                onClick={handleUpdateStatus}
                disabled={updatingStatus || statusUpdate === order.status}
                className="text-[10px] tracking-widest font-display font-black uppercase flex items-center justify-center gap-1.5 py-2"
              >
                {updatingStatus ? 'ACTUALIZANDO...' : 'ACTUALIZAR ESTADO DE PAGO'}
              </Button>
            </div>
          </div>

          {/* A. Payment Details Card */}
          <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-4">
            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-magenta" />
              DETALLE DE TRANSACCIÓN
            </h3>
            
            {order.payment ? (
              <div className="text-xs space-y-3 font-mono">
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-neutral-500 font-sans">Proveedor:</span>
                  <span className="uppercase text-white font-bold">{order.payment.provider}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-neutral-500 font-sans">ID Mercado Pago:</span>
                  <span className="text-white select-all">{order.payment.providerPaymentId || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-neutral-500 font-sans">Transacción ID:</span>
                  <span className="text-white select-all">{order.payment.transactionId || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-neutral-500 font-sans">Estado de Pago:</span>
                  <span className="text-white uppercase font-bold">{order.payment.status}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-neutral-500 font-sans">Detalle Estado:</span>
                  <span className="text-white font-bold">{order.payment.statusDetail || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-neutral-500 font-sans">Método de Pago:</span>
                  <span className="text-white uppercase">{order.payment.paymentMethod || 'N/A'}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-neutral-500 font-sans">Monto Acreditado:</span>
                  <span className="text-white font-bold">
                    <Price amount={order.payment.amount} /> {order.payment.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500 font-sans">Actualización:</span>
                  <span className="text-neutral-300">
                    {new Date(order.payment.updatedAt).toLocaleString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-neutral-500 italic py-4 text-center font-sans">
                Sin datos de transacción de pago registrados.
              </div>
            )}
          </div>

          {/* Email Confirmation Control Card */}
          <div className="bg-brand-charcoal border border-white/5 p-5 rounded-xl space-y-4">
            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
              <Mail className="w-4 h-4 text-brand-magenta" />
              COMPROBANTE DIGITAL DE COMPRA
            </h3>
            
            <div className="text-xs space-y-3 font-sans">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-neutral-400">Estado de Envío:</span>
                <div>
                  {order.confirmationEmailStatus === 'sent' ? (
                    <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded uppercase text-[9px] font-bold">
                      <Check className="w-3 h-3" /> Enviado
                    </span>
                  ) : order.confirmationEmailStatus === 'failed' ? (
                    <span className="inline-flex items-center gap-1 bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded uppercase text-[9px] font-bold">
                      <XCircle className="w-3 h-3" /> Fallido
                    </span>
                  ) : order.confirmationEmailStatus === 'sending' ? (
                    <span className="inline-flex items-center gap-1 bg-brand-gold/10 text-brand-gold border border-brand-gold/20 px-2 py-0.5 rounded uppercase text-[9px] font-bold animate-pulse">
                      <Clock className="w-3 h-3" /> Enviando...
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 px-2 py-0.5 rounded uppercase text-[9px] font-bold">
                      <Clock className="w-3 h-3" /> No Enviado
                    </span>
                  )}
                </div>
              </div>

              {order.confirmationEmailSentAt && (
                <div className="flex justify-between border-b border-white/5 pb-2 text-xs">
                  <span className="text-neutral-400">Enviado el:</span>
                  <span className="text-white font-mono">
                    {new Date(order.confirmationEmailSentAt).toLocaleString('es-MX', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}

              {order.confirmationEmailError && (
                <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-lg space-y-1">
                  <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider block">Último Error Registrado:</span>
                  <p className="text-[10px] text-neutral-400 font-mono break-all leading-normal">
                     {order.confirmationEmailError}
                  </p>
                </div>
              )}

              {/* Status messages for user action */}
              {emailSuccessMsg && (
                <div className="bg-green-500/10 border border-green-500/20 p-2.5 rounded-lg text-green-400 text-[10px] font-medium">
                  {emailSuccessMsg}
                </div>
              )}
              {emailErrorMsg && (
                <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg text-red-400 text-[10px] font-medium break-all">
                  {emailErrorMsg}
                </div>
              )}

              <Button
                variant="primary"
                fullWidth
                size="sm"
                onClick={handleResendEmail}
                disabled={sendingEmail || order.status !== 'paid'}
                className="shadow-magenta-glow text-[10px] tracking-widest font-display font-black uppercase flex items-center justify-center gap-1.5 py-2.5"
              >
                {sendingEmail ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-brand-dark/20 border-t-brand-dark animate-spin" />
                    ENVIANDO...
                  </>
                ) : (
                  <>
                    <Mail className="w-3.5 h-3.5" />
                    REENVIAR COMPROBANTE
                  </>
                )}
              </Button>
              {order.status !== 'paid' && (
                <p className="text-[9px] text-neutral-500 text-center italic font-sans">
                  * Solo se pueden enviar comprobantes de órdenes con pago aprobado ("paid").
                </p>
              )}
            </div>
          </div>

          {/* B. Email Receipt Mockup Preview */}
          <div className="space-y-2">
            <h4 className="text-[10px] tracking-widest font-display text-neutral-500 font-bold uppercase flex items-center gap-1.5 pl-2">
              <History className="w-3.5 h-3.5 text-brand-magenta" />
              Vista Previa Comprobante Cliente
            </h4>
            <EmailReceiptPreview order={order} />
          </div>

        </div>

      </div>
    </div>
  );
}
