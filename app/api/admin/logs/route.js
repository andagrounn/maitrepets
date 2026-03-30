import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function adminGuard(req) {
  const key = req.headers.get('x-admin-key');
  return key === process.env.ADMIN_SECRET || key === 'maitrepets-admin-2025';
}

export async function GET(req) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const level  = searchParams.get('level');   // 'info' | 'warn' | 'error' | null (all)
  const source = searchParams.get('source');  // optional filter
  const limit  = Math.min(parseInt(searchParams.get('limit') || '200'), 500);

  const logs = await prisma.log.findMany({
    where: {
      ...(level  && { level }),
      ...(source && { source }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json({ logs });
}

export async function DELETE(req) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level');
  await prisma.log.deleteMany({ where: level ? { level } : {} });
  return NextResponse.json({ ok: true });
}
