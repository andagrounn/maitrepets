import { NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { prisma } from '@/lib/prisma';
import { sendEmail, shippedEmail, deliveredEmail } from '@/lib/email';

/**
 * Printful webhook receiver.
 *
 * Register this URL via /api/printful/setup (one-time setup), or manually:
 *   POST https://api.printful.com/webhooks
 *   { "url": "https://yourdomain.com/api/printful/webhook",
 *     "types": ["package_shipped","order_failed","order_canceled","order_updated"] }
 *
 * Printful retries failed deliveries at: 1, 4, 16, 64, 256, 1024 minutes.
 * Always return HTTP 200 — even on errors — to stop unnecessary retries.
 */

function verifyPrintfulSignature(rawBody, signature) {
  const secret = process.env.PRINTFUL_API_KEY;
  if (!secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  return signature === expected;
}

export async function POST(req) {
  const rawBody  = await req.text();
  const signature = req.headers.get('x-printful-signature') ?? '';

  if (!verifyPrintfulSignature(rawBody, signature)) {
    console.warn('[Printful webhook] Signature verification failed — rejecting request');
    // Return 200 so Printful doesn't keep retrying an invalid request
    return NextResponse.json({ received: false, error: 'invalid_signature' }, { status: 200 });
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, data } = body ?? {};

  try {
    switch (type) {

      // ── Shipment dispatched ──────────────────────────────────────────────
      case 'package_shipped': {
        const printfulOrderId  = String(data?.order?.id ?? '');
        const externalOrderId  = data?.order?.external_id ?? null; // our DB order ID
        const trackingNumber   = data?.shipment?.tracking_number ?? null;
        const trackingUrl      = data?.shipment?.tracking_url    ?? null;
        const carrier          = data?.shipment?.service         ?? null;

        if (!printfulOrderId) break;

        // Prefer lookup by printfulId; fall back to external_id (our order ID)
        const where = printfulOrderId
          ? { printfulId: printfulOrderId }
          : externalOrderId
            ? { id: externalOrderId }
            : null;

        if (!where) break;

        await prisma.order.updateMany({
          where,
          data: { status: 'shipped', trackingNumber, trackingUrl, updatedAt: new Date() },
        });

        // Send tracking email from the app (Printful shipping notifications must be
        // disabled in Printful dashboard → Settings → Notifications)
        try {
          const order = await prisma.order.findFirst({
            where,
            include: { image: true, user: { select: { email: true } } },
          });
          if (order?.user?.email) {
            const { subject, html } = shippedEmail(order, trackingNumber, trackingUrl, carrier);
            await sendEmail({ to: order.user.email, subject, html, orderId: order.id });
          }
        } catch (emailErr) {
          console.error('[Printful webhook] Tracking email failed:', emailErr.message);
        }

        console.log(`[Printful webhook] Shipped — Printful #${printfulOrderId}, tracking: ${trackingNumber}`);
        break;
      }

      // ── Package delivered ────────────────────────────────────────────────
      case 'package_delivered': {
        const printfulOrderId = String(data?.order?.id ?? '');
        const externalOrderId = data?.order?.external_id ?? null;
        if (!printfulOrderId && !externalOrderId) break;

        const where = printfulOrderId ? { printfulId: printfulOrderId } : { id: externalOrderId };

        await prisma.order.updateMany({
          where,
          data: { status: 'delivered', updatedAt: new Date() },
        });

        try {
          const order = await prisma.order.findFirst({
            where,
            include: { image: true, user: { select: { email: true } } },
          });
          if (order?.user?.email) {
            const { subject, html } = deliveredEmail(order);
            await sendEmail({ to: order.user.email, subject, html, orderId: order.id });
          }
        } catch (emailErr) {
          console.error('[Printful webhook] Delivered email failed:', emailErr.message);
        }

        console.log(`[Printful webhook] Delivered — Printful #${printfulOrderId}`);
        break;
      }

      // ── Order failed (e.g. bad file / payment issue on Printful side) ────
      case 'order_failed': {
        const printfulOrderId = String(data?.order?.id ?? '');
        const externalOrderId = data?.order?.external_id ?? null;
        if (!printfulOrderId && !externalOrderId) break;

        await prisma.order.updateMany({
          where: printfulOrderId ? { printfulId: printfulOrderId } : { id: externalOrderId },
          data: { status: 'paid_fulfillment_failed', updatedAt: new Date() },
        });

        console.log(`[Printful webhook] Order failed — Printful #${printfulOrderId}`);
        break;
      }

      // ── Order canceled ───────────────────────────────────────────────────
      case 'order_canceled': {
        const printfulOrderId = String(data?.order?.id ?? '');
        const externalOrderId = data?.order?.external_id ?? null;
        if (!printfulOrderId && !externalOrderId) break;

        await prisma.order.updateMany({
          where: printfulOrderId ? { printfulId: printfulOrderId } : { id: externalOrderId },
          data: { status: 'failed', updatedAt: new Date() },
        });

        console.log(`[Printful webhook] Order canceled — Printful #${printfulOrderId}`);
        break;
      }

      // ── Package returned ─────────────────────────────────────────────────
      case 'package_returned': {
        const printfulOrderId = String(data?.order?.id ?? '');
        if (!printfulOrderId) break;

        await prisma.order.updateMany({
          where:  { printfulId: printfulOrderId },
          data:   { status: 'returned', updatedAt: new Date() },
        });

        console.log(`[Printful webhook] Package returned — Printful #${printfulOrderId}`);
        break;
      }

      // ── Order updated (catches printing / in-process state) ─────────────
      case 'order_updated': {
        const printfulOrderId = String(data?.order?.id ?? '');
        const externalOrderId = data?.order?.external_id ?? null;
        const printfulStatus  = data?.order?.status ?? '';

        if (!printfulOrderId && !externalOrderId) break;

        // Map Printful's "inprocess" → our "fulfilling"
        if (printfulStatus === 'inprocess') {
          const where = printfulOrderId ? { printfulId: printfulOrderId } : { id: externalOrderId };
          await prisma.order.updateMany({
            where,
            data: { status: 'fulfilling', updatedAt: new Date() },
          });
          console.log(`[Printful webhook] Now printing — Printful #${printfulOrderId}`);
        }
        break;
      }

      default:
        console.log(`[Printful webhook] Unhandled event: ${type}`);
    }
  } catch (err) {
    // Log but still return 200 so Printful doesn't keep retrying
    console.error('[Printful webhook] Handler error:', err.message);
  }

  return NextResponse.json({ received: true });
}
