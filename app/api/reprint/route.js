import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { fulfillOrder } from '@/lib/fulfillment';
import { PRODUCT_VARIANTS } from '@/lib/printful';
import { createPayPalOrder } from '@/lib/paypal';

const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'stripe';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const original = await prisma.order.findUnique({
      where: { id: orderId },
      include: { image: true },
    });

    if (!original) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (original.userId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const product = PRODUCT_VARIANTS[original.productType] ?? PRODUCT_VARIANTS['poster-16x20'];

    const isDemo = PAYMENT_PROVIDER !== 'paypal' && (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_demo');

    if (isDemo) {
      // Create + fulfill immediately in demo mode
      const newOrder = await prisma.order.create({
        data: {
          userId:          session.id,
          imageId:         original.imageId,
          productType:     original.productType,
          size:            original.size,
          price:           product.price,
          status:          'paid',
          shippingName:    original.shippingName,
          shippingAddress: original.shippingAddress,
          shippingAddress2:original.shippingAddress2,
          shippingCity:    original.shippingCity,
          shippingState:   original.shippingState,
          shippingZip:     original.shippingZip,
          shippingCountry: original.shippingCountry,
          shippingPhone:   original.shippingPhone,
          shippingMethod:  original.shippingMethod,
        },
      });
      fulfillOrder(newOrder.id).catch((e) => console.error('[Reprint Demo fulfillment]', e.message));
      return NextResponse.json({ url: `${baseUrl}/success?order=${newOrder.id}&tx=REPRINT-${Date.now()}` });
    }

    // Delete all stale pending orders for this user before creating the new one
    await prisma.order.deleteMany({
      where: { userId: session.id, status: 'pending' },
    }).catch((e) => console.error('[Reprint] cleanup error:', e.message));

    // Create a pending reprint order
    const newOrder = await prisma.order.create({
      data: {
        userId:          session.id,
        imageId:         original.imageId,
        productType:     original.productType,
        size:            original.size,
        price:           product.price,
        status:          'pending',
        frameColor:      original.frameColor,
        digitalCopy:     original.digitalCopy,
        extraCopy:       original.extraCopy,
        shippingName:    original.shippingName,
        shippingAddress: original.shippingAddress,
        shippingAddress2:original.shippingAddress2,
        shippingCity:    original.shippingCity,
        shippingState:   original.shippingState,
        shippingZip:     original.shippingZip,
        shippingCountry: original.shippingCountry,
        shippingPhone:   original.shippingPhone,
        shippingMethod:  original.shippingMethod,
      },
    });

    // ── PayPal ──────────────────────────────────────────────────────────────
    if (PAYMENT_PROVIDER === 'paypal') {
      const { id: paypalOrderId, approveUrl } = await createPayPalOrder({
        orderId:     newOrder.id,
        amount:      product.price,
        description: `Maîtrepets — ${product.name}`,
        shipping:    {
          name: original.shippingName, address1: original.shippingAddress,
          address2: original.shippingAddress2, city: original.shippingCity,
          state: original.shippingState, zip: original.shippingZip,
          country: original.shippingCountry || 'US',
        },
      });
      await prisma.order.update({ where: { id: newOrder.id }, data: { stripeId: paypalOrderId } });
      return NextResponse.json({ url: approveUrl });
    }

    // ── Stripe ───────────────────────────────────────────────────────────────
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Maîtrepets — ${product.name}`,
            description: 'Custom AI pet portrait',
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/success?order=${newOrder.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/dashboard`,
      metadata: { orderId: newOrder.id, type: 'reprint' },
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'JM'] },
    });

    await prisma.order.update({ where: { id: newOrder.id }, data: { stripeId: checkoutSession.id } });
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('[reprint] error:', err);
    return NextResponse.json({ error: err.message || 'Reprint failed' }, { status: 500 });
  }
}
