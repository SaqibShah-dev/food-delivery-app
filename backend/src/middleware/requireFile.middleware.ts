import { NextFunction, Request, Response } from 'express';

export const requireFile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file) {
    return res.status(400).json({
      status: 400,
      message: 'Food image is required',
    });
  }

  next();
};