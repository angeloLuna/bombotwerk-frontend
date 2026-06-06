import type { Metadata } from 'next';
import { getCollections } from '@/lib/api';
import CollectionsClient from './CollectionsClient';
import { getCollectionPageJsonLd, getBreadcrumbListJsonLd, getItemListJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const title = 'Drops y colecciones para twerk y pole dance | Bombo Twerk';
const description = 'Explora drops y colecciones de ropa para twerk, pole dance y performancewear en México: cacheteros, bodys, conjuntos y piezas de temporada con actitud Bombo.';
const ogImageUrl = 'https://bombotwerk.com/images/og/colecciones-bombo-twerk.png';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: 'https://bombotwerk.com/colecciones',
  },
  openGraph: {
    title,
    description,
    url: 'https://bombotwerk.com/colecciones',
    siteName: 'Bombo Twerk',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Drops y colecciones para twerk y pole dance | Bombo Twerk',
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

export default async function CollectionsPage() {
  const collections = await getCollections().catch((e) => {
    console.error('Error fetching collections:', e);
    return [];
  });

  const collectionPageJsonLd = getCollectionPageJsonLd(
    'Drops y colecciones para twerk y pole dance | Bombo Twerk',
    description,
    'https://bombotwerk.com/colecciones',
    ogImageUrl
  );

  const breadcrumbJsonLd = getBreadcrumbListJsonLd([
    { name: 'Inicio', item: 'https://bombotwerk.com' },
    { name: 'Colecciones', item: 'https://bombotwerk.com/colecciones' },
  ]);

  const itemListJsonLd = getItemListJsonLd(
    'Drops y Colecciones Exclusivas',
    'https://bombotwerk.com/colecciones',
    collections.map(c => ({
      name: c.name,
      url: `https://bombotwerk.com/colecciones/${c.slug}`,
      image: c.coverImageUrl || c.heroImageUrl || c.bgImage || 'https://bombotwerk.com/logo.png'
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
      <h1 className="sr-only">Colecciones de Ropa para Twerk y Pole Dance | BOMBO TWERK</h1>
      <CollectionsClient initialCollections={collections} />
    </>
  );
}
