'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getProductBySlug, getProducts } from '@/lib/api';
import type { ApiProduct, Variant } from '@/types/api';
import { useCart } from '@/context/CartContext';
import Button from '@/components/ui/Button';
import Price from '@/components/ui/Price';
import AvailabilityBadge from '@/components/ui/AvailabilityBadge';
import StickyCTA from '@/components/ui/StickyCTA';
import WhatsAppAssist from '@/components/ui/WhatsAppAssist';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import { ArrowLeft, Sparkles, Plus, Check, Info, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import Price2 from '@/components/ui/Price';
import { trackViewItem } from '@/lib/analytics';

interface ProductPageProps {
  params: any;
}

/** Derive availability info for a selected size */
function getSelectedSizeAvailability(variant: Variant | undefined, size: string) {
  if (!variant) {
    return { type: 'limited-drop' as const, text: 'Edición limitada — Contáctanos', disabled: true };
  }

  const stockEntry = variant.stocks?.find((s) => s.size === size);
  const stockQty = stockEntry ? stockEntry.quantity : 0;

  if (variant.availabilityMode === 'discontinued') {
    return {
      type: 'limited-drop' as const,
      text: 'Descontinuado',
      disabled: true,
    };
  }

  if (variant.availabilityMode === 'made_to_order_only') {
    return {
      type: 'crafted-cdmx' as const,
      text: `Hecho bajo pedido · Estimado ${variant.madeToOrderMinDays ?? 7}–${variant.madeToOrderMaxDays ?? 9} días`,
      disabled: false,
    };
  }

  if (variant.availabilityMode === 'stock_and_made_to_order') {
    if (stockQty > 0) {
      return {
        type: 'ready-to-ship' as const,
        text: 'Envío inmediato (Stock disponible)',
        disabled: false,
      };
    } else {
      return {
        type: 'crafted-cdmx' as const,
        text: `Bajo pedido · Estimado ${variant.madeToOrderMinDays ?? 7}–${variant.madeToOrderMaxDays ?? 9} días`,
        disabled: false,
      };
    }
  }

  // default 'stock_only' or fallback
  if (stockQty > 0) {
    return {
      type: 'ready-to-ship' as const,
      text: `Envío inmediato (${stockQty} disponibles)`,
      disabled: false,
    };
  } else {
    return {
      type: 'limited-drop' as const,
      text: 'Agotado',
      disabled: true,
    };
  }
}

/** Derive size status */
function getSizeStatus(variant: Variant | undefined, size: string): 'discontinued' | 'made_to_order' | 'in_stock' | 'out_of_stock' {
  if (!variant) {
    return 'out_of_stock';
  }

  const stockEntry = variant.stocks?.find((s) => s.size === size);
  const stockQty = stockEntry ? stockEntry.quantity : 0;

  if (variant.availabilityMode === 'discontinued') {
    return 'discontinued';
  }

  if (variant.availabilityMode === 'made_to_order_only') {
    return 'made_to_order';
  }

  if (variant.availabilityMode === 'stock_and_made_to_order') {
    if (stockQty > 0) {
      return 'in_stock';
    } else {
      return 'made_to_order';
    }
  }

  // default 'stock_only' or fallback
  if (stockQty > 0) {
    return 'in_stock';
  } else {
    return 'out_of_stock';
  }
}

function getProductMaxQty(variant: Variant | undefined, size: string): number {
  if (!size || !variant) return 99;
  
  const stockEntry = variant.stocks?.find((s) => s.size === size);
  const stockQty = stockEntry ? stockEntry.quantity : 0;

  if (variant.availabilityMode === 'discontinued') {
    return stockQty;
  }
  if (variant.availabilityMode === 'made_to_order_only' || variant.availabilityMode === 'stock_and_made_to_order') {
    return 99;
  }
  
  // stock_only
  return stockQty;
}

/** Derive global availability info for the product */
function getProductGlobalAvailability(product: ApiProduct): {
  type: 'ready-to-ship' | 'crafted-cdmx' | 'limited-drop';
  text: string;
} {
  if (!product.variants || product.variants.length === 0) {
    return { type: 'limited-drop' as const, text: 'Edición limitada — Contáctanos' };
  }

  let hasReadyToShip = false;
  let hasMadeToOrder = false;

  for (const v of product.variants) {
    if (v.availabilityMode === 'discontinued') continue;
    if (v.availabilityMode === 'made_to_order_only') {
      hasMadeToOrder = true;
      continue;
    }
    for (const s of v.stocks) {
      if (s.quantity > 0) {
        hasReadyToShip = true;
      } else if (v.availabilityMode === 'stock_and_made_to_order') {
        hasMadeToOrder = true;
      }
    }
  }

  if (hasReadyToShip) {
    return { type: 'ready-to-ship' as const, text: 'Envío inmediato' };
  }
  if (hasMadeToOrder) {
    return { type: 'crafted-cdmx' as const, text: 'Bajo pedido cdmx' };
  }
  return { type: 'limited-drop' as const, text: 'Agotado / Descontinuado' };
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
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);
  const [errorFeedback, setErrorFeedback] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Pre-select first color variant when product loads
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      const firstVariantWithColor = product.variants.find((v) => !!v.color);
      if (firstVariantWithColor && firstVariantWithColor.color) {
        setSelectedColor(firstVariantWithColor.color);
      }
    }
  }, [product]);

  // Reset active image index when selected color changes
  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedColor]);

  const fetchProduct = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setSelectedSize('');
    setActiveImageIndex(0);
    setQuantity(1);
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
        setError(msg || 'Error al cargar el producto.');
      }
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    if (product) {
      trackViewItem(product);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;
    if (!selectedSize) {
      setErrorFeedback('Por favor selecciona una talla primero.');
      return;
    }
    const availability = getSelectedSizeAvailability(activeVariant, selectedSize);
    if (availability.disabled) {
      setErrorFeedback('Esta talla no está disponible para compra.');
      return;
    }
    setErrorFeedback('');
    addToCart(product, selectedSize, quantity, activeVariant);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="w-full bg-brand-dark pb-28">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <span className="inline-flex items-center gap-2 text-xs font-display font-bold text-neutral-400">
            <ArrowLeft className="w-4 h-4" /> VOLVER A LA TIENDA
          </span>
        </div>
        <LoadingSpinner message="CARGANDO SILUETA..." />
      </div>
    );
  }

  // ── 404 ──
  if (notFound) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-brand-dark px-4 space-y-6">
        <h1 className="font-serif text-3xl text-neutral-400">ARCHIVO DE PRODUCTOS VACÍO</h1>
        <p className="text-sm text-neutral-500 font-sans text-center max-w-sm">
          La silueta que intentas ver no se encuentra en nuestra base de datos activa.
        </p>
        <Link href="/" className="text-brand-magenta text-xs tracking-widest font-display font-black border-b border-brand-magenta pb-1">
          VOLVER AL INICIO
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
            <ArrowLeft className="w-4 h-4" /> VOLVER A LA TIENDA
          </Link>
        </div>
        <ErrorState
          message={error}
          onRetry={fetchProduct}
          actionLabel="VOLVER AL INICIO"
          actionHref="/"
        />
      </div>
    );
  }

  if (!product) return null;

  const globalAvailability = getProductGlobalAvailability(product);
  const activeVariant = product.variants?.find((v) => v.color === selectedColor) || product.variants?.[0];
  const images = (activeVariant && activeVariant.images && activeVariant.images.length > 0)
    ? activeVariant.images.map((img: any) => img.url)
    : (product.images ?? []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const scrollPosition = container.scrollLeft;
    const slideWidth = container.offsetWidth;
    if (slideWidth > 0) {
      const index = Math.round(scrollPosition / slideWidth);
      if (index !== activeImageIndex && index >= 0 && index < images.length) {
        setActiveImageIndex(index);
      }
    }
  };

  const scrollToSlide = (index: number) => {
    setActiveImageIndex(index);
    if (carouselRef.current) {
      const slideWidth = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({
        left: slideWidth * index,
        behavior: 'smooth',
      });
    }
  };

  const currentImageUrl = images[activeImageIndex] ?? images[0];
  const currentImageObj = product.rawImages?.find((img) => img.url === currentImageUrl);
  const currentImageType = currentImageObj?.type || 'catalog';

  return (
    <div className="w-full bg-brand-dark pb-28 md:pb-16 relative">
      {/* 1. TOP HEADER BACK BAR */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <Link
          href={product.collection?.slug ? `/colecciones/${product.collection.slug}` : '/colecciones'}
          className="inline-flex items-center gap-2 text-xs font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> VOLVER AL DROP
        </Link>
      </div>

      {/* 2. DYNAMIC PDP LAYOUT */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
        {/* Left Column: Premium Images Gallery */}
        <div className="space-y-4">
          {/* Mobile Swipeable Gallery (md:hidden) */}
          <div className="block md:hidden relative">
            <div 
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar border border-white/5 bg-brand-charcoal"
            >
              {images.map((img, idx) => {
                const imgObj = product.rawImages?.find((x) => x.url === img);
                const imgType = imgObj?.type || 'catalog';
                const isTechnical = imgType === 'technical';
                return (
                  <div 
                    key={idx} 
                    onClick={() => setIsLightboxOpen(true)}
                    className={`w-full shrink-0 snap-center aspect-square relative flex items-center justify-center cursor-zoom-in transition-colors duration-300 ${
                      isTechnical ? 'bg-white' : 'bg-brand-charcoal'
                    }`}
                  >
                    {product.isNewArrival && idx === 0 && (
                      <span className="absolute top-4 left-4 z-10 bg-brand-magenta text-black text-[9px] font-black tracking-widest px-2.5 py-1 flex items-center gap-1 shadow-md">
                        <Sparkles className="w-3 h-3" /> NUEVO LANZAMIENTO
                      </span>
                    )}
                    <img
                      src={img}
                      alt={imgObj?.alt || `${product.name} ${idx + 1}`}
                      className={`w-full h-full ${
                        isTechnical ? 'object-contain p-4' : 'object-cover'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Mobile dots indicator */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx === activeImageIndex 
                        ? 'bg-brand-magenta w-4' 
                        : 'bg-white/40 hover:bg-white'
                    }`}
                    aria-label={`Ir a imagen ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Desktop Navigable Gallery (hidden md:block) */}
          <div className="hidden md:block space-y-4">
            <div 
              onClick={() => setIsLightboxOpen(true)}
              className={`relative aspect-square w-full border border-white/5 overflow-hidden group cursor-zoom-in transition-colors duration-300 ${
                currentImageType === 'technical' ? 'bg-white' : 'bg-brand-charcoal'
              }`}
            >
              {product.isNewArrival && (
                <span className="absolute top-4 left-4 z-10 bg-brand-magenta text-black text-[9px] font-black tracking-widest px-2.5 py-1 flex items-center gap-1 shadow-md">
                  <Sparkles className="w-3 h-3" /> NUEVO LANZAMIENTO
                </span>
              )}
              
              <img
                src={currentImageUrl}
                alt={currentImageObj?.alt || product.name}
                className={`w-full h-full transition-transform duration-700 ${
                  currentImageType === 'technical' ? 'object-contain p-6' : 'object-cover hover:scale-105'
                }`}
              />

              {/* Navigation Arrows for Desktop */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-brand-magenta hover:text-black hover:border-brand-magenta"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIndex((prev) => (prev + 1) % images.length);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-brand-magenta hover:text-black hover:border-brand-magenta"
                    aria-label="Siguiente imagen"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail list for Desktop */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative aspect-[3/4] w-20 border transition-all duration-300 overflow-hidden shrink-0 ${
                      idx === activeImageIndex
                        ? 'border-brand-magenta shadow-magenta-glow opacity-100'
                        : 'border-white/5 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={product.rawImages?.find((x) => x.url === img)?.alt || `miniatura ${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
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
              &ldquo;Diseñado para destacar en el movimiento.&rdquo;
            </p>
            <div className="pt-2">
              <Price amount={product.price} className="text-2xl font-black text-white" />
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col gap-2">
              {selectedSize ? (
                <AvailabilityBadge
                  type={getSelectedSizeAvailability(activeVariant, selectedSize).type}
                  text={getSelectedSizeAvailability(activeVariant, selectedSize).text}
                />
              ) : (
                <AvailabilityBadge type={globalAvailability.type} text={globalAvailability.text} />
              )}
            </div>
          </div>

          {/* Color Selector widget (swatches) */}
          {product.variants && product.variants.some((v) => !!v.color) && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center text-xs tracking-wider">
                <span className="font-display font-bold text-neutral-400">SELECCIONAR COLOR</span>
                {selectedColor && (
                  <span className="font-display font-black text-brand-magenta uppercase">
                    {selectedColor}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {Array.from(
                  new Map(
                    product.variants
                      .filter((v) => !!v.color)
                      .map((v) => [v.color!.toLowerCase(), v])
                  ).values()
                ).map((variant) => {
                  const isColorActive = selectedColor === variant.color;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => {
                        setSelectedColor(variant.color || '');
                        setErrorFeedback('');
                        // Pre-select first size available for the new color variant
                        const firstSize = variant.stocks?.find((s) => s.quantity > 0)?.size || variant.stocks?.[0]?.size || '';
                        if (firstSize) setSelectedSize(firstSize);
                      }}
                      className={`relative w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                        isColorActive
                          ? 'border-brand-magenta scale-110 shadow-magenta-glow'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                      style={{
                        backgroundColor: variant.colorHex || '#ffffff',
                      }}
                      title={variant.color || ''}
                    >
                      {/* Visual indicator of selection if no hex color */}
                      {!variant.colorHex && (
                        <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white uppercase font-bold px-0.5 truncate">
                          {variant.color?.substring(0, 3)}
                        </span>
                      )}
                      {isColorActive && (
                        <span className="absolute -inset-1 rounded-full border border-brand-magenta animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selector Widget */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-white/5">
              <div className="flex justify-between items-center text-xs tracking-wider">
                <span className="font-display font-bold text-neutral-400">SELECCIONAR TALLA</span>
                {selectedSize && (
                  <span className="font-display font-black text-brand-magenta">
                    {selectedSize.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {product.sizes.map((size) => {
                  const isActive = selectedSize === size;
                  const sizeStatus = getSizeStatus(activeVariant, size);
                  let statusClasses = '';
                  if (isActive) {
                    statusClasses = 'bg-brand-magenta border-brand-magenta text-black shadow-magenta-glow';
                  } else {
                    if (sizeStatus === 'in_stock') {
                      statusClasses = 'border-brand-magenta text-white bg-transparent hover:border-brand-magenta/80';
                    } else if (sizeStatus === 'made_to_order') {
                      statusClasses = 'border-dashed border-brand-magenta/40 text-white bg-transparent hover:border-brand-magenta/80';
                    } else if (sizeStatus === 'out_of_stock') {
                      statusClasses = 'border-white/10 text-neutral-600 bg-transparent';
                    } else if (sizeStatus === 'discontinued') {
                      statusClasses = 'border-white/10 text-neutral-600 bg-transparent opacity-50';
                    }
                  }
                  return (
                    <button
                      key={size}
                      onClick={() => {
                        setSelectedSize(size);
                        setErrorFeedback('');
                        const maxQty = getProductMaxQty(activeVariant, size);
                        setQuantity((prev) => Math.min(maxQty, prev));
                      }}
                      className={`min-w-[60px] h-[48px] border text-xs font-display font-black tracking-widest transition-all duration-300 ${statusClasses}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>

              {selectedSize && (() => {
                const status = getSizeStatus(activeVariant, selectedSize);
                const minDays = activeVariant?.madeToOrderMinDays ?? 7;
                const maxDays = activeVariant?.madeToOrderMaxDays ?? 9;

                if (status === 'made_to_order') {
                  return (
                    <div className="flex gap-2 items-center text-xs text-neutral-300 font-sans pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-magenta animate-pulse shrink-0" />
                      <p>
                        Disponible bajo pedido. Fabricación de <span className="font-bold text-white">{minDays} a {maxDays} días hábiles</span>.
                      </p>
                    </div>
                  );
                }
                if (status === 'out_of_stock') {
                  return (
                    <div className="flex gap-2 items-center text-xs text-neutral-400 font-sans pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-600 shrink-0" />
                      <p>Esta talla no está disponible por ahora.</p>
                    </div>
                  );
                }
                if (status === 'discontinued') {
                  return (
                    <div className="flex gap-2 items-center text-xs text-neutral-500 font-sans pt-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 shrink-0" />
                      <p>Esta talla ya no está disponible.</p>
                    </div>
                  );
                }
                return null;
              })()}

              {errorFeedback && <p className="text-xs text-red-500 font-sans font-bold">{errorFeedback}</p>}
            </div>
          )}

          {/* Quantity Selector Widget */}
          <div className="space-y-3 pt-4 border-t border-white/5">
            <span className="text-[10px] font-display font-bold tracking-widest text-neutral-400 uppercase block">CANTIDAD</span>
            <div className="flex items-center border border-white/10 rounded-lg bg-[#1a1a1a] w-32 h-10 px-1">
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white transition-colors text-lg font-bold"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  const maxQty = getProductMaxQty(activeVariant, selectedSize);
                  setQuantity(Math.min(maxQty, Math.max(1, parseInt(e.target.value) || 1)));
                }}
                className="w-12 text-center bg-transparent border-0 font-mono font-bold text-sm text-white focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => {
                  const maxQty = getProductMaxQty(activeVariant, selectedSize);
                  setQuantity(prev => Math.min(maxQty, prev + 1));
                }}
                className="w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-white transition-colors text-lg font-bold"
              >
                +
              </button>
            </div>
            {selectedSize && activeVariant && (() => {
              const stockEntry = activeVariant.stocks?.find((s) => s.size === selectedSize);
              const stockQty = stockEntry ? stockEntry.quantity : 0;
              if (activeVariant.availabilityMode === 'stock_and_made_to_order' && quantity > stockQty) {
                return (
                  <div className="flex gap-2 items-center text-xs text-brand-magenta font-sans pt-1 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-magenta animate-pulse shrink-0" />
                    <p>
                      Tenemos <span className="font-bold text-white">{stockQty}</span> disponibles para envío inmediato. Las <span className="font-bold text-white">{quantity - stockQty}</span> unidades extra se fabrican bajo pedido.
                    </p>
                  </div>
                );
              }
              return null;
            })()}
          </div>

          {/* Sizing Info advice callout */}
          <div className="flex gap-2.5 items-start bg-brand-charcoal/50 border border-white/5 p-4 text-xs font-sans text-neutral-400 leading-relaxed rounded-xl">
            <Info className="w-4 h-4 text-brand-magenta shrink-0 mt-0.5" />
            <p>
              Diseñado para esculpir, ajustar y moverse contigo. Tallaje de rendimiento estándar mexicano. Elige tu talla habitual o chatea con una asesora del atelier si tienes dudas.
            </p>
          </div>

          {/* Description Copy blocks */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h3 className="font-serif text-lg italic text-brand-magenta">Creado para destacar.</h3>
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
              disabled={selectedSize ? getSelectedSizeAvailability(activeVariant, selectedSize).disabled : false}
            >
              {addedFeedback ? (
                <>
                  <Check className="w-5 h-5 mr-2" /> AÑADIDO AL ARSENAL
                </>
              ) : selectedSize && getSelectedSizeAvailability(activeVariant, selectedSize).disabled ? (
                'NO DISPONIBLE'
              ) : (
                <>
                  <Plus className="w-5 h-5 mr-2" /> AÑADIR AL ARSENAL
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
              <span className="text-[10px] tracking-widest font-display text-brand-magenta font-black">COMPLETA EL LOOK</span>
              <h2 className="text-2xl font-serif text-white uppercase">COMBÍNALO CON</h2>
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
          <h3 className="font-serif text-2xl md:text-3xl text-white">Artesanía Auténtica de la CDMX</h3>
          <p className="text-xs md:text-sm text-neutral-400 font-sans leading-relaxed max-w-md mx-auto">
            Cada prenda se termina a mano en nuestro estudio de la Ciudad de México. Creemos en la producción limitada para garantizar que cada costura cumpla con los estándares de tu rendimiento.
          </p>
          <div className="flex justify-center items-center gap-2 text-[10px] text-neutral-500 font-display font-black tracking-widest">
            <ShieldCheck className="w-4 h-4 text-brand-magenta" />
            <span>EXCLUSIVIDAD GARANTIZADA</span>
          </div>
        </div>
      </section>

      {/* 5. MOBILE STICKY CTA */}
      <div className="md:hidden">
        <StickyCTA
          label={
            addedFeedback
              ? 'AÑADIDO AL ARSENAL'
              : selectedSize && getSelectedSizeAvailability(activeVariant, selectedSize).disabled
              ? 'NO DISPONIBLE'
              : 'AÑADIR AL ARSENAL'
          }
          onClick={handleAddToCart}
          disabled={selectedSize ? getSelectedSizeAvailability(activeVariant, selectedSize).disabled : false}
          price={product.price}
          icon={addedFeedback ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        />
      </div>

      {/* Lightbox / Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button 
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-xl font-bold transition-all hover:scale-110 z-50"
            aria-label="Cerrar vista"
          >
            &times;
          </button>

          {/* Left Arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
              }}
              className="absolute left-4 md:left-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white transition-colors"
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
          )}

          {/* Image Container */}
          <div 
            className={`relative max-w-full max-h-[85vh] flex items-center justify-center overflow-hidden rounded-xl transition-all duration-300 ${
              currentImageType === 'technical' ? 'bg-white p-6 md:p-10 shadow-2xl border border-white/10' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentImageUrl}
              alt={currentImageObj?.alt || product.name}
              className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg"
            />
          </div>

          {/* Right Arrow */}
          {images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveImageIndex((prev) => (prev + 1) % images.length);
              }}
              className="absolute right-4 md:right-8 w-12 h-12 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/15 text-white transition-colors"
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
