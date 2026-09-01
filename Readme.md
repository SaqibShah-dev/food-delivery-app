#  Food Delivery App

A full-stack food delivery application built with modern web technologies. This project features a robust backend API and an interactive frontend for managing food orders, user authentication, and payment processing.

---

##  Features

- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **Food Management**: Browse, search, and filter food items
- **Shopping Cart**: Add items to cart and manage orders
- **Admin Dashboard**: Manage food items, view orders, and track deliveries
- **Payment Integration**: Stripe integration for secure payment processing
- **File Uploads**: Image upload support for food items
- **Order Management**: Track and manage food orders with real-time updates
- **Role-Based Access Control**: Different features for users and admins

---

##  Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js 5.x
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: bcryptjs for password hashing
- **Payments**: Stripe API integration
- **File Uploads**: Multer
- **Validation**: Zod schema validation
- **Development**: Nodemon, tsx

### Frontend
- **Framework**: React 19.x
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: CSS modules and plain CSS
- **Linting**: ESLint with TypeScript support
- **UI Organization**: Component-based architecture (Admin, Cart, Food, Orders)

---

##  Project Structure

```
food-delivery-app/
├── backend/
│   ├── src/
│   │   ├── app.ts                    # Express app configuration
│   │   ├── server.ts                 # Server entry point
│   │   ├── config/
│   │   │   ├── db.ts                 # MongoDB connection
│   │   │   └── env.ts                # Environment variables setup
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts    # Authentication logic
│   │   │   └── food.controller.ts    # Food management logic
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts    # JWT verification middleware
│   │   │   ├── error.middleware.ts   # Error handling middleware
│   │   │   └── upload.middleware.ts  # File upload middleware
│   │   ├── models/
│   │   │   ├── User.model.ts         # User schema and model
│   │   │   └── FoodItem.model.ts     # Food item schema and model
│   │   ├── routes/
│   │   │   ├── auth.routes.ts        # Authentication routes
│   │   │   ├── food.routes.ts        # Food management routes
│   │   │   └── index.ts              # Route aggregator
│   │   ├── services/
│   │   │   ├── auth.service.ts       # Authentication business logic
│   │   │   └── food.service.ts       # Food management business logic
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript type definitions
│   │   ├── utils/
│   │   │   ├── apiResponse.ts        # Standardized API response format
│   │   │   └── asyncHandler.ts       # Async error handling wrapper
│   │   └── tests/                    # Test files
│   ├── uploads/                      # Uploaded files directory
│   ├── package.json
│   ├── tsconfig.json
│   └── dist/                         # Compiled JavaScript output
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx                   # Main App component
│   │   ├── main.tsx                  # React entry point
│   │   ├── App.css                   # Global app styles
│   │   ├── index.css                 # Global styles
│   │   ├── assets/                   # Static assets
│   │   ├── components/
│   │   │   ├── admin/                # Admin panel components
│   │   │   ├── cart/                 # Shopping cart components
│   │   │   ├── common/               # Shared UI components
│   │   │   ├── food/                 # Food display components
│   │   │   └── orders/               # Order management components
│   │   ├── context/                  # React Context API state management
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── pages/                    # Page components
│   │   ├── services/                 # API services and utilities
│   │   ├── types/                    # TypeScript type definitions
│   │   └── utils/                    # Helper utilities
│   ├── public/                       # Public static files
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── eslint.config.js
│   ├── index.html
│   └── dist/                         # Build output
│
└── Readme.md                         # Project documentation
```

---

##  Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git**

---

##  Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd food-delivery-app
```

### 2. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
npm install
```

Create a `.env` file in the `backend` directory with the following variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/food-delivery
# or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/food-delivery

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Frontend URL
CLIENT_URL=http://localhost:5173
```

Build the TypeScript code:
```bash
npm run build
```

### 3. Frontend Setup

Navigate to the frontend directory:
```bash
cd frontend
```

Install dependencies:
```bash
npm install
```

The frontend will use the environment configuration from Vite. By default, it connects to `http://localhost:5000` for API requests. You can customize this in the `src/services` configuration file.

---

##  Running the Project

### Development Mode

**Terminal 1 - Start the Backend:**
```bash
cd backend
npm run dev
```
The backend server will start on `http://localhost:5000`

**Terminal 2 - Start the Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will start on `http://localhost:5173`

### Production Mode

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm preview
```

---

##  Code Quality

### Linting
```bash
cd frontend
npm run lint
```

### Building
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

---

##  API Endpoints Overview

### Authentication Routes
- **`POST /api/auth/register`** - Register a new user
  ```json
  Request: { "email": "user@example.com", "password": "password123", "name": "John Doe" }
  Response: { "message": "User registered successfully", "user": { "id": "...", "email": "..." } }
  ```
- **`POST /api/auth/login`** - Login user
  ```json
  Request: { "email": "user@example.com", "password": "password123" }
  Response: { "token": "jwt_token", "user": { "id": "...", "role": "user" } }
  ```
- **`POST /api/auth/logout`** - Logout user (clears token)
- **`GET /api/auth/profile`** - Get user profile (requires JWT token)

### Food Routes
- **`GET /api/food`** - Get all food items (supports pagination & filtering)
  ```json
  Response: { "data": [{ "id": "...", "name": "Pizza", "price": 15.99, "image": "..." }], "total": 50 }
  ```
- **`GET /api/food/:id`** - Get specific food item details
- **`POST /api/food`** - Create food item (admin only)
  ```json
  Request: { "name": "Burger", "description": "Delicious burger", "price": 8.99, "category": "fast-food" }
  ```
- **`PUT /api/food/:id`** - Update food item (admin only)
- **`DELETE /api/food/:id`** - Delete food item (admin only)
- **`POST /api/food/upload`** - Upload food image (multipart/form-data)

### Order Routes
- **`POST /api/orders`** - Create new order
  ```json
  Request: { "items": [{ "foodId": "...", "quantity": 2, "price": 15.99 }], "totalAmount": 31.98 }
  Response: { "orderId": "...", "status": "pending" }
  ```
- **`GET /api/orders`** - Get all orders for logged-in user
- **`GET /api/orders/:id`** - Get specific order details
- **`PUT /api/orders/:id`** - Update order status (admin)
  ```json
  Request: { "status": "delivered" }
  ```

### Payment Routes
- **`POST /api/payments/create-intent`** - Create Stripe payment intent
  ```json
  Request: { "amount": 3198, "orderId": "..." }
  Response: { "clientSecret": "...", "status": "requires_payment_method" }
  ```

---

##  Database Schema

### User Model
```typescript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (bcrypt hashed),
  phone: String,
  role: "user" | "admin" (default: "user"),
  address: String,
  profileImage: String (URL),
  createdAt: Date,
  updatedAt: Date
}
```

### FoodItem Model
```typescript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  price: Number (required),
  image: String (URL),
  category: String,
  isAvailable: Boolean (default: true),
  rating: Number (0-5),
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model (if tracking orders)
```typescript
{
  _id: ObjectId,
  userId: ObjectId (reference to User),
  items: [{ foodId: ObjectId, quantity: Number, price: Number }],
  totalAmount: Number,
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered",
  shippingAddress: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

##  Authentication & Security

### JWT Flow
1. User registers/logs in with credentials
2. Backend validates credentials and generates JWT token
3. Client stores token (typically in localStorage or sessionStorage)
4. Client sends token in `Authorization: Bearer <token>` header
5. Middleware verifies token on protected routes
6. Token expires after configured duration (default: 7 days)

### Security Best Practices
- Passwords are hashed using bcryptjs (salt rounds: 10)
- JWT secrets should be strong and unique in production
- CORS is configured to only accept requests from allowed origins
- Input validation is performed using Zod schema validation
- Environment variables are used for sensitive configuration

---

##  Development Guidelines

### Coding Standards
- Use **TypeScript** for type safety
- Follow **ESLint** configuration rules
- Use **Async/Await** for asynchronous operations
- Implement error handling with try-catch blocks
- Use middleware for cross-cutting concerns

### File Organization
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and data manipulation
- **Routes**: Define API endpoints and link to controllers
- **Middleware**: Handle authentication, validation, error handling
- **Models**: Define database schemas and queries
- **Utils**: Reusable helper functions and constants

### Component Structure (Frontend)
- **Pages**: Full page components (Home, Profile, etc.)
- **Components**: Reusable UI components organized by feature
- **Context**: Global state management using React Context API
- **Hooks**: Custom React hooks for shared logic
- **Services**: API client and helper functions

---

##  Middleware Overview

### Authentication Middleware (`auth.middleware.ts`)
- Verifies JWT tokens in the Authorization header
- Attaches user information to request object
- Protects routes that require authentication

### Error Middleware (`error.middleware.ts`)
- Catches all application errors
- Formats error responses consistently
- Logs errors for debugging

### Upload Middleware (`upload.middleware.ts`)
- Handles file upload validation
- Stores uploaded files in `backend/uploads` directory
- Supports image uploads for food items

---

##  Testing

The `backend/tests` directory contains test files for API endpoints and business logic.

### Running Tests
```bash
cd backend
npm test
```

### Test Structure
- Unit tests for services and utilities
- Integration tests for API endpoints
- Mock data and test databases for isolation

---

## Environment Variables Reference

### Backend `.env`
```env
# Server
PORT=5000
NODE_ENV=development|production

# Database
MONGO_URI=mongodb://localhost:27017/food-delivery

# JWT
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_PUBLIC_KEY=pk_test_xxx

# CORS
CLIENT_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,https://yourdomain.com

# File Upload
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes
```

### Frontend Configuration
The frontend uses Vite's environment variables. Create `.env.local`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_xxx
```

---

##  Docker Setup (Optional)

### Build Docker Images
```bash
# Backend
cd backend
docker build -t food-delivery-backend .

# Frontend
cd frontend
docker build -t food-delivery-frontend .
```

### Run with Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
```

---

##  Deployment Guide

### Deploying Backend
1. Build the application: `npm run build`
2. Set production environment variables
3. Start with: `npm start`
4. Use process manager like PM2 or systemd

### Deploying Frontend
1. Build the production bundle: `npm run build`
2. Deploy `dist` folder to static hosting (Vercel, Netlify, GitHub Pages)
3. Configure API endpoint to point to production backend

### Platform-Specific Guides
- **AWS**: Deploy backend to EC2/Lambda, frontend to S3+CloudFront
- **Heroku**: Use Procfile for automatic deployment
- **Railway/Render**: Connect GitHub repo for auto-deployment
- **Vercel**: Recommended for Next.js-style frontend deployment

---

##  Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit your changes: `git commit -m 'Add amazing feature'`
3. Push to the branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

##  Additional Resources

### Documentation Links
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Mongoose Guide](https://mongoosejs.com/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [JWT.io Introduction](https://jwt.io/introduction)

### Useful Tools
- [Postman](https://www.postman.com/) - API testing
- [MongoDB Compass](https://www.mongodb.com/products/compass) - Database GUI
- [VS Code](https://code.visualstudio.com/) - Recommended IDE
- [Git](https://git-scm.com/) - Version control

---

##  Support & Contact

For issues, questions, or contributions:
1. Check the Troubleshooting section above
2. Review existing GitHub issues
3. Create a new issue with detailed information
4. Submit a Pull Request with improvements

---

This project is licensed under the ISC License - see the LICENSE file for details.

---

---

##  Dependencies Overview

### Backend Key Dependencies
| Package | Purpose | Version |
|---------|---------|---------|
| `express` | Web framework | 5.x |
| `mongoose` | MongoDB ODM | Latest |
| `jsonwebtoken` | JWT authentication | Latest |
| `bcryptjs` | Password hashing | Latest |
| `zod` | Schema validation | Latest |
| `multer` | File upload handling | Latest |
| `stripe` | Payment processing | Latest |
| `nodemon` | Development hot-reload | Dev |
| `tsx` | TypeScript executor | Dev |

### Frontend Key Dependencies
| Package | Purpose | Version |
|---------|---------|---------|
| `react` | UI library | 19.x |
| `typescript` | Type safety | Latest |
| `vite` | Build tool | Latest |
| `eslint` | Code linting | Latest |

---

##  Quick Start Guide

### Fastest Setup (Development)
```bash
# 1. Install all dependencies
cd backend && npm install
cd ../frontend && npm install

# 2. Create backend .env
cd ../backend
cat > .env << EOF
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/food-delivery
JWT_SECRET=dev_secret_key_change_in_production
STRIPE_SECRET_KEY=sk_test_xxx
CLIENT_URL=http://localhost:5173
EOF

# 3. Start MongoDB (if local)
mongod

# 4. Open two terminals and run
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev

# 5. Open http://localhost:5173
```

---

##  Common Tasks

### Adding a New API Route
1. Create endpoint in `controllers/yourfeature.controller.ts`
2. Define route in `routes/yourfeature.routes.ts`
3. Register route in `routes/index.ts`
4. Add Zod validation schema in `types/index.ts`
5. Implement business logic in `services/yourfeature.service.ts`

### Adding a New Frontend Component
1. Create component in `src/components/[category]/YourComponent.tsx`
2. Define TypeScript types in `src/types/index.ts`
3. Create API service method in `src/services/api.ts`
4. Import and use in pages
5. Add styling in component CSS module

### Uploading Files
```typescript
// Frontend
const formData = new FormData();
formData.append('file', file);
const response = await fetch('/api/food/upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});

// Backend - configure in upload.middleware.ts
```

---

##  Troubleshooting Guide

### Backend Issues

#### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Start MongoDB: `mongod` (local) or verify MongoDB Atlas credentials
- Check `MONGO_URI` format: `mongodb://localhost:27017/food-delivery`
- For MongoDB Atlas, whitelist your IP address

#### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Windows - Find and kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

#### JWT Token Invalid
**Solution:**
- Ensure `JWT_SECRET` in `.env` is consistent
- Check token expiration: `JWT_EXPIRES_IN=7d`
- Verify token format: `Authorization: Bearer <token>`

### Frontend Issues

#### Frontend Can't Connect to Backend
```
Error: Failed to fetch from http://localhost:5000
```
**Solution:**
- Verify backend is running on `http://localhost:5000`
- Check CORS configuration in `backend/src/app.ts`
- Ensure `CLIENT_URL` in backend `.env` matches frontend URL

#### Build Errors
```
Error: Cannot find module 'react'
```
**Solution:**
```bash
cd frontend
npm install
npm run build
```

#### HMR (Hot Module Reload) Not Working
**Solution:**
- Check Vite configuration in `vite.config.ts`
- Ensure development server is running
- Clear browser cache and restart dev server

### Payment Integration

#### Stripe Key Errors
```
Error: Invalid Stripe API key
```
**Solution:**
- Verify `STRIPE_SECRET_KEY` starts with `sk_test_` (test) or `sk_live_` (production)
- Check key is correct in MongoDB Atlas or `.env`
- Regenerate key from Stripe dashboard if needed

---

##  Frequently Asked Questions

**Q: How do I change the database from MongoDB to PostgreSQL?**
A: Replace Mongoose models with TypeORM/Prisma, update connection config in `config/db.ts`, and modify model files to use SQL syntax.

**Q: How do I add more user roles (e.g., "delivery-person")?**
A: Update the User model `role` enum, add role checks in `auth.middleware.ts`, and create role-specific routes.

**Q: Can I use JWT with refresh tokens?**
A: Yes, modify `auth.service.ts` to generate both access and refresh tokens, store refresh token in database, and implement token refresh endpoint.

**Q: How do I add email notifications?**
A: Install `nodemailer`, create `services/email.service.ts`, and call it after order creation or status changes.

**Q: How do I add real-time order updates?**
A: Integrate Socket.io, create namespace for order updates, and emit events from order controller.

---
- On Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
- On macOS/Linux: `lsof -i :5000` then `kill -9 <PID>`

---

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.

---

**Happy Coding! **
