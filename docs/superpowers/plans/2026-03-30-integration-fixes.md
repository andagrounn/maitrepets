# Integration Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix three integration vulnerabilities: PayPal captured-amount verification, Printful webhook signature verification, and Google OAuth CSRF state parameter.

**Architecture:** All three fixes are isolated to their own route files. No new dependencies, no schema changes. PayPal fix adds a numeric comparison before marking an order paid. Printful fix reads the raw body as text before parsing, then verifies HMAC-SHA256 against `PRINTFUL_API_KEY`. Google OAuth fix generates a random `state` cookie in the initiator and verifies it in the callback.

**Tech Stack:** Next.js 14 App Router, Node.js built-in `crypto`, Prisma

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `app/api/paypal/capture/route.js` | Add captured-amount check before marking order paid |
| Modify | `app/api/printful/webhook/route.js` | Read raw body as text, verify HMAC-SHA256 signature |
| Modify | `app/api/auth/google/route.js` | Generate random `state`, store in `_oauth_state` cookie |
| Modify | `app/api/auth/google/callback/route.js` | Verify `state` param matches cookie, clear cookie |

---

## Task 1: PayPal Captured-Amount Verification

**Files:**
- Modify: `app/api/paypal/capture/route.js`

The current code checks `captureStatus === 'COMPLETED'` but never verifies the captured dollar amount matches the order price. An attacker could capture a lower amount and still trigger fulfillment.

The fix: after confirming `COMPLETED`, extract the captured value from `capture.purchase_units[0].payments.captures[0].amount.value` and compare it to `order.price`. If they differ by more than 1 cent, mark the order `fraud_suspected` and redirect to cancel.

- [ ] **Step 1: Replace `app/api/paypal/capture/route.js`**

Write this exact content to `app/api/paypal/capture/route.js`:

```js
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { capturePayPalOrder } from '@/lib/paypal';
import { fulfillOrder } from '@/lib/fulfillment';

/**
 * PayPal redirects here after customer approves payment.
 * Query params: token (PayPal order ID), PayerID
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const baseUrl      = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const paypalToken  = searchParams.get('token');   // PayPal order ID
  const payerId      = searchParams.get('PayerID');

  if (!paypalToken || !payerId) {
    return NextResponse.redirect(`${baseUrl}/cancel?reason=missing_params`);
  }

  try {
    // Find our order by PayPal order ID (stored in stripeId col)
    const order = await prisma.order.findFirst({
      where: { stripeId: paypalToken },
    });

    if (!order) {
      return NextResponse.redirect(`${baseUrl}/cancel?reason=order_not_found`);
    }

    // Capture the payment
    const capture = await capturePayPalOrder(paypalToken);
    const captureStatus = capture?.status;
    const captureData   = capture?.purchase_units?.[0]?.payments?.captures?.[0];
    const captureId     = captureData?.id;

    if (captureStatus === 'COMPLETED') {
      // ── Amount verification ──────────────────────────────────────────────
      const capturedAmount = parseFloat(captureData?.amount?.value ?? 0);
      const expectedAmount = parseFloat(order.price ?? 0);

      if (Math.abs(capturedAmount - expectedAmount) > 0.01) {
        console.error(
          `[PayPal capture] Amount mismatch — expected $${expectedAmount}, got $${capturedAmount}`,
          { orderId: order.id, paypalToken }
        );
        await prisma.order.update({
          where: { id: order.id },
          data:  { status: 'fraud_suspected', updatedAt: new Date() },
        });
        return NextResponse.redirect(`${baseUrl}/cancel?reason=amount_mismatch`);
      }

      // Pull shipping address from PayPal capture response
      const ppShipping = capture?.purchase_units?.[0]?.shipping;
      const ppAddress  = ppShipping?.address;
      const ppName     = ppShipping?.name?.full_name || capture?.payer?.name
        ? `${capture.payer.name.given_name} ${capture.payer.name.surname}`.trim()
        : null;

      await prisma.order.update({
        where: { id: order.id },
        data: {
          status:           'paid',
          updatedAt:        new Date(),
          ...(ppName     && { shippingName:    ppName }),
          ...(ppAddress?.address_line_1 && { shippingAddress:  ppAddress.address_line_1 }),
          ...(ppAddress?.address_line_2 && { shippingAddress2: ppAddress.address_line_2 }),
          ...(ppAddress?.admin_area_2   && { shippingCity:     ppAddress.admin_area_2   }),
          ...(ppAddress?.admin_area_1   && { shippingState:    ppAddress.admin_area_1   }),
          ...(ppAddress?.postal_code    && { shippingZip:      ppAddress.postal_code    }),
          ...(ppAddress?.country_code   && { shippingCountry:  ppAddress.country_code   }),
        },
      });

      // Auto-submit to Printful (fire-and-forget — don't block redirect)
      fulfillOrder(order.id).catch((e) =>
        console.error('[Printful fulfillment failed]', e.message)
      );

      return NextResponse.redirect(
        `${baseUrl}/success?order=${order.id}&tx=${captureId}`
      );
    }

    // Payment not completed
    await prisma.order.update({ where: { id: order.id }, data: { status: 'failed' } });
    return NextResponse.redirect(`${baseUrl}/cancel?reason=capture_failed`);

  } catch (err) {
    console.error('PayPal capture error:', err);
    return NextResponse.redirect(`${baseUrl}/cancel?reason=server_error`);
  }
}
```

- [ ] **Step 2: Verify the amount check is in place**

```bash
grep -n "amount_mismatch\|capturedAmount\|expectedAmount" "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3/app/api/paypal/capture/route.js"
```
Expected: lines referencing `capturedAmount`, `expectedAmount`, and `amount_mismatch`.

- [ ] **Step 3: Commit**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git add app/api/paypal/capture/route.js
git commit -m "security: verify PayPal captured amount matches order price before fulfillment"
```

---

## Task 2: Printful Webhook Signature Verification

**Files:**
- Modify: `app/api/printful/webhook/route.js`

Printful signs each webhook with `HMAC-SHA256(rawBody, PRINTFUL_API_KEY)` and sends the hex digest in the `X-Printful-Signature` header. The current code reads the body with `req.json()` and never checks the header.

The fix: read body as raw text first, verify the signature, then parse JSON.

- [ ] **Step 1: Replace `app/api/printful/webhook/route.js`**

Write this exact content:

```js
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
```

- [ ] **Step 2: Verify signature verification is present**

```bash
grep -n "verifyPrintfulSignature\|x-printful-signature\|invalid_signature" "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3/app/api/printful/webhook/route.js"
```
Expected: lines for `verifyPrintfulSignature`, `x-printful-signature`, and `invalid_signature`.

- [ ] **Step 3: Commit**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git add app/api/printful/webhook/route.js
git commit -m "security: verify Printful webhook HMAC-SHA256 signature before processing"
```

---

## Task 3: Google OAuth CSRF State Parameter

**Files:**
- Modify: `app/api/auth/google/route.js`
- Modify: `app/api/auth/google/callback/route.js`

The OAuth initiator doesn't generate a `state` parameter, so the callback has no CSRF protection. An attacker could craft a login flow and capture codes.

The fix: generate a random 16-byte hex `state` in the initiator, store it in `_oauth_state` cookie (httpOnly, sameSite=lax, 10 min TTL), add it to the OAuth URL params. In the callback, read `state` from the query, compare to the cookie, reject if mismatched.

- [ ] **Step 1: Update `app/api/auth/google/route.js`**

Write this exact content:

```js
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const guestImageId = searchParams.get('guestImageId');
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  // Generate CSRF state token
  const state = randomBytes(16).toString('hex');

  const params = new URLSearchParams({
    client_id:     process.env.GOOGLE_CLIENT_ID || '',
    redirect_uri:  `${baseUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope:         'openid email profile',
    access_type:   'offline',
    prompt:        'select_account',
    state,
  });

  const res = NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params}`
  );

  // Store state for verification in callback
  res.cookies.set('_oauth_state', state, {
    httpOnly: true,
    path: '/',
    maxAge: 60 * 10, // 10 minutes — enough for OAuth round-trip
    sameSite: 'lax',
  });

  // Carry the guest imageId through the OAuth round-trip via a short-lived cookie
  if (guestImageId) {
    res.cookies.set('_guest_img', guestImageId, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 10,
      sameSite: 'lax',
    });
  }

  return res;
}
```

- [ ] **Step 2: Update `app/api/auth/google/callback/route.js`**

Write this exact content:

```js
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
          name:     profile.name    || null,
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
```

- [ ] **Step 3: Verify state is generated and checked**

```bash
grep -n "state\|_oauth_state" "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3/app/api/auth/google/route.js" "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3/app/api/auth/google/callback/route.js"
```
Expected: initiator sets `_oauth_state` cookie and adds `state` param; callback reads both and compares.

- [ ] **Step 4: Commit**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git add app/api/auth/google/route.js app/api/auth/google/callback/route.js
git commit -m "security: add OAuth state param to Google login to prevent CSRF"
```

---

## Task 4: Final Verification

- [ ] **Step 1: Confirm PayPal amount check**

```bash
grep -n "fraud_suspected\|amount_mismatch" "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3/app/api/paypal/capture/route.js"
```
Expected: two matches.

- [ ] **Step 2: Confirm Printful signature check**

```bash
grep -n "verifyPrintfulSignature" "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3/app/api/printful/webhook/route.js"
```
Expected: function definition + call site.

- [ ] **Step 3: Confirm OAuth state check**

```bash
grep -n "oauth_state_mismatch" "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3/app/api/auth/google/callback/route.js"
```
Expected: one match.

- [ ] **Step 4: Build**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3" && npm run build 2>&1 | tail -20
```
Expected: no compile errors.

- [ ] **Step 5: Push**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3" && git push
```

---

## Summary

| Fix | File | What was missing |
|-----|------|-----------------|
| PayPal amount verification | `app/api/paypal/capture/route.js` | Captured amount never compared to order price |
| Printful webhook signature | `app/api/printful/webhook/route.js` | No HMAC verification — anyone could POST fake events |
| Google OAuth state/CSRF | `app/api/auth/google/route.js` + callback | No state param — vulnerable to OAuth CSRF |
