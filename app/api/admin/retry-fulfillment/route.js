import { NextResponse } from 'next/server';
import { fulfillOrder } from '@/lib/fulfillment';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/adminGuard';

export async function POST(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  try {
    // Reset status to 'paid' so fulfillOrder's guard passes
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'paid', printfulId: null },
    });
    const printfulId = await fulfillOrder(orderId);
    return NextResponse.json({ ok: true, printfulId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
