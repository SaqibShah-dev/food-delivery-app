# Food Delivery App

A modern full-stack food ordering platform built with React, Vite, TypeScript, Express, and MongoDB. The app enables customers to browse food items, sign in, add products to a cart, place orders, and complete the checkout flow through a clean and responsive storefront experience.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20.19%2B%20or%2022.12%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_or_Local-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/tests-Vitest-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![CI](https://github.com/SaqibShah-dev/food-delivery-app/actions/workflows/ci.yml/badge.svg)](https://github.com/SaqibShah-dev/food-delivery-app/actions/workflows/ci.yml)

## Overview

Food Delivery App is a practical, production-style example of a food marketplace application. It combines a polished frontend with a secure backend API and handles the core ordering experience, including authentication, catalog management, order processing, and payment session creation.

This project is designed to demonstrate a complete customer journey for a food delivery service, while keeping the implementation focused on the essentials of a real-world web application.

## Key Features

- User registration and login with JWT authentication
- Role-based authorization for customer and admin flows
- Public food catalog browsing with search, category filtering, and pagination
- Admin food management (create, update, soft delete, restore)
- Image upload support for menu items (stored in Cloudinary)
- Cart-driven order creation and order history
- Admin order management with enforced status transitions
- Stripe Checkout with webhook-based payment confirmation, plus cash on delivery
- Admin analytics (dashboard stats, popular items, revenue by category)
- Docker Compose setup with MongoDB, API, and Nginx-served frontend
- Comprehensive Vitest test suites for backend and frontend

## Tech Stack

### Frontend

- React 19
- Vite
- TypeScript
- React Router
- Tailwind CSS
- Axios
- Recharts
- Lucide React

### Backend

- Node.js
- Express 5
- TypeScript
- MongoDB with Mongoose
- JWT Authentication
- bcryptjs for password hashing
- Zod validation
- Multer for file uploads
- Cloudinary for food image storage and delivery
- Stripe for payment session creation

## Architecture

The application follows a clean layered architecture:

```text
Client / Browser
    ↓
React Frontend (Vite)
    ↓
HTTP requests to /api
    ↓
Express API Server
    ↓
Middleware (auth, validation, upload, error handling)
    ↓
Services / Business Logic
    ↓
MongoDB Models
    ↓
MongoDB Database
```

The project is split into two main parts:

- `frontend/` — storefront, user interface, client-side routing, and API consumption
- `backend/` — authentication, validation, business logic, database access, and payment logic

## Repository Structure

```text
food-delivery-app/
├── API.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── DEVELOPMENT.md
├── LICENSE
├── README.md
├── compose.yaml            # Docker Compose: MongoDB + API + frontend
├── .github/workflows/ci.yml
├── backend/
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── uploads/            # legacy local images (new uploads go to Cloudinary)
│   ├── test/               # unit and integration tests
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── scripts/        # seed script
│       ├── services/
│       ├── types/
│       ├── utils/
│       └── validators/
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── vite.config.ts
    ├── tsconfig.json
    ├── index.html
    ├── public/
    └── src/
        ├── api/            # typed API clients
        ├── components/
        ├── context/
        ├── hooks/
        ├── pages/
        ├── types/
        └── utils/
```

## Quick Start with Docker

If you prefer not to set up MongoDB locally, run the whole stack with Docker Compose:

```bash
cp backend/.env.example backend/.env   # then fill in real values
docker compose up --build
```

This starts MongoDB, the API (http://localhost:5001/api), and an Nginx-served frontend (http://localhost:5174). Ports can be overridden with `FRONTEND_HOST_PORT` and `API_HOST_PORT`. See [DEVELOPMENT.md](DEVELOPMENT.md#run-with-docker-compose) for details.

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 20.19+ or 22.12+
- npm
- MongoDB running locally or a MongoDB Atlas instance
- Git
- VS Code or another code editor

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/SaqibShah-dev/food-delivery-app.git
cd food-delivery-app
```

### 2. Configure backend environment

The easiest way to configure the backend is to copy the provided example and fill in your values:

```bash
cp backend/.env.example backend/.env
```

Required variables:

| Variable | Description |
| --- | --- |
| `PORT` | API port (default `5000`) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signing secret for JWTs (minimum 32 characters) |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `CLIENT_URL` | Frontend origin, used for CORS (default `http://localhost:5173`) |
| `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` in test mode) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Optional: credentials used by `npm run seed` |
| `API_RATE_LIMIT_*`, `AUTH_RATE_LIMIT_*` | Optional: request throttling tuning |

All values are validated at startup by `backend/src/config/env.ts`; the process exits with a clear error if anything required is missing or malformed.

Replace the Stripe placeholders with your test-mode credentials. Set the Cloudinary cloud name, API key, and API secret from your Cloudinary dashboard; image uploads are stored there and served from their secure URLs. See [DEVELOPMENT.md](DEVELOPMENT.md) for Stripe CLI setup, Cloudinary configuration, and troubleshooting.

To create local demo food items and an admin account, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `backend/.env`, then run `npm run seed` from the `backend/` directory. See [DEVELOPMENT.md](DEVELOPMENT.md#seed-demo-data-and-an-admin-account) for details.

### 3. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 4. Run the application

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in a second terminal:

```bash
cd frontend
npm run dev
```

The app should be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## Available Scripts

### Backend

```bash
cd backend
npm run dev
npm run build
npm run typecheck
npm run typecheck:test
npm test
npm run test:coverage
npm start
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run typecheck
npm test
npm run test:coverage
npm run preview
```

See [DEVELOPMENT.md](DEVELOPMENT.md#automated-tests) for test setup and CI details.

## API Overview

The backend exposes a REST API under `/api` with the following core routes:

```text
Authentication
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/me

Food Catalog
- GET    /api/food
- GET    /api/food/categories
- GET    /api/food/admin/all (admin only)
- POST   /api/food (admin only)
- PATCH  /api/food/:id (admin only)
- PATCH  /api/food/:id/restore (admin only)
- DELETE /api/food/:id (admin only, soft delete)

Orders
- POST   /api/orders
- GET    /api/orders/my
- GET    /api/orders/:id
- GET    /api/orders (admin only)
- PATCH  /api/orders/:id/status (admin only)
- PATCH  /api/orders/:id/confirm-cod-payment (admin only)
- GET    /api/orders/admin/stats (admin only)
- GET    /api/orders/admin/popular-food (admin only)
- GET    /api/orders/admin/revenue-by-category (admin only)

Payments
- POST /api/payment/create-checkout-session
- POST /api/payment/confirm-checkout-session
- POST /api/payment/webhook (Stripe callback, unauthenticated)
```

## Security and Validation

The project includes important application safeguards:

- Password hashing with `bcryptjs`
- JWT-based auth for protected routes
- Admin-only route checks for privileged actions
- Environment variable validation at startup
- Request validation using Zod
- Rate limiting on the API and auth endpoints
- Security headers via `helmet` and CORS restricted to `CLIENT_URL`
- Upload handling with type and size restrictions (JPEG/PNG/WebP, max 5 MB)
- Webhook signature verification for Stripe callbacks

## Current Scope

This version of the application focuses on the core food-ordering workflow:

- Authentication and role checks
- Food catalog browsing
- Admin inventory management
- Image upload support
- Customer order creation and retrieval
- Admin order status management
- Stripe checkout session creation

It does not yet include full production-scale marketplace features such as real-time notifications, advanced analytics, multi-tenant admin operations, or a complete payment reconciliation system.

## Documentation

Additional project documentation is available here:

- [API.md](API.md) — full REST API reference with request/response examples
- [ARCHITECTURE.md](ARCHITECTURE.md) — system design and data models
- [DEVELOPMENT.md](DEVELOPMENT.md) — setup, Docker, seeding, Stripe, and troubleshooting
- [CONTRIBUTING.md](CONTRIBUTING.md) — coding standards and PR guidelines

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [DEVELOPMENT.md](DEVELOPMENT.md) before submitting changes.

## License

This project is licensed under the [MIT License](LICENSE).
