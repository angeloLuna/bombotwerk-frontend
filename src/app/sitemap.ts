import type { MetadataRoute } from 'next';
import { getProducts, getCollections } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bombotwerk.com';
  const stableDate = new Date('2026-06-06');

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: stableDate,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tienda`,
      lastModified: stableDate,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/colecciones`,
      lastModified: stableDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guia-de-tallas`,
      lastModified: stableDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/envios-y-tiempos`,
      lastModified: stableDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: stableDate,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: stableDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/data-deletion`,
      lastModified: stableDate,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // Dynamic products
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    const uniqueProductUrls = new Set<string>();
    
    productRoutes = products
      .filter((p) => p.isActive && p.availability !== 'limited-drop')
      .map((product) => {
        const canonicalSlug = product.canonicalSlug || product.slug;
        const url = `${baseUrl}/product/${canonicalSlug}`;
        if (uniqueProductUrls.has(url)) {
          return null;
        }
        uniqueProductUrls.add(url);

        let lastModDate = stableDate;
        if ((product as any).updatedAt) {
          lastModDate = new Date((product as any).updatedAt);
        }

        return {
          url,
          lastModified: lastModDate,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        };
      })
      .filter(Boolean) as MetadataRoute.Sitemap;
  } catch (error) {
    console.error('Error generating product sitemap paths:', error);
  }

  // Dynamic collections
  let collectionRoutes: MetadataRoute.Sitemap = [];
  try {
    const collections = await getCollections();
    const uniqueCollectionUrls = new Set<string>();
    
    collectionRoutes = collections
      .map((collection) => {
        const url = `${baseUrl}/colecciones/${collection.slug}`;
        if (uniqueCollectionUrls.has(url)) {
          return null;
        }
        uniqueCollectionUrls.add(url);

        let lastModDate = stableDate;
        if ((collection as any).updatedAt) {
          lastModDate = new Date((collection as any).updatedAt);
        }

        return {
          url,
          lastModified: lastModDate,
          changeFrequency: 'weekly' as const,
          priority: 0.6,
        };
      })
      .filter(Boolean) as MetadataRoute.Sitemap;
  } catch (error) {
    console.error('Error generating collection sitemap paths:', error);
  }

  return [...staticRoutes, ...productRoutes, ...collectionRoutes];
}
