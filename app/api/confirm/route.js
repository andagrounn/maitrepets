import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { fulfillOrder } from '@/lib/fulfillment';
import { logger } from '@/lib/logger';
import { sendEmail, orderConfirmationEmail } from '@/lib/email';

/**
 * Called from the success page with ?session_id=...
 * Verifies the Stripe session is paid and triggers Printful fulfillment.
 */
export async function POST(req) {
  try {
    const { sessionId, orderId } = await req.json();

    if (!sessionId || !orderId) {
      return NextResponse.json({ error: 'Missing sessionId or orderId' }, { status: 400 });
    }

    // Verify payment with Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 });
    }

    // Find order
    const order = await prisma.order.findUnique({ where: { id: orderId }, include: { image: true } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    // Already sent to Printful — just return
    if (order.status === 'fulfilling' || order.printfulId) {
      return NextResponse.json({ ok: true, already: true, digitalCopy: order.digitalCopy });
    }

    // Pull shipping address from Stripe session
    const sa = session.shipping_details?.address || session.customer_details?.address;
    const sn = session.shipping_details?.name    || session.customer_details?.name;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status:   'paid',
        stripeId: sessionId,
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
      const { subject, html } = orderConfirmationEmail(updated);
      sendEmail({ to: customerEmail, subject, html, orderId }).catch(e =>
        logger.warn('confirm', `Confirmation email failed: ${e.message}`, { orderId })
      );
    }

    // Fire Printful fulfillment (address is now saved in DB)
    fulfillOrder(orderId).catch(async (e) => {
      await logger.error('confirm', `Fulfillment failed: ${e.message}`, { orderId });
    });

    return NextResponse.json({ ok: true, digitalCopy: updated.digitalCopy });
  } catch (err) {
    await logger.error('confirm', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
