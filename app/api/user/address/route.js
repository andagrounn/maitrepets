import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Most recent order that has a stored shipping address
  const order = await prisma.order.findFirst({
    where: {
      userId:          session.id,
      shippingAddress: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      shippingName:     true,
      shippingAddress:  true,
      shippingAddress2: true,
      shippingCity:     true,
      shippingState:    true,
      shippingZip:      true,
      shippingCountry:  true,
      shippingPhone:    true,
    },
  });

  if (!order) return NextResponse.json({ address: null });

  return NextResponse.json({
    address: {
      name:     order.shippingName     || '',
      address1: order.shippingAddress  || '',
      address2: order.shippingAddress2 || '',
      city:     order.shippingCity     || '',
      state:    order.shippingState    || '',
      zip:      order.shippingZip      || '',
      country:  order.shippingCountry  || 'US',
      phone:    order.shippingPhone    || '',
    },
  });
}
