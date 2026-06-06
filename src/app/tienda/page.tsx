import type { Metadata } from 'next';
import ShopClient from './ShopClient';

export const metadata: Metadata = {
  title: 'Ropa para twerk, pole dance y performance | BOMBO TWERK',
  description:
    'Ropa para twerk, pole dance y performancewear de alta calidad, diseñada y fabricada en la Ciudad de México. Compresión estructural de alta resistencia.',
  alternates: {
    canonical: 'https://bombotwerk.com/tienda',
  },
  openGraph: {
    title: 'Ropa para twerk, pole dance y performance | BOMBO TWERK',
    description:
      'Ropa para twerk, pole dance y performancewear de alta calidad, diseñada y fabricada en la Ciudad de México. Compresión estructural de alta resistencia.',
    url: 'https://bombotwerk.com/tienda',
    siteName: 'Bombo Twerk',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ropa para twerk, pole dance y performance | BOMBO TWERK',
    description:
      'Ropa para twerk, pole dance y performancewear de alta calidad, diseñada y fabricada en la Ciudad de México. Compresión estructural de alta resistencia.',
  },
};

export default function ShopPage() {
  return (
    <>
      <h1 className="sr-only">Ropa para twerk, pole dance y performance</h1>
      <ShopClient />
    </>
  );
}
