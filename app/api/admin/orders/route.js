import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function adminGuard(req) {
  const key = req.headers.get('x-admin-key');
  return !!key && key === process.env.ADMIN_SECRET;
}

// DELETE /api/admin/orders  { ids: ['id1', 'id2'] }
export async function DELETE(req) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { ids } = await req.json();
  if (!Array.isArray(ids) || ids.length === 0)
    return NextResponse.json({ error: 'No order IDs provided' }, { status: 400 });

  const { count } = await prisma.order.deleteMany({ where: { id: { in: ids } } });
  return NextResponse.json({ ok: true, deleted: count });
}
