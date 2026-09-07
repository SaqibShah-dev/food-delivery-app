# Food Delivery App

A full-stack food ordering application with a React + Vite frontend and an Express + TypeScript + MongoDB backend.

## Overview

This project delivers the core flow for a food ordering system:

- customer registration and login
- JWT-based authentication and role-based access control
- food catalog browsing and admin management
- food image uploads
- order creation and order history
- Stripe checkout session creation for payment initiation

> The current implementation focuses on the core ordering workflow. It is not a complete production-ready marketplace with advanced payment reconciliation, notifications, or a full enterprise admin dashboard.

## Tech Stack

### Backend
- Node.js
- Express 5
- TypeScript
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing
- Multer for file uploads
- Stripe for checkout session creation
- Zod for environment validation

### Frontend
- React 19
- Vite
- TypeScript
- ESLint

## Features

- JWT-based user and admin authentication
- secure password storage with bcryptjs
- public food listing endpoint
- admin-only food creation, update, and deletion
- image upload support for food items
- authenticated customer order creation and retrieval
- admin order listing and status updates
- Stripe checkout session route for cart-based payments

## Repository Structure

```text
food-delivery-app/
├── API.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── DEVELOPMENT.md
├── LICENSE
├── Readme.md
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── uploads/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   └── env.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── food.controller.ts
│   │   │   ├── order.controller.ts
│   │   │   └── payment.controller.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── upload.middleware.ts
│   │   ├── models/
│   │   │   ├── FoodItem.model.ts
│   │   │   ├── Order.model.ts
│   │   │   └── User.model.ts
│   │   ├── routes/
│   │   │   ├── auth.routes.ts
│   │   │   ├── food.routes.ts
│   │   │   ├── index.ts
│   │   │   ├── order.routes.ts
│   │   │   └── payment.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── food.service.ts
│   │   │   ├── order.service.ts
│   │   │   └── payment.service.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── apiResponse.ts
│   │   │   └── asyncHandler.ts
│   │   └── tests/
│   └── .env
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts
    ├── eslint.config.js
    ├── tsconfig.json
    ├── tsconfig.app.json
    ├── tsconfig.node.json
    ├── public/
    └── src/
```

## Prerequisites

Before you begin, make sure you have:

- Node.js 18 or newer
- npm
- Git
- MongoDB running locally or a MongoDB Atlas connection

## Environment Setup

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/food-delivery-app
JWT_SECRET=replace_with_a_long_random_value
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_your_key_here
CLIENT_URL=http://localhost:5173
```

The server validates these variables on startup in `backend/src/config/env.ts` and exits if required values are missing.

## Local Development

### 1. Install backend dependencies

```bash
cd backend
npm install
```

### 2. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 3. Start the backend

```bash
cd backend
npm run dev
```

The API will be available at:

```text
http://localhost:5000
```

### 4. Start the frontend

In a second terminal:

```bash
cd frontend
npm run dev
```

The app will be available at:

```text
http://localhost:5173
```

## Useful Scripts

### Backend

```bash
cd backend
npm run dev    # start in development mode
npm run build  # compile TypeScript
npm start      # run the built app
```

### Frontend

```bash
cd frontend
npm run dev    # start Vite dev server
npm run build  # create production bundle
npm run lint   # run ESLint
npm run preview # preview the production build
```

## API Overview

The backend is mounted under `/api` and currently exposes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/food`
- `POST /api/food` (admin only)
- `PUT /api/food/:id` (admin only)
- `DELETE /api/food/:id` (admin only)
- `POST /api/orders` (authenticated user)
- `GET /api/orders/my` (authenticated user)
- `GET /api/orders` (admin only)
- `PATCH /api/orders/:id/status` (admin only)
- `POST /api/payment/create-checkout-session` (authenticated user)

See [API.md](API.md) for full request and response examples.

## Project Notes

- protected routes use a Bearer token in the `Authorization` header
- admin-only routes check both JWT validity and `role === 'admin'`
- uploaded food images are served from `/uploads`
- the application is intentionally focused on the core ordering flow rather than a full production checkout workflow

## Contributing

Please read [DEVELOPMENT.md](DEVELOPMENT.md) and [CONTRIBUTING.md](CONTRIBUTING.md) before making changes.
