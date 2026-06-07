import type { AdminProduct, AdminCollection, AdminOrder, AdminUser, AdminUserDetail, AdminActivityLog, AdminAuditLog, AdminDashboardSummary } from '@/types/admin';
import type { ProductTypeCard } from '@/types/merchandising';
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
  dashboard: {
    summary: () => req<AdminDashboardSummary>('/dashboard/summary'),
  },
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
    list: (params?: { 
      status?: string; 
      fulfillmentStatus?: string;
      fulfillmentPreset?: string;
      email?: string; 
      orderNumber?: string; 
      startDate?: string; 
      endDate?: string; 
    }) => {
      const q = new URLSearchParams();
      if (params?.status) q.append('status', params.status);
      if (params?.fulfillmentStatus) q.append('fulfillmentStatus', params.fulfillmentStatus);
      if (params?.fulfillmentPreset) q.append('fulfillmentPreset', params.fulfillmentPreset);
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
    updateStatus: (id: string, status: string) => req<any>(`/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
    updateFulfillmentStatus: (id: string, fulfillmentStatus: string) => req<any>(`/orders/${id}/fulfillment-status`, {
      method: 'PATCH',
      body: JSON.stringify({ fulfillmentStatus }),
    }),
    updateShipping: (id: string, body: { 
      carrier: string; 
      trackingNumber: string; 
      trackingUrl?: string; 
      shippedAt?: string; 
      deliveredAt?: string;
    }) => req<any>(`/orders/${id}/shipping`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
    addNote: (id: string, content: string) => req<any>(`/orders/${id}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
  },

  users: {
    list: (params?: {
      page?: number;
      limit?: number;
      email?: string;
      name?: string;
      hasOrders?: boolean;
      isRegistered?: boolean;
      isGuest?: boolean;
      sortBy?: string;
      sortOrder?: string;
    }) => {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      if (params?.email) q.append('email', params.email);
      if (params?.name) q.append('name', params.name);
      if (params?.hasOrders !== undefined) q.append('hasOrders', String(params.hasOrders));
      if (params?.isRegistered !== undefined) q.append('isRegistered', String(params.isRegistered));
      if (params?.isGuest !== undefined) q.append('isGuest', String(params.isGuest));
      if (params?.sortBy) q.append('sortBy', params.sortBy);
      if (params?.sortOrder) q.append('sortOrder', params.sortOrder);
      const queryString = q.toString();
      return req<{
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        data: AdminUser[];
      }>(`/users${queryString ? `?${queryString}` : ''}`);
    },
    get: (idOrEmail: string) => req<AdminUserDetail>(`/users/${idOrEmail}`),
  },

  logs: {
    auditList: (params?: {
      page?: number;
      limit?: number;
      adminUserId?: string;
      action?: string;
      entityType?: string;
      startDate?: string;
      endDate?: string;
    }) => {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      if (params?.adminUserId) q.append('adminUserId', params.adminUserId);
      if (params?.action) q.append('action', params.action);
      if (params?.entityType) q.append('entityType', params.entityType);
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      const queryString = q.toString();
      return req<{
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        data: AdminAuditLog[];
      }>(`/logs/audit${queryString ? `?${queryString}` : ''}`);
    },
    activityList: (params?: {
      page?: number;
      limit?: number;
      userId?: string;
      guestEmail?: string;
      eventType?: string;
    }) => {
      const q = new URLSearchParams();
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      if (params?.userId) q.append('userId', params.userId);
      if (params?.guestEmail) q.append('guestEmail', params.guestEmail);
      if (params?.eventType) q.append('eventType', params.eventType);
      const queryString = q.toString();
      return req<{
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        data: AdminActivityLog[];
      }>(`/logs/activity${queryString ? `?${queryString}` : ''}`);
    },
  },

  merchandising: {
    productTypeCards: {
      list: () => req<ProductTypeCard[]>('/merchandising/product-type-cards'),
      create: (body: object) =>
        req<ProductTypeCard>('/merchandising/product-type-cards', {
          method: 'POST',
          body: JSON.stringify(body),
        }),
      update: (id: string, body: object) =>
        req<ProductTypeCard>(`/merchandising/product-type-cards/${id}`, {
          method: 'PATCH',
          body: JSON.stringify(body),
        }),
      delete: (id: string) =>
        req<{ success: boolean }>(`/merchandising/product-type-cards/${id}`, {
          method: 'DELETE',
        }),
      uploadImage: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return req<{ url: string; key: string }>('/merchandising/product-type-cards/upload', {
          method: 'POST',
          body: formData,
        });
      },
    },
  },
};

