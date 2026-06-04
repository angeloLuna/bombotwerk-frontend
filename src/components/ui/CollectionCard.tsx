import React from 'react';
import Link from 'next/link';
import { Button } from './Button';
import { ApiCollection } from '@/types/api';

interface CollectionCardProps {
  collection: ApiCollection;
  className?: string;
  variant?: 'banner' | 'card';
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  className = '',
  variant = 'card',
}) => {
  const { name, slug, tagline, description } = collection;
  const bgImage = collection.coverImageUrl ?? collection.bgImage ?? collection.heroImageUrl ?? 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000';

  if (variant === 'banner') {
    return (
      <div className={`relative w-full overflow-hidden border border-white/5 bg-brand-dark ${className}`}>
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 ease-out hover:scale-105" style={{ backgroundImage: `url(${bgImage})` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent md:bg-gradient-to-t md:from-black md:via-black/40 md:to-transparent" />
        </div>

        {/* Content Block */}
        <div className="relative z-10 w-full h-full flex flex-col justify-end p-6 md:p-12 min-h-[350px] md:min-h-[500px] max-w-xl space-y-4">
          <span className="text-[10px] md:text-xs tracking-widest font-display text-brand-magenta font-black">
            NEW DROP AVAILABLE
          </span>
          <h3 className="text-3xl md:text-5xl font-serif text-white uppercase tracking-wide leading-none">
            {name}
          </h3>
          <p className="text-sm text-neutral-300 font-sans tracking-wide leading-relaxed">
            &ldquo;{tagline}&rdquo; — {description}
          </p>
          <div className="pt-4">
            <Link href={`/colecciones/${slug}`}>
              <Button variant="primary" size="md">
                SHOP COLLECTION
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Card Variant
  return (
    <div className={`group relative w-full aspect-[4/5] md:aspect-[3/4] overflow-hidden border border-white/5 bg-brand-charcoal ${className}`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105" 
        style={{ backgroundImage: `url(${bgImage})` }}
      />

      {/* Dark tint overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-300" />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col justify-end space-y-3">
        <h3 className="text-2xl md:text-3xl font-serif text-white tracking-wide leading-tight">
          {name}
        </h3>
        <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
          {description}
        </p>
        <div className="pt-2">
          <Link href={`/colecciones/${slug}`} className="inline-block">
            <span className="text-xs font-display font-black tracking-widest text-brand-magenta hover:text-white transition-colors border-b border-brand-magenta/40 pb-0.5">
              EXPLORE DROP →
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CollectionCard;
