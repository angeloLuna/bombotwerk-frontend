import type { Metadata } from 'next';
import { getCollectionBySlug } from '@/lib/api';
import CollectionDetailPageClient from './CollectionDetailPageClient';
import { redirect } from 'next/navigation';
import { getCollectionPageJsonLd, getBreadcrumbListJsonLd, getItemListJsonLd } from '@/lib/seo';

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

  const title = collection.seoTitle || `${collection.name}: ropa para twerk y pole dance | Bombo Twerk`;
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
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: collection.imageAltText || `${collection.name} | Bombo Twerk`,
          },
        ],
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

  const products = collection.products || [];
  const canonicalUrl = `https://bombotwerk.com/colecciones/${collection.slug}`;
  const image = collection.coverImageUrl || collection.heroImageUrl || collection.bgImage || 'https://bombotwerk.com/logo.png';

  const collectionPageJsonLd = getCollectionPageJsonLd(
    collection.seoTitle || `${collection.name}: ropa para twerk y pole dance | Bombo Twerk`,
    collection.seoDescription || collection.description || `Explora el lanzamiento ${collection.name} en Bombo Twerk.`,
    canonicalUrl,
    image
  );

  const breadcrumbJsonLd = getBreadcrumbListJsonLd([
    { name: 'Inicio', item: 'https://bombotwerk.com' },
    { name: 'Colecciones', item: 'https://bombotwerk.com/colecciones' },
    { name: collection.name, item: canonicalUrl },
  ]);

  const itemListJsonLd = getItemListJsonLd(
    `Productos de la Colección ${collection.name}`,
    canonicalUrl,
    products.map(p => ({
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
      <CollectionDetailPageClient initialCollection={collection} />
    </>
  );
}
