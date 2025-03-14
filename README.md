# LitVerse Online Bookstore - Frontend

This is the frontend application for the LitVerse Online Bookstore, built with Angular 19. It provides a modern, responsive UI for browsing books, managing shopping carts, processing orders, and handling user authentication.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Application](#running-the-application)
  - [Building for Production](#building-for-production)
- [Authentication](#authentication)
- [Styling](#styling)
- [Deployment](#deployment)
- [API Integration](#api-integration)

## Features

The frontend application includes the following features:

- **User Authentication**
  - Registration
  - Login/Logout
  - JWT-based authentication
  - Role-based access control (Admin/Customer)
  
- **Book Management (Admin)**
  - Add new books
  - Update existing books
  - Delete books
  - View all books with pagination
  
- **Shopping Experience (Customer)**
  - Browse books with responsive UI
  - Search books by title
  - View book details
  - Add books to cart
  - Update quantities in cart
  - Remove items from cart
  
- **Order Management**
  - Place orders
  - View order history
  - View order details
  
- **Reviews System**
  - Add reviews for books
  - Update own reviews
  - Delete own reviews
  - View all reviews for a book
  
- **User Profile**
  - View and edit profile information
  
- **Payment Processing**
  - Secure payment form
  - Order confirmation

## Tech Stack

- **Framework**: Angular 19
- **UI Library**: Bootstrap 5
- **CSS**: Custom CSS with global variables for consistent styling
- **Icons**: Font Awesome
- **Animations**: Animate.css, WOW.js
- **HTTP Client**: Angular HttpClient
- **State Management**: RxJS for reactive state
- **Authentication**: JWT with secure token storage
- **API Communication**: RESTful API integration
- **Real-time Updates**: WebSocket integration

## Project Structure

The application follows a modular architecture with the following key directories:

```
src/
├── app/
│   ├── auth/               # Authentication components and services
│   │   ├── login/
│   │   ├── register/
│   │   └── http-interceptors/
│   ├── guards/             # Route guards for access control
│   ├── helper/             # Utility helpers
│   ├── interfaces/         # TypeScript interfaces
│   ├── interceptor/        # HTTP interceptors
│   ├── layout/             # Layout components (header, footer)
│   ├── pages/              # Main application pages
│   │   ├── add-book/
│   │   ├── book-details/
│   │   ├── cart/
│   │   ├── home/
│   │   ├── notfound/
│   │   ├── order-confirmation/
│   │   ├── orders/
│   │   ├── payment/
│   │   ├── reviews/
│   │   └── user-profile/
│   ├── pipe/               # Custom Angular pipes
│   ├── services/           # Services for data manipulation and API calls
│   │   └── requests/       # HTTP request services
│   ├── update-book/        # Book update component
│   ├── app.component.*     # Root component
│   ├── app.config.ts       # App configuration
│   └── app.routes.ts       # Application routes
├── assets/                 # Static assets
└── styles.css              # Global styles
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm (v8 or higher)
- Angular CLI 19

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/online-bookstore-ui.git
   cd online-bookstore-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Configuration

1. The application is configured to connect to the backend API. If you need to change the API endpoint, update the `baseUrl` variable in the following service files:

   - `src/app/auth/login/login.service.ts`
   - `src/app/services/requests/http-requests.service.ts`
   - `src/app/services/requests/orders/orders-requests.service.ts`
   - `src/app/services/requests/books/books-requests.service.ts`
   - `src/app/services/requests/cart/cart-requests.service.ts`

2. WebSocket configuration (for real-time updates) can be found in:
   - `src/app/services/requests/websocket/websocket.service.ts`

### Running the Application

For local development:

```bash
ng serve
```

Navigate to `http://localhost:4200/` in your browser. The application will automatically reload if you change any of the source files.

### Building for Production

```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Authentication

The application uses JSON Web Tokens (JWT) for authentication. The token is:

1. Obtained during login
2. Stored securely in localStorage with encryption
3. Attached to all API requests through the AuthInterceptor
4. Checked for expiration and refreshed as needed

User roles (admin/customer) determine access to different features of the application, controlled by route guards.

## Styling

The application uses a combination of:

- Bootstrap 5 for responsive grid and components
- Custom CSS variables for consistent theming
- Font Awesome icons
- Animate.css for animations

Global styles are defined in `src/styles.css` with CSS variables for easy customization.

## Deployment

The application is configured for deployment to Vercel, but can be deployed to any static hosting service:

1. Build the application:
   ```bash
   ng build --configuration production
   ```

2. Upload the contents of the `dist/book-store-mean/browser` directory to your hosting provider.

3. Configure your server to handle Angular's HTML5 routing (redirect all requests to index.html).

## API Integration

The frontend interacts with the backend API through services located in `src/app/services/requests/`. Each service corresponds to a specific domain:

- `books-requests.service.ts` - Book-related operations
- `cart-requests.service.ts` - Shopping cart operations
- `orders-requests.service.ts` - Order processing
- `http-requests.service.ts` - General HTTP utilities

API calls use Angular's HttpClient with proper error handling and RxJS operators for reactive programming.

---

For more information or to report issues, please open an issue on our GitHub repository.