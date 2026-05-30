/**
 * Admin API client for Bombo Twerk backend.
 * Uses native fetch — no extra dependencies.
 * Base: NEXT_PUBLIC_BACKEND_URL/api/admin
 */

import type { AdminProduct, AdminCollection } from '@/types/admin';

const BASE =
  (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000') + '/api/admin';

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ...opts?.headers,
    },
    cache: 'no-store',
  });
  if (!res.ok) {
    let msg = res.statusText;
    try {
      const body = await res.json();
      msg = body?.message ?? msg;
    } catch {}
    throw new Error(`[${res.status}] ${msg}`);
  }
  // 204 No Content
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Products ──────────────────────────────────────────────────────────────────

export const adminApi = {
  products: {
    list: () => req<AdminProduct[]>('/products'),
    get: (id: string) => req<AdminProduct>(`/products/${id}`),
    create: (body: object) =>
      req<AdminProduct>('/products', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: object) =>
      req<AdminProduct>(`/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    deactivate: (id: string) =>
      req<AdminProduct>(`/products/${id}`, { method: 'DELETE' }),
  },

  collections: {
    list: () => req<AdminCollection[]>('/collections'),
    create: (body: object) =>
      req<AdminCollection>('/collections', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    update: (id: string, body: object) =>
      req<AdminCollection>(`/collections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
  },
};
