# Food Delivery App

A modern full-stack food ordering platform built with React, Vite, TypeScript, Express, and MongoDB. The app enables customers to browse food items, sign in, add products to a cart, place orders, and complete the checkout flow through a clean and responsive storefront experience.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_or_Local-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)

## Overview

Food Delivery App is a practical, production-style example of a food marketplace application. It combines a polished frontend with a secure backend API and handles the core ordering experience, including authentication, catalog management, order processing, and payment session creation.

This project is designed to demonstrate a complete customer journey for a food delivery service, while keeping the implementation focused on the essentials of a real-world web application.

## Key Features

- User registration and login with JWT authentication
- Role-based authorization for customer and admin flows
- Public food catalog browsing
- Admin food management (create, update, delete)
- Image upload support for menu items
- Cart-driven order creation and order history
- Admin order management and status updates
- Stripe checkout session initiation for payment flow integration
- Responsive frontend built with React and Vite
- Structured backend API with TypeScript and Express

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
├── backend/
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   ├── uploads/
│   └── src/
│       ├── app.ts
│       ├── server.ts
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── services/
│       ├── types/
│       ├── utils/
│       ├── validators/
│       └── tests/
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── index.html
│   ├── public/
│   └── src/
└── LICENSE
```

## Prerequisites

Before running the project locally, make sure you have:

- Node.js 18 or newer
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

Create a `.env` file inside the `backend/` directory:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/food-delivery-app
JWT_SECRET=replace_with_a_long_random_value
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_your_key_here
CLIENT_URL=http://localhost:5173
```

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
npm start
```

### Frontend

```bash
cd frontend
npm run dev
npm run build
npm run lint
npm run preview
```

## API Overview

The backend exposes a REST API under `/api` with the following core routes:

```text
Authentication
- POST /api/auth/register
- POST /api/auth/login

Food Catalog
- GET /api/food
- GET /api/food/admin/all (admin only)
- POST /api/food (admin only)
- PATCH /api/food/:id (admin only)
- DELETE /api/food/:id (admin only)

Orders
- POST /api/orders
- GET /api/orders/my
- GET /api/orders (admin only)
- PATCH /api/orders/:id/status (admin only)

Payments
- POST /api/payment/create-checkout-session
```

For full endpoint definitions, request payloads, and response examples, see [API.md](API.md).

## Security and Validation

The project includes important application safeguards:

- Password hashing with `bcryptjs`
- JWT-based auth for protected routes
- Admin-only route checks for privileged actions
- Environment variable validation at startup
- Request validation using Zod
- Upload handling for food item images

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

- [API.md](API.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [DEVELOPMENT.md](DEVELOPMENT.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and [DEVELOPMENT.md](DEVELOPMENT.md) before submitting changes.

## License

This project is licensed under the [MIT License](LICENSE).

## Author

Built and maintained by the project author and contributors.

---

If you want, I can also generate a shorter, more GitHub-optimized version of this README or tailor it specifically for portfolio presentation.
