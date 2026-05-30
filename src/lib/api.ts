/**
 * Centralised API client for the Bombo Twerk backend.
 * Uses the native fetch API — no extra dependencies required.
 *
 * Base URL is read from NEXT_PUBLIC_BACKEND_URL (defaults to localhost:4000).
 */

import type { ApiProduct, ApiCollection } from '@/types/api';

const BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000';

// ─── Low-level request helper ─────────────────────────────────────────────────

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    // Disable Next.js cache so we always get fresh data in dev
    cache: 'no-store',
  });

  if (!res.ok) {
    let msg: string;
    try {
      const body = await res.json();
      msg = body?.message ?? res.statusText;
    } catch {
      msg = res.statusText;
    }
    throw new Error(`[${res.status}] ${msg}`);
  }

  return res.json() as Promise<T>;
}

// ─── Public helpers ────────────────────────────────────────────────────────────

export interface ProductFilters {
  category?: string;
  collection?: string;
  availability?: string;
  sort?: string;
  search?: string;
}

/** GET /api/products */
export async function getProducts(filters?: ProductFilters): Promise<ApiProduct[]> {
  let path = '/products';
  if (filters) {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.collection) params.append('collection', filters.collection);
    if (filters.availability) params.append('availability', filters.availability);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.search) params.append('search', filters.search);
    const queryString = params.toString();
    if (queryString) {
      path += `?${queryString}`;
    }
  }
  const data = await request<ApiProduct[]>(path);
  return data.map(normaliseProduct);
}

/** GET /api/products/:slug */
export async function getProductBySlug(slug: string): Promise<ApiProduct> {
  const data = await request<ApiProduct>(`/products/${slug}`);
  return normaliseProduct(data);
}

/** GET /api/collections */
export async function getCollections(): Promise<ApiCollection[]> {
  return request<ApiCollection[]>('/collections');
}

/** GET /api/collections/:slug */
export async function getCollectionBySlug(slug: string): Promise<ApiCollection> {
  const data = await request<ApiCollection>(`/collections/${slug}`);
  return {
    ...data,
    products: data.products?.map(normaliseProduct),
  };
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Derive convenience `images[]`, `sizes[]`, `availability`, and
 * `availabilityText` from the nested variants / media returned by the backend,
 * so existing UI components keep receiving the same flat props they expect.
 */
function normaliseProduct(p: ApiProduct): ApiProduct {
  const images =
    p.media?.map((m) => m.url).filter(Boolean) ??
    ['https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=800'];

  const sizes = Array.from(
    new Set(
      p.variants?.flatMap((v) =>
        v.stocks?.map((s) => s.size).filter(Boolean),
      ) ?? [],
    ),
  );

  // Derive best overall availability from variant stocks
  const allStocks = p.variants?.flatMap((v) => v.stocks) ?? [];
  const hasStock = allStocks.some((s) => s.quantity > 0);
  const hasMTO = p.variants?.some((v) => v.madeToOrderEnabled);

  let availability: ApiProduct['availability'] = 'limited-drop';
  let availabilityText = p.availabilityText || 'Agotado';

  if (hasStock) {
    availability = 'ready-to-ship';
    availabilityText = p.availabilityText || 'Envío inmediato';
  } else if (hasMTO) {
    availability = 'crafted-cdmx';
    availabilityText = p.availabilityText || 'Bajo pedido';
  }

  return { ...p, images, sizes, availability, availabilityText };
}
