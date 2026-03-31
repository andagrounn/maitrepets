import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: session.id }, select: { id: true, email: true, name: true } });
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const superadminEmails = (process.env.SUPERADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean);
  const isSuperAdmin = superadminEmails.length > 0 && superadminEmails.includes(user.email);
  return NextResponse.json({ user: { ...user, isSuperAdmin } });
}
