'use client';

import React from 'react';
import Link from 'next/link';
import type { ApiCollection } from '@/types/api';
import ProductCard from '@/components/ui/ProductCard';
import WhatsAppAssist from '@/components/ui/WhatsAppAssist';
import EmptyState from '@/components/ui/EmptyState';
import { ArrowLeft, Sparkles } from 'lucide-react';

interface CollectionDetailPageClientProps {
  initialCollection: ApiCollection;
}

export default function CollectionDetailPageClient({ initialCollection: collection }: CollectionDetailPageClientProps) {
  const products = collection.products ?? [];

  return (
    <div className="w-full bg-brand-dark pb-24 md:pb-12">
      {/* Back button */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link
          href="/colecciones"
          className="inline-flex items-center gap-2 text-xs font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> VOLVER A TODOS LOS LANZAMIENTOS
        </Link>
      </div>

      {/* Collection Headline Section */}
      {(() => {
        const heroImage = collection.heroImageUrl ?? collection.bgImage ?? collection.coverImageUrl;
        if (heroImage) {
          return (
            <section className="relative w-full overflow-hidden border-b border-white/5 bg-brand-dark mb-8">
              {/* Background Image with Vignette */}
              <div 
                className="absolute inset-0 w-full h-full bg-cover bg-center transition-transform duration-1000 ease-out hover:scale-105" 
                style={{ backgroundImage: `url(${heroImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent" />
                <div className="absolute inset-0 bg-black/60" />
              </div>

              {/* Content Block */}
              <div className="relative z-10 max-w-3xl mx-auto text-center space-y-4 px-4 py-16 md:py-24">
                <span className="text-[10px] tracking-widest font-display text-brand-magenta font-black flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> LANZAMIENTO ACTUAL
                </span>
                <h1 className="text-4xl md:text-6xl font-serif text-white tracking-wide uppercase text-shadow">
                  {collection.name}
                </h1>
                {collection.tagline && (
                  <p className="text-sm text-neutral-300 font-sans font-light max-w-xl mx-auto leading-relaxed tracking-wide italic">
                    &ldquo;{collection.tagline}&rdquo;
                  </p>
                )}
                {collection.description && (
                  <p className="text-xs md:text-sm text-neutral-400 font-sans max-w-xl mx-auto leading-relaxed tracking-wide pt-2">
                    {collection.description}
                  </p>
                )}
                <div className="w-12 h-[1px] bg-brand-magenta/60 mx-auto mt-6" />
              </div>
            </section>
          );
        }

        return (
          <section className="pt-8 pb-12 px-4 text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] tracking-widest font-display text-brand-magenta font-black flex items-center justify-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> LANZAMIENTO ACTUAL
            </span>
            <h1 className="text-4xl md:text-6xl font-serif text-white tracking-wide uppercase">
              {collection.name}
            </h1>
            {collection.tagline && (
              <p className="text-sm text-neutral-300 font-sans font-light max-w-xl mx-auto leading-relaxed tracking-wide italic">
                &ldquo;{collection.tagline}&rdquo;
              </p>
            )}
            {collection.description && (
              <p className="text-xs md:text-sm text-neutral-400 font-sans max-w-xl mx-auto leading-relaxed tracking-wide pt-2">
                {collection.description}
              </p>
            )}
            <div className="w-12 h-[1px] bg-brand-magenta/60 mx-auto mt-6" />
          </section>
        );
      })()}

      {/* Products list */}
      <section className="px-4 md:px-8 py-4 max-w-5xl mx-auto">
        {products.length === 0 ? (
          <EmptyState
            title="SIN ARTÍCULOS EN ESTE LANZAMIENTO"
            message="No hay artículos disponibles actualmente en esta colección."
            actionLabel="EXPLORAR TODOS LOS LANZAMIENTOS"
            actionHref="/colecciones"
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Stylist Assist Footer */}
      <section className="max-w-xl mx-auto px-4 pt-16">
        <WhatsAppAssist
          text="¿Necesitas ayuda para encontrar el conjunto o talla correcta en este lanzamiento?"
          linkText="Chat con una Asesora"
        />
      </section>
    </div>
  );
}
