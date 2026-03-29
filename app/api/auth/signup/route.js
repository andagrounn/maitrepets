import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req) {
  try {
    const { email, password, name, guestImageId } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, name: name || null } });

    // Claim guest generation if one exists
    if (guestImageId) {
      await prisma.image.updateMany({
        where: { id: guestImageId, status: 'guest' },
        data:  { userId: user.id, status: 'generated' },
      });
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name });
    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    res.cookies.set('maitrepets_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
