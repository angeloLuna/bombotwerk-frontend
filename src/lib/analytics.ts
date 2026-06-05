declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function pushToDataLayer(event: string, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...data,
  });
}

/**
 * Tracks when a product is viewed (Detail View).
 */
export function trackViewItem(product: { id: string; name: string; price: number | string; category?: string }) {
  const priceNum = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
  pushToDataLayer("view_item", {
    ecommerce: {
      currency: "MXN",
      value: isNaN(priceNum) ? 0 : priceNum,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: isNaN(priceNum) ? 0 : priceNum,
          item_category: product.category || "",
          quantity: 1,
        }
      ]
    }
  });
}

/**
 * Tracks when an item is added to the shopping cart.
 */
export function trackAddToCart(
  product: { id: string; name: string; price: number | string; category?: string }, 
  size: string, 
  quantity: number = 1
) {
  const priceNum = typeof product.price === 'string' ? parseFloat(product.price) : Number(product.price);
  pushToDataLayer("add_to_cart", {
    ecommerce: {
      currency: "MXN",
      value: (isNaN(priceNum) ? 0 : priceNum) * quantity,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          price: isNaN(priceNum) ? 0 : priceNum,
          item_category: product.category || "",
          item_variant: size,
          quantity: quantity,
        }
      ]
    }
  });
}

/**
 * Tracks the initiation of checkout flow.
 */
export function trackBeginCheckout(
  items: { product: { id: string; name: string; price: number | string; category?: string }; selectedSize: string; quantity: number }[], 
  totalValue: number
) {
  pushToDataLayer("begin_checkout", {
    ecommerce: {
      currency: "MXN",
      value: totalValue,
      items: items.map(item => {
        const priceNum = typeof item.product.price === 'string' ? parseFloat(item.product.price) : Number(item.product.price);
        return {
          item_id: item.product.id,
          item_name: item.product.name,
          price: isNaN(priceNum) ? 0 : priceNum,
          item_category: item.product.category || "",
          item_variant: item.selectedSize,
          quantity: item.quantity,
        };
      })
    }
  });
}

/**
 * Tracks a completed purchase transaction (eCommerce conversion).
 * Employs local storage protection to ensure that it only runs once per order ID.
 */
export function trackPurchase(order: { 
  id: string; 
  orderNumber: string; 
  total: number | string; 
  shippingCost?: number | string; 
  items: { id: string; productName: string; unitPrice: number | string; size: string; quantity: number }[] 
}) {
  if (typeof window === "undefined") return;

  const orderIdKey = order.id || order.orderNumber;
  if (!orderIdKey) return;

  // Protection to avoid duplicate purchase tracking
  const orderKey = `bombo_purchased_${orderIdKey}`;
  if (localStorage.getItem(orderKey)) {
    console.log(`Purchase event already tracked for order: ${order.orderNumber}`);
    return;
  }

  const totalNum = typeof order.total === 'string' ? parseFloat(order.total) : Number(order.total);
  const shippingNum = order.shippingCost !== undefined 
    ? (typeof order.shippingCost === 'string' ? parseFloat(order.shippingCost) : Number(order.shippingCost))
    : 0;

  pushToDataLayer("purchase", {
    ecommerce: {
      transaction_id: order.orderNumber || order.id,
      value: isNaN(totalNum) ? 0 : totalNum,
      currency: "MXN",
      shipping: isNaN(shippingNum) ? 0 : shippingNum,
      items: order.items.map(item => {
        const priceNum = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : Number(item.unitPrice);
        return {
          item_id: item.id || "",
          item_name: item.productName || "",
          price: isNaN(priceNum) ? 0 : priceNum,
          item_variant: item.size || "",
          quantity: item.quantity || 1,
        };
      })
    }
  });

  // Mark as tracked in localStorage
  try {
    localStorage.setItem(orderKey, "true");
  } catch (e) {
    console.error("Failed to write purchase status to localStorage", e);
  }
}

/**
 * Tracks user login event.
 */
export function trackLogin(method: string) {
  pushToDataLayer("login", { method });
}

/**
 * Tracks user sign-up event.
 */
export function trackSignUp(method: string) {
  pushToDataLayer("sign_up", { method });
}

/**
 * Tracks user click on a WhatsApp contact link.
 */
export function trackWhatsAppClick(location: string) {
  pushToDataLayer("whatsapp_click", { location });
}
