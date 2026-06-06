import type { Metadata } from 'next';
import { getCollectionBySlug } from '@/lib/api';
import CollectionDetailPageClient from './CollectionDetailPageClient';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug).catch(() => null);

  if (!collection || 'redirect' in collection) {
    return {
      title: 'Colección no encontrada | BOMBO TWERK',
    };
  }

  const title = collection.seoTitle || `${collection.name} | BOMBO TWERK`;
  const description = collection.seoDescription || collection.description || `Explora el lanzamiento ${collection.name} en Bombo Twerk.`;
  const image = collection.coverImageUrl || collection.heroImageUrl || collection.bgImage || '';

  return {
    title,
    description,
    alternates: {
      canonical: `https://bombotwerk.com/colecciones/${collection.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://bombotwerk.com/colecciones/${collection.slug}`,
      siteName: 'Bombo Twerk',
      locale: 'es_MX',
      type: 'website',
      ...(image && {
        images: [{ url: image }],
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(image && {
        images: [image],
      }),
    },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug).catch(() => null);

  if (!collection) {
    redirect('/colecciones');
  }

  if ('redirect' in collection) {
    redirect(collection.destination);
  }

  return <CollectionDetailPageClient initialCollection={collection} />;
}
