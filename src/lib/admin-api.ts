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
    'ngrok-skip-browser-warning': 'true',
    ...opts?.headers,
  };

  if (!(opts?.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }



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
    uploadImage: (productId: string, file: File, type?: string, alt?: string, sortOrder?: number, isCover?: boolean) => {
      const formData = new FormData();
      formData.append('file', file);
      if (type) formData.append('type', type);
      if (alt) formData.append('alt', alt);
      if (sortOrder !== undefined) formData.append('sortOrder', String(sortOrder));
      if (isCover !== undefined) formData.append('isCover', String(isCover));
      return req<any>(`/products/${productId}/images`, {
        method: 'POST',
        body: formData,
      });
    },
    uploadRawImage: (productId: string, file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return req<{ url: string; key: string }>(`/products/${productId}/images/upload-raw`, {
        method: 'POST',
        body: formData,
      });
    },
    bulkUpdateImages: (productId: string, body: { images: any[]; deletedImageIds: string[] }) =>
      req<any[]>(`/products/${productId}/images/bulk`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    addImageUrl: (productId: string, body: { url: string; alt?: string; type?: string; isCover?: boolean; sortOrder?: number }) =>
      req<any>(`/products/${productId}/images/url`, {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    updateImage: (productId: string, imageId: string, body: { alt?: string; type?: string; sortOrder?: number; isCover?: boolean }) =>
      req<any>(`/products/${productId}/images/${imageId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    reorderImages: (productId: string, ids: string[]) =>
      req<any>(`/products/${productId}/images/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ ids }),
      }),
    deleteImage: (productId: string, imageId: string) =>
      req<any>(`/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
      }),
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
    uploadImage: (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      return req<{ url: string; key: string }>('/collections/upload', {
        method: 'POST',
        body: formData,
      });
    },
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
    resendEmail: (id: string) => req<{
      success: boolean;
      confirmationEmailStatus: string;
      confirmationEmailSentAt: string | null;
      confirmationEmailError: string | null;
    }>(`/orders/${id}/resend-email`, {
      method: 'POST',
    }),
  },
};

