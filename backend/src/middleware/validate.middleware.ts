import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';

export const validateBody =
  <TSchema extends z.ZodTypeAny>(schema: TSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const formattedErrors = z.flattenError(result.error);

      return res.status(400).json({
        status: 400,
        message: 'Validation failed',
        errors: formattedErrors.fieldErrors,
      });
    }

    req.body = result.data;
    next();
  };