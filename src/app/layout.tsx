import type { Metadata } from 'next';
import { Outfit, Bebas_Neue, Playfair_Display, Orbitron, Syne } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import Navigation from '@/components/Navigation';
import { SessionProvider } from 'next-auth/react';
import { GoogleTagManager } from '@next/third-parties/google';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-outfit',
});

const bebas = Bebas_Neue({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-bebas',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
});

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  variable: '--font-orbitron',
});

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
});

export const metadata: Metadata = {
  title: 'BOMBO TWERK | Ropa de Rendimiento Premium Mexicana',
  description:
    'Ropa de rendimiento premium confeccionada a mano en la Ciudad de México. Diseñada para mujeres que dominan el escenario. Ropa inspirada en el baile, twerk y la vida nocturna.',
};

// Viewport configuration (no themeColor here)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#050505',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="es" className={`${outfit.variable} ${bebas.variable} ${playfair.variable} ${orbitron.variable} ${syne.variable} h-full`}>
      <body className="h-full bg-brand-dark text-white flex flex-col selection:bg-brand-magenta selection:text-black">
        {gtmId && process.env.NODE_ENV === 'production' && (
          <GoogleTagManager gtmId={gtmId} />
        )}
        <SessionProvider>
          <CartProvider>
            {/* Header & Nav */}
            <Navigation />

            {/* Main content with space for bottom navigation bar on mobile */}
            <main className="flex-1 pb-20 md:pb-0">
              {children}
            </main>
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}

