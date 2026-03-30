import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const superadminEmails = (process.env.SUPERADMIN_EMAILS || '').split(',').map(e => e.trim());
  const isSuperAdmin = superadminEmails.includes(session.email);

  const orders = await prisma.order.findMany({
    where: isSuperAdmin ? {} : { userId: session.id },
    include: { image: true, ...(isSuperAdmin ? { user: { select: { name: true, email: true } } } : {}) },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ orders });
}
