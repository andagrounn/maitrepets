import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Unsplash fallback images per style — shown when no generated image exists in DB
const FALLBACKS = {
  naiveart:     'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80',
  cubism:       'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=600&q=80',
  mosaic:       'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80',
  steampunk:    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  weirdcore:    'https://images.unsplash.com/photo-1550159930-40066082a4fc?w=600&q=80',
  vernacularart:'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80',
  artinformel:  'https://images.unsplash.com/photo-1549490349-8643362247b5?w=600&q=80',
  rembrandt:    'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&q=80',
  dadaism:      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80',
  renaissance:  'https://images.unsplash.com/photo-1541512416146-3cf58d6b27cc?w=600&q=80',
  neoclassicism:'https://images.unsplash.com/photo-1588516903720-8ceb67f9ef84?w=600&q=80',
  davinci:      'https://images.unsplash.com/photo-1515405295579-ba7b45403062?w=600&q=80',
  romanticism:  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
  expressionism:'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=600&q=80',
  rococo:       'https://images.unsplash.com/photo-1604328471151-b52226907017?w=600&q=80',
};

// Returns the most-recent generated image URL for each style, falling back to Unsplash
export async function GET() {
  try {
    const images = await prisma.image.findMany({
      where: { generatedUrl: { not: null }, status: { not: 'guest' } },
      orderBy: { createdAt: 'desc' },
      select: { style: true, generatedUrl: true },
    });

    // Start with fallbacks, then override with real generated images
    const previews = { ...FALLBACKS };
    for (const img of images) {
      if (img.style && img.style in FALLBACKS) {
        previews[img.style] = img.generatedUrl;
      }
    }

    return NextResponse.json({ previews });
  } catch (err) {
    console.error('[style-previews]', err.message);
    return NextResponse.json({ previews: FALLBACKS });
  }
}
