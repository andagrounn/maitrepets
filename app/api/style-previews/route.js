import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const S3 = 'https://artifyai-images-951411651703-us-east-2-an.s3.us-east-2.amazonaws.com';

// S3-hosted generated pet portraits — fallback until a real user-generated image exists in DB
const FALLBACKS = {
  enhanced:      `${S3}/generated/1775321670273-r83f6qfrgx.png`,
  naiveart:      `${S3}/generated/1775321376120-j8xoy7zjonr.png`,
  cubism:        `${S3}/generated/1775404835021-2154elbknve.png`,
  mosaic:        `${S3}/generated/1774673789483-zzvbnopfst.png`,
  steampunk:     `${S3}/generated/1774629097724-rwg1gu4usj.png`,
  weirdcore:     `${S3}/generated/1774628918481-2r2h8xe3j1g.png`,
  vernacularart: `${S3}/generated/1774622686162-jetc92ep4u.png`,
  artinformel:   `${S3}/generated/1774629095050-xzkiul0l8fn.png`,
  rembrandt:     `${S3}/generated/1774625287329-ojszvlrwi8.png`,
  dadaism:       `${S3}/generated/1774624381822-edfzusc887i.png`,
  renaissance:   `${S3}/generated/1774629784284-j1rt4wukw6.png`,
  neoclassicism: `${S3}/generated/1774622503689-ea98z9891nr.png`,
  davinci:       `${S3}/generated/1774637301839-ij88yovb95n.png`,
  romanticism:   `${S3}/generated/1775318138040-jv3wd1odcu.png`,
  expressionism: `${S3}/generated/1774643589390-xrxhk7b6cwm.png`,
  rococo:        `${S3}/generated/1774660430180-8754kz2iw4t.png`,
};

// Returns the most-recent generated image URL for each style, falling back to S3 hardcoded images
export async function GET() {
  try {
    const images = await prisma.image.findMany({
      where: { generatedUrl: { not: null }, status: { not: 'guest' } },
      orderBy: { createdAt: 'desc' },
      select: { style: true, generatedUrl: true },
    });

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
