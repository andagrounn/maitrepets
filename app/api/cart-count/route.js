import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ count: 0 });

  const count = await prisma.order.count({
    where: {
      userId: session.id,
      status: 'pending',
    },
  });

  return NextResponse.json({ count });
}
