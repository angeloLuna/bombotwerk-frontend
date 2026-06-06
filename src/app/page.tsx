import type { Metadata } from 'next';
import { getProducts, getCollections } from '@/lib/api';
import HomeClient from './HomeClient';
import { getOrganizationJsonLd, getWebSiteJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

const title = 'Bombo Twerk | Ropa para twerk, pole dance y performance en México';
const description = 'Ropa para twerk, pole dance y performancewear diseñada en México. Encuentra cacheteros, bodys, conjuntos, arneses y piezas de temporada para entrenar, bailar y destacar.';
const ogImageUrl = 'https://bombotwerk.com/images/og/home-bombo-twerk.png';

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: 'https://bombotwerk.com',
  },
  openGraph: {
    title,
    description,
    url: 'https://bombotwerk.com',
    siteName: 'Bombo Twerk',
    locale: 'es_MX',
    type: 'website',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'Bombo Twerk | Ropa para twerk, pole dance y performance',
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

  const orgJsonLd = getOrganizationJsonLd();
  const websiteJsonLd = getWebSiteJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HomeClient
        initialProducts={products}
        initialCollections={collections}
      />
    </>
  );
}
