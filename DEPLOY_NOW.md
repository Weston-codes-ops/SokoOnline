# 🚀 SokoOnline → Render Deployment (1-Hour Quickstart)

## 📋 What We've Prepared

✅ **Updated Dockerfile** - Now includes frontend build + backend  
✅ **Updated axios config** - Uses `/api` for production  
✅ **CORS configuration** - Configured for local & production  
✅ **Environment template** - All variables documented  
✅ **Deployment guides** - Step-by-step instructions  

---

## ⏱️ Quick Timeline

| Phase | Duration | What You Do |
|-------|----------|-----------|
| **Phase 1** | 10 min | Local testing & verify builds |
| **Phase 2** | 15 min | Create Render services (DB + Backend) |
| **Phase 3** | 20 min | Deploy & configure |
| **Phase 4** | 10 min | Test & troubleshoot |
| **Total** | ~**45-60 min** | Complete deployment |

---

## 🎯 Start Here (Choose Your Path)

### Path A: I just want to get it working NOW 🏃‍♂️
1. Open [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) ← **START HERE**
2. Follow the checklist step-by-step
3. Reference [ENV_VARS_TEMPLATE.md](ENV_VARS_TEMPLATE.md) for variable values

### Path B: I want detailed explanations 📚
1. Open [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md) ← **START HERE**
2. Read Phase 1-5 carefully
3. Execute steps in order

### Path C: I want to test locally first 🧪
1. Run: `./setup-local.sh` (Mac/Linux) or `setup-local.bat` (Windows)
2. Or manually:
   ```bash
   cd sokoonline-frontend && npm install && npm run build
   mvn clean package -DskipTests
   docker build -t sokoonline:latest .
   ```
3. Then follow Path A or Path B

---

## 🔑 Key Files Modified

| File | Change | Why |
|------|--------|-----|
| `Dockerfile` | Now 3-stage build (frontend → backend → run) | Serves frontend from backend |
| `sokoonline-frontend/src/api/axios.js` | Uses `/api` instead of hardcoded URL | Works in production |
| `sokoonline-frontend/.env.production` | Sets `VITE_API_URL=/api` | Frontend knows API location |
| `CorsConfig.java` | Added localhost + production hosts | Prevents CORS errors |

---

## ⚠️ Critical Steps (Don't Skip!)

1. **Test Docker build locally**
   ```bash
   docker build -t sokoonline:latest .
   ```
   This prevents deployment surprises.

2. **Get all credentials FIRST**
   - Render PostgreSQL connection string
   - Cloudinary API keys (from cloudinary.com)
   - M-Pesa credentials
   - JWT secret (generate with: `openssl rand -base64 32`)

3. **Use environment variables properly**
   - Never commit `.env` files
   - Add all vars to Render dashboard, not in code
   - Reference [ENV_VARS_TEMPLATE.md](ENV_VARS_TEMPLATE.md)

4. **Test after deployment**
   ```bash
   # Test API
   curl https://sokoonline-api.onrender.com/api/products
   
   # Test frontend
   Visit: https://sokoonline-api.onrender.com
   ```

---

## 📞 Troubleshooting Quick Reference

**"npm run dev fails"** → Missing dependencies
```bash
cd sokoonline-frontend && npm install
```

**"Docker build fails"** → Check the error message
```bash
docker build --progress=plain -t sokoonline:latest .
# Read the error carefully
```

**"502 Bad Gateway"** → Backend crashed or still starting
```bash
# Check Render logs: Dashboard → Service → Logs
```

**"CORS error in console"** → Update CorsConfig.java
```java
.allowedOrigins("https://sokoonline-api.onrender.com")
```

**"Database connection fails"** → Check DATABASE_URL format
```
postgresql://username:password@host:port/database
```

See [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md) → Phase 4 for more.

---

## 📦 What Happens When You Deploy

1. You push to GitHub
2. Render webhook triggers
3. Docker build starts:
   - Node builds React app → `dist/`
   - Maven builds Spring Boot → `app.jar`
   - Java runs jar, serving frontend + API
4. App comes live at: `https://sokoonline-api.onrender.com`

---

## ✅ Deployment Verification

After deployment, verify everything works:

```bash
# 1. API is running
curl -I https://sokoonline-api.onrender.com/api/products

# 2. Frontend loads
curl https://sokoonline-api.onrender.com | grep -i "react"

# 3. Authentication works
curl -X POST https://sokoonline-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# 4. Database connected
# Check in Render logs for "Connection successful"
```

---

## 🆘 Need Help?

1. **Check logs first** → Render Dashboard → Service → Logs
2. **Search issues** → Error message often tells you exactly what's wrong
3. **Verify variables** → Dashboard → Service → Environment
4. **Rebuild** → Service Settings → Redeploy
5. **Local test** → Run Docker locally to debug faster

---

## 📚 Next Steps After Deployment

- [ ] Set up custom domain (if you have one)
- [ ] Enable auto-deploy on git push
- [ ] Set up database backups
- [ ] Monitor error logs
- [ ] Add analytics/monitoring
- [ ] Set up CI/CD for testing before deploy

---

## 🎯 You Are Here

```
START → Preparation → Deployment → Testing → Done! 🎉
   ↓
   [Choose Path A, B, or C above]
```

**Ready? Open [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) or [RENDER_DEPLOYMENT_GUIDE.md](RENDER_DEPLOYMENT_GUIDE.md)**

---

Generated: May 2026  
Project: SokoOnline  
Target: Render
