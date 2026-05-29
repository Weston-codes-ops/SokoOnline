# Render Deployment Guide - SokoOnline (1-Hour Setup)

## Overview
- **Backend**: Spring Boot API (Dockerfile-based)
- **Frontend**: React app (served from backend)
- **Database**: PostgreSQL
- **Total Services**: 3 (PostgreSQL, Backend, optionally Frontend)

---

## Phase 1: Preparation (10 minutes)

### Step 1.1: Fix Frontend Build Issues
```bash
cd sokoonline-frontend
npm install
npm run build
```
If there are errors, check for missing dependencies or node version issues (Node 18+ required).

### Step 1.2: Update Backend Dockerfile (Include Frontend)
The current Dockerfile only builds the backend. We need to include the frontend build:

**Update your Dockerfile to:**
```dockerfile
# Stage 1 — Build Frontend
FROM node:18-alpine AS frontend-build
WORKDIR /frontend
COPY sokoonline-frontend/package*.json ./
RUN npm install
COPY sokoonline-frontend ./
RUN npm run build

# Stage 2 — Build Backend
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 3 — Run the App
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
COPY --from=frontend-build /frontend/dist ./static
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Step 1.3: Verify Environment Variables
Create a `.env` file locally to test (DO NOT COMMIT):
```
DATABASE_URL=postgresql://user:pass@localhost:5432/sokoonline
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=yourpassword
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRATION_MS=86400000
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Note: M-Pesa variables are not needed for this deployment.

### Step 1.4: Update Application Properties
Ensure [src/main/resources/application.properties](src/main/resources/application.properties) has:
```properties
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

jwt.secret=${JWT_SECRET}
jwt.expiration-ms=${JWT_EXPIRATION_MS}

cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}

# M-Pesa configuration - NOT NEEDED for this deployment
# mpesa.consumer-key=${MPESA_CONSUMER_KEY}
# mpesa.consumer-secret=${MPESA_CONSUMER_SECRET}
# mpesa.shortcode=${MPESA_SHORTCODE}
# mpesa.passkey=${MPESA_PASSKEY}
# mpesa.callback-url=${MPESA_CALLBACK_URL}

server.port=${PORT:8080}
```

### Step 1.5: Update Frontend API Configuration
Check [sokoonline-frontend/src/api/axios.js](sokoonline-frontend/src/api/axios.js) and ensure it uses environment variables:
```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if exists
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
```

### Step 1.6: Create .env.production for Frontend
Create [sokoonline-frontend/.env.production](sokoonline-frontend/.env.production):
```
VITE_API_URL=/api
```

### Step 1.7: Commit Changes
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

---

## Phase 2: Create Render Services (15 minutes)

### Step 2.1: Create PostgreSQL Database

1. **Sign in to Render** → https://render.com
2. Click **New +** → **PostgreSQL**
3. **Configuration:**
   - Name: `sokoonline-db`
   - Database: `sokoonline`
   - User: `sokoonline` (save the password!)
   - Region: Select closest to you
   - Pricing Plan: Free (Standard for production)
4. Click **Create Database**
5. **Copy the connection string** (you'll need this)

**Extract credentials from connection string:**
- `DATABASE_URL`: The full connection string (postgres://...)
- Split to get: `DATABASE_USERNAME` and `DATABASE_PASSWORD`

### Step 2.2: Create Backend Service

1. Click **New +** → **Web Service**
2. **Connect Repository:**
   - Select your GitHub repository
   - Branch: `main`
3. **Configuration:**
   - Name: `sokoonline-api`
   - Runtime: `Docker`
   - Region: Same as DB
   - Pricing Plan: Free
4. Click **Advanced** options:
   - Add **Environment Variables:**
     - `DATABASE_URL`: postgres://sokoonline:password@yourhost:5432/sokoonline
     - `DATABASE_USERNAME`: sokoonline
     - `DATABASE_PASSWORD`: (from step 2.1)
     - `JWT_SECRET`: (generate a strong secret)
     - `JWT_EXPIRATION_MS`: 86400000
     - `CLOUDINARY_CLOUD_NAME`: your-value
     - `CLOUDINARY_API_KEY`: your-value
     - `CLOUDINARY_API_SECRET`: your-value

5. Click **Create Web Service**

**Wait for build to complete** (5-10 minutes)
- Check build logs in the "Logs" tab
- If build fails, check the Docker build output

### Step 2.3: Create Frontend Service (Optional - if deploying separately)

Skip this if backend serves frontend. Otherwise:

1. Click **New +** → **Static Site**
2. Connect your repository
3. **Build Command:** `cd sokoonline-frontend && npm install && npm run build`
4. **Publish Directory:** `sokoonline-frontend/dist`
5. Add environment variables for API calls
6. Click **Deploy**

---

## Phase 3: Configuration & Testing (20 minutes)

### Step 3.1: Verify Backend Deployment

1. Go to your backend service on Render
2. Copy the URL: `https://sokoonline-api.onrender.com`
3. Test API endpoint:
   ```bash
   curl https://sokoonline-api.onrender.com/api/health
   ```

### Step 3.2: Update Database Migrations
If needed, SSH into backend and run:
```bash
java -jar app.jar --spring.jpa.hibernate.ddl-auto=update
```

### Step 3.3: Configure CORS (If Separate Frontend)

Update backend [src/main/java/com/westoncodesops/sokoonline/config/CorsConfig.java](src/main/java/com/westoncodesops/sokoonline/config/CorsConfig.java):

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "http://localhost:5173",
                        "https://sokoonline-frontend.onrender.com",
                        "https://sokoonline-api.onrender.com"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

### Step 3.4: Test Key Flows

**Test Authentication:**
```bash
curl -X POST https://sokoonline-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

**Test Products:**
```bash
curl https://sokoonline-api.onrender.com/api/products
```

### Step 3.5: Verify All Services Running

Check the Render dashboard to confirm:
- PostgreSQL service status: "Available"
- Web Service status: "Live"
- No errors in service logs

---

## Phase 4: Troubleshooting Common Issues (10 minutes)

### Issue 1: Frontend Not Loading
**Solution:**
- Ensure backend serves static files from `/static`
- Frontend build output is in backend's static folder
- Backend serves `index.html` on `/` with fallback for SPA routes

### Issue 2: Database Connection Fails
**Check:**
```bash
# Verify connection string format
postgresql://username:password@host:port/database

# No special characters in password? If yes, URL encode them
# Example: @ becomes %40
```

### Issue 3: 502 Bad Gateway
**Causes & Solutions:**
1. Backend crashed → Check logs: `Logs` tab in service
2. Out of memory → Upgrade from Free to Standard tier
3. Database not ready → Wait a few minutes for DB to initialize

### Issue 4: CORS Errors
**Update [CorsConfig.java](src/main/java/com/westoncodesops/sokoonline/config/CorsConfig.java)** with your Render URLs

### Issue 5: Build Takes Too Long
**Optimize:**
1. Add `.dockerignore`:
   ```
   node_modules
   .git
   target
   .mvn
   ```
2. Use layer caching in Dockerfile

---

## Phase 5: Post-Deployment (5 minutes)

### Step 5.1: Set Custom Domain (Optional)
1. Go to service settings
2. Click "Custom Domains"
3. Add your domain (e.g., sokoonline.com)

### Step 5.2: Enable Auto-Deploy
1. Service Settings → Auto-Deploy: `Yes`
2. Redeploy on every push to main

### Step 5.3: Set Up Monitoring
- Enable "Notifications" for deployment status
- Check logs regularly for errors

### Step 5.4: Database Backups
1. Go to PostgreSQL service
2. Set backup retention (paid feature)

---

## Quick Command Reference

```bash
# Test local build
docker build -t sokoonline:latest .

# Test backend locally with env file
docker run -p 8080:8080 --env-file .env sokoonline:latest

# Push to GitHub to trigger Render deploy
git push origin main

# View Render logs
# Dashboard → Service → Logs tab
```

---

## Summary Checklist

✅ Updated Dockerfile to include frontend
✅ Fixed frontend build issues
✅ Created PostgreSQL on Render
✅ Created backend service with env variables
✅ Updated CORS configuration
✅ Tested all endpoints
✅ Set callback URLs for integrations
✅ Deployed and verified

---

## Estimated Timeline
- Phase 1: 10 min
- Phase 2: 15 min (+ 5-10 min build time)
- Phase 3: 20 min
- Phase 4: 10 min (if issues)
- **Total: ~1 hour**

---

## Support Resources
- Render Docs: https://render.com/docs
- Spring Boot on Render: https://render.com/docs/deploy-spring-boot
- Docker Compose: https://render.com/docs/docker
