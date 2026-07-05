# SokoOnline Deployment Guide (Free/Cheap for Portfolio)

This guide will walk you through deploying SokoOnline for free/very cheap, perfect for your portfolio!

## Recommended Stack (Free Tiers)
- **Frontend**: Vercel (Free)
- **Backend**: Railway (Free 500 hours/month)
- **Database**: Railway PostgreSQL (Free)

## Prerequisites
1. Your code is pushed to a **GitHub** or **GitLab** repo
2. Accounts on [Vercel](https://vercel.com) and [Railway](https://railway.app) (sign up with GitHub)

---

## Step 1: Prepare Project for Deployment
We've already updated `Backend/src/main/resources/application.properties` to use `spring.jpa.hibernate.ddl-auto=update` instead of `create-drop`, which preserves data between restarts.

---

## Step 2: Deploy Frontend on Vercel (Free)
1. Go to [vercel.com/new](https://vercel.com/new)
2. **Import your Git repo**
3. **Configure project**:
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: Set to `Frontend` (important!)
   - **Environment Variables**: (We'll fill this in after deploying the backend)
4. Click **Deploy**
5. Wait for deployment to finish and copy your frontend URL (e.g., `https://soko-online.vercel.app`)

---

## Step 3: Deploy Backend + Database on Railway (Free)
### Part A: Create Project and Add Database
1. Go to [railway.app/new](https://railway.app/new)
2. Click **Deploy from repo** and select your repo
3. Click **Add Service** → **Database** → **PostgreSQL** (free tier)
4. Wait for PostgreSQL to provision

### Part B: Configure Backend Service
1. Select your backend service (the repo import)
2. Go to **Settings** tab:
   - Set **Root Directory** to `Backend`
   - Set **Build Command** to `./mvnw clean package -DskipTests` (or `mvnw.cmd clean package -DskipTests` if using Windows)
   - Set **Start Command** to `java -jar target/*.jar`
3. Go to **Variables** tab and add the following:
   - Copy variables from your `Backend/src/main/resources/application.properties` or generate new secure values:
     | Variable | Value / Description |
     |----------|---------------------|
     | `SPRING_DATASOURCE_URL` | Use Railway's `DATABASE_URL` (format: `jdbc:postgresql://<host>:<port>/<db>?user=<user>&password=<pass>`) OR use individual vars below |
     | `SPRING_DATASOURCE_USERNAME` | From Railway PostgreSQL → `PGUSER` |
     | `SPRING_DATASOURCE_PASSWORD` | From Railway PostgreSQL → `PGPASSWORD` |
     | `JWT_SECRET` | Generate a long secure string (use [random.org](https://www.random.org/strings/?num=1&len=64&digits=on&upperalpha=on&loweralpha=on&unique=on&format=html&rnd=new) or `openssl rand -base64 64`) |
     | `JWT_EXPIRATION_MS` | `86400000` (24 hours) |
     | `APP_ADMIN_CREATE_SECRET` | Your existing secret or create a new one |
     | `APP_CORS_ALLOWED_ORIGINS` | Your Vercel frontend URL (e.g., `https://soko-online.vercel.app`) |
     | (Optional) `MPESA_CONSUMER_KEY` | Dummy value for portfolio (or real if you want to test M-Pesa) |
     | (Optional) `MPESA_CONSUMER_SECRET` | Dummy value |
     | (Optional) `MPESA_CALLBACK_URL` | Dummy value |
4. Click **Deploy** and wait for it to finish
5. Copy your backend URL from Railway (e.g., `https://soko-online-backend.up.railway.app`)

---

## Step 4: Link Frontend to Backend
1. Go back to your Vercel project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://your-railway-backend-url.up.railway.app/api` (IMPORTANT: add `/api` at the end!)
3. Redeploy your frontend on Vercel (it will auto-pick up the new env var):
   - Go to Vercel → **Deployments** → click the three dots on your latest deployment → **Redeploy**

---

## Step 5: Test Your Deployed App!
1. Visit your Vercel frontend URL
2. Go to `/admin-setup` to create your first admin user
3. Log in and test the app!

---

## Notes for Your Portfolio
- The Railway free tier **sleeps after inactivity**, so the first load might take a few seconds (mention this in your portfolio!)
- For M-Pesa: You can show screenshots/demo videos instead of using real credentials if you don't want to set up a real Daraja app for free tier
- Mention the tech stack:
  - Backend: Spring Boot 4.0.3, Spring Security, JPA, PostgreSQL
  - Frontend: React 19, Vite, Tailwind CSS, Lucide React
  - Deployment: Vercel, Railway

---

## Troubleshooting
- **Frontend can't reach backend?** Double-check `VITE_API_BASE_URL` (make sure it has `/api` at the end) and `APP_CORS_ALLOWED_ORIGINS` (matches your frontend URL exactly)
- **Backend won't start on Railway?** Check Railway logs, make sure `Root Directory` is set to `Backend`
- **Database not connecting?** Verify `SPRING_DATASOURCE_URL`/username/password match Railway's PostgreSQL credentials
