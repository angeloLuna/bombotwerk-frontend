'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Price from '@/components/ui/Price';
import Button from '@/components/ui/Button';
import WhatsAppAssist from '@/components/ui/WhatsAppAssist';
import { ArrowLeft, Check, Lock, ShieldCheck, ShoppingBag, X, Clock, AlertTriangle } from 'lucide-react';
import { initMercadoPago } from '@mercadopago/sdk-react';
import dynamic from 'next/dynamic';

const Payment = dynamic(
  () => import('@mercadopago/sdk-react').then((mod) => mod.Payment),
  { ssr: false }
);

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();

  // Inputs state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [shippingMethod, setShippingMethod] = useState<'express' | 'crafted'>('crafted');
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'card'>('mercadopago');

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
            method: shippingMethod,
          },
          email,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Payment processing failed');
      }

      if (result.paymentStatus === 'approved') {
        setPaymentStatusState('approved');
        setOrderSecured(true);
        clearCart();
      } else if (result.paymentStatus === 'in_process' || result.paymentStatus === 'pending') {
        setPaymentStatusState('pending');
        setOrderSecured(true);
        clearCart();
      } else {
        setPaymentStatusState('rejected');
        alert(`Payment rejected. Please try another card or method. Status: ${result.paymentStatusDetail || 'rejected'}`);
      }
    } catch (error: any) {
      console.error('Payment processing failed:', error);
      alert(`Error: ${error.message || 'An error occurred during payment. Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  const shippingCost = shippingMethod === 'express' ? 250 : 0; // 250 MXN for express
  const checkoutTotal = cartTotal + shippingCost;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !address || !city || !zip) {
      alert('Please fill out your identity and destination details on the guestlist.');
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
        <h1 className="font-serif text-3xl text-neutral-400">NO RESERVED GEAR</h1>
        <p className="text-sm text-neutral-500 font-sans text-center max-w-sm">
          Please add items to your selection prior to booking checkout slots.
        </p>
        <Link href="/">
          <Button variant="primary" size="md">
            VIEW DESIGNS
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
                  LOOK <span className="text-brand-gold italic">PENDING</span>
                </h2>
                <p className="text-sm text-neutral-300 font-sans leading-relaxed font-light">
                  Your payment is in process. We will reserve your performancewear as soon as the transaction is finalized. Check your email on the guestlist for updates.
                </p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-brand-magenta/10 border border-brand-magenta/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
                  <Check className="w-10 h-10 text-brand-magenta" />
                </div>
                <h2 className="font-serif text-3xl text-white uppercase tracking-wide">
                  LOOK <span className="text-brand-magenta italic text-glow-magenta">SECURED</span>
                </h2>
                <p className="text-sm text-neutral-300 font-sans leading-relaxed font-light">
                  Your performancewear has been reserved. If customized, our CDMX  workshop is initiating craft parameters. We have sent receipt details to the guestlist email.
                </p>
              </>
            )}
            <div className="border-t border-white/5 pt-4 text-xs text-brand-gold font-display font-black tracking-widest">
              WELCOME TO THE MOVEMENT
            </div>
            <div className="pt-2">
              <Link href="/">
                <Button variant="primary" size="md" className="w-full">
                  CONTINUE RHYTHM
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Header bar back close button */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center border-b border-white/5">
        <Link
          href="/cart"
          className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO YOUR ARSENAL
        </Link>
        <Link href="/cart" className="p-2 text-neutral-400 hover:text-white transition-colors" aria-label="Close checkout">
          <X className="w-5 h-5" />
        </Link>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="space-y-1 mb-8">
          <h1 className="text-3xl font-serif text-white tracking-wide uppercase">
            SECURE THE <span className="text-brand-magenta italic text-glow-magenta">MOVEMENT</span>
          </h1>
          <p className="text-[10px] text-neutral-500 font-display tracking-widest">
            CHECKOUT PORTAL — FINAL STEP
          </p>
        </div>

        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Shipping Form & Payment Setup (Left 7 Cols) */}
          <div className="lg:col-span-7 space-y-8">

            {/* shipping address section */}
            <div className="space-y-4">
              <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2">
                SHIPPING ADDRESS
              </h3>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="checkout-name" className="text-[10px] tracking-widest text-neutral-400 font-bold">FULL IDENTITY</label>
                  <input
                    id="checkout-name"
                    type="text"
                    required
                    placeholder="Name on the guestlist"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isInfoConfirmed}
                    className="w-full bg-brand-charcoal border border-white/10 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-wide font-sans disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="checkout-email" className="text-[10px] tracking-widest text-neutral-400 font-bold">EMAIL ADDRESS</label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isInfoConfirmed}
                    className="w-full bg-brand-charcoal border border-white/10 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-wide font-sans disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="checkout-address" className="text-[10px] tracking-widest text-neutral-400 font-bold">THE DESTINATION</label>
                  <input
                    id="checkout-address"
                    type="text"
                    required
                    placeholder="Street, Number, Suite"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    disabled={isInfoConfirmed}
                    className="w-full bg-brand-charcoal border border-white/10 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-wide font-sans disabled:opacity-50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="checkout-city" className="text-[10px] tracking-widest text-neutral-400 font-bold">CITY</label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      placeholder="Location"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      disabled={isInfoConfirmed}
                      className="w-full bg-brand-charcoal border border-white/10 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-wide font-sans disabled:opacity-50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="checkout-zip" className="text-[10px] tracking-widest text-neutral-400 font-bold">POSTAL CODE</label>
                    <input
                      id="checkout-zip"
                      type="text"
                      required
                      placeholder="Zip Code"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      disabled={isInfoConfirmed}
                      className="w-full bg-brand-charcoal border border-white/10 rounded-lg py-3 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-wide font-sans disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
            </div>            {/* shipping method section */}
            <div className="space-y-4">
              <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2">
                SHIPPING METHOD
              </h3>

              <div className="space-y-3">
                {/* Option 1: Express */}
                <label
                  className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 ${shippingMethod === 'express'
                    ? 'border-brand-magenta bg-brand-magenta/5 shadow-magenta-glow'
                    : 'border-white/10 bg-brand-charcoal hover:border-white/20'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      disabled={isInfoConfirmed}
                      className="accent-brand-magenta w-4 h-4 cursor-pointer disabled:opacity-50"
                    />
                    <div className="text-left font-sans text-xs">
                      <p className="font-bold text-white uppercase tracking-wider">EXPRESS DELIVERY</p>
                      <p className="text-neutral-400 text-[10px] mt-0.5">Arrival: 1-2 Business Days</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-white">$250 MXN</span>
                </label>

                {/* Option 2: Crafted */}
                <label
                  className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 ${shippingMethod === 'crafted'
                    ? 'border-brand-magenta bg-brand-magenta/5 shadow-magenta-glow'
                    : 'border-white/10 bg-brand-charcoal hover:border-white/20'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'crafted'}
                      onChange={() => setShippingMethod('crafted')}
                      disabled={isInfoConfirmed}
                      className="accent-brand-magenta w-4 h-4 cursor-pointer disabled:opacity-50"
                    />
                    <div className="text-left font-sans text-xs">
                      <p className="font-bold text-white uppercase tracking-wider">CRAFTED DELIVERY</p>
                      <p className="text-neutral-400 text-[10px] mt-0.5">Arrival: 4-6 Business Days</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">FREE</span>
                </label>
              </div>
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
                    if (!name || !email || !address || !city || !zip) {
                      alert('Please fill out all identity, email, and destination fields.');
                      return;
                    }
                    if (!/\S+@\S+\.\S+/.test(email)) {
                      alert('Please enter a valid email address.');
                      return;
                    }
                    setIsInfoConfirmed(true);
                  }}
                  className="shadow-magenta-glow text-xs uppercase"
                >
                  Confirm Info & Select Payment
                </Button>
              </div>
            ) : (
              <div className="flex justify-between items-center p-4 border border-brand-magenta/30 bg-brand-magenta/5 rounded-xl">
                <div className="text-left font-sans text-xs">
                  <p className="font-bold text-white uppercase tracking-wider">Info Confirmed</p>
                  <p className="text-neutral-400 text-[10px] mt-0.5">{email} — {city}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInfoConfirmed(false)}
                  className="text-xs font-bold text-brand-magenta hover:underline"
                >
                  Edit details
                </button>
              </div>
            )}

            {/* secure payment section */}
            <div className="space-y-4">
              <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2">
                SECURE PAYMENT
              </h3>

              {!isInfoConfirmed ? (
                <div className="p-4 bg-brand-charcoal border border-dashed border-white/10 rounded-xl text-center text-xs text-neutral-400">
                  Please confirm your identity and destination details above to initialize secure checkout.
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {/* Option 1: Mercado Pago */}
                    <label
                      className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'mercadopago'
                        ? 'border-brand-magenta bg-brand-magenta/5 shadow-magenta-glow'
                        : 'border-white/10 bg-brand-charcoal hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'mercadopago'}
                          onChange={() => setPaymentMethod('mercadopago')}
                          className="accent-brand-magenta w-4 h-4 cursor-pointer"
                        />
                        <div className="text-left font-sans text-xs">
                          <p className="font-bold text-white uppercase tracking-wider">MERCADO PAGO</p>
                          <p className="text-neutral-400 text-[10px] mt-0.5">Credit, Debit, and Local Options</p>
                        </div>
                      </div>
                      <div className="flex gap-1 bg-white/5 px-2 py-1 rounded">
                        <span className="text-[8px] font-black text-neutral-400 tracking-wider">VISA</span>
                        <span className="text-[8px] font-black text-neutral-400 tracking-wider">MC</span>
                      </div>
                    </label>

                    {/* Option 2: Credit Card */}
                    <label
                      className={`flex justify-between items-center p-4 border rounded-xl cursor-pointer transition-all duration-300 ${paymentMethod === 'card'
                        ? 'border-brand-magenta bg-brand-magenta/5 shadow-magenta-glow'
                        : 'border-white/10 bg-brand-charcoal hover:border-white/20'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="accent-brand-magenta w-4 h-4 cursor-pointer"
                        />
                        <div className="text-left font-sans text-xs">
                          <p className="font-bold text-white uppercase tracking-wider">CREDIT CARD</p>
                          <p className="text-neutral-400 text-[10px] mt-0.5">Add credit or debit card directly</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-neutral-500 font-display tracking-widest">+ ADD CARD</span>
                    </label>
                  </div>

                  {paymentMethod === 'mercadopago' && (
                    <div className="pt-4 border-t border-white/5">
                      <div className="p-4 bg-brand-charcoal border border-white/5 rounded-xl space-y-4">
                        <h4 className="text-[10px] tracking-widest text-neutral-400 font-bold uppercase">PAYMENT PARAMETERS</h4>
                        <Payment
                          initialization={{
                            amount: checkoutTotal,
                            payer: {
                              email: email,
                            }
                          }}
                          customization={{
                            paymentMethods: {
                              creditCard: 'all',
                              debitCard: 'all',
                            },
                            visual: {
                              style: {
                                theme: 'dark',
                              }
                            }
                          }}
                          onSubmit={handlePaymentBrickSubmit}
                          onError={(error) => console.error('MercadoPago Brick Error:', error)}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

          </div>

          {/* Checkout Review Sidebar (Right 5 Cols) */}
          <div className="lg:col-span-5 space-y-6 bg-brand-charcoal border border-white/5 p-6 rounded-2xl">

            <h3 className="text-xs tracking-widest font-display text-neutral-400 font-bold border-b border-white/5 pb-2">
              YOUR ARSENAL ({cart.length} ITEMS)
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
                      <p className="text-[10px] text-neutral-400 mt-0.5">SIZE: {item.selectedSize.toUpperCase()}</p>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] text-neutral-500 font-bold">QTY: {item.quantity}</span>
                      <Price amount={item.product.price * item.quantity} className="font-bold text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* WhatsApp assist links */}
            <WhatsAppAssist
              text="Need immediate stylist confirmation?"
              linkText="Direct Chat"
            />

            {/* Order totals */}
            <div className="space-y-3 border-t border-white/5 pt-4 text-xs font-sans">
              <div className="flex justify-between text-neutral-400">
                <span>SUBTOTAL</span>
                <Price amount={cartTotal} />
              </div>
              <div className="flex justify-between text-neutral-400">
                <span>SHIPPING</span>
                {shippingCost > 0 ? (
                  <Price amount={shippingCost} />
                ) : (
                  <span className="text-brand-gold font-bold">FREE</span>
                )}
              </div>
              <div className="flex justify-between text-white font-bold border-t border-white/5 pt-3">
                <span className="font-display tracking-widest text-neutral-400">TOTAL ENERGY</span>
                <Price amount={checkoutTotal} className="text-lg text-glow-magenta text-brand-magenta font-black" />
              </div>
            </div>

            {/* Buy Action */}
            <div className="pt-4 space-y-4">
              {paymentMethod !== 'mercadopago' ? (
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  type="submit"
                  disabled={loading}
                  className="shadow-magenta-glow text-xs"
                >
                  {loading ? 'SECURING...' : 'COMPLETE THE ENERGY'}
                </Button>
              ) : (
                <div className="text-[10px] text-center text-neutral-500 font-display tracking-widest border border-white/5 bg-brand-dark/30 rounded-lg p-3">
                  COMPLETE SECURE TRANSACTION VIA MERCADO PAGO FORM
                </div>
              )}

              <div className="flex justify-center items-center gap-1.5 text-[9px] text-neutral-500 font-display tracking-widest">
                <Lock className="w-3.5 h-3.5 text-brand-magenta" />
                <span>ENCRYPTED SECURE TRANSACTION</span>
              </div>
            </div>

          </div>
        </form>

      </div>
    </div>
  );
}
