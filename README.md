# SokoOnline

SokoOnline is a modern, production-style full-stack e-commerce marketplace built for Nairobi shoppers. It combines a Spring Boot backend with a React/Vite frontend to deliver secure authentication, role-based access, product discovery, cart management, and order processing.

## Key Features

- Customer storefront with search, category browsing, and subcategory filters
- Secure JWT authentication and session persistence
- Product detail pages with add-to-cart protections for signed-in users
- Cart and checkout flow with order creation
- Admin management for products, categories, promotions, and orders
- PostgreSQL-backed relational data model with Spring Data JPA
- M-Pesa payment integration support via Daraja API
- Smooth modern frontend UI powered by React, Vite, Tailwind-style utility classes, and Lucide icons

## Tech Stack

- Backend: Java 17, Spring Boot 4, Spring Security, Spring Data JPA, JWT, PostgreSQL
- Frontend: React 19, Vite, React Router v7, Axios, Lucide icons
- Build tools: Maven for backend, Vite/npm for frontend

## Repository Layout

- `/src/main/java/com/westoncodesops/sokoonline` — Spring Boot application source
- `/src/main/resources/application.properties` — backend configuration
- `sokoonline-frontend/` — React frontend application

## Getting Started

### Prerequisites

- Java 17 SDK
- PostgreSQL database
- Node.js 20+ / npm
- Git

### Backend Setup

1. Create a PostgreSQL database named `sokoonline`.
2. Update `src/main/resources/application.properties` with your database credentials.
3. Configure a secure JWT secret in `jwt.secret` and set proper M-Pesa keys if you plan to use payment integration.

Example config values:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/sokoonline
spring.datasource.username=postgres
spring.datasource.password=your-db-password
jwt.secret=replace-with-a-strong-secret
```

### Run the Backend

From the repository root:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.
\mvnw.cmd spring-boot:run
```

The backend starts on `http://localhost:8080` by default.

### Frontend Setup

```bash
cd sokoonline-frontend
npm install
npm run dev
```

Open the Vite local URL shown in the terminal to preview the storefront.

## Development Workflow

- Backend build: `./mvnw clean package`
- Frontend build: `npm run build`
- Frontend linting: `npm run lint`

## Notes

- The backend uses `spring.jpa.hibernate.ddl-auto=update` for local development, so schema changes are applied automatically.
- M-Pesa sandbox values are present in `application.properties` for local testing; replace them with real credentials before deploying.
- User session state is stored in local storage on the frontend for persistent login.

## Why SokoOnline?

SokoOnline is designed to feel like a real marketplace app with modern UX, secure cart workflows, and extendable admin tools. It’s a strong base for building a Kenyan e-commerce experience with shopping, promotions, and payment support.

---

Built with code, design, and market-ready intent in mind.