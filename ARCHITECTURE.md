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
JWT auth middleware + route validation
    ↓
Service layer
    ↓
Mongoose models
    ↓
MongoDB
```

---

## Frontend Layer

The frontend is a Vite-based React application organized into feature-oriented folders such as `components`, `pages`, `context`, `services`, and `hooks`.

Main responsibilities:

- render the web app shell and pages
- manage client-side state and user context
- call backend APIs for auth, food, ordering, and payments
- display product listings, carts, and order data

---

## Backend Layer

The backend is a TypeScript Express app structured for a clean route-to-service flow.

Core responsibilities:

- `app.ts`: Express app setup and global middleware
- `routes/index.ts`: aggregates route modules
- `controllers/*`: HTTP request handling and orchestration
- `services/*`: business logic and domain rules
- `models/*`: MongoDB schemas and data access models
- `middleware/*`: auth, validation, upload, and error handling
- `utils/*`: shared response helpers
- `validators/*`: Zod validation schemas

### Actual route structure

```text
/api/auth
  POST /register
  POST /login
  GET  /me         (authenticated user)

/api/food
  GET /
  GET /categories
  GET /admin/all   (admin only)
  POST /           (admin only, multipart with image)
  PATCH /:id       (admin only, optional image)
  PATCH /:id/restore (admin only)
  DELETE /:id      (admin only, soft delete)

/api/orders
  POST /                (authenticated user)
  GET /my               (authenticated user)
  GET /:id              (owner or admin)
  GET /                 (admin only)
  PATCH /:id/status     (admin only, enforced transitions)
  PATCH /:id/confirm-cod-payment (admin only)
  GET /admin/stats      (admin only)
  GET /admin/popular-food (admin only)
  GET /admin/revenue-by-category (admin only)

/api/payment
  POST /create-checkout-session  (authenticated user)
  POST /confirm-checkout-session (authenticated user)
  POST /webhook                  (Stripe callback, signature verified)
```

Route definitions live in `backend/src/routes/`. The `/api/payment/webhook` handler bypasses the JSON parser because Stripe must receive the raw request body for signature verification, and it also accepts the legacy `/api/payments/webhook` path for compatibility.

---

## Authentication Flow

The backend uses JWT tokens for protected routes.

```text
Register/Login request
    ↓
Auth service validates email and password
    ↓
JWT is created with user id and role
    ↓
Client sends Authorization: Bearer <token>
    ↓
protect middleware verifies the token
    ↓
adminOnly middleware checks role = admin when required
```

The authentication logic lives in:

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

Admin endpoints allow creation, update, and deletion of catalog items. Public browsing is exposed through `GET /api/food`.

---

## Order Domain

Orders are created from the authenticated user and include:

- user reference
- list of ordered items
- delivery address
- total amount
- order status
- payment status

The ordering workflow is handled by:

- `backend/src/controllers/order.controller.ts`
- `backend/src/services/order.service.ts`
- `backend/src/models/Order.model.ts`

The service validates item IDs, quantities, and address properties before creating a new order.

---

## Data Model Summary

### User

```text
User {
  name: string
  email: string (unique)
  password: string (hashed with bcryptjs)
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
  user: ObjectId ref User
  items: [{
    food: ObjectId ref FoodItem
    foodName, foodImage, foodCategory   // order-time snapshots
    quantity, unitPrice, subtotal
  }]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled'
  paymentMethod: 'stripe' | 'cod'
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'
  checkoutSessionId: string   // Stripe Checkout session, when applicable
  address: { fullName, phone, street, city, country }
  createdAt
  updatedAt
}
```

Order items store the food name, image, category, unit price, and subtotal as snapshots, so later menu edits never alter historical order details. The schema also declares indexes for customer order history (`user + createdAt`), admin status filtering (`status + createdAt`), date sorting, and legacy payment lookup, which Mongoose creates when the models initialize.

### Order status lifecycle

```text
pending ──→ confirmed ──→ preparing ──→ out-for-delivery ──→ delivered
   │            │             │
   └────────────┴─────────────┴──→ cancelled (terminal)
```

Transitions are enforced in the order service; delivering or cancelling an order is terminal, and repeating the current status is idempotent.

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
- environment variables are validated before startup in `backend/src/config/env.ts`
- request throttling on the API and stricter limits on auth endpoints
- security headers via `helmet`; CORS restricted to the configured `CLIENT_URL`
- shared request IDs (`X-Request-ID`) correlate responses with backend logs
- uploads accept only JPEG, PNG, and WebP up to 5 MB and are delivered from Cloudinary; the `/uploads` static route serves legacy local images only
- Stripe webhooks are verified with the signing secret against the raw request body

---

## Current Scope

This version of the app intentionally focuses on the core food-ordering workflow:

- authentication and role checks
- food catalog management
- order creation and retrieval
- image uploads for products
- Stripe checkout and webhook-based payment confirmation, plus cash on delivery
- basic admin analytics

It does not yet include advanced marketplace features such as real-time notifications, refunds/reconciliation flows, or a large-scale multi-admin system.
