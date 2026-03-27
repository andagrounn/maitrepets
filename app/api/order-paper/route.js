import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { fulfillOrder } from '@/lib/fulfillment';

const PAPER_PRICE = 29.99; // unframed paper poster

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { imageId } = await req.json();
    if (!imageId) return NextResponse.json({ error: 'imageId required' }, { status: 400 });

    const image = await prisma.image.findUnique({ where: { id: imageId } });
    if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    if (image.userId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const isDemo  = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_demo';

    // Create pending order — 'paper-16x20' routes to unframed variant in fulfillment
    const order = await prisma.order.create({
      data: {
        userId:      session.id,
        imageId,
        productType: 'paper-16x20',
        size:        '16x20',
        price:       PAPER_PRICE,
        status:      'pending',
      },
    });

    if (isDemo) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'paid' } });
      fulfillOrder(order.id).catch((e) => console.error('[Paper order demo]', e.message));
      return NextResponse.json({ url: `${baseUrl}/success?order=${order.id}&tx=PAPER-${Date.now()}` });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency:     'usd',
          product_data: {
            name:        'Maîtrepets Paper Print — 16×20"',
            description: 'Enhanced Matte Paper Poster, unframed — your custom AI pet art',
            images:      image.generatedUrl ? [image.generatedUrl] : [],
          },
          unit_amount: Math.round(PAPER_PRICE * 100),
        },
        quantity: 1,
      }],
      mode:       'payment',
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
