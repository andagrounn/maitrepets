import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { fulfillOrder } from '@/lib/fulfillment';

export async function POST(req) {
  const session = await getSession();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { orderId } = await req.json();
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  try {
    const printfulId = await fulfillOrder(orderId);
    return NextResponse.json({ ok: true, printfulId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
