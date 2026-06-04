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
  availabilityMode?: string;
  madeToOrderMinDays?: number;
  madeToOrderMaxDays?: number;
  stocks: AdminSizeStock[];
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
}

// ─── Form state types ──────────────────────────────────────────────────────────

export interface SizeStockForm {
  size: string;
  quantity: number;
}

export interface VariantForm {
  sku: string;
  color: string;
  availabilityMode: string;
  madeToOrderMinDays: number;
  madeToOrderMaxDays: number;
  stocks: SizeStockForm[];
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
    availabilityMode: 'stock_only',
    madeToOrderMinDays: 7,
    madeToOrderMaxDays: 9,
    stocks: defaultSizeStocks(),
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
      availabilityMode: v.availabilityMode,
      madeToOrderMinDays: v.availabilityMode !== 'stock_only' && v.availabilityMode !== 'discontinued' ? Number(v.madeToOrderMinDays) : undefined,
      madeToOrderMaxDays: v.availabilityMode !== 'stock_only' && v.availabilityMode !== 'discontinued' ? Number(v.madeToOrderMaxDays) : undefined,
      stocks: v.stocks.map((s) => ({
        size: s.size,
        quantity: s.quantity,
      })),
    })),
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
              availabilityMode: v.availabilityMode ?? 'stock_only',
              madeToOrderMinDays: v.madeToOrderMinDays ?? 7,
              madeToOrderMaxDays: v.madeToOrderMaxDays ?? 9,
              stocks: mergedStocks,
            };
          })
        : [defaultVariant()],
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

  // Email confirmation control fields
  confirmationEmailSentAt?: string | null;
  confirmationEmailStatus?: string | null;
  confirmationEmailError?: string | null;
}

