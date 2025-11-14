# Ludomania - Quick Start Guide

## Prerequisites

1. **Node.js** (v18 or higher) - For Next.js frontend
2. **Python** (v3.8 or higher) - For security backend
3. **Supabase Account** - For database and authentication

---

## Step 1: Set Up Supabase

### 1.1 Create Supabase Project

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in:
   - Name: `ludomania`
   - Database Password: (create a strong password)
   - Region: (choose closest to you)
4. Click "Create new project"
5. Wait 2-3 minutes for setup

### 1.2 Run Database Migration

1. In Supabase dashboard, click "SQL Editor"
2. Open file: `ludomania-app/supabase-schema.sql`
3. Copy ALL the SQL code
4. Paste into Supabase SQL Editor
5. Click "Run"
6. You should see: "Success. No rows returned"

### 1.3 Run Python Backend Migration

1. In Supabase SQL Editor (same place)
2. Open file: `python-backend/migrations/add_device_tracking.sql`
3. Copy ALL the SQL code
4. Paste into Supabase SQL Editor
5. Click "Run"

### 1.4 Get API Keys

1. In Supabase dashboard, click "Settings" (gear icon)
2. Click "API"
3. Copy these values:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public** key (under "Project API keys")
   - **service_role** key (under "Project API keys" - keep this secret!)

---

## Step 2: Configure Python Backend

### 2.1 Install Python Dependencies

```bash
cd python-backend
pip install -r requirements.txt
```

### 2.2 Update Environment File

The `.env` file is already created with SMTP credentials. You just need to add Supabase keys:

1. Open `python-backend/.env`
2. Replace these lines with your Supabase values:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

The SMTP settings are already configured:
- Email: skillstakes01@gmail.com
- Admin: michealbyers750@gmail.com

### 2.3 Start Python Backend

```bash
# Make sure you're in python-backend folder
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Test it: Open browser to http://localhost:8000
You should see: `{"message": "Ludomania Security API", "status": "running"}`

**Keep this terminal running!**

---

## Step 3: Configure Next.js Frontend

### 3.1 Install Dependencies

Open a NEW terminal:

```bash
cd ludomania-app
npm install
```

### 3.2 Update Environment File

The `.env.local` file is already created with SMTP credentials. You just need to add Supabase keys:

1. Open `ludomania-app/.env.local`
2. Replace these lines with your Supabase values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

The SMTP and Python backend URL are already configured.

### 3.3 Start Next.js App

```bash
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000
```

**Keep this terminal running too!**

---

## Step 4: Test the Platform

### 4.1 Access the App

Open browser: http://localhost:3000

### 4.2 Test Registration

1. Click "Get Started" or go to: http://localhost:3000/auth/signup-new
2. Fill in:
   - Username: testuser
   - Email: your-email@gmail.com (use a real email you can access)
   - Password: test123
3. Click "Sign Up"
4. Check your email for 6-digit verification code
5. Enter the code
6. You should receive a welcome email
7. You'll be redirected to dashboard

### 4.3 Test OTP Login

1. Logout (if logged in)
2. Go to: http://localhost:3000/auth/login-new
3. Click "Email Code" tab
4. Enter your email
5. Click "Send Login Code"
6. Check email for login code
7. Enter the code
8. You should be logged in!

### 4.4 Test Device Tracking

1. Login from Chrome (if you haven't)
2. Check email - no alert (first device)
3. Open Firefox or Incognito mode
4. Login again
5. Check email - you'll get "New Device Alert"!

### 4.5 Test Password Reset

1. Go to: http://localhost:3000/auth/forgot-password
2. Enter your email
3. Check email for reset code
4. Enter code + new password
5. Password reset!

---

## Step 5: Admin Operations

As admin (michealbyers750@gmail.com), you'll receive emails for:

1. **New User Registration** - When someone signs up
2. **Deposit Requests** - When user submits deposit proof
3. **Withdrawal Requests** - When user requests withdrawal
4. **Game Results** - When a game completes (who won, amount)

### Approve Deposits

1. Check your email for deposit notification
2. Go to Supabase dashboard
3. Click "Table Editor"
4. Click "transactions" table
5. Find the pending deposit
6. Change `status` from `pending` to `completed`
7. User's wallet will be credited

### Process Withdrawals

1. Check email for withdrawal request
2. Transfer money to user's bank account
3. Go to Supabase → transactions table
4. Change withdrawal status to `completed`

---

## Troubleshooting

### Python backend won't start

```bash
# Check if port 8000 is in use
netstat -ano | findstr :8000

# Kill the process if needed
taskkill /PID <process_id> /F

# Reinstall dependencies
pip install -r requirements.txt
```

### Emails not sending

1. Check SMTP password in `.env` (no spaces)
2. Verify Gmail app password is correct
3. Check spam folder
4. Make sure Python backend is running

### Database errors

1. Make sure you ran BOTH SQL migrations
2. Check Supabase logs (Logs section in dashboard)
3. Verify service_role key is correct

### Frontend errors

1. Make sure Python backend is running on port 8000
2. Check browser console for errors
3. Verify Supabase keys in `.env.local`

---

## What's Next?

1. **Customize branding** - Update colors, logo in components
2. **Test with friends** - Create accounts and play games
3. **Add bank details** - Update deposit page with your bank info
4. **Deploy to production** - Use Vercel for Next.js, Railway for Python

---

## Important URLs

- **Frontend:** http://localhost:3000
- **Python API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **Supabase Dashboard:** https://supabase.com/dashboard

## Admin Email

All notifications go to: **michealbyers750@gmail.com**

## Support Email

Emails sent from: **skillstakes01@gmail.com**

---

You're all set! Your Ludomania platform is ready to use.

