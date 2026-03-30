import { prisma } from '@/lib/prisma';

/**
 * Writes a log entry to the DB and mirrors it to console.
 * meta: any serialisable object for extra context (orderId, userId, etc.)
 */
async function write(level, source, message, meta = null) {
  const metaStr = meta ? JSON.stringify(meta) : null;
  if (level === 'error') console.error(`[${source}] ${message}`, meta || '');
  else if (level === 'warn') console.warn(`[${source}] ${message}`, meta || '');
  else console.log(`[${source}] ${message}`, meta || '');

  try {
    await prisma.log.create({ data: { level, source, message, meta: metaStr } });
  } catch {
    // never let logging break the caller
  }
}

export const logger = {
  info:  (source, message, meta) => write('info',  source, message, meta),
  warn:  (source, message, meta) => write('warn',  source, message, meta),
  error: (source, message, meta) => write('error', source, message, meta),
};
