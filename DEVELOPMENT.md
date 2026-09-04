# Development Guide
This guide explains how to run and work with the current project state.
---
## Prerequisites
- Node.js 18+
- npm
- MongoDB running locally or a MongoDB Atlas connection
- Git
- VS Code or another code editor
---
## Initial Setup
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
Create a `.env` file in `backend/`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/food-delivery-app
JWT_SECRET=replace_this_with_a_secure_secret
JWT_EXPIRES_IN=7d
STRIPE_SECRET_KEY=sk_test_your_key_here
CLIENT_URL=http://localhost:5173
```
The file is parsed in `src/config/env.ts`, and missing required variables will stop the server from starting.
### 4. Install frontend dependencies
```bash
cd ../frontend
npm install
```
---
## Run the app locally
### Backend
```bash
cd backend
npm run dev
```
The API runs on:
```text
http://localhost:5000
```
### Frontend
Open a second terminal and run:
```bash
cd frontend
npm run dev
```
Then open:
```text
http://localhost:5173
```
---
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
│   │   └── order.controller.ts
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
│   │   └── order.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── food.service.ts
│   │   └── order.service.ts
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
├── eslint.config.js
├── index.html
└── dist/
```
---
## Common Commands
### Backend
```bash
cd backend
npm run dev    # start the API in development mode
npm run build  # compile TypeScript
npm start      # run the compiled app
```
### Frontend
```bash
cd frontend
npm run dev    # start the Vite dev server
npm run build  # create a production build
npm run lint   # lint the project
npm run preview # preview the built app locally
```
---
## API Flow
The app currently follows this flow:
1. client sends a request to `/api/...`
2. Express route matches the request
3. JWT middleware validates auth when required
4. controller reads the request data
5. service layer performs business logic
6. Mongoose reads or writes MongoDB documents
7. response is wrapped in the standard success/error payload
---
## Contributing Notes
- keep the environment configuration in `backend/.env` and do not commit secrets
- update API documentation whenever a route contract changes
- keep response payloads consistent with the `apiResponse` helper
- uploaded images are stored in `backend/uploads/` and served from `/uploads`
---
## Current Implementation Status
The codebase is centered on the core ordering workflow:
- authentication
- food listing and admin management
- uploaded food images
- user orders
It does not currently include a complete Stripe checkout flow or a fully implemented enterprise-style admin dashboard.
