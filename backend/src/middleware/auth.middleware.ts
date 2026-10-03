import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'user' | 'admin';
  };
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    const err: any = new Error('Not authorized, no token');
    err.status = 401;
    return next(err);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    ) as { id: string; role: 'user' | 'admin' };

    req.user = decoded;
    next();
  } catch {
    const err: any = new Error('Not authorized, invalid token');
    err.status = 401;
    return next(err);
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'admin') {
    const err: any = new Error('Admin access required');
    err.status = 403;
    return next(err);
  }
  next();
};