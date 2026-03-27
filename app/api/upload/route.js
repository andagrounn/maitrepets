import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadToS3 } from '@/lib/s3';
import { prisma } from '@/lib/prisma';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const style = formData.get('style') || 'oil';

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG and WebP images are supported' }, { status: 400 });
    }

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `uploads/${session.id}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    let originalUrl;
    const isDemo = process.env.AWS_ACCESS_KEY_ID === 'demo';
    if (isDemo) {
      // Demo mode: use a placeholder URL
      originalUrl = `https://placedog.net/600/600?id=${Date.now()}`;
    } else {
      originalUrl = await uploadToS3(buffer, key, file.type);
    }

    const image = await prisma.image.create({
      data: { userId: session.id, originalUrl, style, status: 'uploaded' },
    });

    return NextResponse.json({ url: originalUrl, imageId: image.id });
  } catch (err) {
    console.error('Upload error:', err);
    const message = err?.message || 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
