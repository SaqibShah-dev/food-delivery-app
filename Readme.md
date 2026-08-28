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
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile (protected)

### Food Routes
- `GET /api/food` - Get all food items
- `GET /api/food/:id` - Get food item details
- `POST /api/food` - Create food item (admin only)
- `PUT /api/food/:id` - Update food item (admin only)
- `DELETE /api/food/:id` - Delete food item (admin only)
- `POST /api/food/upload` - Upload food image

### Order Routes
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id` - Update order status

### Payment Routes
- `POST /api/payments/create-intent` - Create Stripe payment intent

##  Contributing

1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Commit your changes: `git commit -m 'Add amazing feature'`
3. Push to the branch: `git push origin feature/amazing-feature`
4. Open a Pull Request

---

##  License

This project is licensed under the ISC License - see the LICENSE file for details.

---

##  Troubleshooting

### Backend won't connect to MongoDB
- Verify MongoDB is running: `mongod`
- Check `MONGO_URI` in `.env` file
- Ensure your IP is whitelisted in MongoDB Atlas (if using cloud)

### Frontend can't connect to backend
- Ensure backend is running on `http://localhost:5000`
- Check CORS configuration in `backend/src/app.ts`
- Verify `CLIENT_URL` in backend `.env` matches your frontend URL

### Port already in use
- Kill the process using the port or use a different port in `.env`
- On Windows: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
- On macOS/Linux: `lsof -i :5000` then `kill -9 <PID>`

---

## 📞 Support

For issues and questions, please open an issue in the GitHub repository.

---

**Happy Coding! **
