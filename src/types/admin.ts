// These mirror the backend DTOs and Prisma shapes for use in the admin UI.
import { ProductImage } from './api';

export interface AdminSizeStock {
  id?: string;
  size: string;            // S | M | L | OS
  quantity: number;
}

export interface AdminVariant {
  id?: string;
  sku: string;
  color?: string;
  colorHex?: string;
  availabilityMode?: string;
  madeToOrderMinDays?: number;
  madeToOrderMaxDays?: number;
  stocks: AdminSizeStock[];
  images?: any[];
}

export interface AdminCollection {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  bgImage?: string;
  coverImageUrl?: string;
  heroImageUrl?: string;
  _count?: { products: number };
  createdAt?: string;
  updatedAt?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  imageAltText?: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  category?: string;
  isActive: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  compareAtPrice?: number | null;
  collectionId?: string;
  collection?: { id: string; name: string; slug: string } | null;
  variants: AdminVariant[];
  media: { id: string; url: string; sortOrder: number }[];
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  canonicalSlug?: string;
}

// ─── Form state types ──────────────────────────────────────────────────────────

export interface SizeStockForm {
  size: string;
  quantity: number;
}

export interface VariantForm {
  sku: string;
  color: string;
  colorHex: string;
  availabilityMode: string;
  madeToOrderMinDays: number;
  madeToOrderMaxDays: number;
  stocks: SizeStockForm[];
  images: any[];
}

export interface ProductForm {
  name: string;
  slug: string;
  description: string;
  price: string;           // string in the form, converted to number on submit
  category: string;
  collectionId: string;
  isActive: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  compareAtPrice: string;  // string in the form, converted to number on submit
  mediaUrls: string[];
  variants: VariantForm[];
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  canonicalSlug: string;
}

export const DEFAULT_SIZES = ['XCH', 'CH', 'M', 'G', 'XG'];

export function defaultSizeStocks(): SizeStockForm[] {
  return DEFAULT_SIZES.map((size) => ({
    size,
    quantity: 0,
  }));
}

export function defaultVariant(): VariantForm {
  return {
    sku: '',
    color: '',
    colorHex: '',
    availabilityMode: 'stock_only',
    madeToOrderMinDays: 7,
    madeToOrderMaxDays: 9,
    stocks: defaultSizeStocks(),
    images: [],
  };
}

export function defaultProductForm(): ProductForm {
  return {
    name: '',
    slug: '',
    description: '',
    price: '',
    category: '',
    collectionId: '',
    isActive: true,
    isNewArrival: false,
    isFeatured: false,
    compareAtPrice: '',
    mediaUrls: [''],
    variants: [defaultVariant()],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    canonicalSlug: '',
  };
}

/** Convert the form state into the DTO shape expected by the backend */
export function formToCreateDto(form: ProductForm) {
  return {
    name: form.name,
    slug: form.slug,
    description: form.description || undefined,
    price: parseFloat(form.price),
    category: form.category || undefined,
    collectionId: form.collectionId || undefined,
    isActive: form.isActive,
    isNewArrival: form.isNewArrival,
    isFeatured: form.isFeatured,
    compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : undefined,
    mediaUrls: form.mediaUrls.filter(Boolean),
    variants: form.variants.map((v) => ({
      sku: v.sku,
      color: v.color || undefined,
      colorHex: v.colorHex || undefined,
      availabilityMode: v.availabilityMode,
      madeToOrderMinDays: v.availabilityMode !== 'stock_only' && v.availabilityMode !== 'discontinued' ? Number(v.madeToOrderMinDays) : undefined,
      madeToOrderMaxDays: v.availabilityMode !== 'stock_only' && v.availabilityMode !== 'discontinued' ? Number(v.madeToOrderMaxDays) : undefined,
      stocks: v.stocks.map((s) => ({
        size: s.size,
        quantity: s.quantity,
      })),
      images: v.images && v.images.length > 0 ? v.images.map((img) => ({
        url: img.url,
        key: img.key || undefined,
        alt: img.alt || undefined,
      })) : undefined,
    })),
    seoTitle: form.seoTitle || undefined,
    seoDescription: form.seoDescription || undefined,
    seoKeywords: form.seoKeywords || undefined,
    canonicalSlug: form.canonicalSlug || undefined,
  };
}

/** Hydrate a ProductForm from an existing AdminProduct (for edit) */
export function productToForm(p: AdminProduct): ProductForm {
  return {
    name: p.name,
    slug: p.slug,
    description: p.description ?? '',
    price: String(p.price),
    category: p.category ?? '',
    collectionId: p.collectionId ?? '',
    isActive: p.isActive,
    isNewArrival: p.isNewArrival,
    isFeatured: p.isFeatured,
    compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
    mediaUrls: p.media.length > 0 ? p.media.map((m) => m.url) : [''],
    variants:
      p.variants.length > 0
        ? p.variants.map((v) => {
            const stockMap = new Map((v.stocks || []).map((s) => [s.size.toUpperCase(), s.quantity]));
            
            // Build merged stocks prioritizing DEFAULT_SIZES
            const mergedStocks = DEFAULT_SIZES.map((size) => ({
              size,
              quantity: stockMap.has(size.toUpperCase()) ? stockMap.get(size.toUpperCase())! : 0,
            }));

            // If there are other non-default sizes (e.g. shoes, custom, legacy), append them
            (v.stocks || []).forEach((s) => {
              const upperSize = s.size.toUpperCase();
              if (!DEFAULT_SIZES.includes(upperSize)) {
                mergedStocks.push({
                  size: s.size,
                  quantity: s.quantity,
                });
              }
            });

            return {
              sku: v.sku,
              color: v.color ?? '',
              colorHex: v.colorHex ?? '',
              availabilityMode: v.availabilityMode ?? 'stock_only',
              madeToOrderMinDays: v.madeToOrderMinDays ?? 7,
              madeToOrderMaxDays: v.madeToOrderMaxDays ?? 9,
              stocks: mergedStocks,
              images: v.images || [],
            };
          })
        : [defaultVariant()],
    seoTitle: p.seoTitle ?? '',
    seoDescription: p.seoDescription ?? '',
    seoKeywords: p.seoKeywords ?? '',
    canonicalSlug: p.canonicalSlug ?? '',
  };
}

export interface AdminOrderItem {
  id: string;
  productId: string | null;
  productName: string | null;
  variantName: string | null;
  size: string;
  quantity: number;
  unitPrice: number;
  total: number;
  fulfillmentType?: string;
  madeToOrderMinDays?: number | null;
  madeToOrderMaxDays?: number | null;
}

export interface AdminPayment {
  id: string;
  provider: string;
  providerPaymentId: string | null;
  providerStatus: string | null;
  status: string;
  statusDetail: string | null;
  amount: number;
  currency: string;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
  method?: string | null;
  transactionId?: string | null;
  rawResponse?: any;
}

export interface AdminOrderNote {
  id: string;
  content: string;
  createdAt: string;
  adminUser?: {
    name: string | null;
    email: string;
    image: string | null;
  } | null;
}

export interface AdminDashboardSummary {
  sales: {
    today: number;
    month: number;
  };
  orders: {
    total: number;
    paid: number;
    pending: number;
    failedCancelled: number;
    toPrepare: number;
    madeToOrder: number;
    mixed: number;
  };
  inventory: {
    outOfStock: number;
    lowStock: number;
    madeToOrderActive: number;
  };
  latestUsers: Array<{
    id: string;
    email: string;
    name: string | null;
    createdAt: string;
    role: string;
  }>;
  latestOrders: Array<{
    id: string;
    orderNumber: string;
    customerEmail: string;
    customerName: string | null;
    total: number;
    status: string;
    fulfillmentStatus: string;
    createdAt: string;
  }>;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  shippingAddress?: string | null;
  billingAddress?: string | null;
  shippingMethod?: string | null;
  status: string;
  fulfillmentStatus: string;
  subtotal: number;
  shippingTotal: number;
  total: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  payment: AdminPayment | null;
  items: AdminOrderItem[];

  // Shipping snapshot fields
  shippingLabel?: string | null;
  shippingCost?: number;
  isFreeShipping?: boolean;
  freeShippingThreshold?: number;
  amountRemainingForFreeShipping?: number;
  hasInStockItems?: boolean;
  hasMadeToOrderItems?: boolean;
  isMixedFulfillmentCart?: boolean;
  splitShippingSelected?: boolean;
  splitShippingCost?: number;
  estimatedDeliveryMinBusinessDays?: number | null;
  estimatedDeliveryMaxBusinessDays?: number | null;
  firstPackageEstimatedMinBusinessDays?: number | null;
  firstPackageEstimatedMaxBusinessDays?: number | null;
  secondPackageEstimatedMinBusinessDays?: number | null;
  secondPackageEstimatedMaxBusinessDays?: number | null;
  fulfillmentNotes?: string | null;
  shippingNotes?: string | null;

  // Shipping tracking fields
  carrier?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;

  // Internal Notes
  notes?: AdminOrderNote[];

  // Email confirmation control fields
  confirmationEmailSentAt?: string | null;
  confirmationEmailStatus?: string | null;
  confirmationEmailError?: string | null;
}

export interface AdminUser {
  email: string;
  name: string | null;
  userId: string | null;
  customerId: string | null;
  userType: 'admin' | 'registered' | 'guest';
  createdAt: string | null;
  orderCount: number;
  totalSpent: number;
  averageTicket: number;
  lastOrderDate: string | null;
  lastActivity: string | null;
}

export interface AdminUserDetail {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  userType: 'admin' | 'registered' | 'guest';
  createdAt: string | null;
  lastActivity: string | null;
  provider: string | null;
  image: string | null;
  metrics: {
    orderCount: number;
    totalSpent: number;
    averageTicket: number;
  };
  orders: Array<{
    id: string;
    orderNumber: string;
    createdAt: string;
    total: number;
    status: string;
    paymentStatus: string;
  }>;
  productsBought: Array<{
    id: string;
    name: string;
    quantity: number;
    size: string;
    unitPrice: number;
  }>;
  shippingAddresses: string[];
  activityLogs: Array<{
    id: string;
    eventType: string;
    metadata: any;
    createdAt: string;
  }>;
}

export interface AdminActivityLog {
  id: string;
  userId: string | null;
  guestEmail: string | null;
  orderId: string | null;
  productId: string | null;
  eventType: string;
  metadata: any;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  user?: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export interface AdminAuditLog {
  id: string;
  adminUserId: string;
  adminUser: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  action: string;
  entityType: string;
  entityId: string;
  before: any;
  after: any;
  metadata: any;
  createdAt: string;
}

