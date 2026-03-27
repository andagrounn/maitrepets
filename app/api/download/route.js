import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getSignedDownloadUrl } from '@/lib/s3';

export async function GET(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  if (!orderId) return NextResponse.json({ error: 'orderId required' }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { image: true },
  });

  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  if (order.userId !== session.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  if (!order.digitalCopy) return NextResponse.json({ error: 'No digital copy on this order' }, { status: 403 });
  if (!['paid', 'fulfilling', 'fulfilled'].includes(order.status)) {
    return NextResponse.json({ error: 'Payment not confirmed' }, { status: 402 });
  }

  const imageUrl = order.image?.generatedUrl;
  if (!imageUrl) return NextResponse.json({ error: 'Image not found' }, { status: 404 });

  // Extract S3 key from URL, or redirect directly if not an S3 URL
  const s3Bucket = process.env.S3_BUCKET;
  const isS3 = s3Bucket && imageUrl.includes(s3Bucket);

  if (isS3) {
    const key = imageUrl.split('.amazonaws.com/')[1];
    const signedUrl = await getSignedDownloadUrl(key, 3600); // 1hr expiry
    return NextResponse.redirect(signedUrl);
  }

  // Fallback: redirect directly to the image URL with download headers
  return NextResponse.redirect(imageUrl);
}
