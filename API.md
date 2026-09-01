# API Documentation

Complete reference for all API endpoints in the Food Delivery App.

---

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Response Format

### Success Response
```json
{
  "statusCode": 200,
  "data": {
    "id": "...",
    "name": "..."
  },
  "message": "Operation successful",
  "success": true
}
```

### Error Response
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error description",
  "success": false
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

Creates a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890"
}
```

**Response:** `201 Created`
```json
{
  "statusCode": 201,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "User registered successfully",
  "success": true
}
```

**Error Cases:**
- `400` - Email already exists
- `400` - Invalid email format
- `400` - Password too weak

---

### Login User
**POST** `/auth/login`

Authenticates user and returns JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  },
  "message": "Login successful",
  "success": true
}
```

**Error Cases:**
- `401` - Invalid credentials
- `404` - User not found

---

### Get User Profile
**GET** `/auth/profile`

Retrieves authenticated user's profile information.

**Authentication:** Required ✓

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "role": "user",
    "profileImage": "https://...",
    "address": "123 Main St, City",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Profile retrieved successfully",
  "success": true
}
```

**Error Cases:**
- `401` - Unauthorized (missing token)
- `401` - Invalid token

---

### Logout User
**POST** `/auth/logout`

Logs out the authenticated user.

**Authentication:** Required ✓

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": null,
  "message": "Logged out successfully",
  "success": true
}
```

---

## Food Endpoints

### Get All Food Items
**GET** `/food`

Retrieves all available food items with optional filtering.

**Query Parameters:**
- `category` (optional) - Filter by category (string)
- `search` (optional) - Search by name/description (string)
- `page` (optional) - Page number for pagination (default: 1)
- `limit` (optional) - Items per page (default: 20)
- `sort` (optional) - Sort field: name, price, rating (default: createdAt)
- `order` (optional) - Sort order: asc, desc (default: desc)

**Example Request:**
```
GET /food?category=pizza&page=1&limit=10&sort=price&order=asc
```

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "name": "Margherita Pizza",
      "description": "Classic pizza with tomato and mozzarella",
      "price": 12.99,
      "category": "pizza",
      "image": "https://...",
      "rating": 4.5,
      "isAvailable": true,
      "createdAt": "2024-01-10T08:00:00Z"
    }
  ],
  "message": "Food items retrieved successfully",
  "success": true
}
```

**Error Cases:**
- `400` - Invalid query parameters

---

### Get Food Item by ID
**GET** `/food/:id`

Retrieves details of a specific food item.

**Path Parameters:**
- `id` - MongoDB ObjectId (string)

**Response:** `200 OK`
```json
{
  "statusCode": 200,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato and mozzarella",
    "price": 12.99,
    "category": "pizza",
    "image": "https://...",
    "rating": 4.5,
    "isAvailable": true,
    "createdAt": "2024-01-10T08:00:00Z",
    "reviews": [
      {
        "userId": "...",
        "rating": 5,
        "comment": "Delicious!"
      }
    ]
  },
  "message": "Food item retrieved successfully",
  "success": true
}
```

**Error Cases:**
- `404` - Food item not found
- `400` - Invalid ID format

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
