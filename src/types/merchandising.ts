export interface ProductTypeCard {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  imageUrl: string;
  imageAlt?: string | null;
  badgeLabel?: string | null;
  badgeType?: string | null;
  href: string;
  linkType?: string | null; // e.g. collection, category, search, offer, external
  sortOrder: number;
  isActive: boolean;
  highlight: boolean;
  createdAt?: string;
  updatedAt?: string;
}
