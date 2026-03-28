import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function auth(req) {
  const key = req.headers.get('x-admin-key');
  return key === process.env.ADMIN_SECRET;
}

export async function GET(req) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const images = await prisma.image.findMany({
    where: { generatedUrl: { not: null } },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true, name: true } } },
  });

  return NextResponse.json({ images });
}

export async function DELETE(req) {
  if (!auth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  try {
    await prisma.$transaction([
      prisma.order.deleteMany({ where: { imageId: id } }),
      prisma.image.delete({ where: { id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[delete generation]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
