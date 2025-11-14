# Deployment Guide - Production Setup

## Important: Data Safety

Your users will be depositing real money, so data safety is CRITICAL. Here's how to ensure zero data loss:

### Database (Supabase)
- Your database is hosted on Supabase (separate from your code)
- Supabase provides automatic backups
- Even if you update your code, the database remains untouched
- User data, transactions, and balances are ALWAYS safe

### Key Point
**Updating your frontend or backend code NEVER affects the database.**
The database is completely separate and managed by Supabase.

---

## Recommended Deployment Strategy

### Option 1: Vercel + Render (RECOMMENDED)

**Frontend: Vercel (Free)**
- Always-on (no sleeping)
- Automatic HTTPS
- Global CDN
- Free tier: 100GB bandwidth/month
- Perfect for Next.js

**Backend: Render (Paid $7/month)**
- Always-on (no sleeping)
- Automatic HTTPS
- Free tier sleeps after 15 minutes (NOT good for real money app)
- Paid tier: $7/month for always-on

**Total Cost: $7/month**

**Why this is best:**
- Frontend is free and always fast
- Backend is always-on (users can deposit/withdraw anytime)
- No sleeping issues
- Professional and reliable

---

### Option 2: Railway (All-in-one)

**Both Frontend + Backend on Railway**
- Cost: $5-10/month
- Always-on
- Easy to manage
- Good for beginners

---

### Option 3: Render Free Tier (NOT RECOMMENDED for production)

**Why NOT recommended:**
- Backend sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds to wake up
- Bad user experience
- Users might think site is broken
- Not professional for real money app

**Only use free tier for:**
- Testing
- Demo
- Development

---

## Step-by-Step Deployment

### Part 1: Deploy Python Backend to Render

#### 1. Create Render Account
- Go to https://render.com
- Sign up with GitHub

#### 2. Create Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select `python-backend` folder (or root if backend is in root)

#### 3. Configure Service
```
Name: ludomania-backend
Environment: Python 3
Region: Choose closest to your users
Branch: main

Build Command: pip install -r requirements.txt
Start Command: python main.py
```

#### 4. Add Environment Variables
Click "Environment" and add:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=skillstakes01@gmail.com
SMTP_PASSWORD=gdcblzfhdfupmwgm
ADMIN_EMAIL=michealbyers750@gmail.com
SECRET_KEY=your-generated-secret-key
OTP_EXPIRY_MINUTES=10
APP_URL=https://your-frontend-url.vercel.app
BACKEND_URL=https://your-backend.onrender.com
```

#### 5. Choose Plan
- **Free:** Sleeps after 15 min (NOT for production)
- **Starter ($7/month):** Always-on (RECOMMENDED)

#### 6. Deploy
- Click "Create Web Service"
- Wait 5-10 minutes for deployment
- Your backend URL: `https://your-app.onrender.com`

---

### Part 2: Deploy Next.js Frontend to Vercel

#### 1. Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub

#### 2. Import Project
1. Click "Add New..." → "Project"
2. Import your GitHub repository
3. Select `ludomania-app` folder (or root if frontend is in root)

#### 3. Configure Project
```
Framework Preset: Next.js
Root Directory: ludomania-app (if not in root)
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

#### 4. Add Environment Variables
Click "Environment Variables" and add:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=skillstakes01@gmail.com
SMTP_PASSWORD=gdcblzfhdfupmwgm
ADMIN_EMAIL=michealbyers750@gmail.com
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_PYTHON_BACKEND_URL=https://your-backend.onrender.com
```

#### 5. Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Your frontend URL: `https://your-app.vercel.app`

---

### Part 3: Update CORS in Python Backend

After deployment, update `python-backend/main.py`:

```python
# Change this:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    ...
)

# To this:
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-app.vercel.app",  # Your production frontend
        "http://localhost:3000"  # Keep for local development
    ],
    ...
)
```

Commit and push to GitHub. Render will auto-deploy.

---

## Data Safety Checklist

### Before Going Live

- [ ] Supabase backups enabled (automatic on all plans)
- [ ] 2FA enabled on Supabase account
- [ ] Environment variables secured (never in code)
- [ ] Service role key kept secret
- [ ] Database RLS policies enabled
- [ ] Test all features on production
- [ ] Backup database manually (first time)

### Regular Maintenance

- [ ] Weekly: Check Supabase logs for errors
- [ ] Weekly: Verify backups are working
- [ ] Monthly: Export database backup manually
- [ ] Monthly: Review user transactions
- [ ] Monthly: Check for suspicious activity

---

## Handling Updates

### Updating Frontend (Zero Downtime)
1. Make changes locally
2. Test thoroughly
3. Push to GitHub
4. Vercel auto-deploys
5. Database unchanged
6. User data safe

### Updating Backend (Zero Downtime)
1. Make changes locally
2. Test thoroughly
3. Push to GitHub
4. Render auto-deploys
5. Database unchanged
6. User data safe

### Database Migrations (Careful!)
1. Create migration SQL file
2. Test on staging database first
3. Backup production database
4. Run migration during low-traffic time
5. Verify data integrity
6. Monitor for errors

---

## Cost Breakdown

### Recommended Setup (Vercel + Render Paid)
- Vercel (Frontend): $0/month
- Render (Backend): $7/month
- Supabase (Database): $0/month (free tier) or $25/month (pro)
- **Total: $7-32/month**

### When to Upgrade Supabase
Free tier limits:
- 500MB database
- 2GB bandwidth/month
- 50,000 monthly active users

Upgrade to Pro ($25/month) when:
- Database > 400MB
- More than 1,000 active users
- Need better backups (30-day retention)

---

## Monitoring

### What to Monitor
1. **Supabase Dashboard**
   - Database size
   - Active users
   - API requests
   - Errors

2. **Render Dashboard**
   - Backend uptime
   - Response times
   - Memory usage
   - Errors

3. **Vercel Dashboard**
   - Frontend deployments
   - Page load times
   - Bandwidth usage

4. **Email Inbox (Admin)**
   - New user notifications
   - Deposit requests
   - Withdrawal requests
   - Error alerts

---

## Backup Strategy

### Automatic (Supabase)
- Daily backups (last 7 days on free tier)
- Point-in-time recovery
- No action needed

### Manual (Recommended)
```bash
# Weekly backup
# Install Supabase CLI first
supabase db dump -f backup-$(date +%Y%m%d).sql
```

Store backups:
- Google Drive
- Dropbox
- External hard drive

---

## Emergency Procedures

### If Backend Goes Down
1. Check Render dashboard for errors
2. Check logs
3. Restart service if needed
4. Users can still view site (frontend works)
5. Deposits/withdrawals temporarily unavailable

### If Frontend Goes Down
1. Check Vercel dashboard
2. Check deployment logs
3. Rollback to previous deployment if needed
4. Usually auto-recovers in minutes

### If Database Issues
1. Check Supabase status page
2. Check Supabase logs
3. Contact Supabase support
4. Restore from backup if needed

---

## Final Recommendation

**For Real Money App:**
- Frontend: Vercel (Free)
- Backend: Render Starter ($7/month)
- Database: Supabase Free (upgrade to Pro when needed)

**Total: $7/month to start**

This ensures:
- Always-on service
- Fast performance
- Automatic backups
- Zero data loss
- Professional experience

**DO NOT use free backend tier for production with real money!**

---

## Next Steps

1. Test everything locally
2. Create Render account
3. Create Vercel account
4. Deploy backend to Render (paid tier)
5. Deploy frontend to Vercel
6. Update CORS settings
7. Test all features on production
8. Start accepting users!

---

Your user data is safe because:
- Database is separate from code
- Supabase handles backups automatically
- Code updates don't affect database
- You can rollback deployments anytime
- Multiple backup layers

