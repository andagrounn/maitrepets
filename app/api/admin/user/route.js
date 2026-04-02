import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/adminGuard';

export async function DELETE(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { userId } = await req.json();
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  // Cascade: delete orders and images belonging to this user first
  await prisma.order.deleteMany({ where: { userId } });
  await prisma.image.deleteMany({ where: { userId } });
  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ ok: true });
}
