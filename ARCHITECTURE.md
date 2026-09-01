# Architecture Overview

High-level architectural design and system components of the Food Delivery App.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  Browser (React 19)  │  Mobile Browser  │  Native Apps (Future) │
│  - Components        │  - Responsive UI │                       │
│  - State Management  │  - CSS Modules   │                       │
│  - API Calls         │  - Vite Build    │                       │
└─────────────────────┬───────────────────────────────────────────┘
                      │ HTTP/HTTPS (REST API)
                      │
┌─────────────────────┴───────────────────────────────────────────┐
│                    API Gateway Layer                             │
│  - CORS Configuration                                            │
│  - Request Validation                                            │
│  - Rate Limiting                                                 │
└─────────────────────┬───────────────────────────────────────────┘
                      │
┌─────────────────────┴───────────────────────────────────────────┐
│                    Backend API Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Express.js Server (Node.js)                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Routes: /api/auth, /api/food, /api/orders, /api/payments│  │
│  └───────────────────┬──────────────────────────────────────┘  │
│                      │                                           │
│  ┌──────────────────┴──────────────────────────────────────┐   │
│  │ Controller Layer: Handle HTTP requests                   │   │
│  │ - auth.controller.ts   (Register, Login, Profile)       │   │
│  │ - food.controller.ts   (CRUD operations)                │   │
│  │ - order.controller.ts  (Order management)               │   │
│  │ - payment.controller.ts (Payment processing)            │   │
│  └───────────────────┬────────────────────────────────────┘   │
│                      │                                           │
│  ┌──────────────────┴──────────────────────────────────────┐   │
│  │ Service Layer: Business Logic                            │   │
│  │ - auth.service.ts      (Authentication logic)           │   │
│  │ - food.service.ts      (Food operations logic)          │   │
│  │ - order.service.ts     (Order processing logic)         │   │
│  │ - payment.service.ts   (Stripe integration)             │   │
│  └───────────────────┬────────────────────────────────────┘   │
│                      │                                           │
│  ┌──────────────────┴──────────────────────────────────────┐   │
│  │ Middleware Layer: Cross-cutting Concerns                │   │
│  │ - auth.middleware.ts    (JWT verification)              │   │
│  │ - error.middleware.ts   (Error handling)                │   │
│  │ - upload.middleware.ts  (File upload)                   │   │
│  │ - validation middleware  (Request validation)           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────────┘
                      │ Query Language
                      │
┌─────────────────────┴───────────────────────────────────────────┐
│                    Data Layer                                    │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB (NoSQL Database)                                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Collections:                                             │  │
│  │ - users          (User accounts, authentication)         │  │
│  │ - fooditems      (Food catalog)                          │  │
│  │ - orders         (Order records)                         │  │
│  │ - payments       (Payment information)                   │  │
│  │ - reviews        (Food ratings & reviews)               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  External Services                               │
├─────────────────────────────────────────────────────────────────┤
│  - Stripe API       (Payment processing)                         │
│  - File Storage     (Image uploads - local or cloud)            │
│  - Email Service    (Notifications - optional)                  │
│  - SMS Service      (Notifications - optional)                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Component Hierarchy

```
App (Root Component)
├── Layout
│   ├── Navbar
│   ├── Main Route Content
│   │   ├── HomePage
│   │   │   ├── FoodList
│   │   │   │   └── FoodCard (Multiple)
│   │   │   └── FoodFilter
│   │   ├── ProductDetail
│   │   │   └── FoodDetail
│   │   ├── CartPage
│   │   │   └── Cart
│   │   │       └── CartItem (Multiple)
│   │   ├── CheckoutPage
│   │   │   └── Checkout
│   │   ├── ProfilePage
│   │   ├── OrdersPage
│   │   │   └── OrderList
│   │   │       └── OrderCard (Multiple)
│   │   └── AdminPage
│   │       ├── FoodManagement
│   │       └── OrderDashboard
│   └── Footer
└── Toast/Modal Providers
```

### State Management Flow

```
Context API State
├── AuthContext
│   ├── user (logged-in user data)
│   ├── token (JWT token)
│   ├── isLoading
│   └── dispatch (login, logout, register)
├── CartContext
│   ├── items (cart items)
│   ├── total (cart total)
│   └── actions (add, remove, update)
└── OrderContext
    ├── orders (user's orders)
    ├── currentOrder (selected order)
    └── actions (fetch, update status)
```

### Data Flow

```
User Interaction
    ↓
Component Event Handler
    ↓
API Service Call
    ↓
Context Update (State)
    ↓
Component Re-render
    ↓
UI Update
```

---

## Backend Architecture

### Request Processing Flow

```
Incoming Request
    ↓
CORS Middleware ← Validate origin
    ↓
Body Parser ← Parse JSON/form data
    ↓
Authentication Middleware ← Verify JWT token
    ↓
Route Handler ← Match URL pattern
    ↓
Validation Middleware ← Validate request body (Zod)
    ↓
Controller ← Extract request parameters
    ↓
Service Layer ← Execute business logic
    ↓
Database Operations (Mongoose) ← Query/update data
    ↓
Service Response ← Return processed data
    ↓
Controller Formatting ← Format API response
    ↓
Response Middleware ← Add security headers
    ↓
Send Response (200/400/500 etc)
    ↓
Error Middleware (if error) ← Handle exceptions
```

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│         Presentation Layer (Routes)          │
│  Defines API endpoints and HTTP methods      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│      Controller Layer                       │
│  - HTTP request/response handling           │
│  - Parameter extraction                     │
│  - Response formatting                      │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│      Service Layer (Business Logic)         │
│  - Core application logic                   │
│  - Business rule validation                 │
│  - Data transformations                     │
│  - Cross-cutting operations                 │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│      Repository Layer (Data Access)         │
│  - Mongoose models and queries              │
│  - Database operations                      │
│  - Data persistence                         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────┴──────────────────────────┐
│      Database Layer                         │
│  - MongoDB collections                      │
│  - Indexes                                  │
│  - Relationships                            │
└─────────────────────────────────────────────┘
```

### Authentication Flow

```
1. User Registration
   └─> POST /api/auth/register
       └─> UserService.register()
           ├─> Validate input with Zod
           ├─> Hash password with bcryptjs
           └─> Create user in MongoDB

2. User Login
   └─> POST /api/auth/login
       └─> AuthService.login()
           ├─> Find user by email
           ├─> Compare password hash
           ├─> Generate JWT token
           └─> Return token to client

3. Protected Request
   └─> GET /api/auth/profile (with Authorization header)
       └─> Auth Middleware
           ├─> Extract token from header
           ├─> Verify JWT signature
           ├─> Check token expiration
           └─> Attach user data to request
       └─> Controller processes request
```

---

## Data Models

### User Model
```
User {
  _id: ObjectId (auto-generated)
  name: String
  email: String (unique)
  password: String (hashed with bcryptjs)
  phone: String
  address: String
  role: "user" | "admin"
  profileImage: String (URL)
  isActive: Boolean
  createdAt: Date (auto)
  updatedAt: Date (auto)
  
  Relationships:
  - has many Orders
  - has many Reviews
}
```

### FoodItem Model
```
FoodItem {
  _id: ObjectId
  name: String
  description: String
  price: Number
  category: String
  image: String (URL)
  isAvailable: Boolean
  rating: Number (0-5)
  reviews: [Review] (array)
  createdAt: Date
  updatedAt: Date
  
  Relationships:
  - belongs to Category
  - has many OrderItems
  - has many Reviews
}
```

### Order Model
```
Order {
  _id: ObjectId
  userId: ObjectId (ref to User)
  items: [OrderItem]
    - foodId: ObjectId
    - quantity: Number
    - price: Number
  totalAmount: Number
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered"
  shippingAddress: String
  paymentStatus: "pending" | "completed" | "failed"
  paymentMethod: String
  notes: String
  createdAt: Date
  updatedAt: Date
  
  Relationships:
  - belongs to User
  - references multiple FoodItems
}
```

---

## API Design Principles

### RESTful Conventions
```
GET     /api/food          - List all food items
GET     /api/food/:id      - Get single food item
POST    /api/food          - Create new food item
PUT     /api/food/:id      - Update food item
DELETE  /api/food/:id      - Delete food item

GET     /api/orders        - List user's orders
POST    /api/orders        - Create new order
GET     /api/orders/:id    - Get order details
PUT     /api/orders/:id    - Update order status
```

### Response Format
```json
{
  "statusCode": 200,
  "data": { /* actual data */ },
  "message": "Success message",
  "success": true
}
```

### Error Handling
```json
{
  "statusCode": 400,
  "data": null,
  "message": "Validation error message",
  "success": false
}
```

---

## Security Architecture

### Authentication & Authorization
- JWT tokens for stateless authentication
- Token stored in HttpOnly cookies (prevents XSS)
- JWT secrets stored in environment variables
- Token expiration: 7 days (configurable)
- Refresh token strategy (optional)

### Password Security
- Passwords hashed with bcryptjs (salt rounds: 10)
- No plain-text password storage
- Password reset via email token

### Request Validation
- Input validation with Zod schemas
- Type-safe request parameters
- Sanitization of user input

### CORS Protection
- Whitelist allowed origins in environment
- Preflight request validation
- Credential handling

### Database Security
- Parameterized queries with Mongoose
- No SQL injection risks
- User data isolation (access control)

---

## Performance Optimization

### Frontend Optimization
- Code splitting with React.lazy()
- Image optimization and lazy loading
- CSS modules for scoped styling
- Vite for fast build and dev server
- Tree-shaking unused imports
- Minification and compression

### Backend Optimization
- Database indexes on frequently queried fields
- Connection pooling for MongoDB
- Response caching for static data
- Pagination for large result sets
- Query optimization with projections
- Compression middleware (gzip)

---

## Scalability Considerations

### Current Architecture (Single Server)
- Best for: Small to medium projects (<10k users)
- Single Node.js process
- Single MongoDB instance
- File uploads to local disk

### Future Scaling Strategies

**Horizontal Scaling**
```
Load Balancer
├── Backend Instance 1
├── Backend Instance 2
└── Backend Instance 3
     ↓
  MongoDB Replica Set
     ↓
  Shared File Storage (S3/Cloud Storage)
```

**Microservices Architecture**
```
API Gateway
├── User Service
├── Food Service
├── Order Service
└── Payment Service
```

---

## Deployment Architecture

### Development
- Express dev server with hot-reload
- MongoDB local instance
- Local file uploads
- Vite dev server with HMR

### Production
- Express production build (optimized)
- MongoDB Atlas (cloud)
- Cloud storage (S3, Azure Blob)
- Nginx reverse proxy
- SSL/TLS certificates
- Environment-specific configs

### Cloud Deployment Options

**AWS Architecture**
```
CloudFront (CDN)
    ↓
S3 (Frontend static files)
    ↓
ALB (Load Balancer)
    ↓
ECS/EC2 (Backend services)
    ↓
RDS/DocumentDB (Database)
```

**Azure Architecture**
```
Azure CDN
    ↓
Blob Storage (Frontend)
    ↓
Application Gateway
    ↓
App Service (Backend)
    ↓
Cosmos DB (Database)
```

---

## Development Workflow

```
Feature Request
    ↓
Create Feature Branch
    ↓
Implement Changes
├─> Write Code
├─> Write Tests
└─> Add Documentation
    ↓
Local Testing
├─> Unit Tests
├─> Integration Tests
└─> Manual Testing
    ↓
Code Review
    ↓
Merge to Main
    ↓
CI/CD Pipeline
├─> Build
├─> Test
├─> Security Scan
└─> Deploy
    ↓
Production
```

---

## Technology Stack Rationale

| Technology | Reason |
|-----------|--------|
| Node.js | JavaScript runtime with excellent async support |
| Express.js | Minimal, flexible web framework |
| TypeScript | Type safety reduces bugs |
| MongoDB | Flexible schema for food/order data |
| Mongoose | Schema validation and relationships |
| React | Component-based UI with large ecosystem |
| Vite | Fast build tool and dev server |
| JWT | Stateless authentication |
| Stripe | Secure payment processing |
| Zod | Type-safe schema validation |

---

## Future Enhancements

1. **Real-time Features**
   - Socket.io for live order updates
   - WebSocket for delivery tracking

2. **Advanced Search**
   - Elasticsearch for full-text search
   - Faceted search and filters

3. **Recommendation Engine**
   - ML-based food recommendations
   - Personalized suggestions

4. **Analytics**
   - User behavior tracking
   - Sales analytics dashboard

5. **Mobile App**
   - React Native for iOS/Android
   - Push notifications

6. **Internationalization**
   - Multi-language support
   - Multi-currency support

---
