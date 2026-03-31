import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/adminGuard';

export async function GET(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await prisma.config.findMany();
  const config = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return NextResponse.json({ config });
}

export async function POST(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await req.json();
  for (const [key, value] of Object.entries(body)) {
    await prisma.config.upsert({
      where:  { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });
  }
  return NextResponse.json({ ok: true });
}
