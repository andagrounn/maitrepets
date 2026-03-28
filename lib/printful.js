import axios from 'axios';

const printful = axios.create({
  baseURL: 'https://api.printful.com',
  headers: { Authorization: `Bearer ${process.env.PRINTFUL_API_KEY}` },
});

const isDemo = () =>
  !process.env.PRINTFUL_API_KEY || process.env.PRINTFUL_API_KEY === 'demo';

// ─── Product Variants ──────────────────────────────────────────────────────────
// Main product: Enhanced Matte Paper Framed Poster (in) — Product ID 2, Black frame
// Variant IDs verified live from Printful catalog API.
export const PRODUCT_VARIANTS = {
  'poster-8x10':  { variantId: 4651,  name: '8×10" Framed Matte Poster (Black)',  price: 49.99 },
  'poster-11x14': { variantId: 14292, name: '11×14" Framed Matte Poster (Black)', price: 59.99 },
  'poster-12x16': { variantId: 1350,  name: '12×16" Framed Matte Poster (Black)', price: 64.99 },
  'poster-16x20': { variantId: 4399,  name: '16×20" Framed Matte Poster (Black)', price: 79.99 },
  'poster-18x24': { variantId: 3,     name: '18×24" Framed Matte Poster (Black)', price: 99.99 },
  'poster-24x36': { variantId: 4,     name: '24×36" Framed Matte Poster (Black)', price: 139.99 },
};

// Thin Canvas prints: Thin Canvas (in) — used for quick canvas orders (printer icon) and Extra Print Copy addon.
export const EXTRA_COPY_VARIANTS = {
  'poster-8x10':  { variantId: 4463,  name: '8×10" Thin Canvas (in)'  },
  'poster-11x14': { variantId: 14125, name: '11×14" Thin Canvas (in)' },
  'poster-12x16': { variantId: 1349,  name: '12×16" Thin Canvas (in)' },
  'poster-16x20': { variantId: 3877,  name: '16×20" Thin Canvas (in)' },
  'poster-18x24': { variantId: 1,     name: '18×24" Thin Canvas (in)' },
  'poster-24x36': { variantId: 2,     name: '24×36" Thin Canvas (in)' },
};

// ─── Orders ───────────────────────────────────────────────────────────────────

/**
 * Create a Printful order.
 * Pass confirm:true to skip the separate confirm call.
 */
export async function createPrintfulOrder({ recipient, imageUrl, variantId, quantity = 1, orderId, shippingMethod = 'STANDARD', confirm = false }) {
  if (isDemo()) {
    console.log('[Printful DEMO] createOrder:', { orderId, variantId, quantity, shippingMethod });
    return { result: { id: `DEMO-${Date.now()}`, status: 'draft' } };
  }

  const res = await printful.post('/orders', {
    external_id: orderId.replace(/-/g, '').slice(0, 32),
    shipping:    shippingMethod,
    confirm,
    recipient: {
      name:         recipient.name,
      address1:     recipient.address1,
      address2:     recipient.address2   || '',
      city:         recipient.city,
      state_code:   recipient.state_code || '',
      country_code: recipient.country_code,
      zip:          recipient.zip        || '',
      phone:        recipient.phone      || '',
      email:        recipient.email      || '',
    },
    items: [
      {
        variant_id: variantId,
        quantity,
        files: [{ type: 'default', url: imageUrl }],
      },
    ],
  }).catch((err) => {
    const msg = err.response?.data?.error?.message || err.response?.data?.result || err.message;
    throw new Error(`Printful error: ${msg}`);
  });

  return res.data;
}

/**
 * Confirm a draft order → moves it to the fulfillment queue.
 */
export async function confirmPrintfulOrder(printfulOrderId) {
  if (isDemo()) {
    console.log('[Printful DEMO] confirmOrder:', printfulOrderId);
    return { result: { id: printfulOrderId, status: 'pending' } };
  }
  const res = await printful.post(`/orders/${printfulOrderId}/confirm`);
  return res.data;
}

/**
 * Get a Printful order by ID or @external_id.
 */
export async function getPrintfulOrder(printfulOrderId) {
  if (isDemo()) return { result: { id: printfulOrderId, status: 'pending' } };
  const res = await printful.get(`/orders/${printfulOrderId}`);
  return res.data;
}

/**
 * Estimate order costs without creating an order.
 */
export async function estimateOrderCosts({ recipient, variantId, imageUrl }) {
  if (isDemo()) {
    return {
      result: {
        costs: { subtotal: '79.99', shipping: '5.99', tax: '0.00', total: '85.98', currency: 'USD' },
      },
    };
  }
  const res = await printful.post('/orders/estimate-costs', {
    recipient: {
      address1:     recipient.address1,
      city:         recipient.city,
      state_code:   recipient.state_code || '',
      country_code: recipient.country_code,
      zip:          recipient.zip || '',
    },
    items: [{ variant_id: variantId, quantity: 1, files: [{ type: 'default', url: imageUrl }] }],
  }).catch((err) => {
    const msg = err.response?.data?.error?.message || err.message;
    throw new Error(`Printful estimate error: ${msg}`);
  });
  return res.data;
}

// ─── Shipping Rates ───────────────────────────────────────────────────────────

/**
 * Get live shipping rates for a given recipient + variant.
 * Returns an array of { id, name, rate, currency, min_delivery_days, max_delivery_days }
 */
export async function getShippingRates({ recipient, variantId, quantity = 1 }) {
  if (isDemo()) {
    return [
      { id: 'STANDARD', name: 'Standard Shipping (5–7 days)', rate: '5.99',  currency: 'USD', min_delivery_days: 5, max_delivery_days: 7 },
      { id: 'EXPRESS',  name: 'Express Shipping (2–3 days)',  rate: '14.99', currency: 'USD', min_delivery_days: 2, max_delivery_days: 3 },
    ];
  }

  const res = await printful.post('/shipping/rates', {
    recipient: {
      address1:     recipient.address1,
      city:         recipient.city,
      state_code:   recipient.state_code || '',
      country_code: recipient.country_code,
      zip:          recipient.zip || '',
    },
    items: [{ variant_id: variantId, quantity }],
    currency: 'USD',
    locale: 'en_US',
  }).catch((err) => {
    const msg = err.response?.data?.error?.message || err.message;
    throw new Error(`Printful shipping error: ${msg}`);
  });

  return res.data?.result || [];
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

/**
 * Get all variants for a catalog product.
 * Useful for finding the correct variantId values.
 * Canvas = product 2, Poster = product 1.
 */
export async function getCatalogProduct(productId) {
  // Catalog endpoints are public — no auth needed, but include it anyway
  const res = await printful.get(`/products/${productId}`);
  return res.data?.result;
}

/**
 * List all catalog products (optionally filter by category).
 */
export async function listCatalogProducts(categoryId) {
  const params = categoryId ? { category_id: categoryId } : {};
  const res = await printful.get('/products', { params });
  return res.data?.result || [];
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

/**
 * Register (or replace) the webhook configuration on Printful.
 * Call this once from /api/printful/setup after deploying to production.
 */
export async function registerWebhook(url, types) {
  if (isDemo()) {
    console.log('[Printful DEMO] registerWebhook:', url, types);
    return { url, types };
  }
  const res = await printful.post('/webhooks', { url, types });
  return res.data?.result;
}

/**
 * Get the current webhook configuration.
 */
export async function getWebhook() {
  if (isDemo()) return { url: null, types: [] };
  const res = await printful.get('/webhooks');
  return res.data?.result;
}

export default printful;
