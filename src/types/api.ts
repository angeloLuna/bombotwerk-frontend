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
  madeToOrderEnabled: boolean;
  stocks: SizeStock[];
}

export interface CollectionRef {
  name: string;
  slug: string;
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
  variants: Variant[];
  media: MediaItem[];
  collection: CollectionRef | null;
  // Convenience fields derived client-side by normaliseProduct()
  images: string[];        // extracted from media[].url
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
  products?: ApiProduct[];
}
