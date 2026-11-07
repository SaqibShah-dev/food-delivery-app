import dotenv from 'dotenv';
import fs from 'fs/promises';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import FoodItem from '../models/FoodItem.model.js';
import User from '../models/User.model.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendDirectory = path.resolve(__dirname, '../..');

dotenv.config({ path: path.join(backendDirectory, '.env') });

const demoFoods = [
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato, mozzarella, and fresh basil.',
    price: 13.99,
    category: 'Pizza',
    image: 'seed-margherita.svg',
    color: '#f97316',
  },
  {
    name: 'Classic Beef Burger',
    description: 'Grilled beef patty with lettuce, tomato, and house sauce.',
    price: 11.49,
    category: 'Burgers',
    image: 'seed-burger.svg',
    color: '#a16207',
  },
  {
    name: 'Crispy French Fries',
    description: 'Golden, crispy fries seasoned with sea salt.',
    price: 4.99,
    category: 'Sides',
    image: 'seed-fries.svg',
    color: '#eab308',
  },
  {
    name: 'Garden Salad',
    description: 'Fresh greens, cucumber, tomato, and house vinaigrette.',
    price: 8.49,
    category: 'Salads',
    image: 'seed-salad.svg',
    color: '#16a34a',
  },
  {
    name: 'Chocolate Cake',
    description: 'Rich chocolate cake finished with a smooth cocoa glaze.',
    price: 6.99,
    category: 'Desserts',
    image: 'seed-cake.svg',
    color: '#7c3aed',
  },
] as const;

function requiredEnvironmentValue(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `${name} is required. Set it in backend/.env before running npm run seed.`
    );
  }

  return value;
}

async function writeDemoImage(
  filename: string,
  label: string,
  color: string
) {
  const imagePath = path.join(backendDirectory, 'uploads', filename);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420" viewBox="0 0 640 420"><rect width="640" height="420" fill="#fff7ed"/><circle cx="320" cy="190" r="132" fill="${color}"/><circle cx="320" cy="190" r="96" fill="#fff7ed"/><circle cx="280" cy="160" r="14" fill="${color}"/><circle cx="350" cy="155" r="14" fill="${color}"/><circle cx="320" cy="220" r="14" fill="${color}"/><text x="320" y="375" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" font-weight="700" fill="#1e293b">${label}</text></svg>`;

  await fs.writeFile(imagePath, svg, { flag: 'wx' }).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  });
}

async function seed() {
  const mongoUri = requiredEnvironmentValue('MONGO_URI');
  const adminEmail = requiredEnvironmentValue('ADMIN_EMAIL').toLowerCase();
  const adminPassword = requiredEnvironmentValue('ADMIN_PASSWORD');
  const adminName =
    process.env.ADMIN_NAME?.trim() || 'FoodFlow Admin';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) {
    throw new Error('ADMIN_EMAIL must be a valid email address.');
  }

  if (adminPassword.length < 8) {
    throw new Error('ADMIN_PASSWORD must contain at least 8 characters.');
  }

  if (
    process.env.NODE_ENV === 'production' &&
    process.env.SEED_ALLOW_PRODUCTION !== 'true'
  ) {
    throw new Error(
      'Refusing to seed production. Set SEED_ALLOW_PRODUCTION=true only if you intend to seed this database.'
    );
  }

  await fs.mkdir(path.join(backendDirectory, 'uploads'), {
    recursive: true,
  });
  await mongoose.connect(mongoUri);

  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin && existingAdmin.role !== 'admin') {
    throw new Error(
      `The email ${adminEmail} already belongs to a non-admin user. Choose a different ADMIN_EMAIL; the existing account was not changed.`
    );
  }

  if (existingAdmin) {
    console.info(`Admin account already exists: ${adminEmail}`);
  } else {
    await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    });
    console.info(`Created admin account: ${adminEmail}`);
  }

  for (const food of demoFoods) {
    await writeDemoImage(
      food.image,
      food.name,
      food.color
    );

    await FoodItem.updateOne(
      { name: food.name, category: food.category },
      {
        $set: {
          description: food.description,
          price: food.price,
          image: `/uploads/${food.image}`,
          isAvailable: true,
        },
        $setOnInsert: {
          name: food.name,
          category: food.category,
        },
      },
      { upsert: true }
    );
  }

  console.info(`Seeded ${demoFoods.length} demo food items.`);
}

seed()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
