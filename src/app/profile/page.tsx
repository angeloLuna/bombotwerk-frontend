'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, User as UserIcon, Calendar, DollarSign, ArrowRight, Shield } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Price from '@/components/ui/Price';

interface OrderItem {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: string;
  total: number;
  subtotal: number;
  shippingTotal: number;
  paymentStatus: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/profile');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated' || !session?.backendToken) return;

    const fetchOrders = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
        const response = await fetch(`${backendUrl}/api/me/orders`, {
          headers: {
            'Authorization': `Bearer ${session.backendToken}`,
            'ngrok-skip-browser-warning': 'true',
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar tu historial de pedidos');
        }

        const data = await response.json();
        setOrders(data);
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Error al conectar con el servidor.');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [status, session]);

  if (status === 'loading' || status === 'unauthenticated') {
    return <LoadingSpinner message="CONECTANDO CON EL MOVIMIENTO..." />;
  }

  // Get status color and label helper
  const getStatusBadge = (orderStatus: string) => {
    const maps: Record<string, { label: string; class: string }> = {
      pending: { label: 'PENDIENTE', class: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5' },
      paid: { label: 'PAGADO', class: 'border-green-500/20 text-green-400 bg-green-500/5' },
      failed: { label: 'FALLIDO', class: 'border-red-500/20 text-red-400 bg-red-500/5' },
      cancelled: { label: 'CANCELADO', class: 'border-neutral-700 text-neutral-400 bg-neutral-800/10' },
    };

    const resolved = maps[orderStatus] || { label: orderStatus.toUpperCase(), class: 'border-neutral-500 text-neutral-300' };

    return (
      <span className={`text-[9px] font-display font-black tracking-widest px-2.5 py-1 border rounded-full ${resolved.class}`}>
        {resolved.label}
      </span>
    );
  };

  return (
    <div className="w-full bg-[#050505] min-h-screen text-left relative pb-24 md:pb-12">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-magenta/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 space-y-12">
        {/* Profile Card Header */}
        <div className="bg-brand-charcoal/40 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 backdrop-blur-md relative overflow-hidden shadow-magenta-glow">
          <div className="absolute top-0 left-0 bottom-0 w-[2px] bg-gradient-to-b from-brand-magenta to-brand-gold" />
          
          {/* Avatar or image */}
          <div className="relative shrink-0 w-20 h-20 rounded-full overflow-hidden border border-white/10 bg-brand-dark flex items-center justify-center">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt={session.user.name || 'Usuario'} 
                className="w-full h-full object-cover" 
              />
            ) : (
              <UserIcon className="w-8 h-8 text-neutral-500" />
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl font-serif tracking-wide text-white uppercase font-bold">
                {session?.user?.name || 'Cliente de Bombo'}
              </h1>
              {session?.user?.role === 'admin' && (
                <span className="flex items-center gap-1 text-[8px] font-display font-black tracking-wider text-brand-gold bg-brand-gold/10 px-2 py-0.5 border border-brand-gold/20 rounded">
                  <Shield className="w-2.5 h-2.5" /> ADMIN
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 font-mono tracking-wide">{session?.user?.email}</p>
            <p className="text-[9px] text-neutral-600 font-display tracking-widest uppercase pt-1">
              CONECTADO A TRAVÉS DE {(session?.user as any)?.provider || 'GOOGLE'}
            </p>
          </div>

          {session?.user?.role === 'admin' && (
            <div className="w-full md:w-auto shrink-0 pt-2 md:pt-0">
              <Link href="/admin/products">
                <Button variant="secondary" size="sm" className="w-full text-[10px] tracking-widest font-display">
                  PANEL ADMINISTRATIVO
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Orders History Section */}
        <div className="space-y-6">
          <div className="border-b border-white/5 pb-3">
            <h2 className="text-xs font-display tracking-widest text-neutral-400 font-bold uppercase">
              TUS ADQUISICIONES // HISTORIAL DE PEDIDOS
            </h2>
          </div>

          {loadingOrders ? (
            <LoadingSpinner message="ANALIZANDO TU HISTORIAL DE PIEZAS..." />
          ) : error ? (
            <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl text-center space-y-2">
              <p className="text-sm text-red-400">Hubo un problema al cargar tu historial.</p>
              <p className="text-xs text-neutral-500 font-mono">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-brand-charcoal/20 border border-white/5 p-12 rounded-2xl text-center space-y-6">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
                <ShoppingBag className="w-6 h-6 text-neutral-600" />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-lg text-white uppercase tracking-wider">NO TIENES PIEZAS ADQUIRIDAS</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
                  Tu arsenal de rendimiento está vacío. Adquiere diseños exclusivos creados para brillar en el estudio y la noche.
                </p>
              </div>
              <div className="pt-2">
                <Link href="/">
                  <Button variant="primary" size="md">
                    VER DISEÑOS
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {orders.map((order) => (
                <div 
                  key={order.id} 
                  className="bg-brand-charcoal/20 hover:bg-brand-charcoal/40 border border-white/5 hover:border-white/10 p-5 rounded-xl transition-all duration-300 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-white group-hover:text-brand-magenta transition-colors">
                        {order.orderNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500 font-sans">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-neutral-600" />
                        {new Date(order.createdAt).toLocaleDateString('es-MX', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                      <span className="flex items-center gap-0.5 font-bold text-neutral-300">
                        <Price amount={order.total} />
                      </span>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex justify-end shrink-0">
                    <Link href={`/profile/orders/${order.orderNumber}`} className="w-full sm:w-auto">
                      <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 border border-white/10 hover:border-brand-magenta hover:bg-brand-magenta/5 rounded-lg text-xs font-display font-black tracking-widest text-neutral-300 hover:text-white transition-all">
                        DETALLES <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </Link>
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
