'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getProducts, getCollections } from '@/lib/api';
import type { ApiProduct, ApiCollection } from '@/types/api';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';
import CollectionCard from '@/components/ui/CollectionCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import { Play, Sparkles, MapPin, ShieldCheck, Mail } from 'lucide-react';

export default function HomePage() {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, cols] = await Promise.all([getProducts(), getCollections()]);
      setProducts(prods);
      setCollections(cols);
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar los datos de la tienda.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Show first 2 products as "trending"
  const trendingProducts = products.slice(0, 2);

  return (
    <div className="relative w-full overflow-hidden bg-brand-dark pb-16 md:pb-0">

      {/* 1. HERO BANNER */}
      <section className="relative h-[100svh] w-full flex flex-col justify-end overflow-hidden">
        {/* Background Image with Dark Vignette and Gradient Overlays */}
        <div
          className="absolute inset-0 bg-cover bg-[75%_center] md:bg-center"
          style={{ backgroundImage: `url('/images/home/hero-bombo.png')` }}
        >
          {/* Subtle top overlay to transition from sticky header */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/70 via-transparent to-transparent h-28" />

          {/* Left-to-right vignette (softened to let the model and background neon shine, while maintaining text contrast) */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />

          {/* Bottom gradient overlay from transparent to brand-dark (black) to blend into the homepage */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-transparent" />

          {/* Magenta neon atmosphere overlay */}
          <div className="absolute inset-0 bg-brand-plum/5 mix-blend-color-dodge pointer-events-none" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full px-6 md:px-12 pb-[140px] md:pb-24 max-w-4xl space-y-6">
          {/* Eyebrow */}
          <span className="text-[10px] md:text-xs tracking-[0.25em] font-orbitron text-brand-magenta font-bold flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-magenta fill-brand-magenta/20" />
            TEMPORADA 01 // ALMA DIGITAL
          </span>

          {/* Headline */}
          <h1 className="flex flex-col gap-1 md:gap-2">
            <span className="font-bebas text-5xl md:text-8xl tracking-wide text-white leading-none">
              BAILA CON
            </span>
            <span className="font-serif italic font-normal text-brand-magenta text-glow-magenta text-6xl md:text-9xl leading-[0.9] -mt-1 md:-mt-2">
              TU ALMA
            </span>
          </h1>

          {/* Body */}
          <p className="text-xs md:text-sm text-neutral-300 font-sans font-light max-w-md tracking-wider leading-relaxed">
            Premium CDMX performancewear diseñada para esculpir, soportar y destacar bajo las luces de neón.
          </p>

          {/* CTAs */}
          <div className="pt-6 flex flex-col sm:flex-row gap-4 max-w-md sm:max-w-none">
            <Link href="/collections" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                EXPLORAR MOVIMIENTO
              </Button>
            </Link>
            <Link href="/collections/latin-pulse" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                NUEVOS LANZAMIENTOS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. COLLECTIONS TEASER */}
      <Section
        id="collections"
        title="EL PULSO"
        subtitle="COLECCIONES"
        bg="plum"
      >
        {loading ? (
          <LoadingSpinner message="CARGANDO COLECCIONES..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={fetchData}
            actionLabel="VER TIENDA"
            actionHref="/collections"
          />
        ) : collections.length === 0 ? (
          <p className="text-center text-neutral-500 text-sm py-8">No hay colecciones disponibles todavía.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  variant="card"
                />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/collections" className="inline-block group">
                <span className="font-display font-black text-xs tracking-widest text-white group-hover:text-brand-magenta transition-colors border-b border-white group-hover:border-brand-magenta pb-1">
                  VER TODAS LAS SILUETAS →
                </span>
              </Link>
            </div>
          </>
        )}
      </Section>

      {/* 3. TRENDING PRODUCTS GRID (URBAN RHYTHM) */}
      <Section
        title="RITMO URBANO"
        subtitle="EN TENDENCIA"
        bg="dark"
      >
        {loading ? (
          <LoadingSpinner message="CARGANDO NOVEDADES..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={fetchData}
            actionLabel="VER TODOS LOS PRODUCTOS"
            actionHref="/collections"
          />
        ) : trendingProducts.length === 0 ? (
          <p className="text-center text-neutral-500 text-sm py-8">No hay productos disponibles todavía.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-8 max-w-4xl mx-auto">
            {trendingProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </Section>

      {/* 4. LA COMUNIDAD SPOTLIGHT */}
      <section className="relative w-full min-h-[500px] flex items-center justify-center py-24 px-4 overflow-hidden border-b border-white/5">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1200')` }}
        >
          <div className="absolute inset-0 bg-black/75" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-transparent to-brand-dark" />
        </div>

        <div className="relative z-10 text-center max-w-xl space-y-6 flex flex-col items-center">
          <span className="text-xs tracking-widest font-display text-brand-magenta font-black">
            LA COMUNIDAD
          </span>
          <h2 className="text-4xl md:text-6xl font-serif text-white uppercase tracking-wide">
            VISTO EN EL <br />
            <span className="italic font-normal text-glow-magenta text-brand-magenta">MOVIMIENTO</span>
          </h2>

          <div className="relative group cursor-pointer my-6">
            <div className="w-16 h-16 rounded-full bg-brand-magenta/20 border border-brand-magenta/40 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-magenta-glow">
              <Play className="w-6 h-6 text-brand-magenta fill-brand-magenta ml-1" />
            </div>
          </div>

          <p className="text-sm md:text-base text-neutral-300 font-sans font-light tracking-wide italic max-w-md">
            &ldquo;Energía sin disculpas, compresión estructural, diseñada para una confianza de alta intensidad.&rdquo;
          </p>

          <Link href="/collections" className="pt-4">
            <Button variant="secondary" size="md" className="bg-transparent border border-white text-white hover:bg-white/10">
              ÚNETE AL MOVIMIENTO
            </Button>
          </Link>
        </div>
      </section>

      {/* 5. ATELIER STORY (HECHO EN MÉXICO) */}
      <Section
        title="HECHO EN MÉXICO"
        subtitle="AUTENTICIDAD PRIMERO"
        bg="charcoal"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          <div className="space-y-6">
            <p className="text-base text-neutral-300 font-light leading-relaxed">
              Cada puntada es un tributo a la CDMX. Combinamos artesanía tradicional con materiales de alto brillo para crear ropa de rendimiento que sobrevive al escenario, al estudio y a la calle.
            </p>
            <div className="flex items-center gap-4 text-brand-gold text-xs tracking-wider font-bold">
              <MapPin className="w-5 h-5 text-brand-gold animate-bounce" />
              <span>TERMINADO A MANO EN CDMX</span>
            </div>
            <div className="pt-2">
              <Link href="https://wa.me/5215555555555" target="_blank" rel="noopener noreferrer">
                <Button variant="secondary" size="md">
                  VER DETALLES DEL TALLER
                </Button>
              </Link>
            </div>
          </div>

          {/* Atelier Image Overlay */}
          <div className="relative aspect-[4/3] w-full border border-white/10 overflow-hidden shadow-2xl group">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800"
              alt="Espacio de trabajo del atelier en CDMX de noche"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <span className="bg-brand-gold text-black text-[9px] font-black tracking-widest px-2.5 py-1 rounded">
                CDMX
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* 6. NEWSLETTER (JOIN THE DARKNESS) */}
      <section className="py-20 px-4 bg-gradient-to-b from-brand-charcoal to-brand-dark border-t border-white/5 relative">
        <div className="max-w-2xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-3xl md:text-5xl font-serif text-white tracking-wide">
            ÚNETE A LA <span className="text-brand-magenta font-normal italic text-glow-magenta">OSCURIDAD</span>
          </h2>
          <p className="text-xs md:text-sm text-neutral-400 font-sans max-w-md mx-auto tracking-wide leading-relaxed">
            Obtén acceso anticipado a lanzamientos exclusivos, talleres de temporada y campañas de estilo exclusivas.
          </p>

          <form className="pt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => { e.preventDefault(); alert('¡Suscrito a la lista de notificaciones de lanzamientos!'); }}>
            <div className="relative flex-1">
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="TU CORREO ELECTRÓNICO"
                className="w-full bg-brand-dark border border-white/10 rounded-none py-3.5 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-widest uppercase font-sans"
              />
              <Mail className="w-4 h-4 text-neutral-500 absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
            <Button variant="primary" type="submit" size="md" className="rounded-none">
              SUSCRIBIRSE
            </Button>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-white/5 text-center text-[10px] text-neutral-600 tracking-widest bg-brand-dark flex flex-col space-y-4">
        <span>© {new Date().getFullYear()} BOMBO TWERK. TODOS LOS DERECHOS RESERVADOS.</span>
        <div className="flex justify-center gap-6 text-neutral-400">
          <a href="#" className="hover:text-brand-magenta transition-colors">GUÍA DE TALLAS</a>
          <a href="#" className="hover:text-brand-magenta transition-colors">ENVÍOS Y TIEMPOS DE ENTREGA</a>
          <a href="#" className="hover:text-brand-magenta transition-colors">CONTACTAR ATELIER</a>
        </div>
        <div className="flex justify-center items-center gap-1.5 text-neutral-500 pt-2">
          <ShieldCheck className="w-4 h-4 text-brand-magenta" />
          <span>CALIDAD CDMX GARANTIZADA</span>
        </div>
      </footer>
    </div>
  );
}
