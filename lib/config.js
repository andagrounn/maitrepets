import { prisma } from '@/lib/prisma';

const DEFAULTS = {
  ai_model: 'gpt-image-1', // 'gpt-image-1' | 'flux'
};

export async function getConfig(key) {
  try {
    const row = await prisma.config.findUnique({ where: { key } });
    return row?.value ?? DEFAULTS[key] ?? null;
  } catch {
    return DEFAULTS[key] ?? null;
  }
}
