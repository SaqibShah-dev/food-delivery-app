# Development Guide

This guide explains how to set up the project locally, run it in development mode, and contribute changes safely.

## Prerequisites

Before you begin, make sure you have:

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
npm run dev    # start development mode
npm run build  # compile the TypeScript app
npm start      # run the built server
```

### Frontend

```bash
cd frontend
npm run dev    # start the Vite dev server
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
│   │   ├── requireFile.middleware.ts
│   │   ├── upload.middleware.ts
│   │   └── validate.middleware.ts
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
│   ├── validators/
│   │   ├── auth.validator.ts
│   │   ├── food.validator.ts
│   │   └── order.validator.ts
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

The app follows a straightforward layered flow:

1. the browser sends a request to `/api/...`
2. Express matches the route and applies middleware when required
3. controllers interpret the request and validate data
4. services contain the core business logic
5. Mongoose reads or writes MongoDB data
6. the response is returned with a shared API envelope

## Contributing Guidelines

- keep secrets in `backend/.env` and never commit them
- update [API.md](API.md) when route contracts or payloads change
- keep response payloads consistent with the shared helper in `backend/src/utils/apiResponse.ts`
- uploaded images are stored in `backend/uploads/` and exposed through `/uploads`
- keep business logic in service files rather than controllers whenever possible

## Validation Before Opening a PR

### Backend

```bash
cd backend
npm run build
```

### Frontend

```bash
cd frontend
npm run build
npm run lint
```

## Typical Workflow

1. create a feature branch from the main branch
2. make the code change
3. run the relevant build or lint checks
4. update the relevant docs if behavior or contracts change
5. open a pull request with a clear summary

## Current Status

The application currently supports the core food-ordering workflow:

- user authentication and role checks
- food catalog browsing and admin inventory management
- image uploads for food items
- customer order creation and order retrieval
- admin order status management
- Stripe checkout session generation

It is not yet a complete production marketplace or a large-scale admin system.
