import { NextResponse } from 'next/server';
import { registerWebhook, getWebhook } from '@/lib/printful';

/**
 * POST /api/printful/setup
 * One-time setup: registers the webhook URL with Printful.
 * Call this once after deploying to production with a real PRINTFUL_API_KEY.
 *
 * GET  /api/printful/setup — view current webhook config
 * POST /api/printful/setup — register/replace webhook config
 */

const WEBHOOK_EVENTS = [
  'package_shipped',
  'package_delivered',
  'package_returned',
  'order_failed',
  'order_canceled',
  'order_updated',
];

export async function GET() {
  try {
    const config = await getWebhook();
    return NextResponse.json({ webhook: config });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  if (!baseUrl || baseUrl.includes('localhost')) {
    return NextResponse.json(
      { error: 'Set NEXT_PUBLIC_BASE_URL to your production domain before registering webhooks. Printful requires a public HTTPS URL.' },
      { status: 400 }
    );
  }

  const webhookUrl = `${baseUrl}/api/printful/webhook`;

  try {
    const result = await registerWebhook(webhookUrl, WEBHOOK_EVENTS);
    return NextResponse.json({
      success: true,
      registered: result,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
