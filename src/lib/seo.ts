import { ApiProduct, ApiCollection } from '@/types/api';

export function getOrganizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://bombotwerk.com/#organization',
    'name': 'Bombo Twerk',
    'url': 'https://bombotwerk.com',
    'logo': 'https://bombotwerk.com/logo.png',
    'sameAs': [
      'https://www.instagram.com/bombotwerk',
      'https://wa.me/5215582470356'
    ]
  };
}

export function getWebSiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://bombotwerk.com/#website',
    'name': 'Bombo Twerk',
    'url': 'https://bombotwerk.com',
    'publisher': {
      '@id': 'https://bombotwerk.com/#organization'
    }
  };
}

export interface BreadcrumbItem {
  name: string;
  item: string; // Must be absolute URL
}

export function getBreadcrumbListJsonLd(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.name,
      'item': item.item
    }))
  };
}

export function getCollectionPageJsonLd(name: string, description: string, url: string, image?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#collection-page`,
    'name': name,
    'description': description,
    'url': url,
    'isPartOf': {
      '@id': 'https://bombotwerk.com/#website'
    },
    'about': {
      '@id': 'https://bombotwerk.com/#organization'
    },
    ...(image ? { 'image': image } : {})
  };
}

export function getWebPageJsonLd(name: string, description: string, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    'name': name,
    'description': description,
    'url': url,
    'isPartOf': {
      '@id': 'https://bombotwerk.com/#website'
    }
  };
}

export interface ItemListElement {
  name: string;
  url: string; // Must be absolute URL
  image?: string;
}

export function getItemListJsonLd(name: string, url: string, items: ItemListElement[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    'name': name,
    'url': url,
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'url': item.url,
      'name': item.name,
      ...(item.image ? { 'image': item.image } : {})
    }))
  };
}

export function getProductJsonLd(product: ApiProduct) {
  const canonicalUrl = `https://bombotwerk.com/product/${product.canonicalSlug || product.slug}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': product.name,
    'image': product.images || [],
    'description': product.description || '',
    'category': product.category || '',
    'sku': product.variants?.[0]?.sku || product.id,
    'brand': {
      '@type': 'Brand',
      'name': 'Bombo Twerk'
    },
    'offers': {
      '@type': 'Offer',
      'price': product.price,
      'priceCurrency': 'MXN',
      'url': canonicalUrl,
      'availability': product.availability === 'ready-to-ship'
        ? 'https://schema.org/InStock'
        : (product.availability === 'crafted-cdmx' ? 'https://schema.org/PreOrder' : 'https://schema.org/OutOfStock'),
      'priceValidUntil': '2027-12-31',
      'shippingDetails': {
        '@type': 'OfferShippingDetails',
        'shippingRate': {
          '@type': 'MonetaryAmount',
          'value': product.price >= 1000 ? 0 : 150,
          'currency': 'MXN'
        },
        'shippingDestination': {
          '@type': 'DefinedRegion',
          'addressCountry': 'MX'
        },
        'deliveryTime': {
          '@type': 'ShippingDeliveryTime',
          'handlingTime': {
            '@type': 'QuantitativeValue',
            'minValue': product.availability === 'crafted-cdmx' ? 7 : 1,
            'maxValue': product.availability === 'crafted-cdmx' ? 9 : 2,
            'unitCode': 'DAY'
          },
          'transitTime': {
            '@type': 'QuantitativeValue',
            'minValue': 2,
            'maxValue': 5,
            'unitCode': 'DAY'
          }
        }
      }
    }
  };
}

export function getProductGroupJsonLd(product: ApiProduct) {
  const canonicalUrl = `https://bombotwerk.com/product/${product.canonicalSlug || product.slug}`;
  const hasVariants = product.variants && product.variants.length > 0;
  if (!hasVariants) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ProductGroup',
    '@id': `https://bombotwerk.com/product/${product.slug}#product-group`,
    'name': product.name,
    'description': product.description || '',
    'url': canonicalUrl,
    'brand': {
      '@type': 'Brand',
      'name': 'Bombo Twerk'
    },
    'variesBy': ['https://schema.org/size', 'https://schema.org/color'],
    'hasVariant': product.variants.flatMap(v => {
      return (v.stocks || []).map(stock => {
        const isMTO = v.availabilityMode === 'made_to_order_only' || v.availabilityMode === 'stock_and_made_to_order';
        const hasStock = stock.quantity > 0;
        const availability = hasStock
          ? 'https://schema.org/InStock'
          : (isMTO ? 'https://schema.org/PreOrder' : 'https://schema.org/OutOfStock');

        const variantSku = v.sku ? `${v.sku}-${stock.size}` : `${product.id}-${v.color || 'default'}-${stock.size}`;

        return {
          '@type': 'Product',
          'name': `${product.name} - ${v.color || 'Estándar'} / Talla ${stock.size}`,
          'sku': variantSku,
          'image': v.images && v.images.length > 0 ? (typeof v.images[0] === 'string' ? v.images[0] : v.images[0].url) : (product.images?.[0] || ''),
          'size': stock.size,
          'color': v.color || undefined,
          'offers': {
            '@type': 'Offer',
            'price': product.price,
            'priceCurrency': 'MXN',
            'availability': availability,
            'url': canonicalUrl,
            'priceValidUntil': '2027-12-31',
            'shippingDetails': {
              '@type': 'OfferShippingDetails',
              'shippingRate': {
                '@type': 'MonetaryAmount',
                'value': product.price >= 1000 ? 0 : 150,
                'currency': 'MXN'
              },
              'shippingDestination': {
                '@type': 'DefinedRegion',
                'addressCountry': 'MX'
              },
              'deliveryTime': {
                '@type': 'ShippingDeliveryTime',
                'handlingTime': {
                  '@type': 'QuantitativeValue',
                  'minValue': (v.availabilityMode === 'made_to_order_only' || (v.availabilityMode === 'stock_and_made_to_order' && !hasStock)) ? 7 : 1,
                  'maxValue': (v.availabilityMode === 'made_to_order_only' || (v.availabilityMode === 'stock_and_made_to_order' && !hasStock)) ? 9 : 2,
                  'unitCode': 'DAY'
                },
                'transitTime': {
                  '@type': 'QuantitativeValue',
                  'minValue': 2,
                  'maxValue': 5,
                  'unitCode': 'DAY'
                }
              }
            }
          }
        };
      });
    })
  };
}
