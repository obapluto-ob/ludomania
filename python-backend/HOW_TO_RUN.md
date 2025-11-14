# Python Backend - How to Run

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Supabase account with project created

---

## Step 1: Install Dependencies

```bash
cd python-backend
pip install -r requirements.txt
```

This will install:
- FastAPI (web framework)
- Uvicorn (ASGI server)
- Supabase client
- Email libraries
- Security libraries

---

## Step 2: Configure Environment

The `.env` file is already created with SMTP credentials configured.

**You only need to add your Supabase credentials:**

1. Open `python-backend/.env`
2. Replace these lines:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
SUPABASE_SERVICE_KEY=your-service-role-key-here
```

**How to get Supabase keys:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click Settings (gear icon) → API
4. Copy:
   - Project URL → SUPABASE_URL
   - anon public key → SUPABASE_KEY
   - service_role key → SUPABASE_SERVICE_KEY (keep secret!)

**Already configured:**
- SMTP_USER=skillstakes01@gmail.com
- SMTP_PASSWORD=gdcblzfhdfupmwgm
- ADMIN_EMAIL=michealbyers750@gmail.com

---

## Step 3: Run Database Migration

Before starting the server, run the migration:

1. Go to Supabase dashboard → SQL Editor
2. Open file: `python-backend/migrations/add_device_tracking.sql`
3. Copy ALL the SQL code
4. Paste into Supabase SQL Editor
5. Click "Run"

This creates:
- `user_devices` table
- Email verification columns in profiles table

---

## Step 4: Start the Server

```bash
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

The server is now running on **http://localhost:8000**

---

## Step 5: Test the API

### Test 1: Check if server is running

Open browser: http://localhost:8000

You should see:
```json
{"message": "Ludomania Security API", "status": "running"}
```

### Test 2: View API documentation

Open browser: http://localhost:8000/docs

You'll see interactive API documentation where you can test all endpoints.

---

## Available Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/verify-email` - Verify email with OTP
- `POST /auth/resend-verification` - Resend verification code
- `POST /auth/request-otp-login` - Request OTP for login
- `POST /auth/verify-otp-login` - Login with OTP
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with OTP

### Device Tracking
- `POST /auth/check-device` - Check if device is known
- `GET /auth/devices/{user_id}` - Get all user devices

---

## Admin Notifications

The admin (michealbyers750@gmail.com) will receive emails for:

1. **New User Registration** - When user verifies email
2. **Deposit Requests** - From Next.js app
3. **Withdrawal Requests** - From Next.js app
4. **Game Results** - From Next.js app
5. **Security Alerts** - Suspicious activities

---

## Troubleshooting

### Port 8000 already in use

```bash
# Windows - Find process using port 8000
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <process_id> /F
```

### Emails not sending

1. Check SMTP password in `.env` (no spaces)
2. Verify Gmail app password is correct
3. Check spam folder
4. Test with a simple email

### Database errors

1. Make sure migration was run
2. Check Supabase service_role key
3. Verify Supabase URL is correct
4. Check Supabase logs

### Import errors

```bash
# Reinstall dependencies
pip install -r requirements.txt --force-reinstall
```

---

## Running in Production

### Option 1: Render (Recommended - Free tier available)

1. Create account at https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - Name: ludomania-backend
   - Environment: Python 3
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python main.py`
5. Add environment variables from `.env`
6. Click "Create Web Service"

**Note:** Free tier sleeps after 15 minutes of inactivity. Upgrade to paid ($7/month) for always-on.

### Option 2: Railway

1. Create account at https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repository
4. Add environment variables
5. Deploy

**Cost:** $5/month for 500 hours

### Option 3: DigitalOcean App Platform

1. Create account at https://www.digitalocean.com
2. Click "Create" → "Apps"
3. Connect GitHub
4. Configure Python app
5. Add environment variables
6. Deploy

**Cost:** $5/month

---

## Keeping Data Safe

### Database Backups (Supabase)

Supabase automatically backs up your database:
- Point-in-time recovery (last 7 days on free tier)
- Daily backups (retained for 7 days)
- Upgrade to Pro for 30-day retention

### Manual Backup

```bash
# Export database (requires Supabase CLI)
supabase db dump -f backup.sql
```

### Important Notes

1. **Never lose Supabase credentials** - Store them securely
2. **Enable 2FA on Supabase** - Extra security
3. **Regular backups** - Export data weekly
4. **Monitor logs** - Check for errors daily
5. **Update dependencies** - Keep packages updated

---

## Development vs Production

### Development (localhost)
- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- CORS: Allows all origins

### Production
- Backend: https://your-app.render.com
- Frontend: https://your-app.vercel.app
- CORS: Restricted to frontend domain
- HTTPS: Required for security
- Environment variables: Set in hosting platform

---

## Next Steps

1. Start the Python backend (this server)
2. Start the Next.js frontend (see ludomania-app/HOW_TO_RUN.md)
3. Test registration flow
4. Test all security features
5. Deploy to production

---

## Support

- API Documentation: http://localhost:8000/docs
- Supabase Dashboard: https://supabase.com/dashboard
- Admin Email: michealbyers750@gmail.com

