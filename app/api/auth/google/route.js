import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const guestImageId = searchParams.get('guestImageId');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri:  `${baseUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
  });

  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );

  // Carry the guest imageId through the OAuth round-trip via a short-lived cookie
  if (guestImageId) {
    res.cookies.set('_guest_img', guestImageId, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 10, // 10 minutes — enough for OAuth round-trip
      sameSite: 'lax',
    });
  }

  return res;
}
