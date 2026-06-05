'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Check, X } from 'lucide-react';
import { CartItem } from '@/context/CartContext';
import Price from '@/components/ui/Price';

interface AddToCartConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem | null;
  onChangeQuantity: (quantity: number) => void;
}

export default function AddToCartConfirmation({
  isOpen,
  onClose,
  item,
  onChangeQuantity,
}: AddToCartConfirmationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen && pathname !== '/cart' && pathname !== '/checkout') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, pathname]);

  // Handle Close on Escape keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Move focus to primary button when opened
  useEffect(() => {
    if (isOpen && primaryButtonRef.current && pathname !== '/cart' && pathname !== '/checkout') {
      // Small timeout to allow transition/rendering to complete
      const timer = setTimeout(() => {
        primaryButtonRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, pathname]);

  if (!item || !isOpen || pathname === '/cart' || pathname === '/checkout') return null;

  const handleBuyNow = () => {
    onClose();
    router.push('/checkout');
  };

  const handleViewCart = () => {
    onClose();
    router.push('/cart');
  };

  // Safe fallback image
  const imageUrl = (item.selectedVariant && item.selectedVariant.images && item.selectedVariant.images[0])
    ? item.selectedVariant.images[0].url
    : (item.product.images?.[0] || 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=800');

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 transition-all duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`w-full bg-[#0d0d0d] border-t border-white/10 rounded-t-3xl p-6 space-y-6 shadow-2xl transition-all duration-300 md:max-w-md md:rounded-2xl md:border md:border-white/10 md:p-8 transform ${
          isOpen ? 'translate-y-0 scale-100' : 'translate-y-full md:scale-95'
        }`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
      >
        {/* Top drag handle indicator for mobile bottom sheet */}
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto md:hidden -mt-2 mb-4" />

        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="bg-brand-magenta/10 p-1.5 rounded-full">
              <Check className="w-4 h-4 text-brand-magenta" />
            </div>
            <h2
              id="confirmation-title"
              className="text-xs font-display font-black tracking-widest text-white uppercase"
            >
              Agregado a tu carrito
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition-colors p-1"
            aria-label="Cerrar confirmación"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Details Card */}
        <div className="flex gap-4 bg-brand-charcoal/40 border border-white/5 p-4 rounded-xl items-center">
          <div className="w-14 h-18 relative shrink-0 overflow-hidden bg-brand-dark border border-white/5 rounded-lg">
            <img
              src={imageUrl}
              alt={item.product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-1 text-left min-w-0">
            <span className="text-[9px] tracking-widest font-display text-brand-magenta font-black uppercase block">
              {item.product.category || 'Producto'}
            </span>
            <h3 className="text-xs font-sans font-bold text-white leading-snug truncate">
              {item.product.name}
            </h3>
            <div className="flex flex-col gap-1.5 mt-0.5">
              <div className="text-[10px] font-mono text-neutral-400">
                Talla: <strong className="text-white">{item.selectedSize}</strong>
              </div>
              {item.selectedVariant?.color && (
                <div className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5">
                  Color:{' '}
                  <strong className="text-white flex items-center gap-1">
                    {item.selectedVariant.color}
                    {item.selectedVariant.colorHex && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20 inline-block animate-none"
                        style={{ backgroundColor: item.selectedVariant.colorHex }}
                      />
                    )}
                  </strong>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-neutral-400">Cant:</span>
                <div className="flex items-center border border-white/10 rounded bg-[#1a1a1a] h-6 px-1">
                  <button
                    type="button"
                    onClick={() => onChangeQuantity(item.quantity - 1)}
                    className="w-4 h-4 flex items-center justify-center text-neutral-400 hover:text-white transition-colors text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="w-5 text-center font-mono font-bold text-xs text-white">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => onChangeQuantity(item.quantity + 1)}
                    className="w-4 h-4 flex items-center justify-center text-neutral-400 hover:text-white transition-colors text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right shrink-0 pl-2">
            <Price
              amount={Number(item.product.price)}
              className="text-xs font-black text-white font-mono"
            />
          </div>
        </div>

        {/* Actions Stack */}
        <div className="space-y-3 pt-2">
          <button
            ref={primaryButtonRef}
            onClick={handleBuyNow}
            className="w-full bg-brand-magenta text-black text-xs font-display font-black tracking-widest py-3.5 rounded-lg hover:bg-brand-magenta/90 transition-all shadow-magenta-glow uppercase focus:outline-none focus:ring-2 focus:ring-brand-magenta/50 focus:ring-offset-2 focus:ring-offset-black"
          >
            Comprar ahora
          </button>

          <button
            onClick={handleViewCart}
            className="w-full bg-transparent border border-white/10 text-white text-xs font-display font-black tracking-widest py-3.5 rounded-lg hover:bg-white/[0.02] hover:border-white/20 transition-all uppercase focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-black"
          >
            Ver carrito
          </button>

          <button
            onClick={onClose}
            className="w-full text-center text-[10px] tracking-widest font-display font-bold text-neutral-400 hover:text-white transition-colors pt-1 uppercase focus:outline-none focus:underline"
          >
            Seguir comprando
          </button>
        </div>
      </div>
    </div>
  );
}
