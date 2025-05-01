# Beverates Digital

A digital menu and ordering system for beverates.

## Project Structure

This project consists of two main parts:

1. **Backend**: A FastAPI application that provides the API for menu items, orders, and authentication.
2. **Frontend**: A React application that provides the user interface for customers and administrators.

## Backend

The backend is built with FastAPI and uses PostgreSQL for data storage. It provides the following features:

- Menu item management (CRUD operations)
- Order management
- Dynamic pricing with coefficient adjustments
- Authentication and authorization

The backend runs in Docker on port 8000.

## Frontend

The frontend is built with React, TypeScript, and Vite. It provides the following features:

- Menu browsing for customers
- Shopping cart functionality
- Order placement and tracking
- Admin panel for menu management and order tracking

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for the backend)

### Running the Backend

The backend is already configured to run in Docker. To start it, run:

```bash
docker-compose up
```

This will start the backend services on port 8000.

### Running the Frontend

To run the frontend development server:

1. Install dependencies:

```bash
npm install
# or
yarn
```

2. Start the development server:

```bash
npm run dev
# or
yarn dev
```

This will start the frontend development server, typically on port 5173.

3. Open your browser and navigate to `http://localhost:5173`

## Features

### Customer Features

- Browse menu items
- Filter menu items by category
- Add items to cart
- Adjust quantities in cart
- Place orders
- View order confirmation

### Admin Features

- Manage menu items (add, edit, delete)
- View coefficient history for menu items
- View all orders
- View order details

## Authentication

The application uses cookie-based authentication. Admin users have access to additional features.

Default admin credentials:
- Email: (Check your .env file for ADMIN_EMAIL)
- Password: (Check your .env file for ADMIN_PASSWORD)

## API Endpoints

The backend API is available at `http://localhost:8000`. The main endpoints are:

- `/menu` - Menu items
- `/order` - Orders
- `/coefficient` - Coefficient logs
- `/auth` - Authentication
