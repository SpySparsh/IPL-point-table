import type { NextFunction, Request, Response } from 'express';
import { admin } from '../config/firebase';

export async function adminAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authorizationHeader = req.headers.authorization;

  if (!authorizationHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing bearer token' });
    return;
  }

  const token = authorizationHeader.slice('Bearer '.length).trim();

  if (!token) {
    res.status(401).json({ error: 'Unauthorized: Missing bearer token' });
    return;
  }

  try {
    await admin.auth().verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: Invalid Firebase token' });
  }
}
