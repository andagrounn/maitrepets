import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Public endpoint — returns styles sorted by usage count
export async function GET() {
  const rows = await prisma.image.groupBy({
    by: ['style'],
    _count: { style: true },
    orderBy: { _count: { style: 'desc' } },
  });

  // Top 3 styles get the fire badge
  const popular = new Set(rows.slice(0, 3).map((r) => r.style));
  const counts  = Object.fromEntries(rows.map((r) => [r.style, r._count.style]));

  return NextResponse.json({ popular: [...popular], counts });
}
