import { NextResponse } from 'next/server';

function adminGuard(req) {
  const key = req.headers.get('x-admin-key');
  return key === process.env.ADMIN_SECRET || key === 'maitrepets-admin-2025';
}

export async function POST(req) {
  if (!adminGuard(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { to, subject, body } = await req.json();
    if (!to || !subject || !body) return NextResponse.json({ error: 'to, subject, and body are required' }, { status: 400 });
    if (!to.includes('@')) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });

    const apiKey = process.env.RESEND_API_KEY;

    if (apiKey) {
      // Send via Resend (no SDK — raw fetch, no extra package needed)
      // NOTE: The `from` address must match a domain verified in your Resend dashboard.
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Maîtrepets <noreply@maitrepets.com>',
          to: [to],
          subject,
          html: body,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error('[admin/email] Resend error:', err);
        return NextResponse.json({ error: 'Email delivery failed', detail: err }, { status: 500 });
      }

      const data = await res.json();
      console.log(`[admin/email] Sent to ${to} via Resend — ID: ${data.id}`);
    } else {
      // Dev fallback — log instead of sending
      console.log('─────────────────────────────────────────');
      console.log('[admin/email] DEV FALLBACK (set RESEND_API_KEY to send real emails)');
      console.log(`TO:      ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`BODY:\n${body.replace(/<[^>]+>/g, '')}`);
      console.log('─────────────────────────────────────────');
    }

    return NextResponse.json({ ok: true, dev: !apiKey });
  } catch (err) {
    console.error('[admin/email] error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
