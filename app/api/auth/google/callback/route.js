import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const code    = searchParams.get('code');
  const state   = searchParams.get('state');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const cookieStore = cookies();
  const storedState  = cookieStore.get('_oauth_state')?.value || null;
  const guestImageId = cookieStore.get('_guest_img')?.value   || null;

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_cancelled`);
  }

  // CSRF check — state must match what we issued
  if (!state || !storedState || state !== storedState) {
    console.warn('[Google OAuth] State mismatch — possible CSRF attack');
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_state_mismatch`);
  }

  try {
    // Exchange authorisation code for access token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     process.env.GOOGLE_CLIENT_ID     || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri:  `${baseUrl}/api/auth/google/callback`,
        grant_type:    'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(tokens.error_description || 'Token exchange failed');

    // Fetch Google profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const profile = await profileRes.json();
    if (!profile.email) throw new Error('Could not retrieve email from Google');

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email:    profile.email,
          name:     profile.name  || null,
          avatar:   profile.picture || null,
          googleId: profile.id,
        },
      });
    } else if (!user.googleId) {
      // Link Google to an existing email/password account
      user = await prisma.user.update({
        where: { id: user.id },
        data:  { googleId: profile.id, avatar: profile.picture || user.avatar },
      });
    }

    // Claim guest generation if one was in progress before OAuth
    if (guestImageId) {
      await prisma.image.updateMany({
        where: { id: guestImageId, status: 'guest' },
        data:  { userId: user.id, status: 'generated' },
      });
    }

    const token = signToken({ id: user.id, email: user.email, name: user.name });

    const response = NextResponse.redirect(`${baseUrl}/create`);
    response.cookies.set('maitrepets_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      maxAge:   60 * 60 * 24 * 30,
      path:     '/',
      sameSite: 'lax',
    });
    // Clear carry cookies
    response.cookies.delete('_guest_img');
    response.cookies.delete('_oauth_state');

    return response;
  } catch (err) {
    console.error('[Google OAuth callback]', err.message);
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`);
  }
}
