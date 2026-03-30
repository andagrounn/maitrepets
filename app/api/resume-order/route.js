import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { fulfillOrder } from '@/lib/fulfillment';
import { createPayPalOrder } from '@/lib/paypal';

const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'stripe';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const order = await prisma.order.findUnique({
      where:   { id: orderId },
      include: { image: { select: { generatedUrl: true } }, user: { select: { email: true } } },
    });

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.userId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (order.status !== 'pending') return NextResponse.json({ error: 'Order is not pending' }, { status: 400 });

    // ── Resolve shipping address ──────────────────────────────────────────────
    // 1. Use address already on this order (collected in a prior session)
    // 2. Fall back to the user's most recently saved address from any other order
    let shipping = null;

    if (order.shippingAddress) {
      shipping = {
        name:     order.shippingName     || '',
        address1: order.shippingAddress,
        address2: order.shippingAddress2 || '',
        city:     order.shippingCity     || '',
        state:    order.shippingState    || '',
        zip:      order.shippingZip      || '',
        country:  order.shippingCountry  || 'US',
        phone:    order.shippingPhone    || '',
      };
    } else {
      const prev = await prisma.order.findFirst({
        where: {
          userId:          session.id,
          shippingAddress: { not: null },
          id:              { not: orderId },
        },
        orderBy: { createdAt: 'desc' },
        select: {
          shippingName: true, shippingAddress: true, shippingAddress2: true,
          shippingCity: true, shippingState:   true, shippingZip:      true,
          shippingCountry: true, shippingPhone: true,
        },
      });

      if (prev) {
        shipping = {
          name:     prev.shippingName     || '',
          address1: prev.shippingAddress,
          address2: prev.shippingAddress2 || '',
          city:     prev.shippingCity     || '',
          state:    prev.shippingState    || '',
          zip:      prev.shippingZip      || '',
          country:  prev.shippingCountry  || 'US',
          phone:    prev.shippingPhone    || '',
        };
        // Persist onto this order so fulfillment has it ready
        await prisma.order.update({
          where: { id: orderId },
          data: {
            shippingName:     shipping.name,
            shippingAddress:  shipping.address1,
            shippingAddress2: shipping.address2,
            shippingCity:     shipping.city,
            shippingState:    shipping.state,
            shippingZip:      shipping.zip,
            shippingCountry:  shipping.country,
            shippingPhone:    shipping.phone,
          },
        });
      }
    }

    const baseUrl      = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const generatedUrl = order.image?.generatedUrl || '';

    // ── Demo ──────────────────────────────────────────────────────────────────
    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_demo';
    if (isDemo) {
      await prisma.order.update({ where: { id: orderId }, data: { status: 'paid' } });
      fulfillOrder(orderId).catch(e => console.error('[Demo resume fulfillment]', e.message));
      return NextResponse.json({ url: `${baseUrl}/success?order=${orderId}&tx=DEMO-${Date.now()}` });
    }

    // ── PayPal ─────────────────────────────────────────────────────────────────
    if (PAYMENT_PROVIDER === 'paypal') {
      const { id: paypalOrderId, approveUrl } = await createPayPalOrder({
        orderId:     order.id,
        amount:      order.price,
        description: `Maîtrepets Framed Canvas — ${order.size || '16x20'}`,
        shipping,   // pre-fills PayPal address fields if available
      });
      await prisma.order.update({ where: { id: order.id }, data: { stripeId: paypalOrderId } });
      return NextResponse.json({ url: approveUrl });
    }

    // ── Stripe ─────────────────────────────────────────────────────────────────
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email:       order.user?.email || undefined,
      line_items: [{
        price_data: {
          currency:     'usd',
          product_data: {
            name:        `Maîtrepets Portrait — ${order.size || '16x20'}`,
            description: 'Custom AI-generated pet art, professionally printed',
            images:      generatedUrl ? [generatedUrl] : [],
          },
          unit_amount: Math.round(order.price * 100),
        },
        quantity: 1,
      }],
      mode:        'payment',
      success_url: `${baseUrl}/success?order=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/dashboard`,
      metadata:    { orderId: order.id },
      shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB', 'AU', 'JM', 'TT', 'BB'] },
      billing_address_collection:  'required',
    });

    await prisma.order.update({
      where: { id: orderId },
      data:  { stripeId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('[resume-order] error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
