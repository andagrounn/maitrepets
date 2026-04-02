import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { PRODUCT_VARIANTS } from '@/lib/printful';
import { STYLE_PROMPTS } from '@/lib/replicate';
import { runGenerationPipeline, pickRandomStyle } from '@/lib/generation';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { sessionId, originalOrderId, demo } = await req.json();

    // ── Demo mode ──────────────────────────────────────────────────────────────
    if (demo) {
      // Idempotency: return existing upsell image if already generated for this order
      const existing = await prisma.image.findFirst({
        where: { prompt: { contains: `[upsell-demo:${originalOrderId}]` } },
        include: { orders: { take: 1, orderBy: { createdAt: 'desc' } } },
      });
      if (existing) {
        return NextResponse.json({
          ok: true,
          generatedUrl: existing.generatedUrl,
          surpriseStyle: existing.style,
          styleLabel: STYLE_PROMPTS[existing.style]?.label,
          styleEmoji: STYLE_PROMPTS[existing.style]?.emoji,
          imageId: existing.id,
          newOrderId: existing.orders[0]?.id || null,
        });
      }

      const originalOrder = await prisma.order.findUnique({
        where: { id: originalOrderId },
        include: { image: true },
      });
      if (!originalOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
      if (originalOrder.userId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

      const surpriseStyle = pickRandomStyle(originalOrder.image?.style);
      const imageUrl      = originalOrder.image?.originalUrl;

      const { generatedUrl, finalPrompt } = await runGenerationPipeline(imageUrl, surpriseStyle);

      const newImage = await prisma.image.create({
        data: {
          userId:       session.id,
          originalUrl:  imageUrl,
          generatedUrl,
          style:        surpriseStyle,
          status:       'generated',
          prompt:       `${finalPrompt} [upsell-demo:${originalOrderId}]`,
        },
      });

      const product  = PRODUCT_VARIANTS[originalOrder.productType] ?? PRODUCT_VARIANTS['poster-16x20'];
      const newOrder = await prisma.order.create({
        data: {
          userId:          session.id,
          imageId:         newImage.id,
          productType:     originalOrder.productType,
          size:            originalOrder.size,
          price:           product.price,
          status:          'paid',
          shippingName:    originalOrder.shippingName,
          shippingAddress: originalOrder.shippingAddress,
          shippingAddress2:originalOrder.shippingAddress2,
          shippingCity:    originalOrder.shippingCity,
          shippingState:   originalOrder.shippingState,
          shippingZip:     originalOrder.shippingZip,
          shippingCountry: originalOrder.shippingCountry,
          shippingPhone:   originalOrder.shippingPhone,
          shippingMethod:  originalOrder.shippingMethod,
        },
      });
      return NextResponse.json({
        ok:           true,
        generatedUrl,
        surpriseStyle,
        styleLabel:   STYLE_PROMPTS[surpriseStyle]?.label,
        styleEmoji:   STYLE_PROMPTS[surpriseStyle]?.emoji,
        imageId:      newImage.id,
        newOrderId:   newOrder.id,
      });
    }

    // ── Stripe verification ────────────────────────────────────────────────────
    if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

    const stripeSession = await stripe.checkout.sessions.retrieve(sessionId);
    if (stripeSession.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 402 });
    }

    const meta = stripeSession.metadata || {};
    const imageId     = meta.imageId     || null;
    const originalUrl = meta.originalUrl || null;
    const currentStyle = meta.currentStyle || null;
    const origOrderId  = meta.originalOrderId || originalOrderId;

    // Idempotency — if already generated for this Stripe session, return cached result
    const existingImage = await prisma.image.findFirst({
      where: { prompt: { contains: stripeSession.id } },
      include: { orders: { take: 1, orderBy: { createdAt: 'desc' } } },
    });
    if (existingImage) {
      return NextResponse.json({
        ok:           true,
        generatedUrl: existingImage.generatedUrl,
        surpriseStyle: existingImage.style,
        styleLabel:   STYLE_PROMPTS[existingImage.style]?.label,
        styleEmoji:   STYLE_PROMPTS[existingImage.style]?.emoji,
        imageId:      existingImage.id,
        newOrderId:   existingImage.orders[0]?.id || null,
      });
    }

    // Look up original order for shipping details
    const originalOrder = origOrderId
      ? await prisma.order.findUnique({ where: { id: origOrderId } })
      : null;

    const sourceUrl = originalUrl || (
      imageId ? (await prisma.image.findUnique({ where: { id: imageId } }))?.originalUrl : null
    );

    if (!sourceUrl) return NextResponse.json({ error: 'Original image not found' }, { status: 404 });

    // Pick a random DIFFERENT style — this is the surprise
    const surpriseStyle = pickRandomStyle(currentStyle);
    console.log(`[upsell] surprise style: ${surpriseStyle} (was: ${currentStyle})`);

    const { generatedUrl, finalPrompt } = await runGenerationPipeline(sourceUrl, surpriseStyle);

    // Save new image record (embed stripeSession.id in prompt for idempotency)
    const newImage = await prisma.image.create({
      data: {
        userId:       session.id,
        originalUrl:  sourceUrl,
        generatedUrl,
        style:        surpriseStyle,
        status:       'generated',
        prompt:       `${finalPrompt} [upsell:${stripeSession.id}]`,
      },
    });

    // Create order record (not auto-fulfilled — user chooses to order print separately)
    const upsellProductType = originalOrder?.productType || 'poster-16x20';
    const upsellProduct = PRODUCT_VARIANTS[upsellProductType] ?? PRODUCT_VARIANTS['poster-16x20'];
    const newOrder = await prisma.order.create({
      data: {
        userId:          session.id,
        imageId:         newImage.id,
        productType:     upsellProductType,
        size:            originalOrder?.size         || '16x20',
        price:           upsellProduct.price,
        status:          'paid',
        stripeId:        sessionId,
        shippingName:    originalOrder?.shippingName    || null,
        shippingAddress: originalOrder?.shippingAddress || null,
        shippingAddress2:originalOrder?.shippingAddress2 || null,
        shippingCity:    originalOrder?.shippingCity    || null,
        shippingState:   originalOrder?.shippingState   || null,
        shippingZip:     originalOrder?.shippingZip     || null,
        shippingCountry: originalOrder?.shippingCountry || 'US',
        shippingPhone:   originalOrder?.shippingPhone   || null,
        shippingMethod:  originalOrder?.shippingMethod  || 'STANDARD',
      },
    });

    return NextResponse.json({
      ok:           true,
      generatedUrl,
      surpriseStyle,
      styleLabel:   STYLE_PROMPTS[surpriseStyle]?.label,
      styleEmoji:   STYLE_PROMPTS[surpriseStyle]?.emoji,
      imageId:      newImage.id,
      newOrderId:   newOrder.id,
    });

  } catch (err) {
    console.error('[upsell-confirm] error:', err);
    return NextResponse.json({ error: err.message || 'Upsell confirm failed' }, { status: 500 });
  }
}
