// ─── Mirrors the backend Prisma/NestJS data shapes ────────────────────────────

export interface MediaItem {
  id: string;
  url: string;
  type: 'IMAGE' | 'VIDEO';
  sortOrder: number;
}

export interface SizeStock {
  id: string;
  size: string;
  quantity: number;
  availability: 'ready-to-ship' | 'crafted-cdmx' | 'unavailable';
  availabilityText: string;
}

export interface Variant {
  id: string;
  sku: string;
  color: string | null;
  availabilityMode: string;
  madeToOrderMinDays?: number;
  madeToOrderMaxDays?: number;
  stocks: SizeStock[];
}

export interface CollectionRef {
  name: string;
  slug: string;
}

export type ProductImageType = 'catalog' | 'editorial' | 'detail' | 'technical' | 'styling' | 'community';
export type ProductImageView = 'front' | 'back' | 'side' | 'detail' | 'not_applicable';

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  key: string | null;
  alt: string | null;
  type: ProductImageType;
  view: ProductImageView;
  sortOrder: number;
  isCover: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;           // stored in MXN (number)
  category: string;
  isActive: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  compareAtPrice?: number | null;
  variants: Variant[];
  media: MediaItem[];
  images: string[];        // extracted from media[].url
  rawImages?: ProductImage[]; // raw images from R2/DB
  collection: CollectionRef | null;
  // Convenience fields derived client-side by normaliseProduct()
  sizes: string[];         // extracted from variants[].stocks[].size
  availability: 'ready-to-ship' | 'crafted-cdmx' | 'limited-drop';
  availabilityText: string;
}

export interface ApiCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  bgImage: string | null;
  coverImageUrl?: string | null;
  heroImageUrl?: string | null;
  products?: ApiProduct[];
}
