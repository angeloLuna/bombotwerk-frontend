'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getProducts, getCollections, getProductTypeCards } from '@/lib/api';
import type { ApiProduct, ApiCollection } from '@/types/api';
import type { ProductTypeCard } from '@/types/merchandising';
import Section from '@/components/ui/Section';
import Button from '@/components/ui/Button';
import ProductCard from '@/components/ui/ProductCard';
import CollectionCard from '@/components/ui/CollectionCard';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorState from '@/components/ui/ErrorState';
import { Play, Sparkles, MapPin, ShieldCheck, Mail, ArrowRight, Flame, Percent, Zap } from 'lucide-react';
import { trackWhatsAppClick } from '@/lib/analytics';

interface HomeClientProps {
  initialProducts: ApiProduct[];
  initialCollections: ApiCollection[];
}

export default function HomeClient({ initialProducts, initialCollections }: HomeClientProps) {
  const [products, setProducts] = useState<ApiProduct[]>(initialProducts);
  const [collections, setCollections] = useState<ApiCollection[]>(initialCollections);
  const [typeCards, setTypeCards] = useState<ProductTypeCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prods, cols, cards] = await Promise.all([
        getProducts(),
        getCollections(),
        getProductTypeCards().catch((e) => {
          console.error('Error fetching homepage merchandising cards, falling back to static:', e);
          return [];
        })
      ]);
      setProducts(prods);
      setCollections(cols);
      if (cards && cards.length > 0) {
        setTypeCards(cards);
      } else {
        setTypeCards(staticCategoryCards);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Error al cargar los datos de la tienda.');
      setTypeCards(staticCategoryCards);
    } finally {
      setLoading(false);
    }
  }, []);

  // 1. Static Category cards fallback configuration
  const staticCategoryCards: ProductTypeCard[] = [
    {
      id: 'static-1',
      slug: 'cacheteros',
      title: 'Cacheteros',
      href: '/tienda?category=cacheteros',
      imageUrl: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=600',
      description: 'Diseñados para comodidad y movimiento',
      highlight: false,
      sortOrder: 0,
      isActive: true,
    },
    {
      id: 'static-2',
      slug: 'bodys',
      title: 'Bodys',
      href: '/tienda?category=bodys',
      imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600',
      description: 'Compresión estructural de alta intensidad',
      highlight: false,
      sortOrder: 1,
      isActive: true,
    },
    {
      id: 'static-3',
      slug: 'conjuntos',
      title: 'Conjuntos',
      href: '/tienda?category=conjuntos',
      imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=600',
      description: 'Estilo coordinado listo para destacar',
      highlight: false,
      sortOrder: 2,
      isActive: true,
    },
    {
      id: 'static-4',
      slug: 'faldas-flecos',
      title: 'Faldas y Flecos',
      href: '/tienda?category=faldas-flecos',
      imageUrl: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=600',
      description: 'Siluetas fluidas que siguen tu ritmo',
      highlight: false,
      sortOrder: 3,
      isActive: true,
    },
    {
      id: 'static-5',
      slug: 'arneses',
      title: 'Arneses',
      href: '/tienda?category=arneses',
      imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600',
      description: 'Completa tu arsenal con accesorios',
      highlight: false,
      sortOrder: 4,
      isActive: true,
    },
    {
      id: 'static-6',
      slug: 'ofertas',
      title: 'Ofertas',
      href: '/tienda?sale=true',
      imageUrl: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=600',
      description: 'Promociones y últimas piezas en stock',
      highlight: true,
      badgeLabel: 'OFERTA',
      sortOrder: 5,
      isActive: true,
    },
  ];

  const activeCategoryCards = typeCards.length > 0 ? typeCards : staticCategoryCards;

  useEffect(() => {
    let active = true;
    getProductTypeCards()
      .then((cards) => {
        if (active && cards && cards.length > 0) {
          setTypeCards(cards);
        }
      })
      .catch((err) => {
        console.error('Error fetching type cards on load:', err);
      });
    return () => {
      active = false;
    };
  }, []);

  // 2. Filter active collections (maximum 4)
  const featuredCollections = collections.slice(0, 4);

  // 3. Filter products with `isFeatured: true` (Trending). Fallback to first 4 active products.
  const trendingProducts = products.filter((p) => p.isFeatured).slice(0, 4);
  const displayTrending = trendingProducts.length > 0 ? trendingProducts : products.slice(0, 4);

  // 4. Filter promos and last pieces: products with compareAtPrice OR low stock (total quantity <= 5)
  const promoProducts = products
    .filter((p) => {
      const hasDiscount = p.compareAtPrice !== null && p.compareAtPrice !== undefined;
      const totalStock = p.variants?.reduce((sum, v) => {
        return sum + (v.stocks?.reduce((sSum, s) => sSum + s.quantity, 0) ?? 0);
      }, 0) ?? 0;
      const hasLowStock = totalStock > 0 && totalStock <= 5;
      return hasDiscount || hasLowStock;
    })
    .slice(0, 4);

  return (
    <div className="relative w-full overflow-hidden bg-brand-dark pb-16 md:pb-0">

      {/* 1. HERO BANNER */}
      <section className="relative h-[100svh] w-full flex flex-col justify-end overflow-hidden">
        {/* Background Image with Dark Vignette and Gradient Overlays */}
        {/* Mobile background */}
        <div
          className="absolute inset-0 bg-cover animate-fade-in md:hidden"
          style={{
            backgroundImage: `url('/images/home/hero-bombo.png')`,
            backgroundPosition: '62% 317%',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/20 to-transparent h-40" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/30 to-transparent" />
          <div className="absolute inset-0 bg-brand-plum/10 mix-blend-color-dodge pointer-events-none" />
        </div>

        {/* Desktop / tablet background */}
        <div
          className="absolute inset-0 hidden bg-cover animate-fade-in md:block"
          style={{
            backgroundImage: `url('/images/home/hero-bombo.png')`,
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Subtle top overlay to transition from sticky header */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-dark/80 via-brand-dark/20 to-transparent h-40" />

          {/* Left-to-right vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent" />

          {/* Bottom gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-dark/95 via-brand-dark/30 to-transparent" />

          {/* Extra readability overlay around text area */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-transparent" />

          {/* Magenta neon atmosphere overlay */}
          <div className="absolute inset-0 bg-brand-plum/10 mix-blend-color-dodge pointer-events-none" />
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
              BAILA CON{" "}
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
            <Link href="/tienda" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-magenta-glow">
                COMPRAR AHORA
              </Button>
            </Link>
            <Link href="/colecciones" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto bg-transparent border border-white/20 text-white hover:bg-white/5">
                VER COLECCIONES
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. COMPRAR POR TIPO (CATEGORIES GRID) */}
      <Section
        id="categorias"
        title="EL ARSENAL"
        subtitle="COMPRAR POR TIPO"
        bg="charcoal"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto">
          {activeCategoryCards.map((cat, idx) => {
            const bgImg = cat.imageUrl || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=600';
            const isOffer = cat.badgeLabel?.toLowerCase().includes('oferta') || cat.badgeLabel?.includes('%') || cat.badgeType === 'offer' || cat.highlight;
            const isNew = cat.badgeLabel?.toLowerCase().includes('nuev') || cat.badgeType === 'new';

            return (
              <Link
                key={idx}
                href={cat.href}
                className={`group relative aspect-[4/3] w-full overflow-hidden border rounded-2xl transition-all duration-500 flex flex-col justify-end p-4 md:p-6 ${
                  cat.highlight
                    ? 'border-brand-magenta/30 hover:border-brand-magenta hover:shadow-magenta-glow'
                    : 'border-white/5 hover:border-brand-magenta/20'
                }`}
              >
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url('${bgImg}')` }}
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent transition-opacity duration-300 group-hover:opacity-95" />

                {/* Tag / Icon for highlighted sale or custom badge */}
                {(cat.badgeLabel || cat.highlight) && (
                  <div className="absolute top-4 right-4 bg-brand-magenta text-black text-[9px] font-black tracking-widest px-2.5 py-1 rounded flex items-center gap-1 shadow-md uppercase">
                    {isNew ? (
                      <Sparkles className="w-3 h-3" />
                    ) : isOffer ? (
                      <Percent className="w-3 h-3" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )}
                    {cat.badgeLabel || 'OFERTA'}
                  </div>
                )}

                {/* Card Content */}
                <div className="relative z-10 space-y-1 text-left">
                  <h3 className="font-display font-black text-lg md:text-2xl tracking-wider text-white group-hover:text-brand-magenta transition-colors uppercase">
                    {cat.title}
                  </h3>
                  {cat.description && (
                    <p className="text-[10px] md:text-xs text-neutral-400 line-clamp-1 leading-normal">
                      {cat.description}
                    </p>
                  )}
                  <div className="pt-2 opacity-0 group-hover:opacity-100 -translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-1.5 text-[9px] md:text-[10px] font-display font-black tracking-widest text-brand-magenta">
                    EXPLORAR <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* 3. COLECCIONES DESTACADAS */}
      <Section
        id="colecciones"
        title="EL PULSO"
        subtitle="COLECCIONES DESTACADAS"
        bg="plum"
      >
        {loading ? (
          <LoadingSpinner message="CARGANDO COLECCIONES..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={fetchData}
            actionLabel="VER TIENDA"
            actionHref="/tienda"
          />
        ) : featuredCollections.length === 0 ? (
          <p className="text-center text-neutral-500 text-sm py-8">No hay colecciones disponibles todavía.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {featuredCollections.slice(0, 3).map((collection) => (
                <CollectionCard
                  key={collection.id}
                  collection={collection}
                  variant="card"
                  className="rounded-2xl overflow-hidden"
                />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/colecciones" className="inline-block group">
                <span className="font-display font-black text-xs tracking-widest text-white group-hover:text-brand-magenta transition-colors border-b border-white group-hover:border-brand-magenta pb-1">
                  VER TODAS LAS COLECCIONES →
                </span>
              </Link>
            </div>
          </>
        )}
      </Section>

      {/* 4. EN TENDENCIA (TRENDING INDIVIDUAL PRODUCTS) */}
      <Section
        id="tendencias"
        title="RITMO URBANO"
        subtitle="EN TENDENCIA"
        bg="dark"
      >
        {loading ? (
          <LoadingSpinner message="CARGANDO TENDENCIAS..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={fetchData}
            actionLabel="VER TODOS LOS PRODUCTOS"
            actionHref="/tienda"
          />
        ) : displayTrending.length === 0 ? (
          <p className="text-center text-neutral-500 text-sm py-8">No hay productos destacados todavía.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
            {displayTrending.map((product) => (
              <ProductCard key={product.id} product={product} className="rounded-2xl" />
            ))}
          </div>
        )}
      </Section>

      {/* 5. PROMOS Y ÚLTIMAS PIEZAS */}
      <Section
        id="promos"
        title="COMPRA INTELIGENTE"
        subtitle="PROMOS Y ÚLTIMAS PIEZAS"
        bg="charcoal"
      >
        {loading ? (
          <LoadingSpinner message="CARGANDO OFERTAS..." />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={fetchData}
            actionLabel="VER OFERTAS"
            actionHref="/tienda?sale=true"
          />
        ) : promoProducts.length === 0 ? (
          <div className="text-center py-12 border border-white/5 rounded-2xl bg-brand-dark/30 max-w-2xl mx-auto space-y-4">
            <Percent className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-neutral-500 text-sm font-sans">No hay piezas con descuento o bajo stock actualmente.</p>
            <Link href="/tienda" className="inline-block">
              <Button variant="secondary" size="sm">Ver tienda completa</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
              {promoProducts.map((product) => (
                <ProductCard key={product.id} product={product} className="rounded-2xl animate-fade-in" />
              ))}
            </div>
            <div className="mt-12 text-center">
              <Link href="/tienda?sale=true">
                <Button variant="secondary" size="md" className="border-brand-magenta/30 text-brand-magenta hover:bg-brand-magenta hover:text-black hover:border-brand-magenta shadow-magenta-glow">
                  VER OFERTAS
                </Button>
              </Link>
            </div>
          </>
        )}
      </Section>

      {/* 6. IDENTIDAD DEL TALLER */}
      <Section
        id="identidad"
        title="CDMX ATELIER"
        subtitle="IDENTIDAD DEL TALLER"
        bg="plum"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center max-w-5xl mx-auto">
          <div className="space-y-6 text-left">
            <h3 className="font-serif text-3xl md:text-4xl text-white uppercase tracking-wide">
              PIEZAS HECHAS PARA EL <span className="italic text-brand-magenta text-glow-magenta font-normal">MOVIMIENTO</span>
            </h3>
            <p className="text-base text-neutral-300 font-sans font-light leading-relaxed tracking-wide">
              Diseño propio, confección local y artesanal. Cada puntada en nuestro atelier de la Ciudad de México está pensada para soportar dinámicas de alta intensidad. No vendemos prendas ordinarias: creamos el arsenal para tu performance diaria.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-2.5">
                <Zap className="w-5 h-5 text-brand-magenta shrink-0" />
                <div>
                  <h4 className="font-display font-bold text-xs text-white uppercase">Duras en la Pista</h4>
                  <p className="text-[10px] text-neutral-400 font-sans leading-normal">Compresión estructural probada en pole y twerk.</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-brand-magenta shrink-0" />
                <div>
                  <h4 className="font-display font-bold text-xs text-white uppercase">Hecho local en CDMX</h4>
                  <p className="text-[10px] text-neutral-400 font-sans leading-normal">Fabricación ética y soporte a costureras locales.</p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <a 
                href="https://wa.me/5215582470356" 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('home_atelier_details')}
              >
                <Button variant="secondary" size="md" className="bg-transparent border border-white/20 text-white hover:bg-white/5">
                  VER DETALLES DEL TALLER
                </Button>
              </a>
            </div>
          </div>

          {/* Atelier Image Overlay */}
          <div className="relative aspect-[4/3] w-full border border-white/10 overflow-hidden shadow-2xl group rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800"
              alt="Espacio de trabajo del atelier en CDMX de noche"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 flex items-center gap-2">
              <span className="bg-brand-magenta text-black text-[9px] font-black tracking-widest px-3 py-1.5 rounded uppercase">
                CDMX ATELIER
              </span>
            </div>
          </div>
        </div>
      </Section>

      {/* 7. CTA FINAL (EXPLORA TODO EL CATÁLOGO) */}
      <section className="relative py-24 px-4 overflow-hidden border-t border-b border-white/5 bg-brand-charcoal/20">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-magenta/5 via-transparent to-brand-magenta/5 mix-blend-color-dodge pointer-events-none" />

        <div className="relative z-10 text-center max-w-xl mx-auto space-y-6 flex flex-col items-center">
          <span className="text-xs tracking-widest font-display text-brand-magenta font-black">
            CATÁLOGO COMPLETO
          </span>
          <h2 className="text-4xl md:text-6xl font-serif text-white uppercase tracking-wide leading-none">
            EXPLORA TODO EL <br />
            <span className="italic font-normal text-glow-magenta text-brand-magenta">CATÁLOGO</span>
          </h2>
          <p className="text-sm md:text-base text-neutral-300 font-sans font-light tracking-wide max-w-md leading-relaxed">
            Encuentra cacheteros, bodys, conjuntos, arneses y piezas de temporada diseñadas con actitud Bombo.
          </p>

          <div className="pt-4 w-full sm:w-auto">
            <Link href="/tienda">
              <Button variant="primary" size="lg" className="w-full sm:w-auto px-10 shadow-magenta-glow">
                VER TIENDA COMPLETA
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* NEWSLETTER (JOIN THE DARKNESS) */}
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
                className="w-full bg-brand-dark/50 border border-white/10 rounded-none py-3.5 px-4 text-xs text-white focus:outline-none focus:border-brand-magenta transition-colors tracking-widest uppercase font-sans"
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
        <span suppressHydrationWarning>© {new Date().getFullYear()} BOMBO TWERK. TODOS LOS DERECHOS RESERVADOS.</span>
        <div className="flex justify-center gap-6 text-neutral-400 flex-wrap">
          <Link href="/guia-de-tallas" className="hover:text-brand-magenta transition-colors">GUÍA DE TALLAS</Link>
          <Link href="/envios-y-tiempos" className="hover:text-brand-magenta transition-colors">ENVÍOS Y TIEMPOS DE ENTREGA</Link>
          <Link href="/contacto" className="hover:text-brand-magenta transition-colors">CONTACTAR ATELIER</Link>
          <Link href="/privacy" className="hover:text-brand-magenta transition-colors">AVISO DE PRIVACIDAD</Link>
        </div>
        <div className="flex justify-center items-center gap-1.5 text-neutral-500 pt-2">
          <ShieldCheck className="w-4 h-4 text-brand-magenta" />
          <span>CALIDAD CDMX GARANTIZADA</span>
        </div>
      </footer>
    </div>
  );
}
