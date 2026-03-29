import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSession } from '@/lib/auth';
import { STYLE_PROMPTS } from '@/lib/replicate';
import { prisma } from '@/lib/prisma';
import { runGenerationPipeline } from '@/lib/generation';

const FREE_LIMIT        = 3;
const DEMO_EMAIL        = 'demo@artifyai.com';
const GUEST_COOKIE      = '_ggen';
const GUEST_SYSTEM_EMAIL = 'guest@system.maitrepets.com';

async function getOrCreateGuestUser() {
  return prisma.user.upsert({
    where:  { email: GUEST_SYSTEM_EMAIL },
    update: {},
    create: { email: GUEST_SYSTEM_EMAIL, name: 'Guest' },
  });
}

export async function POST(req) {
  const session    = await getSession();
  const cookieStore = cookies();

  // ── Guest (not logged in): 1 generation per session ──────────────────────
  if (!session) {
    const already = cookieStore.get(GUEST_COOKIE);
    if (already) {
      return NextResponse.json({ error: 'GUEST_LIMIT_REACHED' }, { status: 403 });
    }
  }

  try {
    const { imageUrl, style, imageId } = await req.json();
    if (!imageUrl || !style) return NextResponse.json({ error: 'imageUrl and style required' }, { status: 400 });

    // ── Logged-in generation limits (skip demo account) ───────────────────
    if (session && session.email !== DEMO_EMAIL) {
      const [totalGenerations, paidOrderCount] = await Promise.all([
        prisma.image.count({
          where: { userId: session.id, generatedUrl: { not: null } },
        }),
        prisma.order.count({
          where: {
            userId: session.id,
            status: { in: ['paid', 'fulfilling', 'shipped', 'delivered', 'paid_printful_failed'] },
          },
        }),
      ]);
      const maxAllowed = FREE_LIMIT * (1 + paidOrderCount);
      if (totalGenerations >= maxAllowed) {
        return NextResponse.json({ error: 'FREE_LIMIT_REACHED' }, { status: 403 });
      }
    }
    // ──────────────────────────────────────────────────────────────────────

    const styleConfig = STYLE_PROMPTS[style];
    if (!styleConfig) return NextResponse.json({ error: 'Invalid style' }, { status: 400 });

    const isDemo = process.env.REPLICATE_API_TOKEN === 'demo';
    let generatedUrl;
    let finalPrompt;

    if (isDemo) {
      await new Promise((r) => setTimeout(r, 2000));
      generatedUrl = 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80';
    } else {
      ({ generatedUrl, finalPrompt } = await runGenerationPipeline(imageUrl, style));
    }

    if (!generatedUrl) throw new Error('No output URL from any generation model');

    let savedId = imageId; // track the DB record id

    if (session) {
      // Logged-in user: update or create image record
      if (imageId) {
        await prisma.image.update({
          where: { id: imageId },
          data:  { generatedUrl, status: 'generated', prompt: finalPrompt || styleConfig.prompt },
        });
      } else {
        const created = await prisma.image.create({
          data: {
            userId:       session.id,
            originalUrl:  imageUrl,
            generatedUrl,
            style,
            status:       'generated',
            prompt:       finalPrompt || styleConfig.prompt,
          },
        });
        savedId = created.id;
      }
    } else {
      // Guest: save under system guest user so admin bank captures it
      const guestUser = await getOrCreateGuestUser();
      const created = await prisma.image.create({
        data: {
          userId:       guestUser.id,
          originalUrl:  imageUrl,
          generatedUrl,
          style,
          status:       'guest',
          prompt:       finalPrompt || styleConfig.prompt,
        },
      });
      savedId = created.id;
    }

    // Hash = first 8 chars of the DB id (uppercase)
    const hash = savedId ? savedId.replace(/-/g, '').slice(0, 8).toUpperCase() : null;

    const res = NextResponse.json({ output: generatedUrl, style, imageId: savedId, hash });

    // Mark guest session as used
    if (!session) {
      res.cookies.set(GUEST_COOKIE, '1', {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24, // 24 hours
        sameSite: 'lax',
      });
    }

    return res;

  } catch (err) {
    console.error('[generate] error:', err.message);
    return NextResponse.json(
      { error: err?.message || 'Generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
