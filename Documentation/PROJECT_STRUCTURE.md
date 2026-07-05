# SokoOnline Project Structure

## Overview
SokoOnline is a full-stack e-commerce application built with:
- **Backend**: Java Spring Boot
- **Frontend**: React + Vite
- **Architecture**: RESTful API with JWT authentication

---

## Directory Layout
```
SokoOnline/
├── Backend/              # Spring Boot backend application
├── Frontend/             # React frontend application
└── Documentation/        # Project documentation (this directory)
```

---

## 1. Backend/ - Spring Boot Application

### Directory Structure
```
Backend/
├── .mvn/
│   └── wrapper/         # Maven wrapper files
├── src/
│   ├── main/
│   │   ├── java/com/westoncodesops/sokoonline/
│   │   │   ├── config/              # Configuration classes
│   │   │   ├── controllers/         # REST API controllers
│   │   │   ├── dtos/                # Data Transfer Objects
│   │   │   │   ├── requests/        # Request DTOs
│   │   │   │   └── response/        # Response DTOs
│   │   │   ├── entities/            # JPA entities (database models)
│   │   │   ├── enums/               # Enumeration types
│   │   │   ├── exceptions/          # Exception handling
│   │   │   ├── repositories/        # Spring Data JPA repositories
│   │   │   ├── security/            # Security & JWT configuration
│   │   │   ├── services/            # Business logic services
│   │   │   │   ├── AdminUserService/
│   │   │   │   ├── CartService/
│   │   │   │   ├── CategoryService/
│   │   │   │   ├── OrderServices/
│   │   │   │   ├── ProductService/
│   │   │   │   ├── PromotionService/
│   │   │   │   ├── SubcategoryService/
│   │   │   │   ├── UserService/
│   │   │   │   └── mpesa/
│   │   │   └── SokoonlineApplication.java  # Main application entry point
│   │   └── resources/
│   │       └── application.properties  # Application configuration
│   └── test/                    # Test directory
│       ├── java/
│       └── resources/
├── mvnw                        # Maven wrapper script (Unix)
├── mvnw.cmd                    # Maven wrapper script (Windows)
└── pom.xml                     # Maven project dependencies
```

### Key Components

#### config/
- **CorsConfig.java**: Cross-Origin Resource Sharing configuration
- **DataInitializer.java**: Initializes sample data on application startup
- **Mpesaconfig.java**: M-Pesa payment integration configuration
- **RestTemplateConfig.java**: Configures RestTemplate for external API calls

#### controllers/
Handles HTTP requests and responses
- AdminUserController, AuthController, CartController
- CategoryController, MpesaController, OrdersController
- ProductController, PromotionController, SubcategoryController, UserController

#### dtos/
Defines request and response data structures
- **requests/**: Incoming data from frontend
- **response/**: Outgoing data to frontend

#### entities/
JPA entity classes mapped to database tables
- AdminAuditLog, Cart, CartItem, Category, OrderItems
- Orders, Product, Promotion, Subcategory, User

#### exceptions/
Custom exceptions and global exception handler
- BadRequestException, ResourceNotFoundException
- UnauthorizedException, ErrorResponse, GlobalExceptionHandler

#### repositories/
Spring Data JPA interfaces for database operations
- Follows naming convention: `{EntityName}Repository.java`

#### security/
Security configuration
- CustomUserDetailsService: Loads user-specific data
- JwtAuthFilter: JWT token validation filter
- JwtUtil: JWT token generation and validation utilities
- SecurityConfig: Spring Security configuration

#### services/
Business logic layer (each service has an interface and implementation)
- Each service package contains:
  - `{ServiceName}Interface.java`: Service contract
  - `{ServiceName}.java`: Service implementation

---

## 2. Frontend/ - React Application

### Directory Structure
```
Frontend/
├── public/                # Static assets
│   └── vite.svg
├── src/
│   ├── api/               # API communication
│   │   └── axios.js       # Axios instance configuration
│   ├── assets/            # Image and media assets
│   ├── components/        # Reusable UI components
│   ├── context/           # React context providers
│   ├── pages/             # Page components
│   │   └── admin/         # Admin dashboard pages
│   ├── utils/             # Utility functions
│   ├── App.css            # App-wide styles
│   ├── App.jsx            # Main app component
│   ├── index.css          # Global styles
│   └── main.jsx           # React entry point
├── .gitignore
├── eslint.config.js       # ESLint configuration
├── index.html             # HTML entry point
├── package-lock.json
├── package.json           # NPM dependencies
└── vite.config.js         # Vite configuration
```

### Key Components

#### api/
- **axios.js**: Configured Axios instance for API calls with base URL and interceptors

#### components/
Reusable UI components
- AuthModal.jsx: Authentication modal
- Footer.jsx: Footer component
- Navbar.jsx: Navigation bar
- PromoSlider.jsx: Promotion slider

#### context/
React context for state management
- AuthContext.jsx: Manages authentication state (user, token)

#### pages/
Route components (each page corresponds to a route)
- Public pages: AboutPage, FAQPage, Homepage, LoginPage, ProductDetailPage, RegisterPage, StorePage
- User pages: CartPage, CheckoutPage, OrdersPage
- Admin pages (in admin/): AdminCategoriesPage, AdminOrdersPage, AdminProductsPage, AdminPromotionsPage
- Special page: AdminSetupPage (for initial admin setup)

#### utils/
Utility functions
- adminDomain.js: Domain configuration

---

## 3. Documentation/ - Project Documentation

### Files
- **PROJECT_STRUCTURE.md**: This file - describes project organization
- **README.md**: General project overview and getting started guide
- **REMINDER.md**: Project reminders and notes
- **improvements/2026-07/**: Improvement suggestions and feature ideas

---

## Development Workflow

### Backend Development
1. Navigate to `Backend/` directory
2. Run `./mvnw spring-boot:run` (Unix) or `mvnw.cmd spring-boot:run` (Windows)
3. Server starts on `http://localhost:8080`

### Frontend Development
1. Navigate to `Frontend/` directory
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development server
4. App opens on `http://localhost:5173` (or similar)

---

## Key Technologies

### Backend Stack
- Java 17+
- Spring Boot 3+
- Spring Data JPA
- Spring Security + JWT
- Maven
- Hibernate (JPA provider)

### Frontend Stack
- React 18+
- Vite
- Axios (HTTP client)
- React Router (routing)

---

## Naming Conventions

### Backend
- **Files**: PascalCase (e.g., `ProductController.java`, `UserRepository.java`)
- **Packages**: lowercase (e.g., `com.westoncodesops.sokoonline.controllers`)
- **Interfaces**: Suffix with `Interface` (e.g., `ProductServiceInterface.java`)
- **Repositories**: Suffix with `Repository` (e.g., `ProductRepository.java`)

### Frontend
- **Components/Pages**: PascalCase (e.g., `Navbar.jsx`, `Homepage.jsx`)
- **Utilities/Files**: camelCase (e.g., `axios.js`, `adminDomain.js`)
- **CSS**: kebab-case (e.g., `App.css`, `index.css`)

