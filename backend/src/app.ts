import express, { Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', routes);

// Health check
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Food Ordering API (TypeScript)' });
});

// 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ status: 404, message: 'Route not found' });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;