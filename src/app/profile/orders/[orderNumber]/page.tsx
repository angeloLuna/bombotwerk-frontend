'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ReceiptText,
  CreditCard,
  Calendar,
  AlertTriangle,
  ShoppingBag,
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Price from '@/components/ui/Price';

interface OrderItem {
  id: string;
  productId: string | null;
  productName: string | null;
  variantName: string | null;
  size: string;
  quantity: number;
  unitPrice: number;
  total: number;
  fulfillmentType: string;
  madeToOrderMinDays: number | null;
  madeToOrderMaxDays: number | null;
}

interface PaymentDetails {
  id: string;
  provider: string;
  providerPaymentId: string | null;
  providerStatus: string | null;
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  createdAt: string;
}

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress: string | null;
  billingAddress: string | null;
  shippingMethod: string | null;
  subtotal: number;
  shippingTotal: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;

  // Shipping snapshot fields
  shippingLabel: string | null;
  shippingCost: number;
  isFreeShipping: boolean;
  freeShippingThreshold: number;
  amountRemainingForFreeShipping: number;
  hasInStockItems: boolean;
  hasMadeToOrderItems: boolean;
  isMixedFulfillmentCart: boolean;
  splitShippingSelected: boolean;
  splitShippingCost: number;
  estimatedDeliveryMinBusinessDays: number | null;
  estimatedDeliveryMaxBusinessDays: number | null;
  firstPackageEstimatedMinBusinessDays: number | null;
  firstPackageEstimatedMaxBusinessDays: number | null;
  secondPackageEstimatedMinBusinessDays: number | null;
  secondPackageEstimatedMaxBusinessDays: number | null;
  fulfillmentNotes: string | null;
  shippingNotes: string | null;

  items: OrderItem[];
  payment: PaymentDetails | null;
}

export default function UserOrderDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderNumber = params.orderNumber as string;

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/profile/orders/${orderNumber}`);
    }
  }, [status, router, orderNumber]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.backendToken || !orderNumber) return;

    const fetchOrderDetail = async () => {
      setLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        const response = await fetch(`${backendUrl}/api/me/orders/${orderNumber}`, {
          headers: {
            'Authorization': `Bearer ${session.backendToken}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (response.status === 403) {
          throw new Error('No tienes permiso para ver esta orden.');
        } else if (response.status === 404) {
          throw new Error(`La orden ${orderNumber} no fue encontrada.`);
        } else if (!response.ok) {
          throw new Error('Error al cargar los detalles del pedido');
        }

        const data = await response.json();
        setOrder(data);
      } catch (err: any) {
        console.error('Error fetching order detail:', err);
        setError(err.message || 'Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, [status, session, orderNumber]);

  if (status === 'loading' || status === 'unauthenticated' || loading) {
    return <LoadingSpinner message="CONECTANDO CON TU HISTORIAL DE PIEZAS..." />;
  }

  if (error || !order) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#050505] text-white px-4 text-center">
        <div className="max-w-md bg-brand-charcoal/30 border border-white/5 p-8 rounded-2xl space-y-6 shadow-magenta-glow">
          <XCircle className="w-16 h-16 text-brand-magenta mx-auto" />
          <h2 className="font-serif text-2xl uppercase text-white tracking-wide">Acceso Denegado / No Encontrado</h2>
          <p className="text-xs text-neutral-400 font-sans font-light leading-relaxed">
            {error || 'No pudimos recuperar los detalles de este pedido.'}
          </p>
          <div className="pt-2">
            <Link href="/profile">
              <Button variant="primary" size="md" className="w-full text-xs uppercase tracking-widest font-display">
                Volver a mi perfil
              </Button>
            </Link>
          </div>
        </div>
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
          desc: 'La transacción se acreditó correctamente. Tus prendas están en preparación en nuestro taller de la CDMX.',
        };
      case 'pending':
        return {
          bg: 'bg-brand-gold/10 border-brand-gold/20 text-brand-gold shadow-gold-glow',
          icon: <Clock className="w-5 h-5 text-brand-gold" />,
          label: 'PAGO EN PROCESO / PENDIENTE',
          desc: 'El pago está en validación. Las prendas quedarán reservadas en cuanto se complete la transacción.',
        };
      case 'failed':
        return {
          bg: 'bg-red-500/10 border-red-500/20 text-red-400 shadow-red-glow',
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          label: 'PAGO RECHAZADO / TRANSACCIÓN FALLIDA',
          desc: 'La transacción fue rechazada por la plataforma de pagos. Inténtalo de nuevo.',
        };
      case 'cancelled':
      default:
        return {
          bg: 'bg-neutral-500/10 border-neutral-500/20 text-neutral-400',
          icon: <XCircle className="w-5 h-5 text-neutral-400" />,
          label: 'PEDIDO CANCELADO',
          desc: 'El pedido fue cancelado debido a falta de acreditación de pago o cancelación manual.',
        };
    }
  };

  const statusInfo = getStatusDetails(order.status);

  return (
    <div className="w-full bg-[#050505] min-h-screen text-left relative pb-24 md:pb-12">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-magenta/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 py-12 relative z-10 space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-4">
          <div className="space-y-1">
            <Link
              href="/profile"
              className="inline-flex items-center gap-1.5 text-[10px] font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> VOLVER A MI PERFIL
            </Link>
            <h1 className="text-2xl font-serif text-white uppercase tracking-wider mt-2">
              Pedido: <span className="text-brand-magenta font-black">{order.orderNumber}</span>
            </h1>
          </div>
          <div className="text-xs text-neutral-400 font-mono sm:text-right">
            <p className="font-bold text-white uppercase tracking-widest text-[9px] mb-1">FECHA DEL PEDIDO</p>
            {new Date(order.createdAt).toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Logistics, Address, Status (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Status Banner */}
            <div className={`p-5 rounded-xl border flex gap-4 ${statusInfo.bg}`}>
              <div className="shrink-0 mt-0.5">{statusInfo.icon}</div>
              <div className="space-y-1 text-xs">
                <h3 className="font-display font-black tracking-wider uppercase leading-none">{statusInfo.label}</h3>
                <p className="text-neutral-300 font-light leading-relaxed mt-1">{statusInfo.desc}</p>
              </div>
            </div>

            {/* 2. Shipping Details */}
            {order.shippingAddress && (
              <div className="bg-brand-charcoal/40 border border-white/5 p-6 rounded-xl space-y-4 backdrop-blur-md">
                <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-magenta" />
                  DIRECCIÓN DE ENVÍO
                </h3>
                <div className="text-xs space-y-3">
                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Destinatario</span>
                    <span className="text-white font-medium">{order.customerName || 'Cliente'}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Calle y Destino</span>
                    <span className="text-neutral-200 font-light leading-relaxed block">{order.shippingAddress}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-3">
                    <div className="space-y-1">
                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Método de Envío</span>
                      <span className="text-white uppercase font-mono text-[10px]">
                        {order.shippingLabel || order.shippingMethod || 'Envío Estándar'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Costo Envío</span>
                      <span className="text-white font-mono text-[10px]">
                        {order.shippingCost > 0 ? <Price amount={order.shippingCost} /> : 'GRATIS'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Estimated Delivery Times */}
            <div className="bg-brand-charcoal/40 border border-white/5 p-6 rounded-xl space-y-4 backdrop-blur-md">
              <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-magenta" />
                TIEMPO ESTIMADO DE ENTREGA
              </h3>
              
              <div className="text-xs space-y-3 font-sans">
                {order.splitShippingSelected ? (
                  <div className="space-y-3">
                    <div className="bg-brand-dark/40 p-3.5 rounded-lg border border-white/5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        <p className="font-bold text-white uppercase text-[10px]">Paquete 1 (Piezas Disponibles):</p>
                      </div>
                      <p className="text-neutral-400 text-[11px] leading-relaxed pl-3.5">
                        Llegada estimada en <span className="text-white font-bold">{order.firstPackageEstimatedMinBusinessDays ?? 2} a {order.firstPackageEstimatedMaxBusinessDays ?? 5} días hábiles.</span>
                      </p>
                    </div>
                    <div className="bg-brand-dark/40 p-3.5 rounded-lg border border-white/5 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-brand-magenta rounded-full" />
                        <p className="font-bold text-white uppercase text-[10px]">Paquete 2 (Piezas Bajo Demanda):</p>
                      </div>
                      <p className="text-neutral-400 text-[11px] leading-relaxed pl-3.5">
                        Confeccionado en CDMX y enviado. Llegada estimada en <span className="text-white font-bold">{order.secondPackageEstimatedMinBusinessDays ?? 9} a {order.secondPackageEstimatedMaxBusinessDays ?? 14} días hábiles.</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-brand-dark/40 p-4 rounded-lg border border-white/5 space-y-1.5">
                    <p className="text-neutral-300 text-[11px] leading-relaxed">
                      Tu pedido se enviará completo. Llegada estimada general de: <span className="text-brand-magenta font-black font-mono ml-1"><Price amount={order.estimatedDeliveryMinBusinessDays ?? 2} className="text-white font-bold" /> a {order.estimatedDeliveryMaxBusinessDays ?? 14} días hábiles.</span>
                    </p>
                  </div>
                )}
                
                {order.fulfillmentNotes && (
                  <div className="bg-brand-magenta/5 border border-brand-magenta/10 p-3 rounded-lg flex items-start gap-2 mt-2">
                    <AlertTriangle className="w-4 h-4 text-brand-magenta shrink-0 mt-0.5" />
                    <p className="text-[10px] text-neutral-300 font-sans leading-relaxed italic">{order.fulfillmentNotes}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Ordered Items and pricing totals (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* A. Ordered Items List */}
            <div className="bg-brand-charcoal/40 border border-white/5 p-6 rounded-xl space-y-4 backdrop-blur-md">
              <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-brand-magenta" />
                ARTÍCULOS ADQUIRIDOS ({order.items.length})
              </h3>
              
              <div className="divide-y divide-white/5 space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-3 pt-4 first:pt-0 items-start text-xs">
                    <div className="flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <h4 className="font-display font-bold text-white line-clamp-2 uppercase tracking-wide">
                          {item.productName || 'Pieza Exclusiva'}
                        </h4>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
                          <span className="text-[9px] text-neutral-400 font-bold">TALLA: {item.size.toUpperCase()}</span>
                          <span className="text-[9px] text-neutral-500 font-mono">| {item.variantName || 'Estándar'}</span>
                        </div>
                        {item.fulfillmentType === 'made_to_order' && (
                          <span className="inline-block text-[8px] bg-brand-magenta/10 text-brand-magenta border border-brand-magenta/20 px-1.5 py-0.5 rounded uppercase font-display font-bold mt-1">
                            CONFECCIONADO CDMX
                          </span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[10px] text-neutral-500 font-bold">CANT: {item.quantity}</span>
                        <Price amount={item.total} className="font-bold text-white" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals Summary */}
              <div className="space-y-3 border-t border-white/5 pt-4 text-xs font-sans">
                <div className="flex justify-between text-neutral-400">
                  <span>SUBTOTAL</span>
                  <Price amount={order.subtotal} />
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>ENVÍO</span>
                  <Price amount={order.shippingCost} />
                </div>
                {order.splitShippingSelected && (
                  <div className="flex justify-between text-neutral-400">
                    <span>ENVÍO DIVIDIDO</span>
                    <Price amount={order.splitShippingCost} />
                  </div>
                )}
                <div className="flex justify-between text-white font-bold border-t border-white/5 pt-3">
                  <span className="font-display tracking-widest text-neutral-400 uppercase">TOTAL</span>
                  <Price amount={order.total} className="text-lg text-glow-magenta text-brand-magenta font-black" />
                </div>
              </div>
            </div>

            {/* B. Transaction details */}
            <div className="bg-brand-charcoal/40 border border-white/5 p-6 rounded-xl space-y-4 backdrop-blur-md">
              <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-brand-magenta" />
                DETALLES DE PAGO
              </h3>
              
              {order.payment ? (
                <div className="text-xs space-y-3 font-mono">
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-neutral-500 font-sans">Método:</span>
                    <span className="uppercase text-white font-bold">{order.payment.paymentMethod || 'TARJETA'}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-neutral-500 font-sans">Proveedor:</span>
                    <span className="uppercase text-white">{order.payment.provider}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-neutral-500 font-sans">Estado MP:</span>
                    <span className="text-white uppercase font-bold">{order.payment.providerStatus || 'APROBADO'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500 font-sans">Monto:</span>
                    <span className="text-white font-bold">
                      <Price amount={order.payment.amount} /> {order.payment.currency}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-neutral-500 italic py-2 text-center">
                  Sin detalles de transacción de pago registrados.
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
