import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const S3 = 'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com';
const RD = 'https://replicate.delivery/xezq';

// Generated pet portrait images per style — used until a real user-generated image exists in DB
const FALLBACKS = {
  renaissance:   `${S3}/generated/1774629784284-j1rt4wukw6.png`,
  rococo:        `${S3}/generated/1774660430180-8754kz2iw4t.png`,
  mosaic:        `${S3}/generated/1774673789483-zzvbnopfst.png`,
  cubism:        `${S3}/generated/1774643764809-ln2zqseugf8.png`,
  artinformel:   `${S3}/generated/1774629095050-xzkiul0l8fn.png`,
  vernacularart: `${S3}/generated/1774622686162-jetc92ep4u.png`,
  naiveart:      `${RD}/FPe1wHE73xSSIKm2kbKbTtTeFxify14yQJsJfz49AX4UJMUZB/tmpum6q1mkm.jpg`,
  steampunk:     `${RD}/cHfQpXb5JvwfR0lLA0s22ZR5JnZLEAgcngG1fFdTq5EcN5psA/tmpkaabssf3.jpg`,
  rembrandt:     `${RD}/VzYQixW3ed1oJCb0jMIeDZSV1saHWCTll3b6Tat2kdAXn8UWA/tmpmv_w4lzz.jpg`,
  davinci:       `${S3}/generated/1774629784284-j1rt4wukw6.png`,
  // Styles without a dedicated generated image — Unsplash fallbacks
  enhanced:      'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80',
  weirdcore:     'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=600&q=80',
  dadaism:       'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
  neoclassicism: 'https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=600&q=80',
  romanticism:   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
  expressionism: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80',
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
