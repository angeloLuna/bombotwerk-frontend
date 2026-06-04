'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Price from '@/components/ui/Price';
import Button from '@/components/ui/Button';
import WhatsAppAssist from '@/components/ui/WhatsAppAssist';
import { ArrowLeft, Check, Lock, ShieldCheck, ShoppingBag, X, Clock, AlertTriangle } from 'lucide-react';
import { initMercadoPago } from '@mercadopago/sdk-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const Payment = dynamic(
  () => import('@mercadopago/sdk-react').then((mod) => mod.Payment),
  { ssr: false }
);

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const router = useRouter();
  const { data: session, status } = useSession();

  // Inputs state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [splitShippingSelected, setSplitShippingSelected] = useState(false);
  const [shippingCalc, setShippingCalc] = useState<any>(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago'>('mercadopago');
  const [bypassShipping, setBypassShipping] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    if (session?.user) {
      if (session.user.name && !name) {
        setName(session.user.name);
      }
      if (session.user.email && !email) {
        setEmail(session.user.email);
      }
    }
  }, [session, name, email]);

  const showLoginCard = status !== 'authenticated' && !isGuest;

  // Checkout success state
  const [orderSecured, setOrderSecured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paymentStatusState, setPaymentStatusState] = useState<'approved' | 'pending' | 'rejected' | null>(null);
  const [isInfoConfirmed, setIsInfoConfirmed] = useState(false);

  // Initialize Mercado Pago
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || '';
    if (publicKey) {
      initMercadoPago(publicKey, {
        locale: 'es-MX',
      });
    } else {
      console.warn('WARNING: NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY is not defined in environment variables.');
    }
  }, []);

  // Fetch backend-calculated shipping pricing and estimates
  useEffect(() => {
    if (cart.length === 0) return;

    const fetchCalculation = async () => {
      setCalcLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
        const response = await fetch(`${backendUrl}/api/checkout/calculate-shipping`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true',
            ...(session?.backendToken ? { 'Authorization': `Bearer ${session.backendToken}` } : {}),
          },
          body: JSON.stringify({
            cartItems: cart.map(item => ({
              productId: item.product.id,
              variantId: getVariantIdForSize(item.product, item.selectedSize),
              size: item.selectedSize,
              quantity: item.quantity
            })),
            splitShippingSelected,
            bypassShipping,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setShippingCalc(data);
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch shipping calculation:', errorText);
        }
      } catch (err) {
        console.error('Error fetching shipping calculation:', err);
      } finally {
        setCalcLoading(false);
      }
    };

    fetchCalculation();
  }, [cart, splitShippingSelected, bypassShipping, session]);

  // Helper to find variant matching a selected size
  const getVariantIdForSize = (product: any, size: string) => {
    if (!product.variants || product.variants.length === 0) return null;
    const matchingVariant = product.variants.find((v: any) =>
      v.stocks?.some((s: any) => s.size === size)
    );
    return matchingVariant?.id || product.variants[0]?.id;
  };

  const handlePaymentBrickSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    setLoading(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/api/checkout/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
          ...(session?.backendToken ? { 'Authorization': `Bearer ${session.backendToken}` } : {}),
        },
        body: JSON.stringify({
          formData,
          cartItems: cart.map(item => ({
            productId: item.product.id,
            variantId: getVariantIdForSize(item.product, item.selectedSize),
            size: item.selectedSize,
            quantity: item.quantity
          })),
          shippingDetails: {
            name,
            address,
            city,
            zip,
            method: 'standard',
            splitShippingSelected: shippingCalc ? shippingCalc.splitShippingSelected : false,
            bypassShipping,
          },
          email,
          phone,
        }),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        const rawText = await response.text().catch(() => '');
        console.error('Failed to parse response JSON:', parseError, rawText);
        throw new Error(`Server returned status ${response.status}: ${rawText.substring(0, 100) || response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(result.message || 'El procesamiento del pago falló');
      }

      clearCart();
      router.push(`/checkout/result?orderId=${result.orderId}`);
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      alert(`Error: ${error.message || 'Ocurrió un error durante el pago. Por favor, inténtalo de nuevo.'}`);
    } finally {
      setLoading(false);
    }
  };

  const amountToCharge = shippingCalc
    ? shippingCalc.total
    : bypassShipping
      ? cartTotal
      : cartTotal + 150;
  const initialization = React.useMemo(() => {
    const amountVal = Number(amountToCharge);
    return {
      amount: isNaN(amountVal) || amountVal <= 0 ? 1 : amountVal,
      payer: {
        email: email || 'guest@example.com',
        entityType: 'individual' as const,
      },
    };
  }, [amountToCharge, email]);

  const customization = React.useMemo(() => ({
    paymentMethods: {
      creditCard: 'all' as const,
      debitCard: 'all' as const,
    },
    visual: {
      style: {
        theme: 'dark' as const,
      },
    },
  }), []);

  // Submit handler wrapper to ensure stable reference and prevent double renders
  const onSubmitRef = React.useRef(handlePaymentBrickSubmit);
  onSubmitRef.current = handlePaymentBrickSubmit;

  const stableOnSubmit = React.useCallback(async (param: any) => {
    return onSubmitRef.current(param);
  }, []);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !city || !zip) {
      alert('Por favor, completa tus datos de identidad y destino en la lista de invitados.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOrderSecured(true);
      clearCart();
    }, 2000);
  };

  if (cart.length === 0 && !orderSecured) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-brand-dark px-4 space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-charcoal flex items-center justify-center border border-white/5">
          <ShoppingBag className="w-6 h-6 text-neutral-500" />
        </div>
        <h1 className="font-serif text-3xl text-neutral-400">NO HAY PIEZAS RESERVADAS</h1>
        <p className="text-sm text-neutral-500 font-sans text-center max-w-sm">
          Por favor, añade productos a tu selección antes de iniciar el pago.
        </p>
        <Link href="/">
          <Button variant="primary" size="md">
            VER DISEÑOS
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-brand-dark pb-24 md:pb-12 text-left relative min-h-screen">

      {/* SUCCESS MODAL OVERLAY */}
      {orderSecured && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-brand-charcoal border border-brand-magenta/30 p-8 rounded-2xl text-center space-y-6 shadow-magenta-glow">
            {paymentStatusState === 'pending' ? (
              <>
                <div className="w-20 h-20 bg-brand-gold/10 border border-brand-gold/30 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Clock className="w-10 h-10 text-brand-gold" />
                </div>
                <h2 className="font-serif text-3xl text-white uppercase tracking-wide">
                  PAGO <span className="text-brand-gold italic">PENDIENTE</span>
                </h2>
                <p className="text-sm text-neutral-300 font-sans leading-relaxed font-light">
                  Tu pago está en proceso. Reservaremos tus prendas en cuanto se complete la transacción. Revisa tu correo electrónico para ver las actualizaciones.
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-brand-magenta/10 border border-brand-magenta/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-10 h-10 text-brand-magenta" />
                </div>
                <h2 className="font-serif text-3xl text-white uppercase tracking-wide">
                  PAGO <span className="text-brand-magenta italic text-glow-magenta">APROBADO</span>
                </h2>
                <p className="text-sm text-neutral-300 font-sans leading-relaxed font-light">
                  Tus prendas han sido reservadas. Si son personalizadas, nuestro taller de la CDMX ya está iniciando la confección. Hemos enviado los detalles del recibo a tu correo electrónico.
                </p>
              </>
            )}
            <div className="border-t border-white/5 pt-4 text-xs text-brand-gold font-display font-black tracking-widest">
              BIENVENIDO AL MOVIMIENTO
            </div>
            <div className="pt-2">
              <Link href="/">
                <Button variant="primary" size="md" className="w-full">
                  SEGUIR COMPRANDO
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* PROCESSING PAYMENT MODAL OVERLAY */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-xs w-full bg-brand-charcoal border border-white/5 p-6 rounded-2xl text-center space-y-4 shadow-magenta-glow">
            <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 rounded-full border-4 border-brand-magenta/10 animate-pulse" />
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-magenta animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-brand-magenta animate-pulse shadow-magenta-glow" />
              </div>
            </div>
            <h3 className="font-display font-black tracking-widest text-xs text-white uppercase">
              PROCESANDO PAGO...
            </h3>
            <p className="text-[10px] text-neutral-400 font-sans leading-relaxed">
              Estamos procesando tu pago seguro. Por favor, no cierres esta ventana ni refresques la página.
            </p>
          </div>
        </div>
      )}

      {/* Header bar back close button */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center border-b border-white/5">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> VOLVER A TU ARSENAL
        </Link>
        <Link href="/cart" className="p-2 text-neutral-400 hover:text-white transition-colors" aria-label="Close checkout">
          <X className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="space-y-1 mb-8">
          <h1 className="text-3xl font-serif text-white tracking-wide uppercase">
            FINALIZAR <span className="text-brand-magenta italic text-glow-magenta">COMPRA</span>
          </h1>
          <p className="text-[10px] text-neutral-500 font-display tracking-widest">
            PORTAL DE PAGO — PASO FINAL
          </p>
        </div>

        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Shipping Form & Payment Setup (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-8">

            {showLoginCard ? (
              <div className="bg-brand-charcoal/80 border border-white/5 p-8 rounded-2xl space-y-6 relative overflow-hidden shadow-[0_0_50px_0_rgba(219,39,119,0.08)] backdrop-blur-xl">
                {/* Gradient Accent border */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-magenta to-brand-gold" />
                <h3 className="text-xl font-serif text-white tracking-wide uppercase">
                  Guarda tu compra en tu perfil
                </h3>
                <p className="text-xs text-neutral-400 font-sans font-light leading-relaxed">
                  Inicia sesión para consultar tus pedidos, reutilizar tus datos y recibir seguimiento de tu compra.
                </p>
                <div className={`grid grid-cols-1 ${process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN === 'true' ? 'sm:grid-cols-2' : ''} gap-4 pt-2`}>
                  <Button
                    variant="primary"
                    type="button"
                    onClick={() => signIn('google', { callbackUrl: '/checkout' })}
                    className="w-full flex items-center justify-center gap-2 font-display font-black tracking-widest text-[10px] uppercase shadow-magenta-glow py-3.5"
                  >
                    <svg className="w-4 h-4 fill-current text-black" viewBox="0 0 24 24">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.472 0-6.29-2.818-6.29-6.29 0-3.472 2.818-6.29 6.29-6.29 1.564 0 2.98.57 4.07 1.51l3.193-3.19C19.122 1.62 15.918 0 12.24 0 5.48 0 0 5.48 0 12.24s5.48 12.24 12.24 12.24c6.76 0 12.24-5.48 12.24-12.24 0-.82-.073-1.618-.213-2.386H12.24z" />
                    </svg>
                    Google
                  </Button>
                  {process.env.NEXT_PUBLIC_ENABLE_FACEBOOK_LOGIN === 'true' && (
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => signIn('facebook', { callbackUrl: '/checkout' })}
                      className="w-full flex items-center justify-center gap-2 font-display font-black tracking-widest text-[10px] uppercase border-white/10 text-white hover:border-brand-magenta/40 hover:bg-brand-magenta/5 py-3.5"
                    >
                      <svg className="w-4 h-4 fill-current text-neutral-300" viewBox="0 0 24 24">
                        <path d="M9 8H7v3h2v9h3v-9h2.72l.42-3H12V6c0-.53.47-1 1-1h1.72V1h-2.88a3.5 3.5 0 0 0-3.84 3.5V8z" />
                      </svg>
                      Facebook
                    </Button>
                  )}
                </div>
                <div className="text-center pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsGuest(true)}
                    className="text-xs text-neutral-400 hover:text-brand-magenta transition-colors underline underline-offset-4 tracking-wide font-sans"
                  >
                    Continuar como invitado
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* shipping address section */}
                <div className="space-y-4">
                  <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2">
                    DIRECCIÓN DE ENVÍO
                  </h3>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label htmlFor="checkout-name" className="text-[10px] tracking-widest text-neutral-400 font-bold">NOMBRE COMPLETO</label>
                      <input
                        id="checkout-name"
                        type="text"
                        required
                        placeholder="Nombre en la lista de invitados"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isInfoConfirmed}
                        className="w-full bg-brand-charcoal border border-white/10 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-wide font-sans disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="checkout-email" className="text-[10px] tracking-widest text-neutral-400 font-bold">CORREO ELECTRÓNICO</label>
                      <input
                        id="checkout-email"
                        type="email"
                        required
                        placeholder="tucorreo@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isInfoConfirmed}
                        className="w-full bg-brand-charcoal border border-white/10 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-wide font-sans disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="checkout-phone" className="text-[10px] tracking-widest text-neutral-400 font-bold">NÚMERO DE TELÉFONO</label>
                      <input
                        id="checkout-phone"
                        type="tel"
                        required
                        placeholder="ej. 5555555555"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={isInfoConfirmed}
                        className="w-full bg-brand-charcoal border border-white/10 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-wide font-sans disabled:opacity-50"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="checkout-address" className="text-[10px] tracking-widest text-neutral-400 font-bold">DIRECCIÓN DE DESTINO</label>
                      <input
                        id="checkout-address"
                        type="text"
                        required
                        placeholder="Calle, Número, Colonia/Interior"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={isInfoConfirmed}
                        className="w-full bg-brand-charcoal border border-white/10 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-wide font-sans disabled:opacity-50"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label htmlFor="checkout-city" className="text-[10px] tracking-widest text-neutral-400 font-bold">CIUDAD</label>
                        <input
                          id="checkout-city"
                          type="text"
                          required
                          placeholder="Ciudad/Estado"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          disabled={isInfoConfirmed}
                          className="w-full bg-brand-charcoal border border-white/10 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-wide font-sans disabled:opacity-50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="checkout-zip" className="text-[10px] tracking-widest text-neutral-400 font-bold">CÓDIGO POSTAL</label>
                        <input
                          id="checkout-zip"
                          type="text"
                          required
                          placeholder="Código Postal"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          disabled={isInfoConfirmed}
                          className="w-full bg-brand-charcoal border border-white/10 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-wide font-sans disabled:opacity-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* shipping method section */}
                <div className="space-y-4">
                  <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2">
                    MÉTODO DE ENVÍO
                  </h3>

                  <div className="space-y-3">
                    {/* Standard Shipping option */}
                    <div className="flex justify-between items-center p-4 border rounded-xl border-brand-magenta bg-brand-magenta/5 shadow-magenta-glow">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          checked={true}
                          readOnly
                          className="accent-brand-magenta w-4 h-4 cursor-pointer"
                        />
                        <div className="text-left font-sans text-xs">
                          <p className="font-bold text-white uppercase tracking-wider">ENVÍO ESTÁNDAR</p>
                          <p className="text-neutral-400 text-[10px] mt-0.5">
                            {shippingCalc?.isMixedFulfillmentCart && !shippingCalc?.splitShippingSelected
                              ? 'Enviaremos tu pedido completo cuando todas las piezas estén listas.'
                              : shippingCalc?.hasMadeToOrderItems && !shippingCalc?.isMixedFulfillmentCart
                                ? 'Incluye fabricación: llegada en 9-14 días hábiles.'
                                : 'Llegada: 2-5 días hábiles.'
                            }
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white">
                        {shippingCalc ? (
                          shippingCalc.isFreeShipping ? (
                            <span className="text-brand-gold uppercase tracking-widest font-display">GRATIS</span>
                          ) : (
                            `$${shippingCalc.shippingCost} MXN`
                          )
                        ) : (
                          'Calculando...'
                        )}
                      </span>
                    </div>

                    {/* Test Mode Shipping Bypass */}
                    {session?.user?.role === 'admin' && (
                      <label
                        className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 ${
                          bypassShipping
                            ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_15px_rgba(234,179,8,0.15)]'
                            : 'border-white/10 bg-brand-charcoal hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={bypassShipping}
                            onChange={(e) => setBypassShipping(e.target.checked)}
                            disabled={isInfoConfirmed}
                            className="accent-yellow-500 w-4 h-4 cursor-pointer disabled:opacity-50"
                          />
                          <div className="text-left font-sans text-xs">
                            <p className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                              MODO PRUEBA: ENVÍO GRATIS
                              <span className="bg-yellow-500/10 text-yellow-500 text-[8px] font-black tracking-widest px-1.5 py-0.5 rounded border border-yellow-500/20">TEST</span>
                            </p>
                            <p className="text-neutral-400 text-[10px] mt-0.5">
                              Omitir costo de envío para realizar pruebas de cobros pequeños.
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-yellow-500">GRATIS</span>
                      </label>
                    )}

                    {/* Split Shipping Option (Mixed Cart Only) */}
                    {shippingCalc?.splitShippingAvailable && (
                      <label
                        className={`flex flex-col p-4 border rounded-xl cursor-pointer transition-all duration-300 ${
                          splitShippingSelected
                            ? 'border-brand-magenta bg-brand-magenta/5 shadow-magenta-glow'
                            : 'border-white/10 bg-brand-charcoal hover:border-white/20'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={splitShippingSelected}
                              onChange={(e) => setSplitShippingSelected(e.target.checked)}
                              disabled={isInfoConfirmed}
                              className="accent-brand-magenta w-4 h-4 cursor-pointer disabled:opacity-50"
                            />
                            <div className="text-left font-sans text-xs">
                              <p className="font-bold text-white uppercase tracking-wider">
                                Recibir primero las piezas disponibles
                              </p>
                              <p className="text-neutral-400 text-[10px] mt-0.5">
                                Podemos enviar primero las piezas en stock y después las piezas bajo demanda.
                              </p>
                            </div>
                          </div>
                          <span className="text-xs font-bold text-white shrink-0">+$150 MXN</span>
                        </div>

                        {splitShippingSelected && (
                          <div className="mt-3 pt-3 border-t border-white/5 space-y-1.5 text-[10px] text-neutral-300 font-sans pl-7">
                            <p className="flex justify-between">
                              <span>• Primer envío: piezas disponibles</span>
                              <span className="font-semibold text-white">2 a 5 días hábiles</span>
                            </p>
                            <p className="flex justify-between">
                              <span>• Segundo envío: piezas bajo demanda</span>
                              <span className="font-semibold text-white">9 a 14 días hábiles</span>
                            </p>
                          </div>
                        )}
                      </label>
                    )}
                  </div>

                  {/* Mixed Cart consolidado notice */}
                  {shippingCalc?.isMixedFulfillmentCart && !splitShippingSelected && (
                    <div className="bg-brand-magenta/5 border border-brand-magenta/20 p-4 rounded-xl text-xs text-neutral-300 font-sans flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-brand-magenta shrink-0 mt-0.5" />
                      <span>Tu pedido combina piezas disponibles y piezas bajo demanda. Enviaremos tu pedido completo cuando todas las piezas estén listas.</span>
                    </div>
                  )}
                </div>

                {/* confirmation section */}
                {!isInfoConfirmed ? (
                  <div className="pt-4">
                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      type="button"
                      onClick={() => {
                        if (!name || !email || !phone || !address || !city || !zip) {
                          alert('Por favor completa todos los campos de identidad, correo, teléfono y dirección.');
                          return;
                        }
                        if (!/\S+@\S+\.\S+/.test(email)) {
                          alert('Por favor introduce un correo electrónico válido.');
                          return;
                        }
                        setIsInfoConfirmed(true);
                      }}
                      className="shadow-magenta-glow text-xs uppercase"
                    >
                      Confirmar Datos y Elegir Pago
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between items-center p-4 border border-brand-magenta/30 bg-brand-magenta/5 rounded-xl">
                    <div className="text-left font-sans text-xs">
                      <p className="font-bold text-white uppercase tracking-wider">Datos Confirmados</p>
                      <p className="text-neutral-400 text-[10px] mt-0.5">{email} — {phone} — {city}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsInfoConfirmed(false)}
                      className="text-xs font-bold text-brand-magenta hover:underline"
                    >
                      Editar detalles
                    </button>
                  </div>
                )}

                {/* secure payment section */}
                <div className="space-y-4">
                  <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2">
                    PAGO SEGURO
                  </h3>

                  {!isInfoConfirmed ? (
                    <div className="p-4 bg-brand-charcoal border border-dashed border-white/10 rounded-xl text-center text-xs text-neutral-400">
                      Por favor confirma tus datos de identidad y destino arriba para iniciar el pago seguro.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div
                          className="flex justify-between items-center p-4 border border-brand-magenta/30 bg-brand-magenta/5 shadow-magenta-glow rounded-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-brand-magenta animate-pulse" />
                            <div className="text-left font-sans text-xs">
                              <p className="font-bold text-white uppercase tracking-wider">MERCADO PAGO</p>
                              <p className="text-neutral-400 text-[10px] mt-0.5">Tarjeta de Crédito, Débito, Transferencia y Opciones Locales</p>
                            </div>
                          </div>
                          <div className="flex gap-1 bg-white/5 px-2 py-1 rounded">
                            <span className="text-[8px] font-black text-neutral-400 tracking-wider">VISA</span>
                            <span className="text-[8px] font-black text-neutral-400 tracking-wider">MC</span>
                            <span className="text-[8px] font-black text-neutral-400 tracking-wider">AMEX</span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5">
                        <div className="p-4 bg-brand-charcoal border border-white/5 rounded-xl space-y-4">
                          <h4 className="text-[10px] tracking-widest text-neutral-400 font-bold uppercase">PARÁMETROS DE PAGO</h4>
                          <Payment
                            key={`mp-payment-${amountToCharge}`}
                            initialization={initialization}
                            customization={customization}
                            onSubmit={stableOnSubmit}
                            onError={(error) => console.error('MercadoPago Brick Error:', error)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Checkout Review Sidebar (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6 bg-brand-charcoal border border-white/5 p-6 rounded-2xl">

            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2">
              TU ARSENAL ({cart.length} ARTÍCULOS)
            </h3>

            {/* List of checkout items */}
            <div className="divide-y divide-white/5 space-y-4">
              {cart.map((item, idx) => (
                <div key={idx} className="flex gap-3 pt-4 first:pt-0">
                  <div className="relative aspect-[3/4] w-14 overflow-hidden bg-brand-dark rounded border border-white/5 shrink-0">
                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between text-xs py-0.5">
                    <div>
                      <h4 className="font-display font-bold text-white line-clamp-1">{item.product.name}</h4>
                      <p className="text-[10px] text-neutral-400 mt-0.5">TALLA: {item.selectedSize.toUpperCase()}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-neutral-500 font-bold">CANT: {item.quantity}</span>
                      <Price amount={item.product.price * item.quantity} className="font-bold text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp assist links */}
            <WhatsAppAssist
              text="¿Necesitas confirmación inmediata de un estilista?"
              linkText="Chat Directo"
            />

            {/* Order totals */}
            <div className="space-y-3 border-t border-white/5 pt-4 text-xs font-sans">
              <div className="flex justify-between text-neutral-400">
                <span>SUBTOTAL</span>
                <Price amount={cartTotal} />
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>ENVÍO ESTÁNDAR</span>
                {shippingCalc ? (
                  shippingCalc.isFreeShipping ? (
                    <span className="text-brand-gold font-bold uppercase tracking-wider text-[10px]">Gratis</span>
                  ) : (
                    <Price amount={shippingCalc.shippingCost} />
                  )
                ) : (
                  <span>Calculando...</span>
                )}
              </div>
              {shippingCalc?.splitShippingSelected && (
                <div className="flex justify-between text-neutral-400 animate-fade-in">
                  <span>ENVÍO DIVIDIDO</span>
                  <Price amount={shippingCalc.splitShippingCost} />
                </div>
              )}
              {shippingCalc && !shippingCalc.isFreeShipping && (
                <div className="text-[10px] text-brand-gold flex items-center justify-between font-sans">
                  <span>Faltan para envío gratis:</span>
                  <span><Price amount={shippingCalc.amountRemainingForFreeShipping} className="font-bold" /></span>
                </div>
              )}
              {shippingCalc?.isFreeShipping && (
                <div className="text-[10px] text-green-400 font-sans">
                  Tu pedido califica para envío gratis.
                </div>
              )}
              <div className="flex justify-between text-white font-bold border-t border-white/5 pt-3">
                <span className="font-display tracking-widest text-neutral-400">TOTAL</span>
                <Price amount={amountToCharge} className="text-lg text-glow-magenta text-brand-magenta font-black animate-pulse-slow" />
              </div>
            </div>

            {/* Buy Action */}
            <div className="pt-4 space-y-4">
              <div className="text-[10px] text-center text-neutral-500 font-display tracking-widest border border-white/5 bg-brand-dark/30 rounded-lg p-3">
                COMPLETA LA TRANSACCIÓN SEGURA CON EL FORMULARIO DE MERCADO PAGO
              </div>

              <div className="flex justify-center items-center gap-1.5 text-[9px] text-neutral-500 font-display tracking-widest">
                <Lock className="w-3.5 h-3.5 text-brand-magenta" />
                <span>TRANSACCIÓN SEGURA ENCRIPTADA</span>
              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
