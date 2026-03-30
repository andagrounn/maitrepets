import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Resend inbound email webhook.
 * Configure in Resend dashboard: Inbound → Add endpoint → this URL.
 * Resend will POST here whenever an email arrives at your inbound address.
 */
export async function POST(req) {
  try {
    const payload = await req.json();

    // Resend inbound payload shape
    const from    = payload.from    || payload.sender || 'unknown';
    const to      = Array.isArray(payload.to) ? payload.to.join(', ') : (payload.to || '');
    const subject = payload.subject || '(no subject)';
    const body    = payload.html    || payload.text   || '';

    await prisma.email.create({
      data: { direction: 'received', from, to, subject, body, read: false },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[email/inbound]', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
