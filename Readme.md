# Food Delivery App

A full-stack food delivery application with a React + Vite frontend and an Express + TypeScript + MongoDB backend. The project covers the core customer flow for browsing food, signing in, placing orders, and managing admin inventory and order status.

## Overview

This project is designed to model a small but realistic food ordering system with:

- customer registration and login
- JWT-based authentication and role checks
- public menu browsing and admin inventory management
- image upload support for menu items
- customer order creation and order history
- admin order tracking and status updates
- Stripe checkout session creation for payment initiation

> The current implementation focuses on the core ordering workflow and is not yet a full production marketplace with payment reconciliation, notifications, analytics, or advanced admin dashboards.

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
- Zod for request validation and env validation

### Frontend

- React 19
- Vite
- TypeScript
- ESLint

## Features

- JWT authentication for users and admins
- secure password hashing with bcryptjs
- public food catalog browsing
- admin-only food creation, update, and deletion
- food image upload support
- customer order creation and order retrieval
- admin order listing and status management
- Stripe checkout session endpoint for frontend payment flow integration

## Project Architecture

The app is split into two main parts:

- frontend: user-facing storefront and order flow
- backend: API, auth, validation, data access, file storage, and payment session creation

The backend is organized in a layered structure:

- routes for HTTP endpoints
- controllers for request handling
- services for business logic
- models for MongoDB schemas
- middleware for auth, validation, and errors
- utils for shared API helpers

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
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   ├── uploads/
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       │   ├── db.ts
│       │   └── env.ts
│       ├── controllers/
│       │   ├── auth.controller.ts
│       │   ├── food.controller.ts
│       │   ├── order.controller.ts
│       │   └── payment.controller.ts
│       ├── middleware/
│       │   ├── auth.middleware.ts
│       │   ├── error.middleware.ts
│       │   ├── requireFile.middleware.ts
│       │   ├── upload.middleware.ts
│       │   └── validate.middleware.ts
│       ├── models/
│       │   ├── FoodItem.model.ts
│       │   ├── Order.model.ts
│       │   └── User.model.ts
│       ├── routes/
│       │   ├── auth.routes.ts
│       │   ├── food.routes.ts
│       │   ├── index.ts
│       │   ├── order.routes.ts
│       │   └── payment.routes.ts
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── food.service.ts
│       │   ├── order.service.ts
│       │   └── payment.service.ts
│       ├── types/
│       │   └── index.ts
│       ├── utils/
│       │   ├── apiResponse.ts
│       │   └── asyncHandler.ts
│       ├── validators/
│       │   ├── auth.validator.ts
│       │   ├── food.validator.ts
│       │   └── order.validator.ts
│       └── tests/
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

Before starting, make sure you have:

- Node.js 18 or newer
- npm
- MongoDB running locally or an Atlas instance
- Git
- a code editor such as VS Code

## Environment Setup

Create a `.env` file in the `backend` directory with the following values:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/food-delivery-app
JWT_SECRET=replace_with_a_long_random_value
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_your_key_here
CLIENT_URL=http://localhost:5173
```

The backend validates these values in `backend/src/config/env.ts` and exits on startup if any required variable is missing.

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

The API runs at:

```text
http://localhost:5000
```

### 4. Start the frontend

Open a second terminal and run:

```bash
cd frontend
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Useful Scripts

### Backend

```bash
cd backend
npm run dev    # start development mode
npm run build  # compile TypeScript
npm start      # run the built app
```

### Frontend

```bash
cd frontend
npm run dev    # start Vite dev server
npm run build  # create production build
npm run lint   # run ESLint
npm run preview # preview the production build locally
```

## API Overview

The backend is mounted under `/api` and currently exposes the following routes:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/food`
- `GET /api/food/admin/all` (admin only)
- `POST /api/food` (admin only)
- `PATCH /api/food/:id` (admin only)
- `DELETE /api/food/:id` (admin only)
- `POST /api/orders` (authenticated user)
- `GET /api/orders/my` (authenticated user)
- `GET /api/orders` (admin only)
- `PATCH /api/orders/:id/status` (admin only)
- `POST /api/payment/create-checkout-session` (authenticated user)

See [API.md](API.md) for request, response, and validation details.

## Development Notes

- keep environment secrets in `backend/.env` and do not commit them
- update the API docs when route contracts or behavior change
- keep shared response formatting consistent with the helper in `backend/src/utils/apiResponse.ts`
- upload assets are served from `backend/uploads/` under `/uploads`
- business logic should remain in services rather than controller code when possible

## Current Scope

This application is intentionally scoped to the core food-ordering workflow:

- authentication and role checks
- menu browsing and admin catalog management
- image uploads for food items
- customer order creation and history
- admin order status management
- Stripe checkout session creation

It does not yet include a full production-grade marketplace, multi-tenant admin portal, advanced payment reconciliation, or real-time notifications.

- protected routes use a Bearer token in the `Authorization` header
- admin-only routes check both JWT validity and `role === 'admin'`
- uploaded food images are served from `/uploads`
- the application is intentionally focused on the core ordering flow rather than a full production checkout workflow

## Contributing

Please read [DEVELOPMENT.md](DEVELOPMENT.md) and [CONTRIBUTING.md](CONTRIBUTING.md) before making changes.
