import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { findUser } from './db';

const SECRET = process.env.JWT_SECRET!;
if (!SECRET) throw new Error('JWT_SECRET environment variable is required');

export function generateToken(payload: { username: string; role: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: '8h' });
}

export function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization header missing or malformed' });
  }
  try {
    req.user = jwt.verify(authHeader.slice(7), SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function login(username: string, password: string): Promise<string | null> {
  const user = findUser(username);
  if (user && await bcrypt.compare(password, user.passwordHash)) {
    return generateToken({ username: user.username, role: user.role });
  }
  return null;
}
