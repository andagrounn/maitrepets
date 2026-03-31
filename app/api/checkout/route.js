import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { fulfillOrder } from '@/lib/fulfillment';
import { createPayPalOrder } from '@/lib/paypal';

// ─── Switch between "paypal" and "stripe" via PAYMENT_PROVIDER env var ───────
const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || 'stripe';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { imageId, generatedUrl: clientUrl, productKey, price, shipping, extras, frameColor } = await req.json();
    // Always fetch generatedUrl server-side so it's never needed from the client
    const imageRecord = imageId ? await prisma.image.findUnique({ where: { id: imageId }, select: { generatedUrl: true } }) : null;
    const generatedUrl = imageRecord?.generatedUrl || clientUrl || '';

    if (!imageId || !price) {
      return NextResponse.json({ error: 'imageId and price required' }, { status: 400 });
    }

    const sizeMatch = (productKey || '').match(/(\d+x\d+)/);
    const size = sizeMatch ? sizeMatch[1] : '16x20';
    // Normalize legacy canvas keys to poster keys
    const normalizedProductKey = (productKey || 'poster-16x20').replace('canvas-', 'poster-');

    // Fall back to most recently saved address if none provided
    let effectiveShipping = shipping;
    if (!shipping?.address1) {
      const savedOrder = await prisma.order.findFirst({
        where: { userId: session.id, shippingAddress: { not: null } },
        orderBy: { createdAt: 'desc' },
        select: {
          shippingName: true, shippingAddress: true, shippingAddress2: true,
          shippingCity: true, shippingState: true, shippingZip: true,
          shippingCountry: true, shippingPhone: true, shippingMethod: true,
        },
      });
      if (savedOrder) {
        effectiveShipping = {
          name:           savedOrder.shippingName,
          address1:       savedOrder.shippingAddress,
          address2:       savedOrder.shippingAddress2,
          city:           savedOrder.shippingCity,
          state:          savedOrder.shippingState,
          zip:            savedOrder.shippingZip,
          country:        savedOrder.shippingCountry || 'US',
          phone:          savedOrder.shippingPhone,
          shippingMethod: savedOrder.shippingMethod || 'STANDARD',
        };
      }
    }

    // Create pending order in DB
    const order = await prisma.order.create({
      data: {
        userId:           session.id,
        imageId,
        productType:      normalizedProductKey,
        size,
        price:            Number(price),
        status:           'pending',
        shippingName:     effectiveShipping?.name           || null,
        shippingAddress:  effectiveShipping?.address1       || null,
        shippingAddress2: effectiveShipping?.address2       || null,
        shippingCity:     effectiveShipping?.city           || null,
        shippingState:    effectiveShipping?.state          || null,
        shippingZip:      effectiveShipping?.zip            || null,
        shippingCountry:  effectiveShipping?.country        || 'US',
        shippingPhone:    effectiveShipping?.phone          || null,
        shippingMethod:   effectiveShipping?.shippingMethod || 'STANDARD',
        frameColor:       frameColor || 'black',
        digitalCopy:      !!(extras?.digitalCopy),
        extraCopy:        !!(extras?.extraCopy),
      },
    });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // ── PayPal ────────────────────────────────────────────────────────────────
    if (PAYMENT_PROVIDER === 'paypal') {
      const description = `Maîtrepets Framed Canvas — ${size}`;
      const { id: paypalOrderId, approveUrl } = await createPayPalOrder({
        orderId: order.id,
        amount: Number(price),
        description,
        shipping: effectiveShipping,
      });
      // Reuse stripeId column to store PayPal order ID
      await prisma.order.update({ where: { id: order.id }, data: { stripeId: paypalOrderId } });
      return NextResponse.json({ url: approveUrl });
    }

    // ── Demo / Stripe ─────────────────────────────────────────────────────────
    const isDemo = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_demo';

    if (isDemo) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'paid' } });
      fulfillOrder(order.id).catch((e) => console.error('[Demo fulfillment]', e.message));
      return NextResponse.json({ url: `${baseUrl}/success?order=${order.id}&tx=DEMO-${Date.now()}` });
    }

    // Build line items — base print + any selected upsells
    const basePrice = Number(price) -
      (extras?.digitalCopy              ? 12 : 0) -
      (extras?.extraCopy                ? 19 : 0) -
      (extras?.priorityProcessing       ?  9 : 0) -
      (effectiveShipping?.shippingRate  ? parseFloat(effectiveShipping.shippingRate) : 0);

    const lineItems = [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `Maîtrepets Framed Canvas — ${size}`,
            description: 'Custom AI-generated pet art on premium framed canvas',
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
      ...(effectiveShipping?.shippingRate ? [{
        price_data: { currency: 'usd', product_data: { name: 'Shipping' }, unit_amount: Math.round(parseFloat(effectiveShipping.shippingRate) * 100) },
        quantity: 1,
      }] : []),
    ];

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
      billing_address_collection: 'required',
    });

    await prisma.order.update({ where: { id: order.id }, data: { stripeId: checkoutSession.id } });
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error('Checkout error:', err);
    return NextResponse.json({ error: err.message || 'Checkout failed' }, { status: 500 });
  }
}
