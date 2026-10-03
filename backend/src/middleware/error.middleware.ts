import {
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';
import mongoose from 'mongoose';
import { ZodError, z } from 'zod';

type AppError = Error & {
  status?: number;
  statusCode?: number;
  code?: number | string;
  keyValue?: Record<string, unknown>;
};

export const errorHandler: ErrorRequestHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', err);

  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors: Record<string, string[]> | undefined;

  // Zod validation errors
  if (err instanceof ZodError) {
    status = 400;
    message = 'Validation failed';
    errors = z.flattenError(err).fieldErrors;
  }

  // Mongoose schema validation errors
  if (err instanceof mongoose.Error.ValidationError) {
    status = 400;
    message = 'Database validation failed';

    errors = Object.values(err.errors).reduce(
      (result, currentError) => {
        const field = currentError.path || 'unknown';
        result[field] = [currentError.message];
        return result;
      },
      {} as Record<string, string[]>
    );
  }

  // Invalid MongoDB ObjectId or type conversion
  if (err instanceof mongoose.Error.CastError) {
    status = 400;
    message = `Invalid value for "${err.path}"`;
  }

  // MongoDB duplicate key error, such as duplicate email
  if (err.code === 11000) {
    status = 409;

    const duplicateField = err.keyValue
      ? Object.keys(err.keyValue)[0]
      : 'field';

    message = `${duplicateField} already exists`;
  }

  // Multer: uploaded image is larger than configured maximum
  if (err.code === 'LIMIT_FILE_SIZE') {
    status = 413;
    message = 'Image file is too large. Maximum size is 5 MB';
  }

  // Multer: too many files were uploaded
  if (err.code === 'LIMIT_FILE_COUNT') {
    status = 400;
    message = 'Too many files uploaded';
  }

  // Multer: upload key does not match upload.single('image')
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    status = 400;
    message = 'Unexpected file field. Use "image" as the file field name';
  }

  // Your custom Multer fileFilter error
  if (
    err.message === 'Only JPEG, PNG, and WebP images are allowed' ||
    err.message === 'Only JPG, JPEG, PNG, and WebP image files are allowed.'
  ) {
    status = 400;
  }

  res.status(status).json({
    status,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
    }),
  });
};