import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { fulfillOrder } from '@/lib/fulfillment';
import { PRODUCT_VARIANTS } from '@/lib/printful';

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

    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_demo';

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

    // Create a pending reprint order
    const newOrder = await prisma.order.create({
      data: {
        userId:          session.id,
        imageId:         original.imageId,
        productType:     original.productType,
        size:            original.size,
        price:           product.price,
        status:          'pending',
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

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Maîtrepets Reprint — ${product.name}`,
            description: 'Reprint of your custom AI pet portrait',
            images: original.image?.generatedUrl ? [original.image.generatedUrl] : [],
          },
          unit_amount: Math.round(product.price * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/success?order=${newOrder.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/dashboard`,
      metadata: { orderId: newOrder.id, type: 'reprint' },
    });

    await prisma.order.update({
      where: { id: newOrder.id },
      data: { stripeId: checkoutSession.id },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('[reprint] error:', err);
    return NextResponse.json({ error: err.message || 'Reprint failed' }, { status: 500 });
  }
}
