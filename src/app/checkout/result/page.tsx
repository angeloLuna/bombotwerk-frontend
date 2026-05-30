'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Price from '@/components/ui/Price';
import Button from '@/components/ui/Button';
import EmailReceiptPreview from '@/components/checkout/EmailReceiptPreview';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  ArrowLeft, 
  ShoppingBag, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  ReceiptText 
} from 'lucide-react';

function ResultPageContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setError('El identificador de la orden es requerido para visualizar el resultado del checkout.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
        const response = await fetch(`${backendUrl}/api/orders/${orderId}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
          cache: 'no-store',
        });
        if (!response.ok) {
          throw new Error('No se pudo encontrar o cargar el detalle de la orden especificada.');
        }
        const data = await response.json();
        setOrder(data);
      } catch (err: any) {
        setError(err.message || 'Error al conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-brand-dark px-4 space-y-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-brand-magenta/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-magenta animate-spin" />
        </div>
        <h2 className="font-serif text-2xl text-neutral-300 uppercase tracking-widest">PROCESANDO RESULTADO</h2>
        <p className="text-xs text-neutral-500 font-display tracking-wider">
          Consultando detalles de transacción y orden en el Atelier...
        </p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-brand-dark px-4 space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-950/20 border border-red-500/30 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-red-500" />
        </div>
        <h1 className="font-serif text-3xl text-red-500 uppercase tracking-wide">ERROR EN CHECKOUT</h1>
        <p className="text-sm text-neutral-400 font-sans text-center max-w-md">
          {error || 'No pudimos verificar la información del pedido.'}
        </p>
        <div className="pt-4 flex gap-4">
          <Link href="/">
            <Button variant="secondary" size="md">
              IR A LA TIENDA
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="primary" size="md" className="shadow-magenta-glow">
              VER TU ARSENAL
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Determine status color and icon
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          bg: 'bg-green-500/10 border-green-500/30',
          text: 'text-green-500',
          glow: 'shadow-green-glow',
          icon: <CheckCircle2 className="w-12 h-12 text-green-500" />,
          title: 'LOOK SECURED',
          subtitle: 'PAGO APROBADO Y CONFIRMADO',
          desc: 'Tu selección de performancewear está asegurada. Si tu pedido requiere personalización, nuestro taller en la CDMX ya está preparando los parámetros de confección.',
        };
      case 'pending':
        return {
          bg: 'bg-brand-gold/10 border-brand-gold/30',
          text: 'text-brand-gold',
          glow: 'shadow-gold-glow',
          icon: <Clock className="w-12 h-12 text-brand-gold" />,
          title: 'TRANSACTION PENDING',
          subtitle: 'PAGO EN PROCESO',
          desc: 'Tu pago está siendo procesado por el proveedor. Reservaremos tus prendas en cuanto se complete la transacción. Revisa tu email para actualizaciones.',
        };
      case 'failed':
        return {
          bg: 'bg-red-500/10 border-red-500/30',
          text: 'text-red-500',
          glow: 'shadow-red-glow',
          icon: <XCircle className="w-12 h-12 text-red-500" />,
          title: 'LOOK FAILED',
          subtitle: 'TRANSACCIÓN RECHAZADA',
          desc: 'El pago no pudo completarse. Por favor, intenta de nuevo utilizando otra tarjeta u otro método de pago para asegurar tus siluetas.',
        };
      case 'cancelled':
      default:
        return {
          bg: 'bg-neutral-500/10 border-neutral-500/30',
          text: 'text-neutral-500',
          glow: '',
          icon: <XCircle className="w-12 h-12 text-neutral-500" />,
          title: 'TRANSACTION CANCELLED',
          subtitle: 'PEDIDO CANCELADO',
          desc: 'La transacción ha sido cancelada por el usuario o por inactividad. Puedes volver al checkout para intentar nuevamente.',
        };
    }
  };

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="w-full bg-brand-dark pb-24 md:pb-12 text-left relative min-h-screen">
      {/* Top Header Navigation */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center border-b border-white/5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> VOLVER AL INICIO
        </Link>
        <span className="text-[10px] text-neutral-500 font-display tracking-widest">
          CHECKOUT // DETALLE DE COMPRA
        </span>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Status Card, Customer Details, Order Summary (7 Cols) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Transaction Status Card */}
            <div className={`p-6 md:p-8 rounded-2xl border flex flex-col md:flex-row items-center md:items-start gap-6 ${statusConfig.bg} ${statusConfig.glow}`}>
              <div className="shrink-0">{statusConfig.icon}</div>
              <div className="space-y-2 text-center md:text-left">
                <h1 className={`font-serif text-3xl leading-none uppercase ${statusConfig.text}`}>
                  {statusConfig.title}
                </h1>
                <p className="text-[10px] font-display font-bold tracking-widest text-white/80">
                  {statusConfig.subtitle} // {order.orderNumber}
                </p>
                <p className="text-xs text-neutral-300 font-sans leading-relaxed font-light">
                  {statusConfig.desc}
                </p>
              </div>
            </div>

            {/* 2. Customer details */}
            <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl space-y-4">
              <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-magenta" />
                DATOS DEL CLIENTE (INVITADO)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Identidad</span>
                  <span className="text-white font-medium">{order.customerName || 'Invitado'}</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Teléfono de contacto</span>
                  <span className="text-white font-mono">{order.customerPhone || 'N/A'}</span>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider block">Correo electrónico</span>
                  <span className="text-white font-mono">{order.customerEmail || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* 3. Products list summary */}
            <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl space-y-6">
              <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
                <ReceiptText className="w-4 h-4 text-brand-magenta" />
                PRENDAS CONFECCIONADAS ({order.items.length} ARTÍCULOS)
              </h3>
              
              <div className="divide-y divide-white/5 space-y-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 pt-4 first:pt-0">
                    <div className="flex-1 flex flex-col justify-between text-xs py-0.5">
                      <div>
                        <h4 className="font-display font-bold text-sm text-white">{item.productName || 'Producto'}</h4>
                        <p className="text-[10px] text-brand-magenta font-semibold tracking-wider mt-0.5">
                          TALLA: {(item.size || 'N/A').toUpperCase()} // VARIANTE: {(item.variantName || 'N/A').toUpperCase()}
                        </p>

                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-[10px] text-neutral-500 font-bold">CANTIDAD: {item.quantity}</span>
                        <Price amount={item.unitPrice * item.quantity} className="font-bold text-white text-sm" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order totals */}
              <div className="space-y-3 border-t border-white/5 pt-4 text-xs font-sans">
                <div className="flex justify-between text-neutral-400">
                  <span>SUBTOTAL PRENDAS</span>
                  <Price amount={order.subtotal} />
                </div>
                <div className="flex justify-between text-neutral-400">
                  <span>COSTO DE ENVÍO</span>
                  {order.shippingTotal > 0 ? (
                    <Price amount={order.shippingTotal} />
                  ) : (
                    <span className="text-brand-gold font-bold uppercase tracking-wider text-[10px]">Gratis</span>
                  )}
                </div>
                <div className="flex justify-between text-white font-bold border-t border-white/5 pt-3">
                  <span className="font-display tracking-widest text-neutral-400">TOTAL PAGADO</span>
                  <Price amount={order.total} className="text-xl text-glow-magenta text-brand-magenta font-black" />
                </div>
              </div>
            </div>

            {/* 4. Delivery location details if available */}
            {order.shippingAddress && (
              <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl space-y-3">
                <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-magenta" />
                  DESTINO DE ENVÍO
                </h3>
                <div className="text-xs text-neutral-300 font-sans leading-relaxed">
                  <p className="font-bold text-white uppercase tracking-wider mb-1">Dirección Registrada:</p>
                  <p className="font-light">{order.shippingAddress}</p>
                  <p className="text-neutral-500 text-[10px] mt-2 font-display tracking-wider">
                    MÉTODO: {order.shippingMethod === 'express' ? 'ENVÍO EXPRESS (1-2 DÍAS)' : 'ENVÍO CONFECCIÓN CDMX (4-6 DÍAS)'}
                  </p>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link href="/" className="flex-1">
                <Button variant="secondary" size="lg" className="w-full">
                  SEGUIR EXPLORANDO
                </Button>
              </Link>
              {order.status === 'failed' && (
                <Link href="/checkout" className="flex-1">
                  <Button variant="primary" size="lg" className="w-full shadow-magenta-glow">
                    REINTENTAR PAGO
                  </Button>
                </Link>
              )}
            </div>

          </div>

          {/* Right Column: Email Mockup Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-6">
              <EmailReceiptPreview order={order} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-[80vh] flex flex-col items-center justify-center bg-brand-dark px-4 space-y-6">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-brand-magenta/10" />
          <div className="absolute inset-0 rounded-full border-4 border-t-brand-magenta animate-spin" />
        </div>
        <h2 className="font-serif text-2xl text-neutral-300 uppercase tracking-widest">PROCESANDO RESULTADO</h2>
      </div>
    }>
      <ResultPageContent />
    </Suspense>
  );
}
