import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const REFUNDABLE_STATUSES = ['paid', 'fulfilling', 'shipped', 'delivered'];

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { orderId, reason, evidenceUrl } = await req.json();
    if (!orderId || !reason) return NextResponse.json({ error: 'orderId and reason required' }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    if (order.userId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (!REFUNDABLE_STATUSES.includes(order.status)) {
      return NextResponse.json({ error: 'This order is not eligible for a refund request' }, { status: 400 });
    }

    if (order.status === 'refund_requested') {
      return NextResponse.json({ error: 'A refund request has already been submitted for this order' }, { status: 409 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'refund_requested',
        refundReason: reason,
        refundRequestedAt: new Date(),
        refundEvidenceUrl: evidenceUrl || null,
        updatedAt: new Date(),
      },
    });

    console.log(`[Refund Request] Order ${orderId} — reason: "${reason}" — user: ${session.email}`);

    return NextResponse.json({ ok: true, status: updated.status });
  } catch (err) {
    console.error('[refund-request] error:', err);
    return NextResponse.json({ error: err.message || 'Request failed' }, { status: 500 });
  }
}
