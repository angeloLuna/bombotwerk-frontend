'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Price from '@/components/ui/Price';
import Button from '@/components/ui/Button';
import WhatsAppAssist from '@/components/ui/WhatsAppAssist';
import { PRODUCTS } from '@/data/placeholder';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft, AlertTriangle, Clock } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, addToCart } = useCart();

  // Recommendations: Accessory and footwear cross-sell (e.g. GOLDEN CORE CHAIN, PULSE HEELS)
  const recommendations = PRODUCTS.filter(
    (p) => p.category === 'ACCESSORIES' || p.category === 'FOOTWEAR'
  ).slice(0, 2);

  const getCartItemFulfillment = (item: any) => {
    const variant = item.selectedVariant || item.product.variants?.find((v: any) =>
      v.stocks?.some((s: any) => s.size === item.selectedSize)
    ) || item.product.variants?.[0];
    
    if (!variant) {
      return { status: 'error', error: 'No disponible', stockUnits: 0, mtoUnits: 0 };
    }

    const stockEntry = variant.stocks?.find((s: any) => s.size === item.selectedSize);
    const stockQty = stockEntry ? stockEntry.quantity : 0;

    if (variant.availabilityMode === 'discontinued') {
      if (stockQty <= 0) {
        return { status: 'error', error: 'Descontinuado y agotado', stockUnits: 0, mtoUnits: 0 };
      }
      if (item.quantity > stockQty) {
        return { status: 'error', error: `Descontinuado. Solo quedan ${stockQty} en existencia`, stockUnits: 0, mtoUnits: 0 };
      }
      return { status: 'stock', stockUnits: item.quantity, mtoUnits: 0 };
    }

    if (variant.availabilityMode === 'stock_only') {
      if (stockQty < item.quantity) {
        return { status: 'error', error: `Stock insuficiente. Disponible: ${stockQty}`, stockUnits: 0, mtoUnits: 0 };
      }
      return { status: 'stock', stockUnits: item.quantity, mtoUnits: 0 };
    }

    if (variant.availabilityMode === 'made_to_order_only') {
      return { status: 'made_to_order', stockUnits: 0, mtoUnits: item.quantity };
    }

    if (variant.availabilityMode === 'stock_and_made_to_order') {
      if (stockQty >= item.quantity) {
        return { status: 'stock', stockUnits: item.quantity, mtoUnits: 0 };
      } else if (stockQty > 0) {
        return { status: 'split', stockUnits: stockQty, mtoUnits: item.quantity - stockQty };
      } else {
        return { status: 'made_to_order', stockUnits: 0, mtoUnits: item.quantity };
      }
    }

    return { status: 'error', error: 'Sin stock', stockUnits: 0, mtoUnits: 0 };
  };

  const cartFulfillment = cart.map(item => ({
    item,
    fulfillment: getCartItemFulfillment(item)
  }));

  const hasErrors = cartFulfillment.some(f => f.fulfillment.status === 'error');
  const hasInStock = cartFulfillment.some(f => f.fulfillment.stockUnits > 0);
  const hasMadeToOrder = cartFulfillment.some(f => f.fulfillment.mtoUnits > 0);
  const isMixed = hasInStock && hasMadeToOrder;

  const isFreeShipping = cartTotal >= 1000;
  const shippingCost = isFreeShipping ? 0 : 150;
  const total = cartTotal + shippingCost;
  const amountForFreeShipping = Math.max(0, 1000 - cartTotal);

  if (cart.length === 0) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-brand-dark px-4 space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-charcoal flex items-center justify-center border border-white/5">
          <ShoppingBag className="w-6 h-6 text-neutral-500" />
        </div>
        <h1 className="font-serif text-3xl text-neutral-400">TU ARSENAL ESTÁ VACÍO</h1>
        <p className="text-sm text-neutral-500 font-sans text-center max-w-sm">
          Aún no has añadido prendas de rendimiento a tu selección. Completa tu energía explorando nuestros drops.
        </p>
        <Link href="/colecciones">
          <Button variant="primary" size="md">
            EXPLORAR DROPS
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full bg-brand-dark pb-28 md:pb-16 text-left">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">
        
        {/* Editorial Heading */}
        <div className="space-y-2 border-b border-white/5 pb-6">
          <span className="text-[10px] tracking-widest font-display text-brand-magenta font-black">
            TU SELECCIÓN CURADA
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-white tracking-wide uppercase">
            LA ENERGÍA <span className="italic font-normal text-brand-magenta text-glow-magenta">DE ESTA NOCHE</span>
          </h1>
        </div>

        {/* Cart items list */}
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.product.id}-${item.selectedSize}-${item.selectedVariant?.id || 'no-var'}`}
              className="flex gap-4 p-4 bg-brand-charcoal border border-white/5 rounded-2xl relative group"
            >
              {/* Product Thumbnail */}
              <Link href={`/product/${item.product.slug}`} className="relative aspect-[3/4] w-24 overflow-hidden bg-brand-dark shrink-0 border border-white/5 rounded-lg">
                <img src={(item.selectedVariant && item.selectedVariant.images && item.selectedVariant.images[0]) ? item.selectedVariant.images[0].url : item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
              </Link>

              {/* Product Info & Controls */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div className="space-y-1">
                  <div className="flex justify-between items-start gap-4">
                    <Link href={`/product/${item.product.slug}`}>
                      <h3 className="font-display font-bold text-sm md:text-base text-white hover:text-brand-magenta transition-colors line-clamp-1">
                        {item.product.name}
                      </h3>
                    </Link>
                    <button
                      onClick={() => removeFromCart(item.product.id, item.selectedSize, item.selectedVariant?.id)}
                      className="p-1 -mr-1 text-neutral-500 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {(() => {
                    const f = getCartItemFulfillment(item);
                    if (f.status === 'error') {
                      return (
                        <span className="text-[10px] text-red-500 font-bold tracking-wider block uppercase">
                          ⚠️ {f.error}
                        </span>
                      );
                    }
                    if (f.status === 'stock') {
                      return (
                        <span className="text-[10px] text-green-400 font-semibold tracking-wider block uppercase">
                          ✓ Envío inmediato (Stock)
                        </span>
                      );
                    }
                    if (f.status === 'made_to_order') {
                      const variant = item.selectedVariant || item.product.variants?.[0];
                      const minDays = variant?.madeToOrderMinDays ?? 7;
                      const maxDays = variant?.madeToOrderMaxDays ?? 9;
                      return (
                        <span className="text-[10px] text-brand-magenta font-semibold tracking-wider block uppercase">
                          ⚙ Bajo pedido · Fabricación {minDays}–{maxDays} días hábiles
                        </span>
                      );
                    }
                    if (f.status === 'split') {
                      const variant = item.selectedVariant || item.product.variants?.[0];
                      const minDays = variant?.madeToOrderMinDays ?? 7;
                      const maxDays = variant?.madeToOrderMaxDays ?? 9;
                      return (
                        <div className="text-[10px] space-y-0.5">
                          <span className="text-green-400 font-semibold tracking-wider block uppercase">
                            ✓ {f.stockUnits} {f.stockUnits === 1 ? 'unidad' : 'unidades'} para envío inmediato
                          </span>
                          <span className="text-brand-magenta font-semibold tracking-wider block uppercase">
                            ⚙ {f.mtoUnits} {f.mtoUnits === 1 ? 'unidad se fabrica' : 'unidades se fabrican'} bajo pedido ({minDays}–{maxDays} días)
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Selected Size and Color Badges */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="inline-block border border-white/10 px-2 py-0.5 text-[10px] font-display font-bold tracking-widest text-neutral-400">
                      TALLA: {item.selectedSize.toUpperCase()}
                    </div>
                    {item.selectedVariant?.color && (
                      <div className="inline-flex items-center gap-1.5 border border-white/10 px-2 py-0.5 text-[10px] font-display font-bold tracking-widest text-neutral-400">
                        COLOR: {item.selectedVariant.color.toUpperCase()}
                        {item.selectedVariant.colorHex && (
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-white/20"
                            style={{ backgroundColor: item.selectedVariant.colorHex }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price and Quantity Pickers */}
                <div className="flex justify-between items-center pt-4">
                  {/* Quantity adjustment */}
                  <div className="flex items-center bg-brand-dark border border-white/10 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1, item.selectedVariant?.id)}
                      className="p-1 text-neutral-400 hover:text-white transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-display font-bold text-white">
                      {String(item.quantity).padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1, item.selectedVariant?.id)}
                      className="p-1 text-neutral-400 hover:text-brand-magenta transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Price amount={item.product.price * item.quantity} className="font-bold text-white text-sm md:text-base" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* WhatsApp styling advice assist */}
        <WhatsAppAssist 
          text="¿Necesitas ayuda para elegir tu talla o tiempos antes de pagar?" 
          linkText="Pregunta a una Asesora del Atelier"
        />

        {/* COMPLETE THE LOOK ACCESORIES RECOMMENDED */}
        <div className="pt-6 border-t border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-2xl tracking-wide uppercase text-white">COMPLETA EL LOOK</h2>
            <ArrowRight className="w-5 h-5 text-brand-magenta" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {recommendations.map((item) => (
              <div
                key={item.id}
                className="flex flex-col bg-brand-charcoal border border-white/5 p-4 rounded-2xl relative overflow-hidden group"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-dark rounded-lg">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="mt-3 flex-1 flex flex-col justify-between space-y-2 text-left">
                  <div>
                    <h4 className="font-display font-bold text-xs tracking-wider text-white line-clamp-1 group-hover:text-brand-magenta transition-colors">
                      {item.name}
                    </h4>
                    <Price amount={item.price} className="text-xs text-brand-magenta block mt-0.5" />
                  </div>
                  <button
                    onClick={() => {
                      addToCart(item as any, item.sizes[0], 1);
                      alert(`Añadido ${item.name} (Talla: ${item.sizes[0]}) a tu arsenal.`);
                    }}
                    className="w-full border border-white/10 hover:border-brand-magenta hover:bg-brand-magenta/5 text-[10px] tracking-widest font-display font-black text-white hover:text-brand-magenta py-2 transition-all duration-300 uppercase"
                  >
                    + AÑADIR AL LOOK
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping & Production Notices */}
        <div className="space-y-3">
          {/* Free Shipping Progress Alert */}
          {!isFreeShipping ? (
            <div className="bg-brand-gold/10 border border-brand-gold/20 p-4 rounded-xl text-xs text-brand-gold font-sans flex items-center gap-2 justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-brand-gold" />
                <span>Agrega más prendas para obtener envío gratis.</span>
              </div>
              <span>Faltan <Price amount={amountForFreeShipping} className="font-bold inline-block" /></span>
            </div>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-xs text-green-400 font-sans flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 shrink-0 text-green-400" />
              <span>Tu pedido califica para envío gratis.</span>
            </div>
          )}

          {/* Mixed Cart Notice */}
          {isMixed && (
            <div className="bg-brand-magenta/5 border border-brand-magenta/20 p-4 rounded-xl text-xs text-neutral-300 font-sans flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-brand-magenta shrink-0 mt-0.5" />
              <span>Tu pedido combina piezas disponibles y piezas bajo demanda. Enviaremos tu pedido completo cuando todas las piezas estén listas.</span>
            </div>
          )}

          {/* Delivery estimate description */}
          <div className="bg-brand-charcoal border border-white/5 p-4 rounded-xl text-xs text-neutral-300 font-sans space-y-1">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Clock className="w-4 h-4 text-brand-magenta shrink-0" />
              {isMixed ? (
                <span>Entrega estimada: 9 a 14 días hábiles.</span>
              ) : hasMadeToOrder ? (
                <span>Entrega estimada: 9 a 14 días hábiles.</span>
              ) : (
                <span>Entrega estimada: 2 a 5 días hábiles.</span>
              )}
            </div>
            {hasMadeToOrder && (
              <p className="text-[10px] text-neutral-400 ml-6">
                {isMixed
                  ? 'El pedido completo se procesará según los tiempos de fabricación de las piezas bajo demanda.'
                  : 'Incluye 7 a 9 días hábiles de fabricación y 2 a 5 días hábiles de envío.'}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Cart Summary Layout */}
        <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl space-y-6">
          <div className="space-y-3 border-b border-white/5 pb-4 text-xs font-sans">
            <div className="flex justify-between text-neutral-400">
              <span>SUBTOTAL PRENDAS</span>
              <Price amount={cartTotal} />
            </div>
            <div className="flex justify-between text-neutral-400">
              <span>ENVÍO ESTÁNDAR</span>
              {shippingCost > 0 ? (
                <Price amount={shippingCost} />
              ) : (
                <span className="text-brand-gold font-bold uppercase tracking-wider text-[10px]">Gratis</span>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs tracking-widest">
            <span className="text-neutral-400 font-display">TOTAL ESTIMADO</span>
            <Price amount={total} className="text-xl font-black text-white" />
          </div>

          <div className="pt-2">
            <Link href={hasErrors ? "#" : "/checkout"} className={hasErrors ? "pointer-events-none" : ""}>
              <Button 
                variant="primary" 
                fullWidth 
                size="lg" 
                className="shadow-magenta-glow"
                disabled={hasErrors}
              >
                {hasErrors ? 'CORREGIR ERRORES EN EL CARRITO' : 'PROCEDER AL PAGO'} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <Link href="/colecciones" className="inline-flex items-center gap-1.5 text-[10px] tracking-widest font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> SEGUIR EXPLORANDO
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
