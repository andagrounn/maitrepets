import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: session.id },
    include: { image: true },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ orders });
}
