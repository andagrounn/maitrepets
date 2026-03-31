import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import { isAdmin } from '@/lib/adminGuard';

export async function POST(req) {
  if (!(await isAdmin(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { to, subject, body } = await req.json();
    if (!to || !subject || !body) return NextResponse.json({ error: 'to, subject, and body are required' }, { status: 400 });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(to))) return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });

    const html = body.includes('<') ? body : body.replace(/\n/g, '<br>');
    const id = await sendEmail({ to, subject, html });
    return NextResponse.json({ ok: true, dev: !process.env.RESEND_API_KEY, id });
  } catch (err) {
    console.error('[admin/email] error:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
