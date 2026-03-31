import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { fulfillOrder } from '@/lib/fulfillment';
import { createPayPalOrder } from '@/lib/paypal';

const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'stripe';

const PAPER_VARIANTS = {
  'paper-8x10':  { size: '8x10',  price: 44.99,  label: '8×10" Thin Canvas' },
  'paper-11x14': { size: '11x14', price: 49.99,  label: '11×14" Thin Canvas' },
  'paper-16x20': { size: '16x20', price: 64.99,  label: '16×20" Thin Canvas' },
  'paper-18x24': { size: '18x24', price: 74.99,  label: '18×24" Thin Canvas' },
  'paper-24x36': { size: '24x36', price: 109.99, label: '24×36" Thin Canvas' },
};

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { imageId, productKey = 'paper-16x20' } = await req.json();
    if (!imageId) return NextResponse.json({ error: 'imageId required' }, { status: 400 });

    const variant = PAPER_VARIANTS[productKey] ?? PAPER_VARIANTS['paper-16x20'];

    const image = await prisma.image.findUnique({ where: { id: imageId } });
    if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    if (image.userId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const isDemo  = PAYMENT_PROVIDER !== 'paypal' && (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_demo');

    const order = await prisma.order.create({
      data: {
        userId:      session.id,
        imageId,
        productType: productKey,
        size:        variant.size,
        price:       variant.price,
        status:      'pending',
      },
    });

    if (isDemo) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'paid' } });
      fulfillOrder(order.id).catch((e) => console.error('[Paper order demo]', e.message));
      return NextResponse.json({ url: `${baseUrl}/success?order=${order.id}&tx=PAPER-${Date.now()}` });
    }

    // ── PayPal ──────────────────────────────────────────────────────────────
    if (PAYMENT_PROVIDER === 'paypal') {
      const { id: paypalOrderId, approveUrl } = await createPayPalOrder({
        orderId:     order.id,
        amount:      variant.price,
        description: `Maîtrepets — ${variant.label}`,
        shipping:    null,
      });
      await prisma.order.update({ where: { id: order.id }, data: { stripeId: paypalOrderId } });
      return NextResponse.json({ url: approveUrl });
    }

    // ── Stripe ───────────────────────────────────────────────────────────────
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency:     'usd',
          product_data: {
            name:        `Maîtrepets — ${variant.label}`,
            description: 'Thin Canvas (in), unframed — your custom AI pet art',
            images:      image.generatedUrl ? [image.generatedUrl] : [],
          },
          unit_amount: Math.round(variant.price * 100),
        },
        quantity: 1,
      }],
      mode:        'payment',
      success_url: `${baseUrl}/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/dashboard`,
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'JM'] },
      metadata: { orderId: order.id, type: 'paper' },
    });

    await prisma.order.update({ where: { id: order.id }, data: { stripeId: checkoutSession.id } });
    return NextResponse.json({ url: checkoutSession.url });

  } catch (err) {
    console.error('[order-paper] error:', err);
    return NextResponse.json({ error: err.message || 'Order failed' }, { status: 500 });
  }
}
