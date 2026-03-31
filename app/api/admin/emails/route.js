import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/adminGuard';

export async function GET(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const direction = searchParams.get('direction'); // 'sent' | 'received' | null (all)

  const emails = await prisma.email.findMany({
    where:   direction ? { direction } : {},
    orderBy: { createdAt: 'desc' },
    take:    100,
  });

  const unreadCount = await prisma.email.count({ where: { direction: 'received', read: false } });
  return NextResponse.json({ emails, unreadCount });
}

// Mark email as read
export async function PATCH(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  await prisma.email.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
