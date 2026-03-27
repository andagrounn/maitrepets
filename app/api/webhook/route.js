import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { createPrintfulOrder, PRODUCT_VARIANTS } from '@/lib/printful';

export const config = { api: { bodyParser: false } };

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return new NextResponse('Webhook error', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { orderId, imageUrl, productKey } = session.metadata;

    try {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) return new NextResponse('Order not found', { status: 404 });

      const product = PRODUCT_VARIANTS[productKey];

      // Create Printful order
      const printfulOrder = await createPrintfulOrder({
        recipient: {
          name: order.shippingName || 'Customer',
          address1: order.shippingAddress || '123 Main St',
          city: order.shippingCity || 'Los Angeles',
          state_code: order.shippingState || 'CA',
          country_code: order.shippingCountry || 'US',
          zip: order.shippingZip || '90001',
        },
        imageUrl,
        variantId: product?.variantId || 4012,
      });

      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'paid', printfulId: String(printfulOrder?.result?.id || '') },
      });
    } catch (err) {
      console.error('Printful order failed:', err);
      await prisma.order.update({ where: { id: orderId }, data: { status: 'paid_printful_failed' } });
    }
  }

  return new NextResponse('OK', { status: 200 });
}
