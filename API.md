# API Documentation

This document covers the endpoints implemented in the current backend.

---

## Base URL

```text
http://localhost:5000/api
```

The app also exposes a root health endpoint at:

```text
http://localhost:5000/
```

---

## Response format

The backend returns a consistent `apiResponse` envelope:

```json
{
  "statusCode": 200,
  "data": {},
  "message": "Operation successful",
  "success": true
}
```

Error responses are passed through the global error middleware and usually include:

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error description",
  "success": false
}
```

---

## Authentication

Protected endpoints require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

---

## Auth endpoints

### Register a new user

**Endpoint**: `POST /auth/register`

**Body**:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "securePassword123",
  "role": "user"
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

**Errors**:
- `400` if the email already exists
- `401` or `400` depending on validation failures

### Login

**Endpoint**: `POST /auth/login`

**Body**:

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

**Errors**:
- `401` for invalid credentials

---

## Food endpoints

### Get all available food items

**Endpoint**: `GET /food`

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

### Create a food item

**Endpoint**: `POST /food`

**Authentication**: required, admin only

**Body**: multipart form-data

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

**Errors**:
- `400` if required fields are missing
- `400` if an image is not uploaded
- `403` if the user is not an admin

### Update a food item

**Endpoint**: `PUT /food/:id`

**Authentication**: required, admin only

**Body**: multipart form-data, optional fields as needed

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
