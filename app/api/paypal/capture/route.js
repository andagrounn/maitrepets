import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { capturePayPalOrder } from '@/lib/paypal';
import { fulfillOrder } from '@/lib/fulfillment';

/**
 * PayPal redirects here after customer approves payment.
 * Query params: token (PayPal order ID), PayerID
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const baseUrl      = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const paypalToken  = searchParams.get('token');   // PayPal order ID
  const payerId      = searchParams.get('PayerID');

  if (!paypalToken || !payerId) {
    return NextResponse.redirect(`${baseUrl}/cancel?reason=missing_params`);
  }

  try {
    // Find our order by PayPal order ID (stored in stripeId col)
    const order = await prisma.order.findFirst({
      where: { stripeId: paypalToken },
    });

    if (!order) {
      return NextResponse.redirect(`${baseUrl}/cancel?reason=order_not_found`);
    }

    // Capture the payment
    const capture = await capturePayPalOrder(paypalToken);
    const captureStatus = capture?.status;
    const captureId = capture?.purchase_units?.[0]?.payments?.captures?.[0]?.id;

    if (captureStatus === 'COMPLETED') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'paid', updatedAt: new Date() },
      });

      // Auto-submit to Printful (fire-and-forget — don't block redirect)
      fulfillOrder(order.id).catch((e) =>
        console.error('[Printful fulfillment failed]', e.message)
      );

      return NextResponse.redirect(
        `${baseUrl}/success?order=${order.id}&tx=${captureId}`
      );
    }

    // Payment not completed
    await prisma.order.update({ where: { id: order.id }, data: { status: 'failed' } });
    return NextResponse.redirect(`${baseUrl}/cancel?reason=capture_failed`);

  } catch (err) {
    console.error('PayPal capture error:', err);
    return NextResponse.redirect(`${baseUrl}/cancel?reason=server_error`);
  }
}
