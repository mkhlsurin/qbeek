import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';                   // <-- default import
import type { JwtPayload, Secret } from 'jsonwebtoken';
import { env } from '../config/env.js';

export function authJwt(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const { verify } = jwt; 
    const token = header.slice(7);
    const decoded = verify(token, env.JWT_ACCESS_SECRET as Secret) as JwtPayload;

    const sub = decoded.sub;
    const role = (decoded as any).role;

    if (typeof sub !== 'string' || (role !== 'Admin' && role !== 'Manager')) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    req.user = { id: sub, role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
