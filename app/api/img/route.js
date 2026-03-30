import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req) {
  const session = await getSession();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { searchParams } = new URL(req.url);
  const imageId = searchParams.get('id');
  if (!imageId) return new NextResponse('Missing id', { status: 400 });

  const image = await prisma.image.findUnique({ where: { id: imageId } });
  if (!image?.generatedUrl) return new NextResponse('Not found', { status: 404 });

  // Fetch from S3 server-side — never expose the real URL to the browser
  const upstream = await fetch(image.generatedUrl);
  if (!upstream.ok) return new NextResponse('Upstream error', { status: 502 });

  const contentType = upstream.headers.get('content-type') || 'image/png';
  const buffer = await upstream.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'private, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
