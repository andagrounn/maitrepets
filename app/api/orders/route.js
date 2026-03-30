import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const superadminEmails = (process.env.SUPERADMIN_EMAILS || '').split(',').map(e => e.trim());
  const isSuperAdmin = superadminEmails.includes(session.email);

  const imageSelect = { select: { id: true, style: true, status: true, createdAt: true } };

  const orders = await prisma.order.findMany({
    where: isSuperAdmin ? {} : { userId: session.id },
    select: {
      id: true, productType: true, size: true, price: true, status: true,
      frameColor: true, digitalCopy: true, extraCopy: true,
      trackingNumber: true, trackingUrl: true,
      shippingName: true, shippingAddress: true, shippingAddress2: true,
      shippingCity: true, shippingState: true, shippingZip: true, shippingCountry: true,
      refundReason: true, refundRequestedAt: true,
      createdAt: true, updatedAt: true,
      imageId: true,
      image: imageSelect,
      ...(isSuperAdmin ? { user: { select: { name: true, email: true } } } : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ orders });
}
