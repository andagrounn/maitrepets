import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { fulfillOrder } from '@/lib/fulfillment';
import { isAdmin } from '@/lib/adminGuard';

export async function POST(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId, name, address1, address2, city, state, zip, country, phone, retry } = await req.json();
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

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
      ...(retry && { status: 'paid', printfulId: null }),
    },
  });

  if (retry) {
    try {
      await fulfillOrder(orderId);
    } catch (err) {
      return NextResponse.json({ ok: true, fulfillError: err.message });
    }
  }

  return NextResponse.json({ ok: true });
}
