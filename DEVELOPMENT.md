# Development Guide

This guide explains how to run, modify, and extend the project during local development.

## Prerequisites

Before you start, install the following:

- Node.js 18+
- npm
- MongoDB running locally or a MongoDB Atlas database
- Git
- a code editor such as VS Code

## Project Setup

### 1. Clone the repository

```bash
git clone https://github.com/SaqibShah-dev/food-delivery-app.git
cd food-delivery-app
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure the backend environment

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/food-delivery-app
JWT_SECRET=replace_with_a_long_random_value
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_your_key_here
CLIENT_URL=http://localhost:5173
```

The app validates these values in `backend/src/config/env.ts` and exits on startup if any required variable is missing.

### 4. Install frontend dependencies

```bash
cd ../frontend
npm install
```

## Run the App

### Start the backend

```bash
cd backend
npm run dev
```

The backend runs at:

```text
http://localhost:5000
```

### Start the frontend

Open a second terminal and run:

```bash
cd frontend
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

## Common Commands

### Backend

```bash
cd backend
npm run dev    # development mode
npm run build  # compile the TypeScript API
npm start      # run the built server
```

### Frontend

```bash
cd frontend
npm run dev    # launch the Vite dev server
npm run build  # create a production build
npm run lint   # run ESLint
npm run preview # preview the production build locally
```

## Project Layout

### Backend

```text
backend/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   ├── db.ts
│   │   └── env.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── food.controller.ts
│   │   ├── order.controller.ts
│   │   └── payment.controller.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── upload.middleware.ts
│   ├── models/
│   │   ├── FoodItem.model.ts
│   │   ├── Order.model.ts
│   │   └── User.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── food.routes.ts
│   │   ├── index.ts
│   │   ├── order.routes.ts
│   │   └── payment.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── food.service.ts
│   │   ├── order.service.ts
│   │   └── payment.service.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── apiResponse.ts
│   │   └── asyncHandler.ts
│   └── tests/
├── uploads/
├── .env
├── package.json
├── tsconfig.json
└── dist/
```

### Frontend

```text
frontend/
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── App.css
│   ├── index.css
│   ├── assets/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── services/
│   ├── types/
│   └── utils/
├── public/
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── index.html
└── dist/
```

## Request Flow

The app follows a simple layered flow:

1. the browser sends a request to `/api/...`
2. Express matches the route and applies middleware when required
3. controllers read request payloads and validate required fields
4. service classes contain the business logic
5. Mongoose reads or writes MongoDB data
6. the response is returned in the shared API envelope

## Contributing Guidelines

- keep secrets in `backend/.env` and never commit them
- update [API.md](API.md) when route contracts change
- keep response payloads consistent with the shared response helper
- uploaded images are stored inside `backend/uploads/` and exposed via `/uploads`
- keep business logic in services rather than controllers where possible

## Current Status

The codebase currently supports the core food-ordering workflow:

- authentication and role checks
- food catalog management for admins
- image uploads
- customer order creation and retrieval
- admin order status management
- Stripe checkout session generation

It is not yet a complete production-ready marketplace or a large-scale admin system.
