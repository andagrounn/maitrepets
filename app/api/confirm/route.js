import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { fulfillOrder } from '@/lib/fulfillment';

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

    // Mark order paid
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.status === 'fulfilling' || order.status === 'paid') {
      return NextResponse.json({ ok: true, already: true, digitalCopy: order.digitalCopy });
    }

    // Pull shipping address from Stripe session if present
    const sa = session.shipping_details?.address || session.customer_details?.address;
    const sn = session.shipping_details?.name    || session.customer_details?.name;

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status:   'paid',
        stripeId: sessionId,
        ...(sn             && { shippingName:     sn }),
        ...(sa?.line1      && { shippingAddress:  sa.line1 }),
        ...(sa?.line2      && { shippingAddress2: sa.line2 }),
        ...(sa?.city       && { shippingCity:     sa.city }),
        ...(sa?.state      && { shippingState:    sa.state }),
        ...(sa?.postal_code && { shippingZip:     sa.postal_code }),
        ...(sa?.country    && { shippingCountry:  sa.country }),
      },
    });

    // Fire Printful fulfillment
    fulfillOrder(orderId).catch((e) =>
      console.error('[Fulfillment failed]', e.message)
    );

    return NextResponse.json({ ok: true, digitalCopy: updated.digitalCopy });
  } catch (err) {
    console.error('Confirm error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
