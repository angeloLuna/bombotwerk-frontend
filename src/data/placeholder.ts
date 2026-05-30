export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  collectionSlug: string;
  availability: 'ready-to-ship' | 'crafted-cdmx' | 'limited-drop';
  availabilityText: string;
  description: string;
  details: string[];
  sizes: string[];
  images: string[];
  isNewArrival?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  bgImage: string;
}

export const COLLECTIONS: Collection[] = [
  {
    id: 'c1',
    name: 'LATIN PULSE',
    slug: 'latin-pulse',
    tagline: 'RHYTHM OF THE NIGHT',
    description: 'Curated performance pieces featuring high-gloss technical finishes that catch every beam of light, designed for high-intensity movement and night energy.',
    bgImage: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=1000'
  },
  {
    id: 'c2',
    name: 'NOCTURNAL PULSE',
    slug: 'nocturnal-pulse',
    tagline: 'SEDUCTIVE SILHOUETTES',
    description: 'Seductive silhouettes engineered for high-intensity movement and neon-lit floors. A dark editorial statement that blends studio luxury with dancehall energy.',
    bgImage: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1000'
  },
  {
    id: 'c3',
    name: 'VELVET MOTION',
    slug: 'velvet-motion',
    tagline: 'LIQUID TEXTURES',
    description: 'Liquid textures that capture the amber glow of the midnight pulse. Soft to the touch, heavy on performance, crafting an unforgettable skin-to-fabric sensation.',
    bgImage: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=1000'
  }
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'LATIN PULSE LEGGING',
    slug: 'latin-pulse-legging',
    price: 1850,
    category: 'LEGGINGS',
    collectionSlug: 'latin-pulse',
    availability: 'crafted-cdmx',
    availabilityText: 'Crafted in CDMX — Ready in 5–7 days',
    description: 'High-gloss technical finishes that match every beam of light. Anatomical seams and compressive zones engineered for maximum flexibility during high-intensity sequences.',
    details: [
      'Anatomical seams to sculpt and accent movement',
      'High-gloss moisture-wicking compression fabric',
      'Designed to shape and move with your style',
      '78% Recycled Polyamide, 22% Elastane',
      'Made-to-order in our CDMX workspace'
    ],
    sizes: ['S', 'M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=800',
      'https://images.unsplash.com/photo-1518310383802-640c2de311b2?q=80&w=800'
    ],
    isNewArrival: true
  },
  {
    id: 'p2',
    name: 'NOCTURNAL CROP',
    slug: 'nocturnal-crop',
    price: 980,
    category: 'TOPS',
    collectionSlug: 'nocturnal-pulse',
    availability: 'ready-to-ship',
    availabilityText: 'Ships within 24h',
    description: 'Designed to sculpt and move with you. High-stretch performance fabric with a glossy sheen and a double-strap support system that thrives under the spotlight.',
    details: [
      'Comfort-molded double strap shoulder build',
      'Moisture-repelling lining for intense training/clubbing',
      'Reflective contrast stitch details',
      'Hand-crafted in Mexico City'
    ],
    sizes: ['OS (ONE SIZE)'],
    images: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800'
    ],
    isNewArrival: true
  },
  {
    id: 'p3',
    name: 'GOLDEN CORE CHAIN',
    slug: 'golden-core-chain',
    price: 450,
    category: 'ACCESSORIES',
    collectionSlug: 'velvet-motion',
    availability: 'ready-to-ship',
    availabilityText: 'Ships within 24h',
    description: 'Complete the look with this heavy-drape reflective body accessory. Captures the warm amber tones of the CDMX night.',
    details: [
      'Hypoallergenic gold-plated zinc alloy',
      'Adjustable clasp for customizable fit during motion',
      'Sweat-resistant coating'
    ],
    sizes: ['OS'],
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800'
    ]
  },
  {
    id: 'p4',
    name: 'PULSE HEELS',
    slug: 'pulse-heels',
    price: 2400,
    category: 'FOOTWEAR',
    collectionSlug: 'latin-pulse',
    availability: 'crafted-cdmx',
    availabilityText: 'Crafted in CDMX — Ready in 5–7 days',
    description: 'Extreme-comfort stiletto heels with a high-gloss finish, designed to stabilize and secure footwork during twerk and pole routines.',
    details: [
      'Reinforced steel arch support',
      'High-grip suede sole for indoor/studio surfaces',
      'Patent vegan leather wrap'
    ],
    sizes: ['23', '24', '25', '26'],
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800'
    ]
  },
  {
    id: 'p5',
    name: 'MOTION LEGGINGS',
    slug: 'motion-leggings',
    price: 1800,
    category: 'LEGGINGS',
    collectionSlug: 'nocturnal-pulse',
    availability: 'crafted-cdmx',
    availabilityText: 'Crafted in CDMX — Ready in 5–7 days',
    description: 'Textured mesh paneling legging for ventilation and sheer styling. Created with reinforced panels for high-friction support.',
    details: [
      'Premium breathability mesh panels',
      'Dual flatlock stitch for zero friction',
      '4-way stretch CDMX knit fabric'
    ],
    sizes: ['S', 'M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?q=80&w=800'
    ]
  },
  {
    id: 'p6',
    name: 'CLUB GLOW T-SHIRT',
    slug: 'club-glow-tshirt',
    price: 850,
    category: 'TOPS',
    collectionSlug: 'velvet-motion',
    availability: 'ready-to-ship',
    availabilityText: 'Ships within 24h',
    description: 'Relaxed fit drop shoulder tee with reflective branding that reacts with camera flashes.',
    details: [
      'Heavyweight 100% Mexican Cotton',
      'Retro-reflective print front and back',
      'Oversized boxy performance outline'
    ],
    sizes: ['M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=800'
    ]
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find(p => p.slug === slug);
}

export function getProductsByCollection(collectionSlug: string): Product[] {
  return PRODUCTS.filter(p => p.collectionSlug === collectionSlug);
}

export function getCollectionBySlug(slug: string): Collection | undefined {
  return COLLECTIONS.find(c => c.slug === slug);
}
