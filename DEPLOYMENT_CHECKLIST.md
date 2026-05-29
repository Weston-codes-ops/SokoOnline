# Render Deployment Checklist

## Pre-Deployment ✅

- [ ] **Frontend Build Test**
  ```bash
  cd sokoonline-frontend
  npm install
  npm run build
  ```
  Expected: No errors, `dist/` folder created

- [ ] **Backend Build Test**
  ```bash
  mvn clean package -DskipTests
  ```
  Expected: `target/sokoonline-0.0.1-SNAPSHOT.jar` created

- [ ] **Docker Build Test**
  ```bash
  docker build -t sokoonline:latest .
  ```
  Expected: Multi-stage build completes successfully

- [ ] **Git Commit & Push**
  ```bash
  git add .
  git commit -m "Prepare for Render deployment"
  git push origin main
  ```

## On Render Dashboard 🚀

### Step 1: Create Database
- [ ] New PostgreSQL Database
- [ ] Name: `sokoonline-db`
- [ ] Database: `sokoonline`
- [ ] Save connection string

### Step 2: Create Backend Service
- [ ] New → Web Service
- [ ] Connect GitHub repository
- [ ] Runtime: Docker
- [ ] Add environment variables:
  - [ ] `DATABASE_URL` 
  - [ ] `DATABASE_USERNAME`
  - [ ] `DATABASE_PASSWORD`
  - [ ] `JWT_SECRET`
  - [ ] `JWT_EXPIRATION_MS`
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
  - [ ] `MPESA_CONSUMER_KEY`
  - [ ] `MPESA_CONSUMER_SECRET`
  - [ ] `MPESA_SHORTCODE`
  - [ ] `MPESA_PASSKEY`
  - [ ] `MPESA_CALLBACK_URL`

### Step 3: Wait for Deployment
- [ ] Monitor Logs tab (5-10 min)
- [ ] Wait for "Build successful"
- [ ] Service shows "Live"

## Post-Deployment Testing 🧪

- [ ] **Backend Health Check**
  ```bash
  curl https://sokoonline-api.onrender.com/api/health
  ```

- [ ] **Authentication Test**
  ```bash
  curl -X POST https://sokoonline-api.onrender.com/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"pass123"}'
  ```

- [ ] **Products Endpoint**
  ```bash
  curl https://sokoonline-api.onrender.com/api/products
  ```

- [ ] **Frontend Load**
  Visit in browser: `https://sokoonline-api.onrender.com`
  Expected: React app loads (no 404)

## Troubleshooting 🔧

| Issue | Solution |
|-------|----------|
| **502 Bad Gateway** | Check backend logs, restart service |
| **DB Connection Error** | Verify DATABASE_URL format, check credentials |
| **Frontend Not Loading** | Ensure npm build succeeds locally, check Dockerfile |
| **CORS Errors** | Update CorsConfig.java with Render URLs |
| **Build Timeout** | Upgrade to Standard tier or optimize Dockerfile |
| **Out of Memory** | Upgrade from Free to Standard tier |

## Quick Links
- Render Dashboard: https://dashboard.render.com
- Backend Service: https://sokoonline-api.onrender.com
- Render Docs: https://render.com/docs
- Check Logs: Dashboard → Service → Logs tab

## Emergency Rollback
If deployment fails after pushing:
1. Check logs for errors
2. Run local Docker build to debug
3. Fix issues locally
4. Commit and push again (auto-redeploys)

---
**Estimated Time: 45-60 minutes**
