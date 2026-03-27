import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getShippingRates, PRODUCT_VARIANTS } from '@/lib/printful';

/**
 * POST /api/shipping-rates
 * Body: { productKey, shipping: { address1, city, state, zip, country } }
 * Returns an array of shipping options with rates and delivery estimates.
 */
export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { productKey, shipping } = await req.json();

    if (!shipping?.country) {
      return NextResponse.json({ error: 'shipping.country is required' }, { status: 400 });
    }

    const product = PRODUCT_VARIANTS[productKey] ?? PRODUCT_VARIANTS['poster-16x20'];

    const rates = await getShippingRates({
      recipient: {
        address1:     shipping.address1 || '',
        city:         shipping.city     || '',
        state_code:   shipping.state    || '',
        country_code: shipping.country  || 'US',
        zip:          shipping.zip      || '',
      },
      variantId: product.variantId,
    });

    return NextResponse.json({ rates });
  } catch (err) {
    console.error('Shipping rates error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
