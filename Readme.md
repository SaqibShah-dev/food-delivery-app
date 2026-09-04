# Food Delivery App
A full-stack food ordering application built with React + Vite on the frontend and Express + TypeScript + MongoDB on the backend.
This repository currently supports:
- user registration and login with JWT authentication
- admin-only food catalog management
- image uploads for food items
- order creation and retrieval for authenticated users
- a TypeScript-based API and a Vite-based frontend
> The implementation is focused on the core ordering workflow. More advanced features such as full payment processing or a complete admin dashboard are not fully implemented in this codebase yet.
---
## Features
- JWT-based authentication for users and admins
- secure password hashing using bcryptjs
- food catalog browsing through the API
- admin-only create, update, and delete operations for food items
- file uploads for food images
- user order creation and order lookup
- MongoDB persistence with Mongoose
- TypeScript across both backend and frontend
---
## Tech Stack
### Backend
- Node.js
- Express 5
- TypeScript
- MongoDB + Mongoose
- JWT authentication
- bcryptjs
- Multer for uploads
- Zod for environment validation
### Frontend
- React 19
- Vite
- TypeScript
- ESLint
---
## Repository Structure
```text
food-delivery-app/
├── backend/
│   ├── src/
│   │   ├── app.ts
│   │   ├── server.ts
│   │   ├── config/
│   │   │   ├── db.ts
│   │   │   └── env.ts
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts
│   │   │   ├── food.controller.ts
│   │   │   └── order.controller.ts
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
│   │   │   └── order.routes.ts
│   │   ├── services/
│   │   │   ├── auth.service.ts
│   │   │   ├── food.service.ts
│   │   │   └── order.service.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   │   ├── apiResponse.ts
│   │   │   └── asyncHandler.ts
│   │   └── tests/
│   ├── uploads/
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── dist/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── eslint.config.js
│   └── index.html
├── API.md
├── ARCHITECTURE.md
├── DEVELOPMENT.md
├── Readme.md
└── LICENSE
```
---
## Prerequisites
Before starting, install:
- Node.js 18+
- npm
- a MongoDB instance or MongoDB Atlas connection
- Git
---
## Local Setup
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
### 3. Configure environment variables
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
The backend validates these values at startup in `src/config/env.ts`.
### 4. Install frontend dependencies
```bash
cd ../frontend
npm install
```
---
## Run the app
### Start the backend
```bash
cd backend
npm run dev
```
The API runs at:
```text
http://localhost:5000
```
### Start the frontend
In a second terminal:
```bash
cd frontend
npm run dev
```
The frontend runs at:
```text
http://localhost:5173
```
---
## Useful Scripts
### Backend
```bash
cd backend
npm run dev    # development mode
npm run build  # compile TypeScript
npm start      # run the compiled app
```
### Frontend
```bash
cd frontend
npm run dev    # Vite dev server
npm run build  # production build
npm run lint   # lint the app
npm run preview # preview the production build
```
---
## API Summary
The backend is mounted under `/api` and currently exposes the following routes:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/food`
- `POST /api/food` (admin only, requires image upload)
- `PUT /api/food/:id` (admin only)
- `DELETE /api/food/:id` (admin only)
- `POST /api/orders` (authenticated users)
- `GET /api/orders/my` (authenticated users)
See [API.md](API.md) for request and response examples.
---
## Notes
- Admin routes are protected by middleware that checks the JWT and role.
- Food image uploads are served from `/uploads` and stored under the backend `uploads/` folder.
- The current codebase focuses on the core food-ordering workflow rather than a complete checkout or enterprise admin implementation.
