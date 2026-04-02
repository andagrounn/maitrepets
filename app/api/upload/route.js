import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadToS3 } from '@/lib/s3';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function checkForHuman(buffer, mimeType) {
  // Skip check in demo mode
  if (process.env.OPENAI_API_KEY === 'demo') return false;

  try {
    const base64 = buffer.toString('base64');
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 10,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64}`, detail: 'low' },
          },
          {
            type: 'text',
            text: 'Does this image contain a human face or human body? Answer only YES or NO.',
          },
        ],
      }],
    });
    const answer = response.choices[0]?.message?.content?.trim().toUpperCase();
    return answer === 'YES';
  } catch (err) {
    console.error('[upload] human-check error — failing closed:', err.message);
    return true; // fail closed: if vision API is down, block upload to maintain ethics guard
  }
}

export async function POST(req) {
  const session = await getSession();

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

    // ── Ethics guard: block human images (runs in all modes) ──────────────
    const hasHuman = await checkForHuman(buffer, file.type);
    if (hasHuman) {
      return NextResponse.json({ error: 'HUMAN_DETECTED' }, { status: 422 });
    }
    // ──────────────────────────────────────────────────────────────────────

    const isDemo = process.env.AWS_ACCESS_KEY_ID === 'demo';
    const ownerId = session?.id || 'guest';
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(0, 100);
    const key = `uploads/${ownerId}/${Date.now()}-${safeName}`;

    let originalUrl;
    if (isDemo) {
      originalUrl = `https://placedog.net/600/600?id=${Date.now()}`;
    } else {
      originalUrl = await uploadToS3(buffer, key, file.type);
    }

    // Only persist to DB for logged-in users
    if (session) {
      const image = await prisma.image.create({
        data: { userId: session.id, originalUrl, style, status: 'uploaded' },
      });
      return NextResponse.json({ url: originalUrl, imageId: image.id });
    }

    // Guest: return URL only, no DB record
    return NextResponse.json({ url: originalUrl, imageId: null });
  } catch (err) {
    console.error('Upload error:', err);
    const message = err?.message || 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
