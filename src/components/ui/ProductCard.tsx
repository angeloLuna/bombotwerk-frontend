import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ApiProduct } from '@/types/api';
import Price from './Price';
import AvailabilityBadge from './AvailabilityBadge';
import { Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: ApiProduct;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const { name, slug, price, category, availability } = product;
  const rawImages = product.rawImages || [];

  // 1. Resolve Primary Image URL and Alt
  let primaryImgObj = rawImages.find((img) => img.isCover === true);
  if (!primaryImgObj) {
    primaryImgObj = rawImages.find((img) => img.type === 'editorial');
  }
  if (!primaryImgObj) {
    primaryImgObj = rawImages.find((img) => img.type === 'catalog');
  }
  if (!primaryImgObj) {
    primaryImgObj = rawImages[0];
  }

  const primaryImageUrl = primaryImgObj?.url || product.images?.[0] || 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=800';
  const primaryAlt = primaryImgObj?.alt || `${product.name} ${product.category || ''} Bombo Twerk`.trim();

  // 2. Resolve Hover Image (must be different from primary)
  let hoverImgObj = rawImages.find((img) => img.type === 'catalog' && img.url !== primaryImageUrl);
  if (!hoverImgObj) {
    hoverImgObj = rawImages.find((img) => img.type === 'detail' && img.url !== primaryImageUrl);
  }

  const secondaryImageUrl = hoverImgObj?.url;
  const hasHoverImage = !!secondaryImageUrl;

  return (
    <div className={`group relative flex flex-col bg-brand-charcoal border border-white/5 overflow-hidden transition-all duration-300 hover:border-brand-magenta/30 hover:shadow-magenta-glow ${className}`}>
      {/* Product Image Wrapper (Aspect Ratio 3:4 for editorial look) */}
      <Link href={`/product/${slug}`} className="relative aspect-[3/4] overflow-hidden w-full bg-brand-dark">
        {product.isNewArrival && (
          <span className="absolute top-3 left-3 z-10 bg-brand-magenta text-black text-[9px] font-black tracking-widest px-2 py-1 flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" /> NUEVO
          </span>
        )}
        
        {product.compareAtPrice && (
          <span className="absolute top-3 right-3 z-10 bg-brand-magenta text-black text-[9px] font-black tracking-widest px-2 py-1 shadow-md uppercase">
            OFERTA
          </span>
        )}
        
        {hasHoverImage ? (
          <>
            {/* Primary Image */}
            <img
              src={primaryImageUrl}
              alt={primaryAlt}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
              loading="lazy"
            />

            {/* Secondary Hover Image */}
            <img
              src={secondaryImageUrl}
              alt={`${name} vista alternativa`}
              className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-700 ease-out scale-100 group-hover:opacity-100 group-hover:scale-105"
              loading="lazy"
            />
          </>
        ) : (
          <img
            src={primaryImageUrl}
            alt={primaryAlt}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Dark overlay grid */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 pointer-events-none" />
      </Link>

      {/* Product Information */}
      <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <span className="text-[10px] tracking-widest font-bold text-neutral-500 uppercase">
            {category} {product.collection ? `// ${product.collection.name}` : ''}
          </span>
          <Link href={`/product/${slug}`}>
            <h3 className="font-display font-bold text-sm tracking-wider text-white hover:text-brand-magenta transition-colors line-clamp-1">
              {name}
            </h3>
          </Link>
        </div>

        <div className="flex flex-col space-y-2 pt-2">
          {/* Availability Badge */}
          <AvailabilityBadge type={availability} text={product.availabilityText} />
          
          <div className="flex justify-between items-center pt-1 border-t border-white/5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <Price amount={price} className="text-sm font-black text-white" />
              {product.compareAtPrice && (
                <Price amount={Number(product.compareAtPrice)} className="text-[10px] text-neutral-500 line-through" />
              )}
            </div>
            <Link 
              href={`/product/${slug}`}
              className="text-[10px] tracking-widest font-black text-brand-magenta border-b border-brand-magenta/40 pb-0.5 hover:border-brand-magenta transition-colors"
            >
              VER DETALLES
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
