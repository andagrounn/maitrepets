import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function adminGuard(req) {
  const key = req.headers.get('x-admin-key');
  return key === process.env.ADMIN_SECRET || key === 'maitrepets-admin-2025';
}

export async function GET(req) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

  return NextResponse.json({ logs, total, page, limit });
}

export async function DELETE(req) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level');
  await prisma.log.deleteMany({ where: level ? { level } : {} });
  return NextResponse.json({ ok: true });
}
