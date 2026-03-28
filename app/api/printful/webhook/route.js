import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
export async function POST(req) {
  let body;
  try {
    body = await req.json();
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

        if (!printfulOrderId) break;

        // Prefer lookup by printfulId; fall back to external_id (our order ID)
        const where = printfulOrderId
          ? { printfulId: printfulOrderId }
          : externalOrderId
            ? { id: externalOrderId }
            : null;

        if (where) {
          await prisma.order.updateMany({
            where,
            data: { status: 'shipped', trackingNumber, trackingUrl, updatedAt: new Date() },
          });
        }

        console.log(`[Printful webhook] Shipped — Printful #${printfulOrderId}, tracking: ${trackingNumber}`);
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
