import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { fulfillOrder } from '@/lib/fulfillment';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { imageId, generatedUrl, productKey, price, shipping, extras, frameColor, printType } = await req.json();

    if (!imageId || !price) {
      return NextResponse.json({ error: 'imageId and price required' }, { status: 400 });
    }

    const sizeMatch = (productKey || '').match(/(\d+x\d+)/);
    const size = sizeMatch ? sizeMatch[1] : '16x20';
    // Keep canvas-* as-is; normalize any legacy 'poster-' keys
    const normalizedProductKey = productKey || 'poster-16x20';

    // Create pending order in DB
    const order = await prisma.order.create({
      data: {
        userId:           session.id,
        imageId,
        productType:      normalizedProductKey,
        size,
        price:            Number(price),
        status:           'pending',
        shippingName:     shipping?.name           || null,
        shippingAddress:  shipping?.address1       || null,
        shippingAddress2: shipping?.address2       || null,
        shippingCity:     shipping?.city           || null,
        shippingState:    shipping?.state          || null,
        shippingZip:      shipping?.zip            || null,
        shippingCountry:  shipping?.country        || 'US',
        shippingPhone:    shipping?.phone          || null,
        shippingMethod:   shipping?.shippingMethod || 'STANDARD',
        frameColor:       frameColor || 'black',
        digitalCopy:      !!(extras?.digitalCopy),
        extraCopy:        !!(extras?.extraCopy),
      },
    });

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_demo';

    if (isDemo) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'paid' } });
      fulfillOrder(order.id).catch((e) => console.error('[Demo fulfillment]', e.message));
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      return NextResponse.json({ url: `${baseUrl}/success?order=${order.id}&tx=DEMO-${Date.now()}` });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Build line items — base print + any selected upsells
    const basePrice = Number(price) -
      (extras?.digitalCopy        ? 12 : 0) -
      (extras?.extraCopy          ? 19 : 0) -
      (extras?.priorityProcessing ?  9 : 0) -
      (shipping?.shippingRate     ? parseFloat(shipping.shippingRate) : 0);

    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: printType === 'canvas' ? `Maîtrepets Canvas Print — ${size}` : `Maîtrepets Framed Poster — ${size}`,
            description: printType === 'canvas' ? 'Custom AI-generated pet art, thin canvas print' : 'Custom AI-generated pet art, professionally printed & framed',
            images: generatedUrl ? [generatedUrl] : [],
          },
          unit_amount: Math.round(basePrice * 100),
        },
        quantity: 1,
      },
      ...(extras?.digitalCopy ? [{
        price_data: { currency: 'usd', product_data: { name: 'HD Digital Copy' }, unit_amount: 1200 },
        quantity: 1,
      }] : []),
      ...(extras?.extraCopy ? [{
        price_data: { currency: 'usd', product_data: { name: 'Extra Print Copy' }, unit_amount: 1900 },
        quantity: 1,
      }] : []),
      ...(extras?.priorityProcessing ? [{
        price_data: { currency: 'usd', product_data: { name: 'Priority Processing' }, unit_amount: 900 },
        quantity: 1,
      }] : []),
      ...(shipping?.shippingRate ? [{
        price_data: { currency: 'usd', product_data: { name: 'Shipping' }, unit_amount: Math.round(parseFloat(shipping.shippingRate) * 100) },
        quantity: 1,
      }] : []),
    ];

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${baseUrl}/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel?reason=cancelled`,
      metadata: {
        orderId: order.id,
        imageUrl: generatedUrl || '',
        productKey: productKey || 'canvas-16x20',
      },
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'JM'] },
    });

    // Save Stripe session ID
    await prisma.order.update({
      where: { id: order.id },
      data: { stripeId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
