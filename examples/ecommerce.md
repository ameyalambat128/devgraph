# E-commerce Platform Architecture

A realistic multi-service e-commerce platform example demonstrating DevGraph capabilities.

## Services

### Web Storefront

The customer-facing Next.js application.

```devgraph-service
name: web
type: nextjs
commands:
  dev: pnpm dev --filter web
  build: pnpm build --filter web
  test: pnpm test --filter web
depends:
  - api-gateway
  - auth-service
```

### API Gateway

Central API gateway that routes requests to internal services.

```devgraph-service
name: api-gateway
type: node
commands:
  dev: pnpm dev --filter api-gateway
  build: pnpm build --filter api-gateway
depends:
  - order-service
  - product-service
  - user-service
```

### Order Service

Handles order creation, updates, and fulfillment tracking.

```devgraph-service
name: order-service
type: node
commands:
  dev: pnpm dev --filter order-service
  build: pnpm build --filter order-service
depends:
  - product-service
  - payment-service
```

### Product Service

Manages product catalog, inventory, and pricing.

```devgraph-service
name: product-service
type: node
commands:
  dev: pnpm dev --filter product-service
  build: pnpm build --filter product-service
```

### User Service

User profiles, preferences, and account management.

```devgraph-service
name: user-service
type: node
commands:
  dev: pnpm dev --filter user-service
  build: pnpm build --filter user-service
```

### Auth Service

Authentication and authorization (JWT tokens, sessions).

```devgraph-service
name: auth-service
type: node
commands:
  dev: pnpm dev --filter auth-service
  build: pnpm build --filter auth-service
depends:
  - user-service
```

### Payment Service

Payment processing and transaction management.

```devgraph-service
name: payment-service
type: node
commands:
  dev: pnpm dev --filter payment-service
  build: pnpm build --filter payment-service
```

## APIs

### API Gateway Routes

```devgraph-api
service: api-gateway
routes:
  GET /health: Health check endpoint
  GET /api/products: List all products
  GET /api/products/:id: Get product by ID
  POST /api/cart: Add item to cart
  GET /api/cart: Get current cart
  POST /api/orders: Create new order
  GET /api/orders/:id: Get order by ID
  POST /api/auth/login: User login
  POST /api/auth/register: User registration
  POST /api/auth/refresh: Refresh JWT token
```

### Order Service Routes

```devgraph-api
service: order-service
routes:
  POST /orders: Create order
  GET /orders/:id: Get order by ID
  PATCH /orders/:id/status: Update order status
  GET /orders/user/:userId: Get orders by user
```

### Product Service Routes

```devgraph-api
service: product-service
routes:
  GET /products: List products
  GET /products/:id: Get product
  POST /products: Create product (admin)
  PATCH /products/:id: Update product (admin)
  GET /products/:id/inventory: Check inventory
```

### Auth Service Routes

```devgraph-api
service: auth-service
routes:
  POST /auth/login: Authenticate user
  POST /auth/register: Create new user
  POST /auth/refresh: Refresh access token
  POST /auth/logout: Invalidate session
```

## Environment Variables

### Web Storefront

```devgraph-env
service: web
vars:
  NEXT_PUBLIC_API_URL: http://localhost:4000
  NEXT_PUBLIC_STRIPE_KEY: pk_test_xxx
  NEXT_PUBLIC_SITE_URL: http://localhost:3000
```

### API Gateway

```devgraph-env
service: api-gateway
vars:
  PORT: "4000"
  ORDER_SERVICE_URL: http://localhost:4001
  PRODUCT_SERVICE_URL: http://localhost:4002
  USER_SERVICE_URL: http://localhost:4003
  AUTH_SERVICE_URL: http://localhost:4004
  REDIS_URL: redis://localhost:6379
  JWT_SECRET: your-secret-key
```

### Order Service

```devgraph-env
service: order-service
vars:
  PORT: "4001"
  DATABASE_URL: postgresql://localhost:5432/orders
  RABBITMQ_URL: amqp://localhost:5672
  PAYMENT_SERVICE_URL: http://localhost:4005
```

### Product Service

```devgraph-env
service: product-service
vars:
  PORT: "4002"
  DATABASE_URL: postgresql://localhost:5432/products
  REDIS_URL: redis://localhost:6379
```

### User Service

```devgraph-env
service: user-service
vars:
  PORT: "4003"
  DATABASE_URL: postgresql://localhost:5432/users
```

### Auth Service

```devgraph-env
service: auth-service
vars:
  PORT: "4004"
  DATABASE_URL: postgresql://localhost:5432/auth
  JWT_SECRET: your-secret-key
  JWT_EXPIRY: "3600"
  REFRESH_TOKEN_EXPIRY: "604800"
```

### Payment Service

```devgraph-env
service: payment-service
vars:
  PORT: "4005"
  STRIPE_SECRET_KEY: sk_test_xxx
  STRIPE_WEBHOOK_SECRET: whsec_xxx
  DATABASE_URL: postgresql://localhost:5432/payments
```
