# Security Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate all Critical and High security vulnerabilities identified in the audit: hardcoded secrets, missing rate limiting, CSRF gaps, weak cookie config, human-detection fail-open, guest image hijacking, and unbounded admin queries.

**Architecture:** Fixes are isolated to `lib/auth.js`, `lib/rateLimit.js` (new), `next.config.js`, `middleware.js` (new), and the affected API routes. No schema changes required. No frontend changes required.

**Tech Stack:** Next.js 14 App Router, Prisma, jsonwebtoken, bcryptjs, Node.js `crypto` module (built-in, no new deps)

---

## File Map

| Action | File | What changes |
|--------|------|-------------|
| Modify | `lib/auth.js` | Remove hardcoded JWT secret fallback; throw on missing env var |
| Create | `lib/rateLimit.js` | In-memory sliding-window rate limiter (no Redis needed) |
| Modify | `next.config.js` | Add HTTP security headers |
| Create | `middleware.js` | Next.js middleware — enforce `sameSite` cookie behavior note |
| Modify | `app/api/auth/login/route.js` | Add rate limit + `sameSite` cookie |
| Modify | `app/api/auth/signup/route.js` | Add rate limit + `sameSite` cookie + validate guestImageId |
| Modify | `app/api/generate/route.js` | Add per-user rate limit |
| Modify | `app/api/upload/route.js` | Fail closed on human detection error |
| Modify | `app/api/admin/stats/route.js` | Remove hardcoded key fallback; paginate orders query |
| Modify | `app/api/admin/order/route.js` | Remove hardcoded key fallback |
| Modify | `app/api/admin/orders/route.js` | Remove hardcoded key fallback |
| Modify | `app/api/admin/config/route.js` | Remove hardcoded key fallback |
| Modify | `app/api/admin/email/route.js` | Remove hardcoded key fallback |
| Modify | `app/api/admin/emails/route.js` | Remove hardcoded key fallback |
| Modify | `app/api/admin/generations/route.js` | Remove hardcoded key fallback |
| Modify | `app/api/admin/logs/route.js` | Remove hardcoded key fallback |
| Modify | `app/api/admin/retry-fulfillment/route.js` | Remove hardcoded key fallback |
| Modify | `app/api/admin/update-address/route.js` | Remove hardcoded key fallback |

---

## Task 1: Remove Hardcoded JWT Secret

**Files:**
- Modify: `lib/auth.js`

- [ ] **Step 1: Update `lib/auth.js` to throw if `JWT_SECRET` is missing**

Replace the entire file content:

```js
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET environment variable is not set');

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

export function verifyToken(token) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('maitrepets_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
```

- [ ] **Step 2: Verify `JWT_SECRET` is set in `.env`**

Run:
```bash
grep JWT_SECRET "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3/.env"
```
Expected: a line like `JWT_SECRET="some-long-random-string"`. If missing, add one:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```
Copy the output and add to `.env`:
```
JWT_SECRET="<output>"
```

- [ ] **Step 3: Start dev server to confirm no crash**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3" && npm run dev 2>&1 | head -20
```
Expected: server starts without `JWT_SECRET environment variable is not set` error.

- [ ] **Step 4: Commit**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git add lib/auth.js
git commit -m "security: remove hardcoded JWT secret fallback — require env var"
```

---

## Task 2: Remove Hardcoded Admin Key From All Admin Routes

**Files:**
- Modify: all `app/api/admin/*/route.js` files (9 files)

The pattern to replace in every file:
```js
// OLD (insecure)
return key === process.env.ADMIN_SECRET || key === 'maitrepets-admin-2025';

// NEW (secure)
return !!key && key === process.env.ADMIN_SECRET;
```

- [ ] **Step 1: Update every admin route's `adminGuard` function**

Run this to do all 9 files at once:
```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
for f in \
  app/api/admin/stats/route.js \
  app/api/admin/order/route.js \
  app/api/admin/orders/route.js \
  app/api/admin/config/route.js \
  app/api/admin/email/route.js \
  app/api/admin/emails/route.js \
  app/api/admin/generations/route.js \
  app/api/admin/logs/route.js \
  app/api/admin/retry-fulfillment/route.js \
  app/api/admin/update-address/route.js; do
  sed -i '' "s/key === process\.env\.ADMIN_SECRET || key === 'maitrepets-admin-2025'/!!key \&\& key === process.env.ADMIN_SECRET/g" "$f"
done
```

- [ ] **Step 2: Verify the replacement worked on each file**

```bash
grep -r "maitrepets-admin-2025" "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3/app/api/admin/"
```
Expected: **no output** (empty result means all occurrences removed).

- [ ] **Step 3: Verify `ADMIN_SECRET` is set in `.env`**

```bash
grep ADMIN_SECRET "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3/.env"
```
Expected: a line like `ADMIN_SECRET="some-strong-key"`. If missing or weak, generate one:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Add to `.env`: `ADMIN_SECRET="<output>"`

- [ ] **Step 4: Commit**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git add app/api/admin/
git commit -m "security: remove hardcoded admin key fallback from all admin routes"
```

---

## Task 3: Add Security Headers to `next.config.js`

**Files:**
- Modify: `next.config.js`

- [ ] **Step 1: Replace `next.config.js` with headers config**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.replicate.delivery' },
      { protocol: 'https', hostname: 'pbxt.replicate.delivery' },
      { protocol: 'https', hostname: 'replicate.delivery' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options',           value: 'DENY' },
          { key: 'X-Content-Type-Options',     value: 'nosniff' },
          { key: 'Referrer-Policy',            value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy',         value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://www.paypalobjects.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.amazonaws.com https://*.replicate.delivery https://replicate.delivery https://placedog.net https://images.unsplash.com",
              "connect-src 'self' https://api.replicate.com https://api.openai.com https://api-m.paypal.com https://api-m.sandbox.paypal.com",
              "frame-src https://www.paypal.com https://www.sandbox.paypal.com",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

- [ ] **Step 2: Start dev server and verify headers are served**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3" && npm run dev &
sleep 5
curl -s -I http://localhost:3000 | grep -E "x-frame|x-content|strict-transport|content-security"
```
Expected output includes lines like:
```
x-frame-options: DENY
x-content-type-options: nosniff
strict-transport-security: max-age=63072000...
content-security-policy: default-src 'self'...
```

- [ ] **Step 3: Kill dev server and commit**

```bash
kill %1 2>/dev/null; true
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git add next.config.js
git commit -m "security: add X-Frame-Options, CSP, HSTS, and other security headers"
```

---

## Task 4: Fix Auth Cookies — Add `sameSite` and `secure`

**Files:**
- Modify: `app/api/auth/login/route.js`
- Modify: `app/api/auth/signup/route.js`

- [ ] **Step 1: Update login cookie in `app/api/auth/login/route.js`**

Find line 18 and replace the `res.cookies.set` call:
```js
res.cookies.set('maitrepets_token', token, {
  httpOnly: true,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
});
```

- [ ] **Step 2: Update signup cookie in `app/api/auth/signup/route.js`**

Find line 26 and replace the `res.cookies.set` call:
```js
res.cookies.set('maitrepets_token', token, {
  httpOnly: true,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
});
```

- [ ] **Step 3: Commit**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git add app/api/auth/login/route.js app/api/auth/signup/route.js
git commit -m "security: add sameSite=lax and secure flag to auth cookies"
```

---

## Task 5: Create In-Memory Rate Limiter

**Files:**
- Create: `lib/rateLimit.js`

This is a lightweight sliding-window rate limiter using a plain `Map`. No Redis or new packages needed.

- [ ] **Step 1: Create `lib/rateLimit.js`**

```js
// Simple in-memory sliding-window rate limiter.
// For multi-instance deployments, swap the Map for Redis.
const windows = new Map();

/**
 * @param {string} key      — unique identifier (e.g. IP or userId)
 * @param {number} limit    — max requests allowed
 * @param {number} windowMs — time window in milliseconds
 * @returns {{ allowed: boolean, remaining: number, resetMs: number }}
 */
export function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const entry = windows.get(key) || { count: 0, start: now };

  // Reset window if expired
  if (now - entry.start > windowMs) {
    entry.count = 0;
    entry.start = now;
  }

  entry.count += 1;
  windows.set(key, entry);

  const remaining = Math.max(0, limit - entry.count);
  const resetMs   = entry.start + windowMs - now;
  return { allowed: entry.count <= limit, remaining, resetMs };
}

/** Extract best available IP from Next.js request headers */
export function getClientIp(req) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git add lib/rateLimit.js
git commit -m "security: add in-memory sliding-window rate limiter utility"
```

---

## Task 6: Rate-Limit Login Endpoint

**Files:**
- Modify: `app/api/auth/login/route.js`

Limit: **5 attempts per IP per 15 minutes**.

- [ ] **Step 1: Add rate limiting to login route**

Replace the full file:
```js
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req) {
  const ip = getClientIp(req);
  const { allowed, resetMs } = rateLimit(`login:${ip}`, 5, 15 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(resetMs / 1000)) },
      }
    );
  }

  try {
    const { email, password } = await req.json();
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const superadminEmails = (process.env.SUPERADMIN_EMAILS || '').split(',').map(e => e.trim());
    const isSuperAdmin = superadminEmails.includes(user.email);
    const token = signToken({ id: user.id, email: user.email, name: user.name });
    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, isSuperAdmin } });
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
```

- [ ] **Step 2: Verify rate limit triggers on 6th request**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3" && npm run dev &
sleep 6
for i in {1..6}; do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" \
    -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```
Expected: requests 1-5 return `401`, request 6 returns `429`.

- [ ] **Step 3: Kill dev server and commit**

```bash
kill %1 2>/dev/null; true
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git add app/api/auth/login/route.js
git commit -m "security: rate-limit login to 5 attempts per IP per 15 minutes"
```

---

## Task 7: Rate-Limit Signup + Fix Guest Image Claiming

**Files:**
- Modify: `app/api/auth/signup/route.js`

Limit: **10 signups per IP per hour**. Guest image fix: only allow claiming if the image has `status: 'guest'` AND `userId` matches the guest system user.

- [ ] **Step 1: Replace full `app/api/auth/signup/route.js`**

```js
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
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git add app/api/auth/signup/route.js
git commit -m "security: rate-limit signup + validate guestImageId ownership before claiming"
```

---

## Task 8: Rate-Limit Image Generation

**Files:**
- Modify: `app/api/generate/route.js`

Limit: **10 generations per user per hour** (authenticated), **already handled by guest cookie** (guests).

- [ ] **Step 1: Add rate limiting import and check to generate route**

Add the import at the top of `app/api/generate/route.js` (after existing imports):
```js
import { rateLimit } from '@/lib/rateLimit';
```

Then add the rate limit check immediately after `const session = await getSession();` (after line 23):
```js
  // Rate limit authenticated users: 10 generations per hour
  if (session) {
    const { allowed } = rateLimit(`generate:${session.id}`, 10, 60 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: 'Generation limit reached. Please try again in an hour.' },
        { status: 429 }
      );
    }
  }
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git add app/api/generate/route.js
git commit -m "security: rate-limit image generation to 10 per user per hour"
```

---

## Task 9: Fix Human Detection to Fail Closed

**Files:**
- Modify: `app/api/upload/route.js`

Currently returns `false` (allow) on API error. Should return `true` (block) so a vision API outage doesn't silently disable the ethics guard.

- [ ] **Step 1: Update the catch block in `checkForHuman`**

In `app/api/upload/route.js`, find lines 34-37:
```js
  } catch (err) {
    console.error('[upload] human-check error:', err.message);
    return false; // fail open so a vision API error doesn't block all uploads
  }
```

Replace with:
```js
  } catch (err) {
    console.error('[upload] human-check error — failing closed:', err.message);
    return true; // fail closed: if vision API is down, block upload to maintain ethics guard
  }
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git add app/api/upload/route.js
git commit -m "security: fail closed on human detection error — block upload if vision API is down"
```

---

## Task 10: Fix Admin Stats — Remove Hardcoded Key + Paginate Query

**Files:**
- Modify: `app/api/admin/stats/route.js`

The hardcoded key was removed in Task 2. This task fixes the unbounded `findMany` that loads every order ever created into memory.

- [ ] **Step 1: Add pagination to the orders query in `app/api/admin/stats/route.js`**

Find the `prisma.order.findMany` call (around line 13) and add a `take` limit. Also add a separate count query for stats:

Replace the `Promise.all` block at the top of the GET handler:
```js
  const [orders, usersRaw, imageCount, totalOrderCount] = await Promise.all([
    prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500, // cap in-memory payload; increase if needed
      include: {
        user:  { select: { id: true, name: true, email: true, createdAt: true } },
        image: { select: { generatedUrl: true, style: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 50, // last 50 orders per user is plenty for the customer panel
          include: { image: { select: { generatedUrl: true, style: true } } },
        },
      },
    }),
    prisma.image.count(),
    prisma.order.count(),
  ]);
```

Then update the stats block to use `totalOrderCount` for the total orders stat:
```js
  const totalOrders = totalOrderCount; // true total, not capped by take:500
```

- [ ] **Step 2: Commit**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git add app/api/admin/stats/route.js
git commit -m "security/perf: cap admin stats query at 500 rows to prevent memory exhaustion"
```

---

## Task 11: Final Verification

- [ ] **Step 1: Confirm no hardcoded secrets remain**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
grep -r "maitrepets-admin-2025\|maitrepets-dev-secret-2024" app/ lib/
```
Expected: **no output**.

- [ ] **Step 2: Confirm rate limiter is wired into all three endpoints**

```bash
grep -l "rateLimit" app/api/auth/login/route.js app/api/auth/signup/route.js app/api/generate/route.js
```
Expected: all 3 filenames printed.

- [ ] **Step 3: Confirm sameSite is on both auth cookies**

```bash
grep -n "sameSite" app/api/auth/login/route.js app/api/auth/signup/route.js
```
Expected: one match per file.

- [ ] **Step 4: Confirm human check fails closed**

```bash
grep -A2 "fail closed" app/api/upload/route.js
```
Expected: `return true;` on the line after the comment.

- [ ] **Step 5: Run build to confirm no compile errors**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3" && npm run build 2>&1 | tail -20
```
Expected: build completes with `✓ Compiled successfully` (warnings OK, errors not OK).

- [ ] **Step 6: Final commit and push**

```bash
cd "/Users/rashidibrown/Documents/Dev/WEB/artify-ai 3"
git push
```

---

## Summary of Changes

| Issue | Fixed in Task |
|-------|--------------|
| Hardcoded JWT secret | Task 1 |
| Hardcoded admin key (9 routes) | Task 2 |
| Missing security headers | Task 3 |
| Auth cookies missing `sameSite`/`secure` | Task 4 |
| No rate limiting on login | Tasks 5+6 |
| No rate limiting on signup | Task 7 |
| Guest image hijacking | Task 7 |
| No rate limiting on generation | Task 8 |
| Human detection fails open | Task 9 |
| Admin unbounded DB query | Task 10 |
