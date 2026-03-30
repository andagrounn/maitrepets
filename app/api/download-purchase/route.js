import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { getSignedDownloadUrl } from '@/lib/s3';

const DOWNLOAD_PRICE = 12;

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { imageId } = await req.json();
    if (!imageId) return NextResponse.json({ error: 'imageId required' }, { status: 400 });

    const superadminEmails = (process.env.SUPERADMIN_EMAILS || '').split(',').map(e => e.trim());
    const isSuperAdmin = superadminEmails.includes(session.email);

    const image = await prisma.image.findUnique({ where: { id: imageId } });
    if (!image) return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    if (!isSuperAdmin && image.userId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (!image.generatedUrl) return NextResponse.json({ error: 'Image not generated yet' }, { status: 400 });

    // Superadmin gets free instant download
    if (isSuperAdmin) {
      const s3Bucket = process.env.S3_BUCKET;
      const isS3     = s3Bucket && image.generatedUrl.includes(s3Bucket);
      if (isS3) {
        const key       = image.generatedUrl.split('.amazonaws.com/')[1];
        const signedUrl = await getSignedDownloadUrl(key, 3600);
        return NextResponse.json({ url: signedUrl, free: true });
      }
      return NextResponse.json({ url: image.generatedUrl, free: true });
    }

    // Check if user already has a paid digital copy for this image — give free download
    const existing = await prisma.order.findFirst({
      where: { imageId, digitalCopy: true, status: { in: ['paid', 'fulfilling', 'fulfilled', 'shipped'] } },
    });
    if (existing) {
      const s3Bucket = process.env.S3_BUCKET;
      const isS3     = s3Bucket && image.generatedUrl.includes(s3Bucket);
      if (isS3) {
        const key       = image.generatedUrl.split('.amazonaws.com/')[1];
        const signedUrl = await getSignedDownloadUrl(key, 3600);
        return NextResponse.json({ url: signedUrl, free: true });
      }
      return NextResponse.json({ url: image.generatedUrl, free: true });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const isDemo  = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_demo';

    // Create a minimal "digital only" order record
    const order = await prisma.order.create({
      data: {
        userId:      session.id,
        imageId,
        productType: 'digital',
        size:        'digital',
        price:       DOWNLOAD_PRICE,
        status:      'pending',
        digitalCopy: true,
      },
    });

    if (isDemo) {
      await prisma.order.update({ where: { id: order.id }, data: { status: 'paid' } });
      const s3Bucket = process.env.S3_BUCKET;
      const isS3     = s3Bucket && image.generatedUrl.includes(s3Bucket);
      let downloadUrl = image.generatedUrl;
      if (isS3) {
        const key = image.generatedUrl.split('.amazonaws.com/')[1];
        downloadUrl = await getSignedDownloadUrl(key, 3600);
      }
      return NextResponse.json({ url: downloadUrl, free: false });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency:     'usd',
          product_data: {
            name:        'HD Digital Copy — Maîtrepets',
            description: 'Full-resolution PNG download of your AI pet portrait',
            images:      [image.generatedUrl],
          },
          unit_amount: DOWNLOAD_PRICE * 100,
        },
        quantity: 1,
      }],
      mode:        'payment',
      success_url: `${baseUrl}/success?order=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${baseUrl}/dashboard`,
      metadata:    { orderId: order.id, type: 'digital' },
    });

    await prisma.order.update({ where: { id: order.id }, data: { stripeId: checkoutSession.id } });
    return NextResponse.json({ url: checkoutSession.url });

  } catch (err) {
    console.error('[download-purchase] error:', err);
    return NextResponse.json({ error: err.message || 'Purchase failed' }, { status: 500 });
  }
}
