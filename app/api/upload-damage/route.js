import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { uploadToS3 } from '@/lib/s3';

export async function POST(req) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) return NextResponse.json({ error: 'Only JPEG, PNG and WebP allowed' }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `damage-evidence/${session.id}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    const isDemo = process.env.AWS_ACCESS_KEY_ID === 'demo' || !process.env.AWS_ACCESS_KEY_ID;
    const url = isDemo
      ? `https://placedog.net/400/400?id=${Date.now()}`
      : await uploadToS3(buffer, key, file.type);

    return NextResponse.json({ url });
  } catch (err) {
    console.error('[upload-damage] error:', err);
    return NextResponse.json({ error: err.message || 'Upload failed' }, { status: 500 });
  }
}
