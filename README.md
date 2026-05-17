# SportyHub

SportyHub is a full-stack sports shopping and community platform with a React frontend and an Express backend. It includes authentication, product browsing, cart and checkout flows, product reviews, a sports forum, expert tips, blog content, order history, and a rule-based sports chatbot.

This repo is currently set up to use PostgreSQL through Prisma on the backend.

## Features

- User registration and login with JWT-based auth
- Product listing, filtering, sorting, and detail pages
- Cart stored in browser local storage
- Stripe checkout flow
- Product reviews and rating updates
- Community forum with topics and replies
- Expert tips by sport
- Blog listing, blog details, likes, and view counts
- Order history per user
- Built-in sports chatbot

## Tech Stack

### Frontend

- React
- React Router
- Axios
- Stripe React SDK

### Backend

- Node.js
- Express
- Prisma
- PostgreSQL
- JWT
- bcryptjs
- Stripe

## Project Structure

```text
sporty-hub/
  backend/
    app.js
    cleanup.js
    delete-user.js
    data/
      seedData.js
    prisma/
      schema.prisma
    .env
    .env.example
    package.json
  frontend/
    src/
      components/
      context/
      pages/
      services/
    public/
    package.json
  README.md
```

## Main App Flow

1. A user registers or logs in from the frontend.
2. The backend creates or validates the user and returns a JWT.
3. The frontend stores the `token` and `user` in `localStorage`.
4. Protected routes become available after login.
5. The user can browse products, add items to cart, leave reviews, join the forum, read expert tips and blogs, and place orders.
6. The cart lives in `localStorage`, while orders, reviews, forum data, tips, blogs, and users live in PostgreSQL.

## Frontend Overview

The frontend lives in [frontend](./frontend) and is a Create React App project.

### Important frontend files

- [frontend/src/App.js](./frontend/src/App.js): Route definitions and auth gating
- [frontend/src/context/CartContext.js](./frontend/src/context/CartContext.js): Cart state and persistence
- [frontend/src/services/api.js](./frontend/src/services/api.js): Shared Axios instance for auth calls
- [frontend/src/components/Chatbot.js](./frontend/src/components/Chatbot.js): Floating chatbot UI

### Frontend routes

- `/register`
- `/login`
- `/dashboard`
- `/products`
- `/product/:id`
- `/cart`
- `/checkout`
- `/orders`
- `/forum`
- `/forum/topic/:id`
- `/expert`
- `/blog`
- `/blog/:id`

### Frontend behavior notes

- Auth is checked client-side using `localStorage`.
- Cart data is stored in `localStorage`.
- Many page components call `http://localhost:5000` directly.
- The public Stripe key is currently hardcoded in the checkout page.

## Backend Overview

The backend lives in [backend](./backend) and uses Express with Prisma and PostgreSQL.

### Important backend files

- [backend/app.js](./backend/app.js): Main API server
- [backend/prisma/schema.prisma](./backend/prisma/schema.prisma): Database schema
- [backend/data/seedData.js](./backend/data/seedData.js): Product, expert tip, and blog seed content
- [backend/cleanup.js](./backend/cleanup.js): Clears database tables
- [backend/delete-user.js](./backend/delete-user.js): Deletes a user by email

### Backend domains

- Auth
- Products
- Reviews
- Forum topics and replies
- Expert tips
- Blogs
- Orders
- Payments
- Chatbot

## Database Schema

PostgreSQL data is managed with Prisma. The current models are:

- `User`
- `Product`
- `Review`
- `Topic`
- `Reply`
- `ExpertTip`
- `Blog`
- `Order`

The backend keeps the API compatible with the frontend by returning `_id` in responses, even though PostgreSQL records are stored with `id`.

## Environment Variables

Backend environment variables live in [backend/.env](./backend/.env). A sample file is available at [backend/.env.example](./backend/.env.example).

### Required backend variables

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/sportyhub?schema=public"
JWT_SECRET="replace-with-a-strong-secret"
STRIPE_SECRET_KEY="replace-with-your-stripe-secret-key"
PORT=5000
```

### Notes

- `DATABASE_URL` must point to a real PostgreSQL database.
- `JWT_SECRET` should be changed before real deployment.
- `STRIPE_SECRET_KEY` is required for payment intent creation.

## Installation

### Prerequisites

- Node.js
- npm
- PostgreSQL

### 1. Clone or open the repo

```powershell
cd sporty-hub
```

### 2. Install backend dependencies

```powershell
cd backend
npm install
```

### 3. Install frontend dependencies

```powershell
cd ..\frontend
npm install
```

### 4. Configure backend environment

Copy `backend/.env.example` values into `backend/.env` and set your real values.

### 5. Create the PostgreSQL database

Create a database named `sportyhub`, or update `DATABASE_URL` to match your database name, user, password, and port.

## Prisma Setup

From the `backend` folder:

```powershell
npm run prisma:generate
npm run prisma:migrate -- --name init
```

If the schema changes later:

```powershell
npm run prisma:migrate -- --name your_change_name
```

## Running the App

### Start backend

```powershell
cd backend
npm start
```

The backend runs on `http://localhost:5000`.

### Start frontend

```powershell
cd frontend
npm start
```

The frontend runs on `http://localhost:3000`.

## Seeding Data

After the backend is running, seed the content using HTTP requests.

### Seed products

```powershell
curl -X POST http://localhost:5000/api/products/seed
```

### Seed expert tips

```powershell
curl -X POST http://localhost:5000/api/expert/seed
```

### Seed blogs

```powershell
curl -X POST http://localhost:5000/api/blogs/seed
```

## Utility Scripts

### Clear all database data

```powershell
cd backend
node cleanup.js
```

### Delete a single user by email

```powershell
cd backend
node delete-user.js user@example.com
```

If no email is passed, it defaults to `usman@example.com`.

## API Reference

### Health

- `GET /`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products/seed`

### Reviews

- `GET /api/reviews/:productId`
- `POST /api/reviews`

### Forum

- `GET /api/forum/topics`
- `GET /api/forum/topics/:id`
- `POST /api/forum/topics`
- `POST /api/forum/replies`
- `GET /api/forum/category/:category`

### Expert Tips

- `GET /api/expert/tips`
- `GET /api/expert/tips/category/:category`
- `POST /api/expert/tips/:id/like`
- `POST /api/expert/seed`

### Blogs

- `GET /api/blogs`
- `GET /api/blogs/:id`
- `GET /api/blogs/category/:category`
- `POST /api/blogs/:id/like`
- `POST /api/blogs/seed`

### Orders and Payments

- `POST /api/create-payment-intent`
- `POST /api/save-order`
- `GET /api/orders/:userId`

### Chatbot

- `POST /api/chatbot`

## Example Requests

### Register

```json
POST /api/auth/register
{
  "name": "Ali Khan",
  "email": "ali@example.com",
  "password": "password123"
}
```

### Login

```json
POST /api/auth/login
{
  "email": "ali@example.com",
  "password": "password123"
}
```

### Create a review

```json
POST /api/reviews
{
  "productId": "product-id",
  "userId": "user-id",
  "userName": "Ali Khan",
  "rating": 5,
  "comment": "Excellent product"
}
```

### Create a forum topic

```json
POST /api/forum/topics
{
  "title": "Best cricket bat for beginners?",
  "category": "Cricket",
  "content": "I am looking for a good beginner bat.",
  "authorId": "user-id",
  "authorName": "Ali Khan"
}
```

## Current Scripts

### Backend

```powershell
npm start
npm run dev
npm run prisma:generate
npm run prisma:migrate
```

### Frontend

```powershell
npm start
npm test
npm run build
```

## Known Limitations

- Backend auth is not enforced on most API routes with middleware yet.
- The frontend relies heavily on `localStorage` for auth and cart state.
- Several frontend files use hardcoded `http://localhost:5000` URLs instead of a shared environment-based API base URL.
- The frontend still uses a hardcoded Stripe publishable key.
- Some legacy MongoDB-related files and dependencies still exist in the repo, even though the active backend uses PostgreSQL.
- There is no centralized validation layer for request payloads.
- Tests are minimal at the moment.

## Suggested Next Improvements

- Add auth middleware for protected backend routes
- Move frontend API base URL to environment variables
- Move Stripe publishable key to frontend env config
- Remove remaining MongoDB and Mongoose dependencies if no longer needed
- Add request validation with a schema library
- Add automated tests for backend routes and core frontend flows
- Add Docker support for PostgreSQL, frontend, and backend

## Troubleshooting

### Backend fails to start

Check:

- PostgreSQL is running
- `DATABASE_URL` is correct
- Prisma client has been generated
- Migrations have been applied

### Prisma migrate fails

Check:

- Database exists
- Database credentials are correct
- The configured PostgreSQL user has permission to create tables

### Payments fail

Check:

- `STRIPE_SECRET_KEY` is set in `backend/.env`
- The frontend publishable key is valid

### Frontend cannot connect to backend

Check:

- Backend is running on port `5000`
- Frontend is calling `http://localhost:5000`
- No firewall or port conflict is blocking local access

## Development Notes

- The active backend entry file is [backend/app.js](./backend/app.js).
- [backend/server.js](./backend/server.js) is still present but is not used by the current npm scripts.
- The frontend expects Mongo-style `_id` fields, and the backend now adapts PostgreSQL records to that shape.

## License

No license file is currently included in this repo.
