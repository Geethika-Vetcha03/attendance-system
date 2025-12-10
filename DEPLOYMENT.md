# Deployment Guide — Online Attendance Management System

This guide walks you through deploying the Attendance System to **Render** with a PostgreSQL database.

---

## Prerequisites

- **GitHub Account** — Code must be pushed to GitHub (done: `https://github.com/Geethika-Vetcha03/attendance-system`)
- **Render Account** — Sign up at [render.com](https://render.com) (free tier available)
- **PostgreSQL Database** — Use one of:
  - **Render PostgreSQL** (easiest, integrated)
  - **ElephantSQL** (free tier: elephantsql.com)
  - **Neon** (serverless: neon.tech)
  - **Railway** (railway.app)

---

## Step 1: Set Up PostgreSQL Database

### Option A: Use Render PostgreSQL (Recommended)
1. Log in to [render.com](https://render.com)
2. Click **New +** → **PostgreSQL**
3. Fill in:
   - **Name**: `attendance-db`
   - **Database**: `postgres`
   - **Username**: `postgres`
   - **Region**: Choose closest to you
   - **Plan**: Free
4. Click **Create Database**
5. After creation, copy the **External Database URL** — this is your `DATABASE_URL`
   - Format: `postgresql://user:password@host:port/dbname`

### Option B: Use ElephantSQL (Free Alternative)
1. Sign up at [elephantsql.com](https://elephantsql.com)
2. Create a new instance (free plan)
3. Copy the **URL** (your `DATABASE_URL`)

---

## Step 2: Deploy Backend on Render

1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **New +** → **Web Service**
3. Select your GitHub repository: `attendance-system`
4. Fill in:
   - **Name**: `attendance-system-api`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm run start:prod`
   - **Plan**: Free
5. **Environment Variables** — Click **Add Environment Variable** for each:
   | Key | Value | Notes |
   |-----|-------|-------|
   | `NODE_ENV` | `production` | — |
   | `DATABASE_URL` | `postgresql://user:pass@host:port/dbname` | Copy from your DB provider |
   | `DATABASE_SSL` | `true` | Required for most hosted PostgreSQL |
   | `PORT` | `3001` | Default; Render overrides if needed |
   | `FRONTEND_URL` | `https://attendance-system-web.onrender.com` | Set after frontend is deployed |

6. Click **Create Web Service**
7. Wait for deployment (2-3 minutes)
8. Copy the **service URL** (e.g., `https://attendance-system-api.onrender.com`) — you'll need this for the frontend

---

## Step 3: Deploy Frontend on Render

1. Go to [render.com/dashboard](https://render.com/dashboard)
2. Click **New +** → **Static Site**
3. Select your GitHub repository: `attendance-system`
4. Fill in:
   - **Name**: `attendance-system-web`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: Free
5. **Environment Variables** — Click **Add Environment Variable**:
   | Key | Value | Notes |
   |-----|-------|-------|
   | `VITE_API_URL` | `https://attendance-system-api.onrender.com` | Use backend URL from Step 2 |

6. Click **Create Static Site**
7. Wait for deployment (1-2 minutes)
8. Get your frontend URL from the dashboard (e.g., `https://attendance-system-web.onrender.com`)

---

## Step 4: Update Backend FRONTEND_URL

The backend needs to know the deployed frontend URL for CORS.

1. Go back to the **Backend Service** in Render
2. Click **Settings** → **Environment**
3. Update the `FRONTEND_URL` variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://attendance-system-web.onrender.com` (your frontend URL from Step 3)
4. Click **Save**
5. Render will auto-redeploy the backend

---

## Step 5: Verify Deployment

### Test Backend Health
```bash
curl https://attendance-system-api.onrender.com/api/health
# Expected: 404 or similar (no health endpoint defined, but server responds)
# If connection fails, check DATABASE_URL and DATABASE_SSL in Render environment
```

### Test Frontend
1. Open `https://attendance-system-web.onrender.com` in your browser
2. You should see the Login page
3. Try logging in with test credentials (if database has users)

### Test API Connectivity
1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try to log in on the frontend
4. Check the `/api/auth/login` request:
   - Should show `200` if credentials are correct
   - Should show `401` if credentials are wrong
   - Should show CORS error if `FRONTEND_URL` is not set correctly

---

## Step 6: Create Initial Users (Optional)

If the database is empty, you need to create users.

### Option A: Use Seed Script (Recommended)
1. In your local terminal (in the backend folder):
   ```bash
   DATABASE_URL="your_render_postgres_url" npm run seed
   ```
2. This will create sample users (if seed.ts is implemented)

### Option B: Create via API
```bash
# Register a new admin user
curl -X POST https://attendance-system-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@school.com",
    "password": "admin123",
    "name": "Admin User",
    "role": "admin"
  }'
```

### Option C: Direct Database Insert
1. Connect to your Render PostgreSQL using a tool like **pgAdmin** or **DBeaver**
2. Insert users directly into the `users` table:
   ```sql
   INSERT INTO users (id, email, password, name, role, "createdAt")
   VALUES (
     gen_random_uuid(),
     'admin@school.com',
     '$2a$10$...hashed_password...',  -- Use bcryptjs to hash the password
     'Admin User',
     'admin',
     NOW()
   );
   ```

---

## Troubleshooting

### Backend Won't Start
**Problem**: Deployment fails with database connection error
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/dbname`
- Ensure `DATABASE_SSL=true` for hosted databases
- Verify database is running and accessible from Render

**Problem**: "The server does not support SSL connections"
- Set `DATABASE_SSL=false` if connecting to local/non-SSL Postgres
- Set `DATABASE_SSL=true` if using Render/ElephantSQL/Neon

### Frontend Can't Connect to Backend
**Problem**: Login page loads but login fails with CORS error
- Check that `VITE_API_URL` is set to your backend URL
- Check that backend `FRONTEND_URL` is set to your frontend URL
- Wait 5 minutes for Render to redeploy after changing env vars

**Problem**: "Invalid email or password" but credentials should be correct
- Verify users exist in the database
- Check that passwords were hashed with `bcryptjs` (not plaintext)
- Verify the user's email matches exactly (case-sensitive)

### Database Connection Slow
- Render free tier databases go to sleep after 7 days of inactivity
- Upgrade to paid tier or use a different provider (Railway, Neon)

---

## Environment Variables Reference

### Backend (`node dist/main.js`)
| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| `NODE_ENV` | No | `development` | `production` |
| `DATABASE_URL` | Yes | N/A | `postgresql://user:pass@host:5432/dbname` |
| `DATABASE_SSL` | No | `false` | `true` |
| `PORT` | No | `3001` | `3001` |
| `FRONTEND_URL` | No | `http://localhost:3000` | `https://attendance-system-web.onrender.com` |

### Frontend (Build-time)
| Variable | Required | Default | Example |
|----------|----------|---------|---------|
| `VITE_API_URL` | No | `http://localhost:3001` | `https://attendance-system-api.onrender.com` |

---

## Local Development

To test before deploying:

```bash
# Backend
cd backend
DATABASE_URL=postgres://user:pass@localhost:5432/postgres DATABASE_SSL=false npm start

# Frontend (in new terminal)
cd frontend
VITE_API_URL=http://localhost:3001 npm run dev
```

---

## Production Checklist

- [ ] PostgreSQL database is running and accessible
- [ ] `DATABASE_URL` set in Render backend environment
- [ ] `DATABASE_SSL=true` if using hosted PostgreSQL
- [ ] `FRONTEND_URL` set in Render backend environment (after frontend is deployed)
- [ ] `VITE_API_URL` set in Render frontend environment
- [ ] Initial users created in the database
- [ ] Tested login flow end-to-end
- [ ] Verified no sensitive data (passwords, keys) in code
- [ ] `.env` file is in `.gitignore` (not committed)

---

## Monitoring

### View Logs
1. In Render dashboard, click your service
2. Click **Logs** tab
3. Look for errors in application startup

### Check Database
```bash
# Connect to your Postgres instance
psql "postgresql://user:pass@host:5432/dbname"

# Verify tables exist
\dt

# Check users table
SELECT id, email, name, role FROM users;
```

---

## Support

If deployment fails:
1. Check Render logs for specific errors
2. Verify all environment variables are set
3. Ensure GitHub repo is up to date with latest code
4. Test locally first to ensure code works

---

**Last Updated**: December 10, 2025
**Status**: Ready for deployment ✅
