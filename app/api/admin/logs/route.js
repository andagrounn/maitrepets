import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/adminGuard';

export async function GET(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const level  = searchParams.get('level');
  const source = searchParams.get('source');
  const limit  = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
  const page   = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const skip   = (page - 1) * limit;

  const where = {
    ...(level  && { level }),
    ...(source && { source }),
  };

  const [logs, total] = await Promise.all([
    prisma.log.findMany({ where, orderBy: { createdAt: 'desc' }, take: limit, skip }),
    prisma.log.count({ where }),
  ]);

  // Enrich logs with customer info derived from orderId in meta
  const orderIds = [...new Set(
    logs.flatMap(l => {
      try { const m = JSON.parse(l.meta || '{}'); return m.orderId ? [m.orderId] : []; }
      catch { return []; }
    })
  )];

  const orders = orderIds.length
    ? await prisma.order.findMany({
        where:   { id: { in: orderIds } },
        select:  { id: true, user: { select: { name: true, email: true } } },
      })
    : [];

  const orderMap = Object.fromEntries(orders.map(o => [o.id, o.user]));

  const enriched = logs.map(l => {
    try {
      const m = JSON.parse(l.meta || '{}');
      const user = m.orderId ? orderMap[m.orderId] : null;
      return { ...l, customer: user || null };
    } catch {
      return { ...l, customer: null };
    }
  });

  return NextResponse.json({ logs: enriched, total, page, limit });
}

export async function DELETE(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level');
  await prisma.log.deleteMany({ where: level ? { level } : {} });
  return NextResponse.json({ ok: true });
}
