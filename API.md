# API Documentation

This document describes the backend API exposed by the project and reflects the current route structure used in the app.

## Base URL

```text
http://localhost:5000/api
```

The server also exposes a health endpoint at:

```text
http://localhost:5000/
```

## Response Format

The API uses a shared response wrapper for successful and failed requests:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Operation successful",
  "success": true
}
```

Error responses follow the same envelope:

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error description",
  "success": false
}
```

## Authentication

Protected routes require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

The `protect` middleware verifies the token and attaches the user to the request. Admin-only endpoints also check the user role.

---

## Auth Endpoints

### Register a user

**Method**: `POST /auth/register`

**Authentication**: not required

**Request body**:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

**Example response**:

```json
{
  "statusCode": 201,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64c0e1f4d3a5bc0425d1f3b1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user"
    }
  },
  "message": "User registered",
  "success": true
}
```

**Common errors**:

- `400` validation failure or duplicate email
- `409` style conflicts are not currently used here; validation is the primary guard

### Login

**Method**: `POST /auth/login`

**Authentication**: not required

**Request body**:

```json
{
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

**Example response**:

```json
{
  "statusCode": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64c0e1f4d3a5bc0425d1f3b1",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user"
    }
  },
  "message": "User logged in",
  "success": true
}
```

**Common errors**:

- `401` invalid email or password

---

## Food Endpoints

### Get all available food items

**Method**: `GET /food`

**Authentication**: not required

**Example response**:

```json
{
  "statusCode": 200,
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
  ],
  "message": "Success",
  "success": true
}
```

### Get all food items for admins

**Method**: `GET /food/admin/all`

**Authentication**: required, admin only

**Example response**:

```json
{
  "statusCode": 200,
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
  ],
  "message": "Success",
  "success": true
}
```

### Create a food item

**Method**: `POST /food`

**Authentication**: required, admin only

**Body**: `multipart/form-data`

```text
name: "Margherita Pizza"
description: "Classic pizza with mozzarella"
price: 14.99
category: "pizza"
image: <file>
```

**Example response**:

```json
{
  "statusCode": 201,
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3b1",
    "name": "Margherita Pizza",
    "description": "Classic pizza with mozzarella",
    "price": 14.99,
    "category": "pizza",
    "image": "/uploads/abc123.png",
    "isAvailable": true
  },
  "message": "Food item created",
  "success": true
}
```

**Common errors**:

- `400` validation failure or missing image
- `403` if the caller is not an admin

### Update a food item

**Method**: `PATCH /food/:id`

**Authentication**: required, admin only

**Body**: `multipart/form-data`

```text
name: "Updated Pizza"
price: 15.99
isAvailable: true
image: <file>
```

**Example response**:

```json
{
  "statusCode": 200,
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3b1",
    "name": "Updated Pizza",
    "description": "Classic pizza with mozzarella",
    "price": 15.99,
    "category": "pizza",
    "isAvailable": true
  },
  "message": "Food item updated",
  "success": true
}
```

**Common errors**:

- `400` no valid fields provided or invalid values
- `404` food item not found
- `403` if the caller is not an admin

### Delete a food item

**Method**: `DELETE /food/:id`

**Authentication**: required, admin only

**Example response**:

```json
{
  "statusCode": 200,
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3b1"
  },
  "message": "Food item deleted",
  "success": true
}
```

---

## Order Endpoints

### Create an order

**Method**: `POST /orders`

**Authentication**: required

**Request body**:

```json
{
  "items": [
    {
      "foodId": "64c0e1f4d3a5bc0425d1f3b1",
      "quantity": 2
    }
  ],
  "address": {
    "fullName": "Jane Doe",
    "phone": "+1234567890",
    "street": "123 Main Street",
    "city": "New York",
    "country": "USA"
  }
}
```

**Example response**:

```json
{
  "statusCode": 201,
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3c9",
    "user": "64c0e1f4d3a5bc0425d1f3b1",
    "items": [
      {
        "food": "64c0e1f4d3a5bc0425d1f3b1",
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
  },
  "message": "Order created",
  "success": true
}
```

**Common errors**:

- `400` invalid items or shipping address details
- `401` missing or invalid token

### Get my orders

**Method**: `GET /orders/my`

**Authentication**: required

**Example response**:

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "64c0e1f4d3a5bc0425d1f3c9",
      "status": "pending",
      "totalAmount": 29.98,
      "createdAt": "2026-09-04T10:00:00.000Z"
    }
  ],
  "message": "Success",
  "success": true
}
```

### Get all orders (admin)

**Method**: `GET /orders`

**Authentication**: required, admin only

**Example response**:

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "64c0e1f4d3a5bc0425d1f3c9",
      "user": "64c0e1f4d3a5bc0425d1f3b1",
      "status": "confirmed",
      "totalAmount": 29.98
    }
  ],
  "message": "Success",
  "success": true
}
```

### Update order status (admin)

**Method**: `PATCH /orders/:id/status`

**Authentication**: required, admin only

**Request body**:

```json
{
  "status": "preparing"
}
```

**Allowed values**:

- `pending`
- `confirmed`
- `preparing`
- `out-for-delivery`
- `delivered`
- `cancelled`

**Example response**:

```json
{
  "statusCode": 200,
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3c9",
    "status": "preparing"
  },
  "message": "Order status updated",
  "success": true
}
```

---

## Payment Endpoints

### Create a Stripe checkout session

**Method**: `POST /payment/create-checkout-session`

**Authentication**: required

**Request body**:

```json
{
  "items": [
    {
      "foodId": "64c0e1f4d3a5bc0425d1f3b1",
      "quantity": 1
    }
  ],
  "address": {
    "fullName": "Jane Doe",
    "phone": "+1234567890",
    "street": "123 Main Street",
    "city": "New York",
    "country": "USA"
  }
}
```

**Example response**:

```json
{
  "statusCode": 201,
  "data": {
    "sessionId": "cs_test_123",
    "url": "https://checkout.stripe.com/xxx"
  },
  "message": "Stripe Checkout session created",
  "success": true
}
```

**Common errors**:

- `400` missing delivery address or invalid address fields
- `401` missing or invalid JWT

---

## Health Check

### Root endpoint

**Method**: `GET /`

**Authentication**: not required

**Example response**:

```json
{
  "status": "ok",
  "message": "Food Ordering API is running"
}
```

## Notes

- Food image uploads are served from `/uploads`.
- Request validation is handled with Zod schemas in the validators folder.
- The app expects required environment variables to be defined before the server starts.

    "_id": "64c0e1f4d3a5bc0425d1f3b1",
    "name": "Updated Pizza",
    "price": 15.99,
    "isAvailable": true
  },
  "message": "Food item updated",
  "success": true
}
```

### Delete a food item

**Method**: `DELETE /food/:id`

**Authentication**: required, admin only

**Example response**:

```json
{
  "statusCode": 200,
  "data": null,
  "message": "Food item deleted",
  "success": true
}
```

---

## Order Endpoints

### Create an order

**Method**: `POST /orders`

**Authentication**: required

**Request body**:

```json
{
  "items": [
    {
      "foodId": "64c0e1f4d3a5bc0425d1f3b1",
      "quantity": 2
    }
  ],
  "address": {
    "fullName": "Jane Doe",
    "phone": "+1234567890",
    "street": "123 Main Street",
    "city": "New York",
    "country": "USA"
  }
}
```

**Example response**:

```json
{
  "statusCode": 201,
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3b2",
    "user": "64c0e1f4d3a5bc0425d1f3a9",
    "items": [
      {
        "food": "64c0e1f4d3a5bc0425d1f3b1",
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
  },
  "message": "Order placed successfully",
  "success": true
}
```

**Common errors**:
- `400` if the cart is empty or contains invalid IDs
- `400` if the address is incomplete

### Get my orders

**Method**: `GET /orders/my`

**Authentication**: required

**Example response**:

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "64c0e1f4d3a5bc0425d1f3b2",
      "user": "64c0e1f4d3a5bc0425d1f3a9",
      "totalAmount": 29.98,
      "status": "pending",
      "paymentStatus": "pending",
      "items": [
        {
          "food": {
            "name": "Margherita Pizza",
            "image": "/uploads/abc123.png",
            "category": "pizza"
          },
          "quantity": 2,
          "unitPrice": 14.99,
          "subtotal": 29.98
        }
      ]
    }
  ],
  "message": "Your orders",
  "success": true
}
```

### Get all orders

**Method**: `GET /orders`

**Authentication**: required, admin only

### Update order status

**Method**: `PATCH /orders/:id/status`

**Authentication**: required, admin only

**Request body**:

```json
{
  "status": "confirmed"
}
```

Allowed values include:
- `pending`
- `confirmed`
- `preparing`
- `out-for-delivery`
- `delivered`
- `cancelled`

---

## Payment Endpoints

### Create Stripe checkout session

**Method**: `POST /payment/create-checkout-session`

**Authentication**: required

**Request body**:

```json
{
  "items": [
    {
      "foodId": "64c0e1f4d3a5bc0425d1f3b1",
      "quantity": 1
    }
  ],
  "address": {
    "fullName": "Jane Doe",
    "phone": "+1234567890",
    "street": "123 Main Street",
    "city": "New York",
    "country": "USA"
  }
}
```

**Example response**:

```json
{
  "statusCode": 201,
  "data": {
    "checkoutUrl": "https://checkout.stripe.com/...",
    "sessionId": "cs_test_..."
  },
  "message": "Stripe Checkout session created",
  "success": true
}
```

**Common errors**:
- `400` if the cart is empty or invalid
- `400` if required address fields are missing

---

## Root Endpoint

**Method**: `GET /`

**Example response**:

```json
{
  "status": "ok",
  "message": "Food Ordering API (TypeScript)"
}
```

## Notes

- admin-only routes are enforced by the `protect` and `adminOnly` middleware
- uploaded food images are served from `/uploads` under the backend `uploads/` directory
- required environment variables are validated before the server starts

```json
{
  "statusCode": 200,
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3b1",
    "name": "Updated Pizza",
    "price": 15.99,
    "isAvailable": true
  },
  "message": "Food item updated",
  "success": true
}
```

### Delete a food item

**Endpoint**: `DELETE /food/:id`

**Authentication**: required, admin only

**Example response**:

```json
{
  "statusCode": 200,
  "data": null,
  "message": "Food item deleted",
  "success": true
}
```

---

## Order endpoints

### Create an order

**Endpoint**: `POST /orders`

**Authentication**: required

**Body**:

```json
{
  "items": [
    {
      "foodId": "64c0e1f4d3a5bc0425d1f3b1",
      "quantity": 2
    }
  ],
  "address": {
    "fullName": "Jane Doe",
    "phone": "+1234567890",
    "street": "123 Main Street",
    "city": "New York",
    "country": "USA"
  }
}
```

**Example response**:

```json
{
  "statusCode": 201,
  "data": {
    "_id": "64c0e1f4d3a5bc0425d1f3b2",
    "user": "64c0e1f4d3a5bc0425d1f3a9",
    "items": [
      {
        "food": "64c0e1f4d3a5bc0425d1f3b1",
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
  },
  "message": "Order placed successfully",
  "success": true
}
```

**Errors**:
- `400` if the cart is empty or contains invalid item IDs
- `400` if the address is incomplete

### Get my orders

**Endpoint**: `GET /orders/my`

**Authentication**: required

**Example response**:

```json
{
  "statusCode": 200,
  "data": [
    {
      "_id": "64c0e1f4d3a5bc0425d1f3b2",
      "user": "64c0e1f4d3a5bc0425d1f3a9",
      "totalAmount": 29.98,
      "status": "pending",
      "paymentStatus": "pending",
      "items": [
        {
          "food": {
            "name": "Margherita Pizza",
            "image": "/uploads/abc123.png",
            "category": "pizza"
          },
          "quantity": 2,
          "unitPrice": 14.99,
          "subtotal": 29.98
        }
      ]
    }
  ],
  "message": "Your orders",
  "success": true
}
```

---

## Root endpoint

**Endpoint**: `GET /`

**Example response**:

```json
{
  "status": "ok",
  "message": "Food Ordering API (TypeScript)"
}
```

---

## Notes

- Admin-only routes are enforced by `protect` and `adminOnly` middleware.
- Food images are served from `/uploads` and are stored in the backend `uploads/` folder.
- The backend currently validates required environment variables before booting, so missing values will stop the app from starting.

---

### Create Food Item
**POST** `/food`

Creates a new food item (Admin only).

**Authentication:** Required ✓
**Authorization:** Admin role required

**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "description": "Classic pizza with tomato and mozzarella",
  "price": 12.99,
  "category": "pizza",
  "isAvailable": true
}
```

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato and mozzarella",
    "price": 12.99,
    "category": "pizza",
    "isAvailable": true,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Food item created successfully",
  "success": true
}
```

**Error Cases:**
- `401` - Unauthorized
- `403` - Insufficient permissions (not admin)
- `400` - Missing required fields

---

### Update Food Item
**PUT** `/food/:id`

Updates an existing food item (Admin only).

**Authentication:** Required ✓
**Authorization:** Admin role required

**Path Parameters:**
- `id` - MongoDB ObjectId (string)

**Request Body:**
```json
{
  "name": "Margherita Pizza",
  "price": 13.99,
  "isAvailable": true
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Margherita Pizza",
    "price": 13.99,
    "updatedAt": "2024-01-15T11:00:00Z"
  },
  "message": "Food item updated successfully",
  "success": true
}
```

**Error Cases:**
- `404` - Food item not found
- `403` - Insufficient permissions

---

### Delete Food Item
**DELETE** `/food/:id`

Deletes a food item (Admin only).

**Authentication:** Required ✓
**Authorization:** Admin role required

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Food item deleted successfully",
  "success": true
}
```

**Error Cases:**
- `404` - Food item not found
- `403` - Insufficient permissions

---

### Upload Food Image
**POST** `/food/upload`

Uploads an image for a food item.

**Authentication:** Required ✓
**Authorization:** Admin role required

**Request:**
- Content-Type: `multipart/form-data`
- File field: `file` (image file, max 5MB)

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "imageUrl": "https://example.com/uploads/food-123.jpg",
    "fileName": "food-123.jpg"
  },
  "message": "Image uploaded successfully",
  "success": true
}
```

**Error Cases:**
- `400` - No file provided
- `400` - File size exceeds limit
- `400` - Invalid file type

---

## Order Endpoints

### Create Order
**POST** `/orders`

Creates a new food order.

**Authentication:** Required ✓

**Request Body:**
```json
{
  "items": [
    {
      "foodId": "507f1f77bcf86cd799439011",
      "quantity": 2,
      "price": 12.99
    }
  ],
  "totalAmount": 25.98,
  "shippingAddress": "123 Main St, City",
  "notes": "No onions please"
}
```

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "items": [
      {
        "foodId": "507f1f77bcf86cd799439011",
        "quantity": 2,
        "price": 12.99
      }
    ],
    "totalAmount": 25.98,
    "status": "pending",
    "shippingAddress": "123 Main St, City",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Order created successfully",
  "success": true
}
```

---

### Get User Orders
**GET** `/orders`

Retrieves all orders for the authenticated user.

**Authentication:** Required ✓

**Query Parameters:**
- `status` (optional) - Filter by status: pending, confirmed, preparing, ready, delivered
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "totalAmount": 25.98,
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "message": "Orders retrieved successfully",
  "success": true
}
```

---

### Get Order Details
**GET** `/orders/:id`

Retrieves details of a specific order.

**Authentication:** Required ✓

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "userId": "507f1f77bcf86cd799439011",
    "items": [...],
    "totalAmount": 25.98,
    "status": "pending",
    "shippingAddress": "123 Main St, City",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:35:00Z"
  },
  "message": "Order retrieved successfully",
  "success": true
}
```

---

### Update Order Status
**PUT** `/orders/:id`

Updates the status of an order (Admin only).

**Authentication:** Required ✓
**Authorization:** Admin role required

**Request Body:**
```json
{
  "status": "confirmed"
}
```

**Valid Statuses:**
- `pending` - Initial state
- `confirmed` - Order confirmed
- `preparing` - Being prepared
- `ready` - Ready for delivery
- `delivered` - Delivered to customer
- `cancelled` - Order cancelled

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "status": "confirmed",
    "updatedAt": "2024-01-15T10:35:00Z"
  },
  "message": "Order status updated successfully",
  "success": true
}
```

---

## Payment Endpoints

### Create Payment Intent
**POST** `/payments/create-intent`

Creates a Stripe payment intent for an order.

**Authentication:** Required ✓

**Request Body:**
```json
{
  "orderId": "507f1f77bcf86cd799439012",
  "amount": 2598
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdefgh",
    "intentId": "pi_1234567890",
    "amount": 2598,
    "currency": "usd"
  },
  "message": "Payment intent created successfully",
  "success": true
}
```

---

## Error Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Authentication required |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal server error |

---

## Rate Limiting

Currently, there is no rate limiting implemented. For production, consider implementing:
- Request rate limits (e.g., 100 requests per minute)
- User-based rate limits
- IP-based rate limits

---

## Versioning

API version is implied in the base URL (`/api`). For future versions:
- Use `/api/v1`, `/api/v2`, etc.
- Maintain backward compatibility within versions
- Deprecate old versions with advance notice

---

## Testing with Postman

1. Import the provided Postman collection (if available)
2. Set up environment variables:
   - `base_url` = `http://localhost:5000/api`
   - `token` = Your JWT token from login endpoint
3. Use the `{{token}}` variable in Authorization headers

Example collection structure:
```
Food Delivery API
├── Auth
│   ├── Register
│   ├── Login
│   └── Profile
├── Food
│   ├── Get All
│   ├── Get by ID
│   ├── Create
│   ├── Update
│   └── Delete
├── Orders
│   ├── Create
│   ├── Get All
│   ├── Get by ID
│   └── Update Status
└── Payments
    └── Create Intent
```

---
