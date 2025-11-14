# Ludomania - START HERE

## Two Separate Servers Required

This platform has **TWO separate servers** that must run simultaneously:

1. **Python Backend** (Port 8000) - Security & Authentication
2. **Next.js Frontend** (Port 3000) - User Interface & Game

---

## Quick Start

### Terminal 1: Start Python Backend

```bash
cd python-backend
pip install -r requirements.txt
python main.py
```

Should show: `Uvicorn running on http://0.0.0.0:8000`

### Terminal 2: Start Next.js Frontend

```bash
cd ludomania-app
npm install
npm run dev
```

Should show: `ready started server on 0.0.0.0:3000`

---

## Configuration Required

Both servers need Supabase credentials. The SMTP settings are already configured.

### 1. Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Create new project
3. Wait 2-3 minutes for setup

### 2. Run Database Migrations

**Migration 1: Main Schema**
1. In Supabase → SQL Editor
2. Copy all SQL from `ludomania-app/supabase-schema.sql`
3. Paste and click "Run"

**Migration 2: Security Features**
1. In Supabase → SQL Editor
2. Copy all SQL from `python-backend/migrations/add_device_tracking.sql`
3. Paste and click "Run"

### 3. Get Supabase Keys

1. In Supabase → Settings → API
2. Copy these 3 values:
   - Project URL
   - anon public key
   - service_role key (keep secret!)

### 4. Update Environment Files

**File 1: `python-backend/.env`**
```env
SUPABASE_URL=paste-your-project-url-here
SUPABASE_KEY=paste-your-anon-key-here
SUPABASE_SERVICE_KEY=paste-your-service-role-key-here
```

**File 2: `ludomania-app/.env.local`**
```env
NEXT_PUBLIC_SUPABASE_URL=paste-your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste-your-anon-key-here
```

---

## Testing

1. Open http://localhost:3000
2. Click "Get Started"
3. Register with your real email
4. Check email for verification code
5. Enter code
6. Check email for welcome message
7. Admin (michealbyers750@gmail.com) receives new user notification

---

## Detailed Guides

- **python-backend/HOW_TO_RUN.md** - Backend setup & troubleshooting
- **ludomania-app/HOW_TO_RUN.md** - Frontend setup & troubleshooting
- **DEPLOYMENT_GUIDE.md** - Production deployment
- **QUICK_START.md** - Complete setup guide

---

## Admin Email

All notifications go to: **michealbyers750@gmail.com**

Notifications for:
- New user registrations
- Deposit requests
- Withdrawal requests
- Game results
- Security alerts

---

## Data Safety

Your database is hosted on Supabase (separate from code).

- Code updates NEVER affect database
- User balances always safe
- Automatic daily backups
- Zero data loss on updates

See DEPLOYMENT_GUIDE.md for complete data safety strategy.

---

## Deployment

**Recommended for production:**
- Frontend: Vercel (Free)
- Backend: Render ($7/month for always-on)
- Database: Supabase (Free to start)

**Total: $7/month**

See DEPLOYMENT_GUIDE.md for step-by-step instructions.

---

## Support

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs
- Admin: michealbyers750@gmail.com

---

**Next Step:** Follow QUICK_START.md for complete setup

