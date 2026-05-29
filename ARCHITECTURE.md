# SokoOnline Deployment Architecture

## 🏗️ What Gets Deployed to Render

```
┌─────────────────────────────────────────────────────────┐
│  RENDER DEPLOYMENT (Single Container + Database)       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────────────────────────────────┐     │
│  │  Web Service (Docker Container)              │     │
│  ├──────────────────────────────────────────────┤     │
│  │  Port 8080 (Render sets PORT env var)        │     │
│  │                                              │     │
│  │  ┌─────────────────────────────────────┐   │     │
│  │  │  Spring Boot Application            │   │     │
│  │  │  ✓ Serves Frontend (React app)      │   │     │
│  │  │  ✓ Serves API (/api/*)              │   │     │
│  │  │  ✓ Handles Auth (JWT)               │   │     │
│  │  │  ✓ Manages Orders, Products, etc.   │   │     │
│  │  └─────────────────────────────────────┘   │     │
│  │                                              │     │
│  │  ┌─────────────────────────────────────┐   │     │
│  │  │  /static folder (Frontend Files)    │   │     │
│  │  │  ✓ index.html                       │   │     │
│  │  │  ✓ JavaScript bundles               │   │     │
│  │  │  ✓ CSS files                        │   │     │
│  │  │  ✓ React app                        │   │     │
│  │  └─────────────────────────────────────┘   │     │
│  └──────────────────────────────────────────────┘     │
│                       │                               │
│  ┌────────────────────▼──────────────────────┐       │
│  │  PostgreSQL Database                      │       │
│  │  ✓ Users                                  │       │
│  │  ✓ Products                               │       │
│  │  ✓ Orders                                 │       │
│  │  ✓ Carts                                  │       │
│  └───────────────────────────────────────────┘       │
│                                                       │
└─────────────────────────────────────────────────────────┘
         https://sokoonline-api.onrender.com
```

---

## 🔄 Request Flow

### User visits: https://sokoonline-api.onrender.com

```
1. Browser sends GET /
   ↓
2. Spring Boot receives request
   ↓
3. Serves index.html from /static folder
   ↓
4. Browser loads React app (App.jsx, components, etc.)
   ↓
5. React app initializes and makes API calls:
   - GET /api/products
   - POST /api/auth/register
   - GET /api/orders
   (All requests go to same backend on /api/* endpoints)
   ↓
6. Backend queries PostgreSQL database
   ↓
7. Response returned to frontend
   ↓
8. React updates UI with data
```

---

## 🐳 Docker Build Process

```
┌──────────────────────────────────────┐
│  Docker Build (3 Stages)             │
├──────────────────────────────────────┤
│                                      │
│  STAGE 1: Frontend Build             │
│  ├─ FROM node:18-alpine              │
│  ├─ npm install (dependencies)       │
│  ├─ npm run build (creates dist/)    │
│  └─ OUTPUT: dist/ folder             │
│                                      │
│  STAGE 2: Backend Build              │
│  ├─ FROM maven:3.9.6                 │
│  ├─ mvn clean package (compile)      │
│  └─ OUTPUT: app.jar                  │
│                                      │
│  STAGE 3: Runtime Image              │
│  ├─ FROM eclipse-temurin:17-jre      │
│  ├─ COPY app.jar                     │
│  ├─ COPY dist/ → /static             │
│  ├─ EXPOSE 8080                      │
│  └─ RUN java -jar app.jar            │
│                                      │
│  FINAL: Single optimized image       │
│  Size: ~500-600 MB                   │
│  Ready for: docker run -p 8080:8080  │
│                                      │
└──────────────────────────────────────┘
```

---

## 📝 Build Timeline

```
GitHub Push
    ↓
Render Webhook Triggered
    ↓
┌─────────────────────────────────────┐
│ Docker Build Starts                 │
├─────────────────────────────────────┤
│ ✓ Clone repository                  │ ~5s
│ ✓ Stage 1: Build frontend           │ ~1-2 min
│ ✓ Stage 2: Build backend            │ ~2-3 min
│ ✓ Stage 3: Create runtime image     │ ~30s
│ ✓ Push to Render registry           │ ~20s
│ ✓ Start container                   │ ~20s
│ ✓ Warm up application               │ ~10s
└─────────────────────────────────────┘
    ↓
Total: 5-10 minutes
    ↓
Service Status: "Live" ✅
    ↓
URL: https://sokoonline-api.onrender.com
```

---

## 🔐 Environment Variables Flow

```
┌──────────────────────────────────┐
│  Render Dashboard Environment    │
├──────────────────────────────────┤
│ DATABASE_URL = postgres://...    │
│ JWT_SECRET = xxxxx               │
│ CLOUDINARY_CLOUD_NAME = xxx      │
│ MPESA_CONSUMER_KEY = xxx         │
│ (12 more variables...)           │
└──────────────────────────────────┘
           ↓
      Mounted as env vars
           ↓
┌──────────────────────────────────┐
│  Docker Container                │
├──────────────────────────────────┤
│ ${DATABASE_URL}                  │
│ ${JWT_SECRET}                    │
│ ${CLOUDINARY_CLOUD_NAME}         │
│ ${MPESA_CONSUMER_KEY}            │
└──────────────────────────────────┘
           ↓
   application.properties reads them
           ↓
   spring.datasource.url=${DATABASE_URL}
   jwt.secret=${JWT_SECRET}
   cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
```

---

## 🌐 Network Flow

```
┌─────────────┐
│   Browser   │
│ (User)      │
└──────┬──────┘
       │ HTTPS
       ▼
┌──────────────────────────────────┐
│  Render CDN / Load Balancer      │
│  sokoonline-api.onrender.com     │
└──────┬───────────────────────────┘
       │ Forwards to
       ▼
┌──────────────────────────────────┐
│  Docker Container                │
│  Port 8080 (Internal)            │
├──────────────────────────────────┤
│  Routes:                         │
│  GET / → index.html (React app)  │
│  GET /api/* → Spring Boot API    │
│  POST /api/auth → Authentication │
└──────┬───────────────────────────┘
       │
       ▼
┌──────────────────────────────────┐
│  PostgreSQL Database             │
│  (Render Managed)                │
└──────────────────────────────────┘
```

---

## 📊 File Organization After Docker Build

```
Docker Image Contents:
│
├── /app/
│   └── app.jar (Spring Boot application ~150 MB)
│
├── /app/static/ (Served by Spring Boot)
│   ├── index.html
│   ├── assets/
│   │   ├── index-abc123.js (React bundle)
│   │   ├── index-def456.css (Tailwind CSS)
│   │   └── ...other assets
│   └── ...other frontend files
│
├── /etc/ (Java/OS configuration)
└── ...other files

When request comes to /:
  1. Spring Boot checks /static/index.html
  2. Sends React app to browser
  3. Browser loads JavaScript from /assets/
  4. React app makes XHR requests to /api/*
```

---

## ✨ Current Architecture vs Deployed Architecture

### BEFORE (Development)
```
┌─────────────────────┐  DIFFERENT     ┌──────────────────┐
│  Frontend (Vite)    │◄─────ports────►│ Backend (Spring) │
│  localhost:5173     │                │  localhost:8080  │
└─────────────────────┘                └──────────────────┘
         ▲                                      ▲
         │ CORS Issues!                        │
         │ Needs special headers               │ 
         │ Cross-origin requests                │
         │                                      │
```

### AFTER (Render)
```
┌─────────────────────────────────────────────────┐
│  Single Container (sokoonline-api.onrender.com) │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Frontend (React app at /)               │  │
│  └──────┬───────────────────────────────────┘  │
│         │ Same origin (localhost)              │
│         │ No CORS needed!                      │
│  ┌──────▼───────────────────────────────────┐  │
│  │  Backend (API at /api/*)                 │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
└─────────────────────────────────────────────────┘
          https://sokoonline-api.onrender.com
          
Benefits:
✓ No CORS issues
✓ Faster (same network hop)
✓ Simpler configuration
✓ One service to manage
```

---

## 🔄 Deployment Services

```
RENDER SERVICES (What you'll create)
│
├─ PostgreSQL Database
│  ├─ Name: sokoonline-db
│  ├─ User: sokoonline
│  ├─ Database: sokoonline
│  └─ Status: Auto-started, managed by Render
│
└─ Web Service (Docker)
   ├─ Name: sokoonline-api
   ├─ Source: GitHub repository
   ├─ Runtime: Docker (uses Dockerfile)
   ├─ Port: 8080 (internal) → Render assigns public URL
   ├─ Environment: 14+ variables
   └─ Auto-deploy: Yes (redeploy on git push)
```

---

## 🎯 Success Indicators

```
✅ Service Shows "Live" (green indicator)
✅ Logs show "Started SokoonlineApplication in X seconds"
✅ Can visit https://sokoonline-api.onrender.com (React app loads)
✅ curl /api/products returns JSON (API working)
✅ Database connected (check logs for "Connection pool initialized")
✅ No errors in logs (Logs tab is clean)
```

---

## 📋 Components & Their Endpoints

```
Frontend (React at /)
├─ HomePage
├─ Navbar (navigation)
├─ Cart (stored in localStorage)
└─ Authentication (JWT in localStorage)

Backend (Spring Boot at /api/)
├─ /auth → User registration, login, JWT
├─ /products → List, search, filter products
├─ /categories → Product categories
├─ /cart → Add/remove items
├─ /orders → Create, view orders
├─ /promotions → View current promotions
└─ /mpesa → M-Pesa payment integration

Database (PostgreSQL)
├─ users table
├─ products table
├─ orders table
├─ carts table
├─ categories table
└─ ... other tables
```

---

## 🆘 Debugging Checklist

```
Frontend not loading?
└─ Check: Service logs for Java errors
   Solution: Backend may have crashed

API returning 404?
└─ Check: /api endpoints in backend
   Solution: Routes may not be defined

Database connection failing?
└─ Check: DATABASE_URL format
   Solution: Must be postgresql://user:pass@host:port/db

CORS errors?
└─ Check: CorsConfig.java allowed origins
   Solution: Add https://sokoonline-api.onrender.com

Slow deployment?
└─ Check: Build logs in Render
   Solution: First build slow, later builds use cache
```

---

This architecture ensures your full-stack app works seamlessly on Render! 🚀
