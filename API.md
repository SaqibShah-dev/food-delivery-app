# Food Delivery App API Documentation

This document describes the REST API implemented by the backend of the Food Delivery App. The application exposes a JSON API under `/api` and is built with Node.js, Express, TypeScript, MongoDB, JWT authentication, and Stripe integration.

## Base URL

```text
http://localhost:5000/api
```

The backend also exposes a health endpoint at:

```text
http://localhost:5000/
```

## API conventions

The backend uses a simple response envelope:

### Successful response

```json
{
  "status": 200,
  "message": "Available food items",
  "data": {
    "items": []
  }
}
```

### Error response

```json
{
  "status": 400,
  "message": "Validation failed",
  "requestId": "2a2508de-bb35-49d5-873d-16a9a64a1a1f",
  "errors": {
    "email": ["Please provide a valid email address"]
  }
}
```

Every response includes an `X-Request-ID` header. Error responses include the same ID in the JSON body so a request can be correlated with backend logs.

Important implementation details:

- Protected routes require a JWT in the `Authorization` header as `Bearer <token>`.
- The app uses `Zod` validation for request payloads.
- Admin-only endpoints require `req.user.role === 'admin'`.
- Food item uploads use `multipart/form-data` with an `image` file field.
- Accepted image formats: JPEG, PNG, and WebP; maximum size 5 MB.
- Newly uploaded images are stored in Cloudinary and returned as secure delivery URLs; `/uploads/...` paths appear only on legacy items with locally stored images.

## Authentication

```http
Authorization: Bearer <jwt_token>
```

### User roles

- `user`: standard customer
- `admin`: privileged manager for food, orders, and analytics

### Auth endpoints

#### Register a user

- Method: `POST /auth/register`
- Auth required: No

Request body:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

Example response:

```json
{
  "status": 201,
  "message": "User registered",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64c0e1f4d3a5bc0425d1f3b1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user"
    }
  }
}
```

Common errors:

- `400`: validation failure
- `409`: duplicate email or duplicate unique key

#### Login

- Method: `POST /auth/login`
- Auth required: No

Request body:

```json
{
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

Example response:

```json
{
  "status": 200,
  "message": "User logged in",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64c0e1f4d3a5bc0425d1f3b1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user"
    }
  }
}
```

Common errors:

- `400`: invalid request payload
- `401`: invalid email or password

#### Get current user

- Method: `GET /auth/me`
- Auth required: Yes

Example response:

```json
{
  "status": 200,
  "message": "Current user",
  "data": {
    "id": "64c0e1f4d3a5bc0425d1f3b1",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "user"
  }
}
```

---

## Food endpoints

### Get available food items

- Method: `GET /food`
- Auth required: No
- Query params:
  - `page` (optional, default: `1`)
  - `limit` (optional, default: `10`, max: `50`)
  - `category` (optional)
  - `search` (optional)

Example response:

```json
{
  "status": 200,
  "message": "Available food items",
  "data": {
    "items": [
      {
        "_id": "64c0e1f4d3a5bc0425d1f3b1",
        "name": "Margherita Pizza",
        "description": "Classic pizza with mozzarella",
        "price": 14.99,
        "category": "pizza",
        "image": "/uploads/abc123.png",
        "isAvailable": true,
        "createdAt": "2026-09-04T10:00:00.000Z",
        "updatedAt": "2026-09-04T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1
    }
  }
}
```

### Get food categories

- Method: `GET /food/categories`
- Auth required: No

Example response:

```json
{
  "status": 200,
  "message": "Available food categories",
  "data": ["pizza", "burger", "dessert"]
}
```

### Get all food items for admin

- Method: `GET /food/admin/all`
- Auth required: Yes, admin only

Example response:

```json
{
  "status": 200,
  "message": "All food items for admin",
  "data": [
    {
      "_id": "64c0e1f4d3a5bc0425d1f3b1",
      "name": "Margherita Pizza",
      "description": "Classic pizza with mozzarella",
      "price": 14.99,
      "category": "pizza",
      "image": "/uploads/abc123.png",
      "isAvailable": true,
      "createdAt": "2026-09-04T10:00:00.000Z",
      "updatedAt": "2026-09-04T10:00:00.000Z"
    }
  ]
}
```

### Create a food item

- Method: `POST /food`
- Auth required: Yes, admin only
- Content-Type: `multipart/form-data`

Form fields:

```text
name: "Margherita Pizza"
description: "Classic pizza with mozzarella"
price: 14.99
category: "pizza"
image: <file>
```

Notes:

- `image` is required.
- Allowed formats: JPEG, PNG, and WebP.
- Maximum upload size: 5 MB.

Example response:

```json
{
  "status": 201,
  "message": "Food item created",
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3b1",
    "name": "Margherita Pizza",
    "description": "Classic pizza with mozzarella",
    "price": 14.99,
    "category": "pizza",
    "image": "/uploads/abc123.png",
    "isAvailable": true
  }
}
```

Common errors:

- `400`: validation failure, missing file, bad extension, or oversized file
- `403`: admin access required

### Update a food item

- Method: `PATCH /food/:id`
- Auth required: Yes, admin only
- Content-Type: `multipart/form-data`

Optional form fields:

```text
name: "Updated Pizza"
price: 15.99
category: "pizza"
isAvailable: true
image: <file>
```

Example response:

```json
{
  "status": 200,
  "message": "Food item updated",
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3b1",
    "name": "Updated Pizza",
    "description": "Classic pizza with mozzarella",
    "price": 15.99,
    "category": "pizza",
    "isAvailable": true
  }
}
```

Common errors:

- `400`: invalid payload or no valid fields provided
- `404`: food item not found
- `403`: admin access required

### Restore a hidden food item

- Method: `PATCH /food/:id/restore`
- Auth required: Yes, admin only

Example response:

```json
{
  "status": 200,
  "message": "Food item restored and available",
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3b1",
    "isAvailable": true
  }
}
```

### Delete a food item

- Method: `DELETE /food/:id`
- Auth required: Yes, admin only

This endpoint performs a soft delete and hides the food item from customers instead of permanently deleting it.

Example response:

```json
{
  "status": 200,
  "message": "Food item hidden from customers",
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3b1",
    "isAvailable": false
  }
}
```

---

## Order endpoints

### Create an order

- Method: `POST /orders`
- Auth required: Yes

Request body:

```json
{
  "items": [
    {
      "foodId": "64c0e1f4d3a5bc0425d1f3b1",
      "quantity": 2
    }
  ],
  "paymentMethod": "stripe",
  "address": {
    "fullName": "Jane Doe",
    "phone": "+1234567890",
    "street": "123 Main Street",
    "city": "New York",
    "country": "USA"
  }
}
```

`paymentMethod` accepts `stripe` or `cod` and defaults to `stripe` when omitted. Cash on delivery orders remain unpaid until an admin confirms cash collection.
Each new order item also stores the food name, image, category, unit price, and subtotal as order-time snapshots. The food ID remains available as `food` for reference; subsequent menu edits do not change the order's historical item details.

Example response:

```json
{
  "status": 201,
  "message": "Order placed successfully",
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3c9",
    "user": "64c0e1f4d3a5bc0425d1f3b1",
    "items": [
      {
        "food": "64c0e1f4d3a5bc0425d1f3b1",
        "foodName": "Classic Burger",
        "foodImage": "/uploads/classic-burger.svg",
        "foodCategory": "Burgers",
        "quantity": 2,
        "unitPrice": 14.99,
        "subtotal": 29.98
      }
    ],
    "totalAmount": 29.98,
    "status": "pending",
    "paymentStatus": "pending",
    "address": {
      "fullName": "Jane Doe",
      "phone": "+1234567890",
      "street": "123 Main Street",
      "city": "New York",
      "country": "USA"
    }
  }
}
```

Common errors:

- `400`: invalid items or address payload
- `401`: missing or invalid token

### Get my orders

- Method: `GET /orders/my`
- Auth required: Yes

Example response:

```json
{
  "status": 200,
  "message": "Your orders",
  "data": [
    {
      "_id": "64c0e1f4d3a5bc0425d1f3c9",
      "status": "pending",
      "totalAmount": 29.98,
      "createdAt": "2026-09-04T10:00:00.000Z"
    }
  ]
}
```

### Get order by ID

- Method: `GET /orders/:id`
- Auth required: Yes

Access rules:

- Customers can view their own orders.
- Admins can view any order.

Example response:

```json
{
  "status": 200,
  "message": "Order details",
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3c9",
    "user": {
      "_id": "64c0e1f4d3a5bc0425d1f3b1",
      "name": "Jane Doe"
    },
    "status": "confirmed",
    "totalAmount": 29.98,
    "items": []
  }
}
```

Common errors:

- `403`: requester is not the owner and not an admin
- `404`: order not found

### Get all orders (admin)

- Method: `GET /orders`
- Auth required: Yes, admin only
- Query params:
  - `status` (optional)
  - `startDate` (optional)
  - `endDate` (optional)

Example response:

```json
{
  "status": 200,
  "message": "All orders",
  "data": [
    {
      "_id": "64c0e1f4d3a5bc0425d1f3c9",
      "user": "64c0e1f4d3a5bc0425d1f3b1",
      "status": "confirmed",
      "totalAmount": 29.98
    }
  ]
}
```

### Update order status (admin)

- Method: `PATCH /orders/:id/status`
- Auth required: Yes, admin only

Request body:

```json
{
  "status": "preparing"
}
```

Allowed values:

- `pending`
- `confirmed`
- `preparing`
- `out-for-delivery`
- `delivered`
- `cancelled`

Allowed transitions are `pending → confirmed` or `cancelled`; `confirmed → preparing` or `cancelled`; `preparing → out-for-delivery` or `cancelled`; and `out-for-delivery → delivered`. `delivered` and `cancelled` are terminal. Repeating the current status is idempotent; any other transition returns `409`.

Example response:

```json
{
  "status": 200,
  "message": "Order status updated",
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3c9",
    "status": "preparing"
  }
}
```

### Confirm cash on delivery payment (admin)

- Method: `PATCH /orders/:id/confirm-cod-payment`
- Auth required: Yes, admin only
- Purpose: records that cash was collected for an unpaid, non-cancelled COD order. Stripe orders cannot be marked paid through this endpoint.

The response contains the updated order with `paymentStatus: "paid"`.

Common errors:

- `403`: admin access required
- `404`: order not found
- `409`: order is not COD, is cancelled, or payment status changed

### Dashboard stats (admin)

- Method: `GET /orders/admin/stats`
- Auth required: Yes, admin only

### Popular food items (admin)

- Method: `GET /orders/admin/popular-food`
- Auth required: Yes, admin only
- Query param:
  - `limit` (optional, default `10`, max `50`)

### Revenue by category (admin)

- Method: `GET /orders/admin/revenue-by-category`
- Auth required: Yes, admin only

---

## Payment endpoints

### Create a Stripe checkout session

- Method: `POST /payment/create-checkout-session`
- Auth required: Yes
- Purpose: creates a Stripe Checkout session for an existing unpaid order owned by the authenticated user. Create the order first with `POST /orders`.

Request body:

```json
{
  "orderId": "64c0e1f4d3a5bc0425d1f3c9"
}
```

Example response:

```json
{
  "status": 201,
  "message": "Stripe Checkout session created",
  "data": {
    "sessionId": "cs_test_123",
    "checkoutUrl": "https://checkout.stripe.com/xxx"
  }
}
```

Common errors:

- `400`: missing `orderId`, order already paid, or order is cancelled
- `401`: missing or invalid JWT
- `404`: order not found or does not belong to the authenticated user
- `409`: order is COD or its stored Checkout Session has already completed
- `502`: Stripe rejected the configured secret key

### Confirm a Stripe checkout session

- Method: `POST /payment/confirm-checkout-session`
- Auth required: Yes
- Purpose: retrieves the checkout session from Stripe, verifies that it belongs to the authenticated user and is paid, then marks the associated order as paid. The payment success page calls this endpoint as a fallback if webhook delivery is delayed or unavailable.

Request body:

```json
{
  "sessionId": "cs_test_123"
}
```

Common errors:

- `400`: missing or invalid Stripe session ID
- `401`: missing or invalid JWT
- `404`: checkout session does not belong to the authenticated user
- `409`: Stripe has not confirmed payment

### Stripe webhook

- Method: `POST /payment/webhook`
- Auth required: No
- Purpose: receives Stripe webhook events and updates order payment status when checkout completes

This endpoint expects the standard Stripe signature header: `stripe-signature` and the unmodified raw request body. Configure Stripe to send `checkout.session.completed` events to this URL. For local development, see the Stripe webhook setup in [DEVELOPMENT.md](DEVELOPMENT.md).

---

## Health check

### Root route

- Method: `GET /`
- Auth required: No

Example response:

```json
{
  "status": "ok",
  "message": "Food Ordering API is running"
}
```

## Common HTTP status codes

- `200 OK`: successful request
- `201 Created`: resource created
- `400 Bad Request`: validation errors or malformed request payload
- `401 Unauthorized`: missing/invalid JWT
- `403 Forbidden`: admin access required or unauthorized order access
- `404 Not Found`: resource not found or route missing
- `409 Conflict`: duplicate unique value, illegal order status transition, or a payment/checkout state conflict
- `413 Payload Too Large`: uploaded image exceeds maximum size
- `429 Too Many Requests`: rate limit exceeded on the API or auth endpoints
- `502 Bad Gateway`: upstream payment provider error (e.g. Stripe rejected the configured key)

## Notes on the current implementation

- The backend is organized in a layered structure: routes → controllers → services → MongoDB models.
- Public uploads are exposed via `/uploads`.
- The app uses `helmet`, `cors`, request throttling, and input validation.
- The frontend is a React + Vite app that consumes this API from the `frontend/` directory.
- The current backend scope covers authentication, food browsing and admin management, order creation and tracking, Stripe checkout sessions with webhook-based confirmation, cash on delivery, and admin analytics.

For implementation details and route wiring, see the backend source under `backend/src/routes` and `backend/src/controllers`.
