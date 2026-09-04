# Architecture Overview
This project follows a simple layered architecture built around a React frontend and an Express + MongoDB backend.
---
## System Overview
```text
Browser / Client
    ↓
React App (Vite)
    ↓
HTTP requests to /api
    ↓
Express API server
    ↓
JWT auth middleware + route handlers
    ↓
Service layer
    ↓
Mongoose models
    ↓
MongoDB
```
---
## Frontend Layer
The frontend is a Vite-based React application. The current codebase uses standard component-based structure with `src/components`, `src/pages`, `src/context`, and `src/services` folders.
Main responsibilities:
- render the application shell and pages
- manage client-side state
- call the backend API
- display food listings and user order data
---
## Backend Layer
The backend is a TypeScript Express application with the following structure:
- `app.ts`: Express app setup and middleware
- `routes/index.ts`: route aggregation
- `controllers/*`: HTTP request handling
- `services/*`: business logic
- `models/*`: MongoDB schemas
- `middleware/*`: auth and error handling
- `utils/*`: shared API helper functions
### Actual route structure
```text
/api/auth
  POST /register
  POST /login
/api/food
  GET /
  POST /   (admin only)
  PUT /:id (admin only)
  DELETE /:id (admin only)
/api/orders
  POST /   (authenticated user)
  GET /my  (authenticated user)
```
---
## Authentication Flow
The backend uses JWT tokens for protected routes.
```text
Register/Login request
    ↓
Auth service validates user credentials
    ↓
JWT is created with user id and role
    ↓
Client sends Authorization: Bearer <token>
    ↓
protect middleware verifies the token
    ↓
adminOnly middleware checks role = admin when required
```
The authentication logic is implemented in:
- `backend/src/services/auth.service.ts`
- `backend/src/middleware/auth.middleware.ts`
- `backend/src/controllers/auth.controller.ts`
---
## Food Domain
Food items are stored in the `FoodItem` model and include:
- name
- description
- price
- category
- image
- isAvailable
- timestamps
The admin endpoints allow creation, update, and deletion of these items. Public listing is exposed via `GET /api/food`.
---
## Order Domain
Orders are created from the authenticated user and contain:
- user reference
- list of order items
- delivery address
- total amount
- status
- paymentStatus
The ordering workflow is handled by:
- `backend/src/controllers/order.controller.ts`
- `backend/src/services/order.service.ts`
- `backend/src/models/Order.model.ts`
The service validates item IDs, quantity, and required address fields before creating an order.
---
## Data Model Summary
### User
```text
User {
  name: string
  email: string
  password: string (hashed)
  role: 'user' | 'admin'
  createdAt
  updatedAt
}
```
### FoodItem
```text
FoodItem {
  name: string
  description: string
  price: number
  image: string
  category: string
  isAvailable: boolean
  createdAt
  updatedAt
}
```
### Order
```text
Order {
  user: string
  items: [{ food, quantity, unitPrice, subtotal }]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  address: { fullName, phone, street, city, country }
  createdAt
  updatedAt
}
```
---
## Request Flow
```text
Incoming HTTP request
    ↓
CORS middleware
    ↓
Express JSON parsing
    ↓
Auth middleware (if required)
    ↓
Route matching
    ↓
Controller
    ↓
Service layer
    ↓
Mongoose model / MongoDB
    ↓
Formatted API response
    ↓
Error middleware when needed
```
---
## Security Notes
- passwords are hashed with bcryptjs before storage
- JWTs are required for protected endpoints
- admin-only routes check the user role in middleware
- environment variables are validated before server startup in `src/config/env.ts`
---
## Current Scope
This version of the application is intentionally scoped to the core food-ordering flow:
- auth
- food catalog management
- order creation and retrieval
- image uploads for products
It does not yet include a complete checkout/payment flow, notifications, or a fully expanded admin dashboard beyond the existing route protection and CRUD logic.
