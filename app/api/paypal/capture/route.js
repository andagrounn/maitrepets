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

    // Idempotency: if already processed, redirect to success without re-capturing
    if (['paid', 'fulfilling', 'fulfilled', 'shipped', 'delivered'].includes(order.status)) {
      return NextResponse.redirect(`${baseUrl}/success?order=${order.id}&tx=${order.stripeId || paypalToken}`);
    }

    // Capture the payment
    const capture = await capturePayPalOrder(paypalToken);
    const captureStatus = capture?.status;
    const captureData   = capture?.purchase_units?.[0]?.payments?.captures?.[0];
    const captureId     = captureData?.id;

    if (captureStatus === 'COMPLETED') {
      // ── Amount verification ──────────────────────────────────────────────
      const capturedAmount = parseFloat(captureData?.amount?.value ?? 0);
      const expectedAmount = parseFloat(order.price ?? 0);

      if (Math.abs(capturedAmount - expectedAmount) > 0.01) {
        console.error(
          `[PayPal capture] Amount mismatch — expected $${expectedAmount}, got $${capturedAmount}`,
          { orderId: order.id, paypalToken }
        );
        await prisma.order.update({
          where: { id: order.id },
          data:  { status: 'fraud_suspected', updatedAt: new Date() },
        });
        return NextResponse.redirect(`${baseUrl}/cancel?reason=amount_mismatch`);
      }

      // Pull shipping address from PayPal capture response
      const ppShipping = capture?.purchase_units?.[0]?.shipping;
      const ppAddress  = ppShipping?.address;
      const ppName     = ppShipping?.name?.full_name || capture?.payer?.name
        ? `${capture.payer.name.given_name} ${capture.payer.name.surname}`.trim()
        : null;

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status:           'paid',
          updatedAt:        new Date(),
          ...(ppName     && { shippingName:    ppName }),
          ...(ppAddress?.address_line_1 && { shippingAddress:  ppAddress.address_line_1 }),
          ...(ppAddress?.address_line_2 && { shippingAddress2: ppAddress.address_line_2 }),
          ...(ppAddress?.admin_area_2   && { shippingCity:     ppAddress.admin_area_2   }),
          ...(ppAddress?.admin_area_1   && { shippingState:    ppAddress.admin_area_1   }),
          ...(ppAddress?.postal_code    && { shippingZip:      ppAddress.postal_code    }),
          ...(ppAddress?.country_code   && { shippingCountry:  ppAddress.country_code   }),
        },
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
