'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getProductBySlug, getProducts } from '@/lib/api';
import type { ApiProduct } from '@/types/api';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import AvailabilityBadge from '@/components/ui/AvailabilityBadge';
import StickyCTA from '@/components/ui/StickyCTA';
import WhatsAppAssist from '@/components/ui/WhatsAppAssist';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import { ArrowLeft, Sparkles, Plus, Check, Info, ShieldCheck } from 'lucide-react';
import Price2 from '@/components/ui/Price';

interface ProductPageProps {
  params: any;
}

/** Derive the best availability info from the product's variant stocks */
function getProductAvailability(product: ApiProduct): {
  type: 'ready-to-ship' | 'crafted-cdmx' | 'limited-drop';
  text: string;
} {
  const allStocks = product.variants?.flatMap((v) => v.stocks) ?? [];
  const hasStock = allStocks.some((s) => s.quantity > 0);
  const hasMTO = product.variants?.some((v) => v.madeToOrderEnabled);

  if (hasStock) return { type: 'ready-to-ship', text: 'Ships within 24h' };
  if (hasMTO) return { type: 'crafted-cdmx', text: 'Crafted in CDMX — Ready in 5–7 days' };
  return { type: 'limited-drop', text: 'Limited — Contact us' };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const [slug, setSlug] = useState<string>(() => {
    if (params && typeof (params as any).then !== 'function') {
      return (params as any).slug || '';
    }
    return '';
  });

  useEffect(() => {
    if (params && typeof (params as any).then === 'function') {
      (params as any).then((resolvedParams: any) => {
        if (resolvedParams?.slug) {
          setSlug(resolvedParams.slug);
        }
      });
    } else if (params && (params as any).slug) {
      setSlug((params as any).slug);
    }
  }, [params]);

  const { addToCart } = useCart();

  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Interactive States
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);
  const [errorFeedback, setErrorFeedback] = useState<string>('');

  const fetchProduct = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setSelectedSize('');
    setActiveImageIndex(0);
    try {
      const [p, all] = await Promise.all([
        getProductBySlug(slug),
        getProducts(),
      ]);
      setProduct(p);
      // Pre-select first available size
      if (p.sizes && p.sizes.length > 0) {
        setSelectedSize(p.sizes[0]);
      }
      // Cross-sell: same collection, different product
      const related = all
        .filter(
          (x) =>
            x.collection?.slug === p.collection?.slug && x.id !== p.id,
        )
        .slice(0, 2);
      setRelatedProducts(related);
    } catch (e: any) {
      const msg: string = e?.message ?? '';
      if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
        setNotFound(true);
      } else {
        setError(msg || 'Failed to load product.');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      setErrorFeedback('Please select a size first.');
      return;
    }
    setErrorFeedback('');
    addToCart(product, selectedSize, 1);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="w-full bg-brand-dark pb-28">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <span className="inline-flex items-center gap-2 text-xs font-display font-bold text-neutral-400">
            <ArrowLeft className="w-4 h-4" /> BACK TO DROP
          </span>
        </div>
        <LoadingSpinner message="LOADING SILHOUETTE..." />
      </div>
    );
  }

  // ── 404 ──
  if (notFound) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-brand-dark px-4 space-y-6">
        <h1 className="font-serif text-3xl text-neutral-400">PRODUCT ARCHIVE EMPTY</h1>
        <p className="text-sm text-neutral-500 font-sans text-center max-w-sm">
          The silhouette you are trying to view is not in our active digital drops database.
        </p>
        <Link href="/" className="text-brand-magenta text-xs tracking-widest font-display font-black border-b border-brand-magenta pb-1">
          RETURN TO SHOP HOME
        </Link>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="w-full bg-brand-dark pb-28">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors">
            <ArrowLeft className="w-4 h-4" /> BACK TO SHOP
          </Link>
        </div>
        <ErrorState
          message={error}
          onRetry={fetchProduct}
          actionLabel="RETURN HOME"
          actionHref="/"
        />
      </div>
    );
  }

  if (!product) return null;

  const availability = getProductAvailability(product);
  const images = product.images ?? [];

  return (
    <div className="w-full bg-brand-dark pb-28 md:pb-16 relative">
      {/* 1. TOP HEADER BACK BAR */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link
          href={product.collection?.slug ? `/collections/${product.collection.slug}` : '/collections'}
          className="inline-flex items-center gap-2 text-xs font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> BACK TO DROP
        </Link>
      </div>

      {/* 2. DYNAMIC PDP LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left Column: Premium Images Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-[3/4] w-full border border-white/5 bg-brand-charcoal overflow-hidden group">
            {product.isNewArrival && (
              <span className="absolute top-4 left-4 z-10 bg-brand-magenta text-black text-[9px] font-black tracking-widest px-2.5 py-1 flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3" /> NEW ARRIVAL
              </span>
            )}
            <img
              src={images[activeImageIndex] ?? images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
          </div>

          {/* Thumbnail list */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-[3/4] w-20 border transition-all duration-300 overflow-hidden shrink-0 ${
                    idx === activeImageIndex
                      ? 'border-brand-magenta shadow-magenta-glow'
                      : 'border-white/5 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Dynamic E-Commerce Control Box */}
        <div className="space-y-8 text-left">
          {/* Headline details */}
          <div className="space-y-2">
            <span className="text-xs tracking-widest font-display text-brand-magenta font-black">
              {product.category}
            </span>
            <h1 className="text-4xl font-serif text-white leading-tight uppercase">
              {product.name}
            </h1>
            <p className="text-sm text-neutral-400 font-sans italic tracking-wide">
              &ldquo;Built for the movement spotlight.&rdquo;
            </p>
            <div className="pt-2">
              <Price amount={product.price} className="text-2xl font-black text-white" />
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col gap-2">
              <AvailabilityBadge type={availability.type} text={availability.text} />
            </div>
          </div>

          {/* Size Selector Widget */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center text-xs tracking-wider">
                <span className="font-display font-bold text-neutral-400">SELECT SIZE</span>
                {selectedSize && (
                  <span className="font-display font-black text-brand-magenta">
                    {selectedSize.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => {
                  const isActive = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setErrorFeedback('');
                      }}
                      className={`min-w-[60px] h-[48px] border text-xs font-display font-black tracking-widest transition-all duration-300 ${
                        isActive
                          ? 'bg-brand-magenta border-brand-magenta text-black shadow-magenta-glow'
                          : 'border-white/10 text-white bg-transparent hover:border-white'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
              {errorFeedback && <p className="text-xs text-red-500 font-sans font-bold">{errorFeedback}</p>}
            </div>
          )}

          {/* Sizing Info advice callout */}
          <div className="flex gap-2.5 items-start bg-brand-charcoal/50 border border-white/5 p-4 text-xs font-sans text-neutral-400 leading-relaxed rounded-xl">
            <Info className="w-4 h-4 text-brand-magenta shrink-0 mt-0.5" />
            <p>
              Designed to sculpt, fit, and move with you. Standard Mexican performance sizing. Choose your regular size or chat with an atelier stylist if in doubt.
            </p>
          </div>

          {/* Description Copy blocks */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="font-serif text-lg italic text-brand-magenta">Built for the spotlight.</h3>
            <p className="text-sm font-sans text-neutral-300 font-light leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Desktop Buy Button */}
          <div className="hidden md:block pt-4">
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleAddToCart}
              className="shadow-magenta-glow"
            >
              {addedFeedback ? (
                <>
                  <Check className="w-5 h-5 mr-2" /> ADDED TO MOVEMENT
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" /> ADD TO MOVEMENT
                </>
              )}
            </Button>
          </div>

          {/* WhatsApp advisor support */}
          <WhatsAppAssist />
        </div>
      </div>

      {/* 3. COMPLETE THE LOOK SECTION */}
      {relatedProducts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-16 mt-8 border-t border-white/5">
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <span className="text-[10px] tracking-widest font-display text-brand-magenta font-black">COMPLETE THE LOOK</span>
              <h2 className="text-2xl font-serif text-white uppercase">STYLED WITH</h2>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-2xl">
            {relatedProducts.map((item) => (
              <div key={item.id} className="relative aspect-[3/4] border border-white/5 overflow-hidden group bg-brand-charcoal">
                <Link href={`/product/${item.slug}`} className="block w-full h-full relative">
                  <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-left">
                    <span className="text-[9px] text-neutral-400 font-sans tracking-widest uppercase block">{item.category}</span>
                    <p className="text-xs text-white font-bold tracking-wider line-clamp-1 group-hover:text-brand-magenta transition-colors">{item.name}</p>
                    <Price2 amount={item.price} className="text-[11px] text-brand-magenta block mt-0.5" />
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. ATELIER BRAND PROOF */}
      <section className="bg-brand-charcoal py-16 px-4 border-t border-b border-white/5">
        <div className="max-w-xl mx-auto text-center space-y-6">
          <h3 className="font-serif text-2xl md:text-3xl text-white">Authentic CDMX Craftsmanship</h3>
          <p className="text-xs md:text-sm text-neutral-400 font-sans leading-relaxed max-w-md mx-auto">
            Each garment is hand-finished in our Mexico City studio. We believe in limited production to ensure every stitch meets the metrics of your performance.
          </p>
          <div className="flex justify-center items-center gap-2 text-[10px] text-neutral-500 font-display font-black tracking-widest">
            <ShieldCheck className="w-4 h-4 text-brand-magenta" />
            <span>EXCLUSIVITY SECURED</span>
          </div>
        </div>
      </section>

      {/* 5. MOBILE STICKY CTA */}
      <div className="md:hidden">
        <StickyCTA
          label={addedFeedback ? 'ADDED TO MOVEMENT' : 'ADD TO MOVEMENT'}
          onClick={handleAddToCart}
          price={product.price}
          icon={addedFeedback ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        />
      </div>
    </div>
  );
}
