# Development Guide

Complete guide for setting up and working with the Food Delivery App codebase.

---

## Prerequisites

### Required Software
- **Node.js** v18+ ([Download](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)
- **Git** v2.3+ ([Download](https://git-scm.com/))
- **MongoDB** v5+ ([Download](https://www.mongodb.com/try/download/community))
- **VS Code** (Recommended IDE)

### Optional Tools
- **MongoDB Compass** - GUI for MongoDB
- **Postman** - API testing
- **Git GUI** - GitKraken, GitHub Desktop
- **Docker** - For containerized development

---

## Initial Setup

### 1. Clone Repository
```bash
git clone https://github.com/username/food-delivery-app.git
cd food-delivery-app
```

### 2. Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 3. Environment Setup

**Backend (.env)**
```bash
cd backend
cat > .env << 'EOF'
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/food-delivery-app
# For MongoDB Atlas: mongodb+srv://user:password@cluster.mongodb.net/food-delivery-app

# Authentication
JWT_SECRET=dev_key_change_in_production_$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# Stripe (get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLIC_KEY=pk_test_your_key_here

# CORS & URLs
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
EOF
```

**Frontend (.env.local)**
```bash
cd ../frontend
cat > .env.local << 'EOF'
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_your_key_here
VITE_APP_NAME=Food Delivery App
EOF
```

### 4. Verify Installation
```bash
# Backend
cd backend
npm run build
npm run dev

# Frontend (new terminal)
cd frontend
npm run dev
```

Open http://localhost:5173 in your browser.

---

## Project Structure Deep Dive

### Backend (`backend/src`)

```
src/
├── app.ts                    # Express app setup, middleware configuration
├── server.ts                 # Entry point, server startup
│
├── config/
│   ├── db.ts                 # MongoDB connection logic
│   └── env.ts                # Environment variable validation
│
├── controllers/
│   ├── auth.controller.ts    # Auth request handlers
│   │   ├── register()        # New user registration
│   │   ├── login()           # User login
│   │   ├── logout()          # User logout
│   │   └── getProfile()      # Fetch user profile
│   │
│   └── food.controller.ts    # Food management handlers
│       ├── getAll()          # List all food items
│       ├── getById()         # Get single food item
│       ├── create()          # Create new food item
│       ├── update()          # Update food item
│       └── delete()          # Delete food item
│
├── middleware/
│   ├── auth.middleware.ts    # JWT verification, user extraction
│   ├── error.middleware.ts   # Global error handler
│   └── upload.middleware.ts  # File upload handling with validation
│
├── models/
│   ├── User.model.ts         # User schema definition
│   └── FoodItem.model.ts     # Food item schema definition
│
├── routes/
│   ├── auth.routes.ts        # Auth endpoint definitions
│   ├── food.routes.ts        # Food endpoint definitions
│   └── index.ts              # Route aggregator
│
├── services/
│   ├── auth.service.ts       # Auth business logic
│   │   ├── registerUser()
│   │   ├── loginUser()
│   │   └── validatePassword()
│   │
│   └── food.service.ts       # Food business logic
│       ├── getAllFoods()
│       ├── getFoodById()
│       ├── createFood()
│       ├── updateFood()
│       └── deleteFood()
│
├── types/
│   └── index.ts              # TypeScript interfaces and types
│       ├── IUser
│       ├── IFoodItem
│       ├── IOrder
│       ├── ApiResponse
│       └── Zod validation schemas
│
└── utils/
    ├── apiResponse.ts        # Standardized API response wrapper
    └── asyncHandler.ts       # Async error handling wrapper
```

### Frontend (`frontend/src`)

```
src/
├── App.tsx                   # Root component
├── main.tsx                  # React entry point
├── index.css                 # Global styles
│
├── assets/                   # Static files (images, logos, fonts)
│
├── components/
│   ├── admin/
│   │   ├── FoodManagement.tsx
│   │   ├── OrderDashboard.tsx
│   │   └── AdminPanel.tsx
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   │
│   ├── cart/
│   │   ├── Cart.tsx
│   │   ├── CartItem.tsx
│   │   └── Checkout.tsx
│   │
│   ├── common/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Loading.tsx
│   │   └── ErrorBoundary.tsx
│   │
│   ├── food/
│   │   ├── FoodList.tsx
│   │   ├── FoodCard.tsx
│   │   ├── FoodFilter.tsx
│   │   └── FoodDetail.tsx
│   │
│   └── orders/
│       ├── OrderList.tsx
│       ├── OrderCard.tsx
│       └── OrderTracking.tsx
│
├── context/
│   ├── AuthContext.tsx       # Authentication state
│   ├── CartContext.tsx       # Shopping cart state
│   └── OrderContext.tsx      # Order management state
│
├── hooks/
│   ├── useAuth.ts            # Auth utilities
│   ├── useCart.ts            # Cart utilities
│   └── useFetch.ts           # Data fetching hook
│
├── pages/
│   ├── HomePage.tsx          # Home/landing page
│   ├── ProfilePage.tsx       # User profile
│   ├── OrdersPage.tsx        # Order history
│   ├── AdminPage.tsx         # Admin dashboard
│   └── NotFoundPage.tsx      # 404 page
│
├── services/
│   ├── api.ts                # Axios instance, base config
│   ├── authService.ts        # Auth API calls
│   ├── foodService.ts        # Food API calls
│   ├── orderService.ts       # Order API calls
│   └── paymentService.ts     # Stripe integration
│
├── types/
│   ├── index.ts              # TypeScript interfaces
│   ├── user.ts               # User types
│   ├── food.ts               # Food types
│   └── order.ts              # Order types
│
└── utils/
    ├── constants.ts          # App constants
    ├── helpers.ts            # Utility functions
    └── validators.ts         # Form validation
```

---

## Running the Application

### Development Mode

**Terminal 1 - MongoDB**
```bash
mongod
# or if using MongoDB Atlas, skip this
```

**Terminal 2 - Backend**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
# Auto-reloads on file changes with nodemon
```

**Terminal 3 - Frontend**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
# Uses Vite for fast HMR (Hot Module Replacement)
```

### Production Mode

**Build Backend**
```bash
cd backend
npm run build      # Compiles TypeScript to JavaScript
npm start          # Runs compiled code
```

**Build Frontend**
```bash
cd frontend
npm run build      # Creates optimized build in dist/
npm preview        # Preview production build locally
```

---

## Code Style & Conventions

### TypeScript Best Practices

**1. Always Use Strict Types**
```typescript
// ❌ Bad
const user = {} as any;
function getData(data: any) { }

// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}
const user: User = { id: '1', name: 'John', email: 'john@example.com' };
function getData(data: IUser): void { }
```

**2. Use Union Types Instead of Any**
```typescript
// ❌ Bad
function process(value: any): any { }

// ✅ Good
type Status = 'pending' | 'success' | 'error';
function process(value: Status): Promise<string> { }
```

**3. Proper Error Handling**
```typescript
// ❌ Bad
async function fetchUser(id: string) {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}

// ✅ Good
async function fetchUser(id: string): Promise<User> {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json() as User;
  } catch (error) {
    logger.error('Failed to fetch user:', error);
    throw new Error('Unable to fetch user data');
  }
}
```

### Naming Conventions

```typescript
// Constants - UPPER_SNAKE_CASE
const MAX_UPLOAD_SIZE = 5242880;
const API_TIMEOUT = 30000;

// Variables & Functions - camelCase
const userName = 'John';
function getUserById(id: string) { }

// Classes & Interfaces - PascalCase
class UserService { }
interface IUser { }
type UserType = { name: string };

// React Components - PascalCase
function UserProfile() { }
export const UserCard: React.FC<Props> = () => { };

// Private functions - _camelCase (optional)
function _calculateTotal(items: Item[]): number { }
```

### Comments

```typescript
// Good: Explains WHY, not WHAT
// Cache user data for 5 minutes to avoid redundant API calls
const cachedUser = cache.get(userId) || await fetchUser(userId);

// Avoid: Obvious comments
// Get the user
const user = await fetchUser(userId);

// Good: Document complex logic
/**
 * Merges cart items, combining quantities for duplicate items
 * @param existingCart - Current cart state
 * @param newItems - Items to add
 * @returns Merged cart with updated quantities
 */
function mergeCartItems(existingCart: CartItem[], newItems: CartItem[]): CartItem[] { }
```

---

## Common Development Tasks

### Adding a New API Endpoint

1. **Create the Model** (`backend/src/models/`)
```typescript
import { Schema, model } from 'mongoose';

const FoodSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: String,
  image: String,
  createdAt: { type: Date, default: Date.now }
});

export const Food = model('Food', FoodSchema);
```

2. **Create Validation Schema** (`backend/src/types/`)
```typescript
import { z } from 'zod';

export const createFoodSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Price must be positive'),
  category: z.string().optional()
});

export type CreateFoodInput = z.infer<typeof createFoodSchema>;
```

3. **Create Service** (`backend/src/services/`)
```typescript
export async function createFood(data: CreateFoodInput): Promise<IFood> {
  const food = new Food(data);
  return await food.save();
}
```

4. **Create Controller** (`backend/src/controllers/`)
```typescript
export const create = asyncHandler(async (req, res) => {
  const validatedData = createFoodSchema.parse(req.body);
  const food = await foodService.createFood(validatedData);
  res.status(201).json(new ApiResponse(201, food, 'Food created'));
});
```

5. **Define Route** (`backend/src/routes/`)
```typescript
router.post('/', verifyJWT, adminOnly, create);
```

6. **Add to Router Index** (`backend/src/routes/index.ts`)
```typescript
app.use('/api/food', foodRoutes);
```

### Adding a New Frontend Component

1. **Create Component File**
```bash
# Create file
touch src/components/food/FoodCard.tsx

# Create styles
touch src/components/food/FoodCard.module.css
```

2. **Write Component**
```typescript
import styles from './FoodCard.module.css';
import { IFood } from '../../types/food';

interface FoodCardProps {
  food: IFood;
  onAddToCart: (foodId: string) => void;
}

export const FoodCard: React.FC<FoodCardProps> = ({ food, onAddToCart }) => {
  return (
    <div className={styles.card}>
      <img src={food.image} alt={food.name} />
      <h3>{food.name}</h3>
      <p>${food.price}</p>
      <button onClick={() => onAddToCart(food.id)}>Add to Cart</button>
    </div>
  );
};
```

3. **Add Styles**
```css
.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 4px;
}
```

4. **Export from Index**
```typescript
// components/food/index.ts
export { FoodCard } from './FoodCard';
```

5. **Use in Parent Component**
```typescript
import { FoodCard } from '../components/food';

function FoodList() {
  return (
    <div>
      {foods.map(food => (
        <FoodCard 
          key={food.id} 
          food={food}
          onAddToCart={handleAddToCart}
        />
      ))}
    </div>
  );
}
```

---

## Debugging

### Backend Debugging

**VS Code Debug Configuration** (`.vscode/launch.json`)
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Backend",
      "program": "${workspaceFolder}/backend/src/server.ts",
      "restart": true,
      "runtimeArgs": ["--loader", "tsx"],
      "console": "integratedTerminal"
    }
  ]
}
```

**Console Logging**
```typescript
// Debug variables
console.log('User data:', user);
console.table(users);  // Better for arrays/objects

// Error logging
console.error('Error:', error.message);
console.warn('Warning:', deprecatedFunction);
```

### Frontend Debugging

**React Developer Tools**
- Install [React DevTools](https://react.dev/learn/react-developer-tools) browser extension
- Inspect component state and props
- Profile component render performance

**Console Debugging**
```typescript
// Debug state changes
const [count, setCount] = useState(0);
useEffect(() => {
  console.log('Count updated:', count);
}, [count]);
```

---

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test auth.service.test.ts

# Generate coverage report
npm test -- --coverage
```

**Example Test**
```typescript
describe('AuthService', () => {
  it('should hash password correctly', async () => {
    const password = 'testPassword123';
    const hashedPassword = await hashPassword(password);
    
    expect(hashedPassword).not.toBe(password);
    expect(await comparePassword(password, hashedPassword)).toBe(true);
  });

  it('should throw error for invalid credentials', async () => {
    await expect(loginUser('wrong@email.com', 'wrongPassword'))
      .rejects.toThrow('Invalid credentials');
  });
});
```

### Frontend Testing

```bash
cd frontend

# Run tests
npm test

# Run with coverage
npm test -- --coverage
```

---

## Performance Optimization

### Backend
- Add database indexes on frequently queried fields
- Implement caching for static data
- Use pagination for large datasets
- Optimize database queries with projections

### Frontend
- Lazy load components with `React.lazy()`
- Optimize images and assets
- Use `React.memo` for expensive components
- Implement virtual scrolling for large lists
- Split code bundles with dynamic imports

---

## Git Workflow

### Feature Development
```bash
# Create feature branch
git checkout -b feature/user-authentication

# Make changes and commit
git add .
git commit -m "feat(auth): implement JWT authentication"

# Push branch
git push origin feature/user-authentication

# Create Pull Request (via GitHub UI)
```

### Keeping Branch Updated
```bash
# Fetch latest changes
git fetch origin

# Rebase on main
git rebase origin/main

# Or merge if prefer
git merge origin/main
```

---

## Useful Commands Reference

```bash
# Backend
cd backend
npm install              # Install dependencies
npm run dev              # Start development server
npm run build            # Compile TypeScript
npm start                # Run production build
npm test                 # Run tests
npm run lint             # Check linting issues

# Frontend
cd frontend
npm install              # Install dependencies
npm run dev              # Start dev server with HMR
npm run build            # Create production build
npm preview              # Preview production build
npm run lint             # Check linting issues
npm run format           # Format code

# Git
git status               # Check status
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push origin branch   # Push to remote
git pull origin main     # Pull latest changes
git branch -a            # List all branches
git checkout -b feature  # Create new branch
```

---

## Troubleshooting Development Issues

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Dependencies Issue
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Compilation Error
```bash
# Clear build cache
rm -rf dist
npm run build
```

### Vite HMR Not Working
- Check Vite config is correct
- Restart dev server
- Clear browser cache

---

## Need Help?

- Check existing GitHub issues
- Review project documentation
- Ask in development team chat
- Create a detailed GitHub issue

---
