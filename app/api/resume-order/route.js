import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { fulfillOrder } from '@/lib/fulfillment';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { image: { select: { generatedUrl: true } } },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.userId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (order.status !== 'pending') return NextResponse.json({ error: 'Order is not pending' }, { status: 400 });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_demo';
    if (isDemo) {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'paid' } });
      fulfillOrder(orderId).catch(e => console.error('[Demo resume fulfillment]', e.message));
      return NextResponse.json({ url: `${baseUrl}/success?order=${orderId}&tx=DEMO-${Date.now()}` });
    }

    // Re-create Stripe session using the stored order details
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Maîtrepets Portrait — ${order.size || '16x20'}`,
              description: 'Custom AI-generated pet art, professionally printed',
              images: order.image?.generatedUrl ? [order.image.generatedUrl] : [],
            },
            unit_amount: Math.round(order.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/success?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/dashboard`,
      metadata: { orderId: order.id },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { stripeId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('[resume-order] error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
