import type { Metadata } from 'next';
import { getProducts } from '@/lib/api';
import ShopClient from './ShopClient';
import { getCollectionPageJsonLd, getBreadcrumbListJsonLd, getItemListJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const title = 'Ropa para twerk, pole dance y performance | BOMBO TWERK';
const description = 'Ropa para twerk, pole dance y performancewear de alta calidad, diseñada y fabricada en la Ciudad de México. Compresión estructural de alta resistencia.';
const ogImageUrl = 'https://bombotwerk.com/images/og/tienda-bombo-twerk.png';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: 'https://bombotwerk.com/tienda',
  },
  openGraph: {
    title,
    description,
    url: 'https://bombotwerk.com/tienda',
    siteName: 'Bombo Twerk',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Tienda Bombo Twerk | Ropa para twerk, pole dance y performance',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [ogImageUrl],
  },
};

export default async function ShopPage() {
  const initialProducts = await getProducts().catch((e) => {
    console.error('Error fetching products for shop SSR:', e);
    return [];
  });

  const collectionPageJsonLd = getCollectionPageJsonLd(
    'Ropa para twerk, pole dance y performance | BOMBO TWERK',
    description,
    'https://bombotwerk.com/tienda',
    ogImageUrl
  );

  const breadcrumbJsonLd = getBreadcrumbListJsonLd([
    { name: 'Inicio', item: 'https://bombotwerk.com' },
    { name: 'Tienda', item: 'https://bombotwerk.com/tienda' },
  ]);

  const itemListJsonLd = getItemListJsonLd(
    'Catálogo de Ropa para Twerk y Pole Dance',
    'https://bombotwerk.com/tienda',
    initialProducts.map(p => ({
      name: p.name,
      url: `https://bombotwerk.com/product/${p.canonicalSlug || p.slug}`,
      image: p.images?.[0] || 'https://bombotwerk.com/logo.png'
    }))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <h1 className="sr-only">Ropa para twerk, pole dance y performance</h1>
      <ShopClient initialProducts={initialProducts} />
    </>
  );
}
