import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const images = await prisma.image.findMany({
    where: { userId: session.id, generatedUrl: { not: null } },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return NextResponse.json({ images });
}
