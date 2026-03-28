import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Returns the most-recent generated image URL for each style
export async function GET() {
  try {
    const images = await prisma.image.findMany({
      where: { generatedUrl: { not: null }, status: { not: 'guest' } },
      orderBy: { createdAt: 'desc' },
      select: { style: true, generatedUrl: true },
    });

    // Keep the first (most recent) hit per style
    const previews = {};
    for (const img of images) {
      if (img.style && !previews[img.style]) {
        previews[img.style] = img.generatedUrl;
      }
    }

    return NextResponse.json({ previews });
  } catch (err) {
    console.error('[style-previews]', err.message);
    return NextResponse.json({ previews: {} });
  }
}
