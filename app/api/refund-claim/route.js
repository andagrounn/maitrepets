import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { orderId } = await req.json();
    if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.userId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (order.status !== 'refund_approved') {
      return NextResponse.json({ error: 'Refund has not been approved for this order' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'returned', updatedAt: new Date() },
    });

    console.log(`[Refund Claim] Order ${orderId} claimed by ${session.email}`);
    return NextResponse.json({ ok: true, status: updated.status });
  } catch (err) {
    console.error('[refund-claim] error:', err);
    return NextResponse.json({ error: err.message || 'Request failed' }, { status: 500 });
  }
}
