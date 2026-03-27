import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyWiPayHash } from '@/lib/wipay';

/**
 * WiPay sends a GET redirect to this URL after payment.
 * Query params: status, transaction_id, order_id, total, currency,
 *               card, message, date, hash (on success), data
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const status         = searchParams.get('status');
  const transaction_id = searchParams.get('transaction_id');
  const order_id       = searchParams.get('order_id');
  const total          = searchParams.get('total');
  const hash           = searchParams.get('hash');
  const message        = searchParams.get('message');

  // Always find the order first
  const order = await prisma.order.findUnique({ where: { id: order_id } }).catch(() => null);

  if (!order) {
    return NextResponse.redirect(`${baseUrl}/cancel?reason=order_not_found`);
  }

  if (status === 'success') {
    // Verify hash to confirm response authenticity
    const valid = verifyWiPayHash({ transaction_id, total, hash });

    if (!valid) {
      console.warn('WiPay hash mismatch — possible tampered response', { transaction_id, order_id });
      await prisma.order.update({ where: { id: order_id }, data: { status: 'fraud_suspected' } });
      return NextResponse.redirect(`${baseUrl}/cancel?reason=verification_failed`);
    }

    // Mark order as paid
    await prisma.order.update({
      where: { id: order_id },
      data: {
        status:    'paid',
        stripeId:  transaction_id,  // reusing stripeId col for wipay tx id
        updatedAt: new Date(),
      },
    });

    return NextResponse.redirect(`${baseUrl}/success?order=${order_id}&tx=${transaction_id}`);
  }

  // Payment failed or errored
  console.log('WiPay payment not successful:', { status, message, order_id });
  await prisma.order.update({ where: { id: order_id }, data: { status: 'failed' } });

  return NextResponse.redirect(`${baseUrl}/cancel?reason=${encodeURIComponent(message || status)}`);
}
