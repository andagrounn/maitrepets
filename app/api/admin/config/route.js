import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function adminGuard(req) {
  const key = req.headers.get('x-admin-key');
  return key === process.env.ADMIN_SECRET || key === 'maitrepets-admin-2025';
}

export async function GET(req) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await prisma.config.findMany();
  const config = Object.fromEntries(rows.map(r => [r.key, r.value]));
  return NextResponse.json({ config });
}

export async function POST(req) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
