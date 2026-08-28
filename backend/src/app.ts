import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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