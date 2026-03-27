import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'demo',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'demo',
  },
});

export async function uploadToS3(buffer, key, contentType) {
  const cmd = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ContentLength: buffer.length,
  });
  try {
    await s3Client.send(cmd);
  } catch (err) {
    const detail = err?.message || String(err);
    console.error('[S3 upload error]', detail);
    throw new Error(`S3 upload failed: ${detail}`);
  }
  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
}

export async function getSignedDownloadUrl(key, expiresInSeconds = 3600) {
  const cmd = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="pawtrait-${key.split('/').pop()}"`,
  });
  return getSignedUrl(s3Client, cmd, { expiresIn: expiresInSeconds });
}
