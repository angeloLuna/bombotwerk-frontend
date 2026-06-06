import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getProductBySlug, getProducts } from '@/lib/api';

export const dynamic = 'force-dynamic';
import type { ApiProduct } from '@/types/api';
import ProductDetailClient from './ProductDetailClient';
import type { Metadata } from 'next';
import { getOrganizationJsonLd, getProductJsonLd, getProductGroupJsonLd } from '@/lib/seo';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const productData = await getProductBySlug(slug);
    if ('redirect' in productData) {
      return { title: 'Redireccionando...' };
    }

    const title = productData.seoTitle || `${productData.name} | BOMBO TWERK`;
    const description = productData.seoDescription || productData.description;
    const canonicalSlug = productData.canonicalSlug || productData.slug;
    const canonicalUrl = `https://bombotwerk.com/product/${canonicalSlug}`;
    const imageUrl = productData.images?.[0] || 'https://bombotwerk.com/logo.png';

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: productData.name,
        description: productData.description,
        url: canonicalUrl,
        siteName: 'Bombo Twerk',
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: productData.name,
          },
        ],
        locale: 'es_MX',
      },
      other: {
        'og:type': 'product',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: 'Producto no encontrado | BOMBO TWERK',
    };
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: ApiProduct | null = null;
  let relatedProducts: ApiProduct[] = [];
  let error: string | null = null;
  let notFound = false;

  try {
    const productData = await getProductBySlug(slug);
    if ('redirect' in productData) {
      redirect(productData.destination);
    }

    product = productData;

    // Cross-sell: same collection, different product
    const all = await getProducts();
    const related = all
      .filter((x) => x.collection?.slug === product?.collection?.slug && x.id !== product?.id)
      .slice(0, 2);
    relatedProducts = related;
  } catch (e: any) {
    const msg: string = e?.message ?? '';
    if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
      notFound = true;
    } else {
      error = msg || 'Error al cargar el producto.';
    }
  }

  // ── 404 ──
  if (notFound || !product) {
    return (
      <div className="w-full min-h-[70vh] flex flex-col items-center justify-center bg-brand-dark px-4 space-y-6">
        <h1 className="font-serif text-3xl text-neutral-400">ARCHIVO DE PRODUCTOS VACÍO</h1>
        <p className="text-sm text-neutral-500 font-sans text-center max-w-sm">
          La silueta que intentas ver no se encuentra en nuestra base de datos activa.
        </p>
        <Link
          href="/"
          className="text-brand-magenta text-xs tracking-widest font-display font-black border-b border-brand-magenta pb-1"
        >
          VOLVER AL INICIO
        </Link>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="w-full bg-brand-dark pb-28 min-h-[70vh] flex flex-col justify-center items-center">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center space-y-4">
          <p className="text-red-500 font-sans font-bold">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-display font-bold text-neutral-400 hover:text-brand-magenta transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> VOLVER AL INICIO
          </Link>
        </div>
      </div>
    );
  }

  // Generate Schemas using centralized helpers
  const organizationJsonLd = getOrganizationJsonLd();
  const productJsonLd = getProductJsonLd(product);
  const productGroupJsonLd = getProductGroupJsonLd(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      {productGroupJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productGroupJsonLd) }}
        />
      )}
      <ProductDetailClient
        initialProduct={product}
        initialRelatedProducts={relatedProducts}
      />
    </>
  );
}
