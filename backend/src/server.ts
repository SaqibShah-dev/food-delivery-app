import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';

const PORT = Number(env.PORT);

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
};

start();