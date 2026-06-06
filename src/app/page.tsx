import type { Metadata } from 'next';
import { getProducts, getCollections } from '@/lib/api';
import HomeClient from './HomeClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'BOMBO TWERK | Ropa de Rendimiento Premium Mexicana',
  description:
    'Ropa de rendimiento premium confeccionada a mano en la Ciudad de México. Diseñada para mujeres que dominan el escenario. Ropa inspirada en el baile, twerk y la vida nocturna.',
  alternates: {
    canonical: 'https://bombotwerk.com',
  },
  openGraph: {
    title: 'BOMBO TWERK | Ropa de Rendimiento Premium Mexicana',
    description:
      'Ropa de rendimiento premium confeccionada a mano en la Ciudad de México. Diseñada para mujeres que dominan el escenario. Ropa inspirada en el baile, twerk y la vida nocturna.',
    url: 'https://bombotwerk.com',
    siteName: 'Bombo Twerk',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BOMBO TWERK | Ropa de Rendimiento Premium Mexicana',
    description:
      'Ropa de rendimiento premium confeccionada a mano en la Ciudad de México. Diseñada para mujeres que dominan el escenario. Ropa inspirada en el baile, twerk y la vida nocturna.',
  },
};

export default async function HomePage() {
  const [products, collections] = await Promise.all([
    getProducts().catch((e) => {
      console.error('Error fetching products for Home:', e);
      return [];
    }),
    getCollections().catch((e) => {
      console.error('Error fetching collections for Home:', e);
      return [];
    }),
  ]);

  return (
    <HomeClient
      initialProducts={products}
      initialCollections={collections}
    />
  );
}
