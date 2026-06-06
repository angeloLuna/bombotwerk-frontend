import type { MetadataRoute } from 'next';
import { getProducts, getCollections } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bombotwerk.com';

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tienda`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/colecciones`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/data-deletion`,
      lastModified: new Date(),
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
        return {
          url,
          lastModified: new Date(),
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
        return {
          url,
          lastModified: new Date(),
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
