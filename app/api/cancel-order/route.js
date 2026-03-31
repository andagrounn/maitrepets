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
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Only unpaid orders can be removed' }, { status: 400 });
    }

    // Delete the specific order and any other stale pending orders for this user
    await prisma.order.deleteMany({ where: { userId: session.id, status: 'pending' } });
    console.log(`[Cancel Order] all pending orders removed for ${session.email}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[cancel-order] error:', err);
    return NextResponse.json({ error: err.message || 'Failed to remove order' }, { status: 500 });
  }
}
