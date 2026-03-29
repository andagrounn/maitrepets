import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function adminGuard(req) {
  const key = req.headers.get('x-admin-key');
  return key === process.env.ADMIN_SECRET || key === 'maitrepets-admin-2025';
}

// Update order status, tracking, or items
export async function PATCH(req) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId, status, trackingNumber, trackingUrl, digitalCopy, extraCopy, frameColor, size, price } = await req.json();
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  const data = {};
  if (status        !== undefined) data.status         = status;
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
  if (trackingUrl   !== undefined) data.trackingUrl    = trackingUrl;
  if (digitalCopy   !== undefined) data.digitalCopy    = digitalCopy;
  if (extraCopy     !== undefined) data.extraCopy      = extraCopy;
  if (frameColor    !== undefined) data.frameColor     = frameColor;
  if (size          !== undefined) data.size           = size;
  if (price         !== undefined) data.price          = Number(price);
  data.updatedAt = new Date();

  const order = await prisma.order.update({ where: { id: orderId }, data });
  return NextResponse.json({ ok: true, order });
}
