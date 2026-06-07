'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ShoppingBag, Search, User, Sparkles, MessageSquare, Compass, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { trackWhatsAppClick } from '@/lib/analytics';
import { getCollections } from '@/lib/api';
import type { ApiCollection } from '@/types/api';

const Navigation: React.FC = () => {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { data: session, status } = useSession();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [isCollectionsOpen, setIsCollectionsOpen] = useState(false);
  const [loadingCollections, setLoadingCollections] = useState(false);

  useEffect(() => {
    let active = true;
    const loadCollections = async () => {
      setLoadingCollections(true);
      try {
        const data = await getCollections();
        if (active) {
          setCollections(data);
        }
      } catch (e) {
        console.error('Error fetching navigation collections:', e);
      } finally {
        if (active) {
          setLoadingCollections(false);
        }
      }
    };
    loadCollections();
    return () => {
      active = false;
    };
  }, []);

  // Hide storefront header on admin and login pages
  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/unauthorized')
  ) {
    return null;
  }

  const navLinks = [
    { name: 'INICIO', path: '/' },
    { name: 'TIENDA', path: '/tienda' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Buscando: ${searchQuery} (Funcionalidad simulada)`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full bg-brand-dark/80 backdrop-blur-md border-b border-white/5 py-4 px-4 md:px-8 flex justify-between items-center">
        {/* Menu Hamburger */}
        <button
          id="nav-menu-button"
          onClick={() => setIsDrawerOpen(true)}
          className="p-2 -ml-2 text-white hover:text-brand-magenta transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo */}
        <Link href="/" className="flex flex-col items-center">
          <span className="font-display font-black text-xl tracking-widest text-white hover:text-brand-magenta transition-colors">
            BOMBO TWERK
          </span>
        </Link>

        {/* Cart Trigger */}
        <Link
          href="/cart"
          id="header-cart-link"
          className="relative p-2 -mr-2 text-white hover:text-brand-magenta transition-colors"
          aria-label="Ver carrito"
        >
          <ShoppingBag className="w-6 h-6" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-magenta text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
              {cartCount}
            </span>
          )}
        </Link>
      </header>

      {/* Slide-out Drawer Menu */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-full max-w-xs bg-brand-dark border-r border-white/10 p-6 flex flex-col h-full z-10 shadow-2xl">
            <div className="flex justify-between items-center mb-10">
              <span className="font-display font-black text-lg tracking-widest">BOMBO TWERK</span>
              <button
                id="close-drawer-button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-white hover:text-brand-magenta transition-colors"
                aria-label="Cerrar menú"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 flex flex-col space-y-6 overflow-y-auto pr-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    href={link.path}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`font-sans text-lg font-medium tracking-wider hover:text-brand-magenta transition-colors ${
                      isActive ? 'text-brand-magenta font-bold border-l-2 border-brand-magenta pl-3' : 'text-neutral-300'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {/* Dynamic Accordion for Colecciones */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setIsCollectionsOpen(!isCollectionsOpen)}
                  className={`flex items-center justify-between w-full font-sans text-lg font-medium tracking-wider hover:text-brand-magenta transition-colors text-left focus:outline-none ${
                    pathname?.startsWith('/colecciones') ? 'text-brand-magenta font-bold border-l-2 border-brand-magenta pl-3' : 'text-neutral-300'
                  }`}
                >
                  <span>COLECCIONES</span>
                  {isCollectionsOpen ? (
                    <ChevronUp className="w-4 h-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-400" />
                  )}
                </button>

                {isCollectionsOpen && (
                  <div className="pl-4 flex flex-col space-y-4 border-l border-white/5 mt-2">
                    <Link
                      href="/colecciones"
                      onClick={() => setIsDrawerOpen(false)}
                      className={`font-sans text-sm tracking-wider hover:text-brand-magenta transition-colors ${
                        pathname === '/colecciones' ? 'text-brand-magenta font-bold' : 'text-neutral-400'
                      }`}
                    >
                      VER TODAS
                    </Link>

                    {loadingCollections ? (
                      <span className="text-[10px] text-neutral-500 font-mono tracking-widest animate-pulse">CARGANDO...</span>
                    ) : collections.length === 0 ? (
                      <span className="text-[10px] text-neutral-500 font-mono tracking-widest">SIN COLECCIONES ACTIVAS</span>
                    ) : (
                      collections.map((col) => {
                        const isColActive = pathname === `/colecciones/${col.slug}`;
                        return (
                          <Link
                            key={col.id}
                            href={`/colecciones/${col.slug}`}
                            onClick={() => setIsDrawerOpen(false)}
                            className={`font-sans text-sm tracking-wider hover:text-brand-magenta transition-colors uppercase ${
                              isColActive ? 'text-brand-magenta font-bold' : 'text-neutral-400'
                            }`}
                          >
                            {col.name}
                          </Link>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Tu Arsenal Link */}
              <Link
                href="/cart"
                onClick={() => setIsDrawerOpen(false)}
                className={`font-sans text-lg font-medium tracking-wider hover:text-brand-magenta transition-colors ${
                  pathname === '/cart' ? 'text-brand-magenta font-bold border-l-2 border-brand-magenta pl-3' : 'text-neutral-300'
                }`}
              >
                TU ARSENAL (CARRITO)
              </Link>

              <div className="border-t border-white/5 pt-6 space-y-6">
                {status === 'authenticated' ? (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsDrawerOpen(false)}
                      className={`font-sans text-lg font-medium tracking-wider hover:text-brand-magenta transition-colors block ${
                        pathname?.startsWith('/profile') ? 'text-brand-magenta font-bold border-l-2 border-brand-magenta pl-3' : 'text-neutral-300'
                      }`}
                    >
                      MI PERFIL
                    </Link>
                    <button
                      onClick={() => {
                        setIsDrawerOpen(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="font-sans text-lg font-medium tracking-wider text-neutral-400 hover:text-brand-magenta transition-colors text-left block w-full"
                    >
                      CERRAR SESIÓN
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsDrawerOpen(false)}
                    className={`font-sans text-lg font-medium tracking-wider hover:text-brand-magenta transition-colors block ${
                      pathname === '/login' ? 'text-brand-magenta font-bold border-l-2 border-brand-magenta pl-3' : 'text-neutral-300'
                    }`}
                  >
                    INICIAR SESIÓN
                  </Link>
                )}
              </div>
            </nav>

            <div className="mt-auto border-t border-white/5 pt-6 space-y-4">
              <a
                href="https://wa.me/5215582470356?text=Hola%2C%20me%20gustar%C3%ADa%20recibir%20ayuda%20con%20las%20tallas%20y%20selecci%C3%B3n%20de%20prendas%20en%20Bombo%20Twerk%21"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('nav_mobile_drawer')}
                className="flex items-center gap-3 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-brand-magenta" />
                <span>Hablar con una Asesora</span>
              </a>
              <p className="text-[10px] text-neutral-500 tracking-wider">
                DISEÑADO EN CDMX. EST. 2026
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay/Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-brand-charcoal border border-white/10 p-6 rounded-2xl relative shadow-magenta-glow">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
              aria-label="Cerrar búsqueda"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="font-serif text-2xl italic text-center mb-6 text-brand-magenta">Encuentra Tu Energía</h3>
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Conjuntos, Leggings, Tops..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-dark/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-magenta transition-colors"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-brand-magenta"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bottom Sticky Mobile Navigation Tabs */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-brand-dark/90 backdrop-blur-lg border-t border-white/5 py-2 px-6 flex justify-between items-center shadow-lg">
        {/* Tab 1: Inicio */}
        <Link
          href="/"
          className={`flex flex-col items-center gap-1 transition-colors ${
            pathname === '/' ? 'text-brand-magenta' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px] tracking-widest font-display font-medium">INICIO</span>
        </Link>

        {/* Tab 2: Exclusivo */}
        <Link
          href={collections.length > 0 ? `/colecciones/${collections[0].slug}` : '/colecciones'}
          className={`flex flex-col items-center gap-1 transition-colors ${
            pathname.includes('/colecciones/') ? 'text-brand-magenta' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] tracking-widest font-display font-medium">EXCLUSIVO</span>
        </Link>

        {/* Tab 3: Asesora */}
        <a
          href="https://wa.me/5215582470356?text=Hola!%20Me%20gustar%C3%ADa%20chatear%20con%20una%20asesora%20sobre%20tallas%20y%20opciones%20de%20dise%C3%B1o."
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackWhatsAppClick('nav_mobile_bar')}
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors"
        >
          <MessageSquare className="w-5 h-5 text-brand-magenta animate-pulse" />
          <span className="text-[10px] tracking-widest font-display font-medium">ASESORA</span>
        </a>

        {/* Tab 4: Buscar */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white transition-colors"
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] tracking-widest font-display font-medium">BUSCAR</span>
        </button>

        {/* Tab 5: Perfil */}
        <Link
          href="/profile"
          className={`flex flex-col items-center gap-1 transition-colors ${
            pathname?.startsWith('/profile') ? 'text-brand-magenta' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] tracking-widest font-display font-medium">PERFIL</span>
        </Link>
      </nav>
    </>
  );
};

export default Navigation;
