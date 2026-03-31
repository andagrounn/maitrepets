import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

const GUEST_SYSTEM_EMAIL = 'guest@system.maitrepets.com';

export async function POST(req) {
  const ip = getClientIp(req);
  const { allowed, resetMs } = rateLimit(`signup:${ip}`, 10, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(resetMs / 1000)) },
      }
    );
  }

  try {
    const { email, password, name, guestImageId } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'Email already registered' }, { status: 409 });

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, password: hashed, name: name || null } });

    // Claim guest generation — validate it belongs to the guest system user
    if (guestImageId && typeof guestImageId === 'string' && guestImageId.length === 36) {
      const guestUser = await prisma.user.findUnique({ where: { email: GUEST_SYSTEM_EMAIL } });
      if (guestUser) {
        await prisma.image.updateMany({
          where: { id: guestImageId, userId: guestUser.id, status: 'guest' },
          data:  { userId: user.id, status: 'generated' },
        });
      }
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name });
    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } });
    res.cookies.set('maitrepets_token', token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });
    return res;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
