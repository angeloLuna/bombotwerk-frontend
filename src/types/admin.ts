// ─── Admin-specific TypeScript types ──────────────────────────────────────────
// These mirror the backend DTOs and Prisma shapes for use in the admin UI.

export interface AdminSizeStock {
  id?: string;
  size: string;            // S | M | L | OS
  quantity: number;
  madeToOrderEnabled: boolean;
  productionDaysMin?: number;
  productionDaysMax?: number;
}

export interface AdminVariant {
  id?: string;
  sku: string;
  color?: string;
  madeToOrderEnabled?: boolean;
  stocks: AdminSizeStock[];
}

export interface AdminCollection {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  bgImage?: string;
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
  collectionId?: string;
  collection?: { id: string; name: string; slug: string } | null;
  variants: AdminVariant[];
  media: { id: string; url: string; sortOrder: number }[];
  createdAt: string;
  updatedAt: string;
}

// ─── Form state types ──────────────────────────────────────────────────────────

export interface SizeStockForm {
  size: string;
  quantity: number;
  madeToOrderEnabled: boolean;
  productionDaysMin: number;
  productionDaysMax: number;
}

export interface VariantForm {
  sku: string;
  color: string;
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
  mediaUrls: string[];
  variants: VariantForm[];
}

export const DEFAULT_SIZES = ['S', 'M', 'L'];

export function defaultSizeStocks(): SizeStockForm[] {
  return DEFAULT_SIZES.map((size) => ({
    size,
    quantity: 0,
    madeToOrderEnabled: false,
    productionDaysMin: 5,
    productionDaysMax: 7,
  }));
}

export function defaultVariant(): VariantForm {
  return { sku: '', color: '', stocks: defaultSizeStocks() };
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
    mediaUrls: form.mediaUrls.filter(Boolean),
    variants: form.variants.map((v) => ({
      sku: v.sku,
      color: v.color || undefined,
      stocks: v.stocks.map((s) => ({
        size: s.size,
        quantity: s.quantity,
        madeToOrderEnabled: s.madeToOrderEnabled,
        productionDaysMin: s.madeToOrderEnabled ? s.productionDaysMin : undefined,
        productionDaysMax: s.madeToOrderEnabled ? s.productionDaysMax : undefined,
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
    mediaUrls: p.media.length > 0 ? p.media.map((m) => m.url) : [''],
    variants:
      p.variants.length > 0
        ? p.variants.map((v) => ({
            sku: v.sku,
            color: v.color ?? '',
            stocks:
              v.stocks.length > 0
                ? v.stocks.map((s) => ({
                    size: s.size,
                    quantity: s.quantity,
                    madeToOrderEnabled: s.madeToOrderEnabled,
                    productionDaysMin: (s as any).productionDaysMin ?? 5,
                    productionDaysMax: (s as any).productionDaysMax ?? 7,
                  }))
                : defaultSizeStocks(),
          }))
        : [defaultVariant()],
  };
}
