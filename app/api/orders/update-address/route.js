import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fulfillOrder } from '@/lib/fulfillment';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId, name, address1, address2, city, state, zip, country, phone } = await req.json();
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  // Ensure the order belongs to this user and is in a failed state
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.userId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!['paid_fulfillment_failed', 'paid_printful_failed'].includes(order.status)) {
    return NextResponse.json({ error: 'Order is not in a failed state' }, { status: 400 });
  }

  // Update address and reset to paid so fulfillOrder can run
  await prisma.order.update({
    where: { id: orderId },
    data: {
      shippingName:     name     || order.shippingName,
      shippingAddress:  address1 || order.shippingAddress,
      shippingAddress2: address2 ?? order.shippingAddress2,
      shippingCity:     city     || order.shippingCity,
      shippingState:    state    || order.shippingState,
      shippingZip:      zip      || order.shippingZip,
      shippingCountry:  country  || order.shippingCountry,
      shippingPhone:    phone    ?? order.shippingPhone,
      status:           'paid',
      printfulId:       null,
    },
  });

  try {
    await fulfillOrder(orderId);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
