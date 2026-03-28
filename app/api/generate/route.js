import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { STYLE_PROMPTS } from '@/lib/replicate';
import { prisma } from '@/lib/prisma';
import { runGenerationPipeline } from '@/lib/generation';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { imageUrl, style, imageId } = await req.json();
    if (!imageUrl || !style) return NextResponse.json({ error: 'imageUrl and style required' }, { status: 400 });

    // ── 1-free-generation limit ──────────────────────────────────────────────
    const existingGenerations = await prisma.image.count({
      where: { userId: session.id, generatedUrl: { not: null } },
    });

    if (existingGenerations >= 1) {
      const paidOrders = await prisma.order.count({
        where: {
          userId: session.id,
          status: { in: ['paid', 'fulfilling', 'shipped', 'delivered', 'paid_printful_failed'] },
        },
      });
      if (paidOrders === 0) {
        return NextResponse.json(
          { error: 'FREE_LIMIT_REACHED' },
          { status: 403 }
        );
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

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

    if (imageId) {
      await prisma.image.update({
        where: { id: imageId },
        data:  { generatedUrl, status: 'generated', prompt: finalPrompt || styleConfig.prompt },
      });
    } else {
      await prisma.image.create({
        data: {
          userId:       session.id,
          originalUrl:  imageUrl,
          generatedUrl,
          style,
          status:       'generated',
          prompt:       finalPrompt || styleConfig.prompt,
        },
      });
    }

    return NextResponse.json({ output: generatedUrl, style });

  } catch (err) {
    console.error('[generate] error:', err.message);
    return NextResponse.json(
      { error: err?.message || 'Generation failed. Please try again.' },
      { status: 500 }
    );
  }
}
