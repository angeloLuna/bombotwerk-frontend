/**
 * Admin API client for Bombo Twerk backend.
 * Uses native fetch — no extra dependencies.
 * Base: NEXT_PUBLIC_BACKEND_URL/api/admin
 */

import type { AdminProduct, AdminCollection, AdminOrder } from '@/types/admin';
import { getSession } from 'next-auth/react';

const BASE =
  (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000') + '/api/admin';

async function req<T>(path: string, opts?: RequestInit): Promise<T> {
  const headers: any = {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    ...opts?.headers,
  };



  try {
    const session = await getSession();
    if (session && (session as any).backendToken) {
      headers['Authorization'] = `Bearer ${(session as any).backendToken}`;
    }
  } catch (error) {
    console.error('[Admin API Client] Error retrieving session token:', error);
  }

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
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

  orders: {
    list: (params?: { status?: string; email?: string; orderNumber?: string; startDate?: string; endDate?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.email) q.append('email', params.email);
      if (params?.orderNumber) q.append('orderNumber', params.orderNumber);
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      const queryString = q.toString();
      return req<AdminOrder[]>(`/orders${queryString ? `?${queryString}` : ''}`);
    },
    get: (id: string) => req<AdminOrder>(`/orders/${id}`),
  },
};

