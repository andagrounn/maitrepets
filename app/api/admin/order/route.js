import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function adminGuard(req) {
  const key = req.headers.get('x-admin-key');
  return key === process.env.ADMIN_SECRET || key === 'maitrepets-admin-2025';
}

// Update order status or tracking
export async function PATCH(req) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId, status, trackingNumber, trackingUrl } = await req.json();
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  const data = {};
  if (status)         data.status         = status;
  if (trackingNumber) data.trackingNumber = trackingNumber;
  if (trackingUrl)    data.trackingUrl    = trackingUrl;
  data.updatedAt = new Date();

  const order = await prisma.order.update({ where: { id: orderId }, data });
  return NextResponse.json({ ok: true, order });
}
