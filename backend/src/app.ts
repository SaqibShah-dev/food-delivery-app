import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';

import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { env } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers
app.use(helmet());

// Allow browser requests only from your frontend URL
app.use(
  cors({
    origin: env.CLIENT_URL,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Reject JSON bodies larger than 100 KB
app.use(express.json({ limit: '100kb' }));

// Serve locally uploaded food images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate-limit all API requests, then register API routes
app.use('/api', apiLimiter, routes);

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Food Ordering API is running',
  });
});

// 404 handler: must be after every route
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 404,
    message: 'Route not found',
  });
});

// Error handler: must be the final middleware
app.use(errorHandler);

export default app;