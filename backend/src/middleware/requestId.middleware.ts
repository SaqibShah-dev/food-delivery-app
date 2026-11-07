import { randomUUID } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

export const requestIdMiddleware = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = randomUUID();
  res.locals.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};
