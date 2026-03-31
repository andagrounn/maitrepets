import { getSession } from '@/lib/auth';

/**
 * Server-side admin authorization check.
 * Primary: session cookie + SUPERADMIN_EMAILS list.
 * Secondary: x-admin-key header for server-to-server automation.
 */
export async function isAdmin(req) {
  // Primary: session-based check
  const session = await getSession();
  if (session) {
    const superadminEmails = (process.env.SUPERADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim())
      .filter(Boolean);
    if (superadminEmails.length > 0 && superadminEmails.includes(session.email)) return true;
  }
  // Secondary: API key for server-to-server (never from browser)
  const key = req.headers.get('x-admin-key');
  return !!key && key === process.env.ADMIN_SECRET;
}
