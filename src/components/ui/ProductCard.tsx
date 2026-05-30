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
  const { name, slug, price, category, images, availability } = product;
  const primaryImage = images[0];
  const secondaryImage = images[1] || images[0];

  return (
    <div className={`group relative flex flex-col bg-brand-charcoal border border-white/5 overflow-hidden transition-all duration-300 hover:border-brand-magenta/30 hover:shadow-magenta-glow ${className}`}>
      {/* Product Image Wrapper (Aspect Ratio 3:4 for editorial look) */}
      <Link href={`/product/${slug}`} className="relative aspect-[3/4] overflow-hidden w-full bg-brand-dark">
        {product.isNewArrival && (
          <span className="absolute top-3 left-3 z-10 bg-brand-magenta text-black text-[9px] font-black tracking-widest px-2 py-1 flex items-center gap-1 shadow-md">
            <Sparkles className="w-3 h-3" /> NEW
          </span>
        )}
        
        {/* Primary Image */}
        <img
          src={primaryImage}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 group-hover:opacity-0"
          loading="lazy"
        />

        {/* Secondary Hover Image */}
        <img
          src={secondaryImage}
          alt={`${name} secondary view`}
          className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-all duration-700 ease-out scale-100 group-hover:opacity-100 group-hover:scale-105"
          loading="lazy"
        />

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
            <Price amount={price} className="text-sm font-black text-white" />
            <Link 
              href={`/product/${slug}`}
              className="text-[10px] tracking-widest font-black text-brand-magenta border-b border-brand-magenta/40 pb-0.5 hover:border-brand-magenta transition-colors"
            >
              VIEW DETAILS
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
