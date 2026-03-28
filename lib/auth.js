import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SECRET = process.env.JWT_SECRET || 'maitrepets-dev-secret-2024';

export function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '30d' });
}

export function verifyToken(token) {
  try { return jwt.verify(token, SECRET); } catch { return null; }
}

export async function getSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('maitrepets_token')?.value;
  if (!token) return null;
  return verifyToken(token);
}
