import type { Metadata } from 'next';
import { getCollections } from '@/lib/api';
import CollectionsClient from './CollectionsClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Colecciones | BOMBO TWERK',
  description:
    'Explora las colecciones exclusivas de Bombo Twerk: siluetas diseñadas para twerk, pole dance y clubwear con compresión estructural y actitud.',
  alternates: {
    canonical: 'https://bombotwerk.com/colecciones',
  },
  openGraph: {
    title: 'Colecciones | BOMBO TWERK',
    description:
      'Explora las colecciones exclusivas de Bombo Twerk: siluetas diseñadas para twerk, pole dance y clubwear con compresión estructural y actitud.',
    url: 'https://bombotwerk.com/colecciones',
    siteName: 'Bombo Twerk',
    locale: 'es_MX',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Colecciones | BOMBO TWERK',
    description:
      'Explora las colecciones exclusivas de Bombo Twerk: siluetas diseñadas para twerk, pole dance y clubwear con compresión estructural y actitud.',
  },
};

export default async function CollectionsPage() {
  const collections = await getCollections().catch((e) => {
    console.error('Error fetching collections:', e);
    return [];
  });

  return (
    <>
      <h1 className="sr-only">Colecciones de Ropa para Twerk y Pole Dance | BOMBO TWERK</h1>
      <CollectionsClient initialCollections={collections} />
    </>
  );
}
