import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { fulfillOrder } from '@/lib/fulfillment';
import { logger } from '@/lib/logger';
import { sendEmail, orderConfirmationEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    await logger.error('webhook', `Signature verification failed: ${err.message}`);
    return new NextResponse('Webhook error', { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { orderId } = session.metadata || {};

    if (!orderId) {
      console.warn('[Webhook] No orderId in session metadata');
      return new NextResponse('OK', { status: 200 });
    }

    try {
      const order = await prisma.order.findUnique({ where: { id: orderId }, include: { image: true } });
      if (!order) {
        console.warn(`[Webhook] Order ${orderId} not found`);
        return new NextResponse('OK', { status: 200 });
      }

      // Already processed — skip
      if (order.status === 'fulfilling' || order.status === 'paid' && order.printfulId) {
        await logger.info('webhook', `Order already processed — skipping`, { orderId });
        return new NextResponse('OK', { status: 200 });
      }

      // Extract shipping address from the Stripe session
      const sa = session.shipping_details?.address || session.customer_details?.address;
      const sn = session.shipping_details?.name    || session.customer_details?.name;

      // Save address + mark paid
      await prisma.order.update({
        where: { id: orderId },
        data: {
          status:   'paid',
          stripeId: session.id,
          ...(sn              && { shippingName:     sn }),
          ...(sa?.line1       && { shippingAddress:  sa.line1 }),
          ...(sa?.line2       && { shippingAddress2: sa.line2 }),
          ...(sa?.city        && { shippingCity:     sa.city }),
          ...(sa?.state       && { shippingState:    sa.state }),
          ...(sa?.postal_code && { shippingZip:      sa.postal_code }),
          ...(sa?.country     && { shippingCountry:  sa.country }),
        },
      });

      // Send order confirmation email
      const customerEmail = session.customer_details?.email;
      if (customerEmail) {
        const freshOrder = await prisma.order.findUnique({ where: { id: orderId }, include: { image: true } });
        if (freshOrder) {
          const { subject, html } = orderConfirmationEmail(freshOrder);
          sendEmail({ to: customerEmail, subject, html, orderId }).catch(e =>
            logger.warn('webhook', `Confirmation email failed: ${e.message}`, { orderId })
          );
        }
      }

      // Trigger Printful fulfillment
      await fulfillOrder(orderId);
      await logger.info('webhook', `Payment confirmed — fulfillment triggered`, { orderId });
    } catch (err) {
      await logger.error('webhook', `Fulfillment failed: ${err.message}`, { orderId });
      // fulfillOrder already sets status to paid_fulfillment_failed on error
    }
  }

  return new NextResponse('OK', { status: 200 });
}
