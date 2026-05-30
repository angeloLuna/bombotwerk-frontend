'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import Price from '@/components/ui/Price';
import Button from '@/components/ui/Button';
import WhatsAppAssist from '@/components/ui/WhatsAppAssist';
import { PRODUCTS } from '@/data/placeholder';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, addToCart } = useCart();

  // Recommendations: Accessory and footwear cross-sell (e.g. GOLDEN CORE CHAIN, PULSE HEELS)
  const recommendations = PRODUCTS.filter(
    (p) => p.category === 'ACCESSORIES' || p.category === 'FOOTWEAR'
  ).slice(0, 2);

  if (cart.length === 0) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-brand-dark px-4 space-y-6">
        <div className="w-16 h-16 rounded-full bg-brand-charcoal flex items-center justify-center border border-white/5">
          <ShoppingBag className="w-6 h-6 text-neutral-500" />
        </div>
        <h1 className="font-serif text-3xl text-neutral-400">YOUR ARSENAL IS EMPTY</h1>
        <p className="text-sm text-neutral-500 font-sans text-center max-w-sm">
          You haven&apos;t added any performancewear to your selection yet. Complete your energy by exploring our drops.
        </p>
        <Link href="/collections">
          <Button variant="primary" size="md">
            EXPLORE DROPS
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
            YOUR CURATED SELECTION
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-white tracking-wide uppercase">
            TONIGHT&apos;S <span className="italic font-normal text-brand-magenta text-glow-magenta">ENERGY</span>
          </h1>
        </div>

        {/* Cart items list */}
        <div className="space-y-4">
          {cart.map((item) => (
            <div
              key={`${item.product.id}-${item.selectedSize}`}
              className="flex gap-4 p-4 bg-brand-charcoal border border-white/5 rounded-2xl relative group"
            >
              {/* Product Thumbnail */}
              <Link href={`/product/${item.product.slug}`} className="relative aspect-[3/4] w-24 overflow-hidden bg-brand-dark shrink-0 border border-white/5 rounded-lg">
                <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
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
                      onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                      className="p-1 -mr-1 text-neutral-500 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-[10px] text-brand-magenta font-semibold tracking-wider block">
                    {item.product.availabilityText.toUpperCase()}
                  </span>
                  
                  {/* Selected Size Badge */}
                  <div className="inline-block border border-white/10 px-2 py-0.5 text-[10px] font-display font-bold tracking-widest text-neutral-400">
                    SIZE: {item.selectedSize.toUpperCase()}
                  </div>
                </div>

                {/* Price and Quantity Pickers */}
                <div className="flex justify-between items-center pt-4">
                  {/* Quantity adjustment */}
                  <div className="flex items-center bg-brand-dark border border-white/10 rounded-lg p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                      className="p-1 text-neutral-400 hover:text-white transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-display font-bold text-white">
                      {String(item.quantity).padStart(2, '0')}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
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
          text="Need help choosing your sizing or timing before checking out?" 
          linkText="Ask an Atelier Stylist"
        />

        {/* COMPLETE THE LOOK ACCESORIES RECOMMENDED */}
        <div className="pt-6 border-t border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif text-2xl tracking-wide uppercase text-white">COMPLETE THE LOOK</h2>
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
                      alert(`Added ${item.name} (Size: ${item.sizes[0]}) to your selection.`);
                    }}
                    className="w-full border border-white/10 hover:border-brand-magenta hover:bg-brand-magenta/5 text-[10px] tracking-widest font-display font-black text-white hover:text-brand-magenta py-2 transition-all duration-300 uppercase"
                  >
                    + ADD TO LOOK
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Cart Summary Layout */}
        <div className="bg-brand-charcoal border border-white/5 p-6 rounded-2xl space-y-6">
          <div className="flex justify-between items-center text-xs tracking-widest">
            <span className="text-neutral-400 font-display">TOTAL ENERGY</span>
            <Price amount={cartTotal} className="text-xl font-black text-white" />
          </div>
          <div className="flex justify-between items-center text-[10px] tracking-widest border-t border-white/5 pt-4">
            <span className="text-neutral-400 font-display">EST. SHIPPING</span>
            <span className="text-brand-gold font-bold">COMPLIMENTARY</span>
          </div>

          <div className="pt-2">
            <Link href="/checkout">
              <Button variant="primary" fullWidth size="lg" className="shadow-magenta-glow">
                SECURE THE LOOK <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <Link href="/collections" className="inline-flex items-center gap-1.5 text-[10px] tracking-widest font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> CONTINUE EXPLORING
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
