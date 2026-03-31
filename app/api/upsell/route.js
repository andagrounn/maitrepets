import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req) {
  const ip = getClientIp(req);
  const { allowed, resetMs } = rateLimit(`upsell:${ip}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(resetMs / 1000)) } }
    );
  }

  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { orderId } = await req.json();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Look up the original order to get imageId and style
    const originalOrder = orderId
      ? await prisma.order.findUnique({ where: { id: orderId }, include: { image: true } })
      : null;

    const imageId      = originalOrder?.imageId      || null;
    const originalUrl  = originalOrder?.image?.originalUrl || null;
    const currentStyle = originalOrder?.image?.style  || null;

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_demo';
    if (isDemo) {
      return NextResponse.json({ url: `${baseUrl}/upsell-success?order=${orderId || ''}&demo=1` });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Surprise HD Style — Maîtrepets',
            description: 'A secret new art style generated just for your pet — HD file delivered instantly. One-time deal!',
          },
          unit_amount: 600, // $6.00
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/upsell-success?order=${orderId || ''}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/success?order=${orderId || ''}`,
      metadata: {
        type:          'upsell',
        originalOrderId: orderId     || '',
        imageId:         imageId     || '',
        originalUrl:     originalUrl || '',
        currentStyle:    currentStyle || '',
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('[upsell] error:', err);
    return NextResponse.json({ error: err.message || 'Upsell failed' }, { status: 500 });
  }
}
