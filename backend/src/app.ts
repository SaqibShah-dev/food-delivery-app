import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api', routes);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Food Ordering API is running',
  });
});

// 404 handler: must come after routes
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    status: 404,
    message: 'Route not found',
  });
});

// Error handler: must be last
app.use(errorHandler);

export default app;