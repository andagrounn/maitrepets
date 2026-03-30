import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const raw = await prisma.image.findMany({
    where: { userId: session.id, generatedUrl: { not: null } },
    orderBy: { createdAt: 'desc' },
    take: 20,
    select: { id: true, style: true, status: true, createdAt: true },
  });
  return NextResponse.json({ images: raw });
}
