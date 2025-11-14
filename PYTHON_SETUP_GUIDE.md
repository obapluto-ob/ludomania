# 🐍 Python Security Backend - Complete Setup Guide

## 🎯 What This Adds

Your Ludomania platform now has **enterprise-level security** with:

✅ **Email Verification** - Users must verify email with OTP before accessing the platform  
✅ **OTP Login** - Passwordless login option with email code  
✅ **Password Reset** - Secure password reset with email verification  
✅ **Device Tracking** - Track user devices and send alerts for new logins  
✅ **Password Visibility Toggle** - Show/hide password in all forms  
✅ **Welcome Emails** - Automated emails after successful registration  
✅ **Security Alerts** - Email notifications for suspicious activity  

---

## 🚀 Quick Setup (10 Minutes)

### Step 1: Install Python (if not installed)

**Windows:**
```bash
# Download from python.org or use winget
winget install Python.Python.3.11
```

**Verify installation:**
```bash
python --version
# Should show Python 3.8 or higher
```

### Step 2: Install Python Dependencies

```bash
cd python-backend
pip install -r requirements.txt
```

### Step 3: Configure Environment

```bash
# Copy example env file
cp .env.example .env
```

**Edit `.env` file:**
```env
# Supabase (same as Next.js app)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key  # ⚠️ Important! Get from Supabase

# SMTP (same as Next.js app)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-gmail-app-password
ADMIN_EMAIL=your-admin-email@gmail.com

# Security
SECRET_KEY=generate-this-with-command-below
OTP_EXPIRY_MINUTES=10

# App URLs
APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

**Generate SECRET_KEY:**
```bash
# On Windows PowerShell:
python -c "import secrets; print(secrets.token_hex(32))"

# Copy the output and paste as SECRET_KEY in .env
```

### Step 4: Get Supabase Service Role Key

1. Go to your Supabase project
2. Click **Settings** → **API**
3. Scroll down to **Service Role Key** (⚠️ Keep this secret!)
4. Copy and paste into `.env` as `SUPABASE_SERVICE_KEY`

### Step 5: Run Database Migration

1. Go to Supabase dashboard → **SQL Editor**
2. Open `python-backend/migrations/add_device_tracking.sql`
3. Copy ALL the SQL code
4. Paste into Supabase SQL Editor
5. Click **Run**

This adds:
- `user_devices` table for device tracking
- `email_verified` column to profiles
- Indexes and security policies

### Step 6: Start Python Backend

```bash
# Make sure you're in python-backend folder
cd python-backend

# Start the server
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test it:**
Open browser: http://localhost:8000

You should see:
```json
{"message": "Ludomania Security API", "status": "running"}
```

### Step 7: Start Next.js App

```bash
# In a NEW terminal
cd ludomania-app
npm run dev
```

---

## 🎮 Using the New Features

### New Auth Pages

The enhanced auth pages are at:
- **Signup:** http://localhost:3000/auth/signup-new
- **Login:** http://localhost:3000/auth/login-new  
- **Forgot Password:** http://localhost:3000/auth/forgot-password

### User Flow

**1. Registration:**
- User enters username, email, password
- Password visibility toggle (eye icon)
- Clicks "Sign Up"
- Receives 6-digit code via email
- Enters code to verify
- Receives welcome email
- Redirected to dashboard

**2. Login (Password):**
- User enters email & password
- Password visibility toggle
- Clicks "Login"
- If new device → receives security alert email
- Redirected to dashboard

**3. Login (OTP - Passwordless):**
- User clicks "Email Code" tab
- Enters email
- Receives 6-digit code
- Enters code
- If new device → receives security alert email
- Logged in!

**4. Forgot Password:**
- User enters email
- Receives reset code
- Enters code + new password
- Password visibility toggle
- Password reset!

---

## 📧 Email Templates

Users will receive beautiful HTML emails for:

1. **Verification Code** - 6-digit OTP with branding
2. **Login Code** - Quick login OTP
3. **Password Reset** - Reset code with instructions
4. **Welcome Email** - After successful verification
5. **New Device Alert** - Security notification with device details

All emails include:
- Professional Ludomania branding
- Clear instructions
- Expiry time (10 minutes)
- Security warnings

---

## 🔒 Security Features Explained

### Email Verification
- **Why:** Prevents fake accounts and ensures valid emails
- **How:** 6-digit OTP sent to email, expires in 10 minutes
- **Max attempts:** 5 tries before needing new code

### Device Tracking
- **What it tracks:**
  - Browser (Chrome, Firefox, etc.)
  - Operating System (Windows, Mac, etc.)
  - Device type (Desktop, Mobile, Tablet)
  - IP address
  - Login count
  
- **When alerts are sent:**
  - First time login from new device
  - Different browser on same device
  - Different location (IP change)

### OTP System
- **Secure:** Random 6-digit codes
- **Time-limited:** 10-minute expiry
- **Attempt-limited:** Max 5 wrong attempts
- **Purpose-based:** Separate OTPs for verification, login, reset

---

## 🧪 Testing the System

### Test Email Verification

1. Go to http://localhost:3000/auth/signup-new
2. Create account with your email
3. Check your email for 6-digit code
4. Enter code to verify
5. Check email again for welcome message

### Test OTP Login

1. Go to http://localhost:3000/auth/login-new
2. Click "Email Code" tab
3. Enter your email
4. Check email for login code
5. Enter code to login

### Test Device Tracking

1. Login from Chrome
2. Check your email - no alert (first device)
3. Login from Firefox (or incognito)
4. Check email - you'll get "New Device Alert"!

### Test Password Reset

1. Go to http://localhost:3000/auth/forgot-password
2. Enter your email
3. Check email for reset code
4. Enter code + new password
5. Login with new password

---

## 🔧 Troubleshooting

**Python backend won't start:**
```bash
# Make sure you're in the right folder
cd python-backend

# Check if dependencies are installed
pip list | grep fastapi

# Reinstall if needed
pip install -r requirements.txt
```

**Emails not sending:**
- Check SMTP credentials in `.env`
- Verify Gmail app password (not regular password)
- Check spam folder
- Test with: `python -c "from utils.email_service import send_email; send_email('your@email.com', 'Test', '<h1>Test</h1>')"`

**"Service role key" error:**
- Make sure you copied the SERVICE ROLE key, not the anon key
- It's a different, longer key in Supabase settings

**Database errors:**
- Run the migration SQL in Supabase
- Check if `user_devices` table exists
- Verify `email_verified` column in profiles table

**CORS errors:**
- Make sure Python backend is running on port 8000
- Check browser console for exact error
- Verify `APP_URL` in `.env` matches your Next.js URL

---

## 📊 Monitoring

### View All Devices for a User

```bash
curl http://localhost:8000/auth/devices/USER_ID_HERE
```

### Check API Health

```bash
curl http://localhost:8000/
```

### View Logs

The Python backend prints logs to console. Watch for:
- Email sending status
- OTP generation
- Device tracking events
- Errors

---

## 🚀 Production Deployment

When deploying to production:

1. **Use Redis for OTP storage** (currently in-memory)
2. **Add rate limiting** to prevent abuse
3. **Enable HTTPS** for secure communication
4. **Use environment variables** (never commit `.env`)
5. **Add logging** (use proper logging service)
6. **Monitor emails** (track delivery rates)
7. **Add IP geolocation** for better device alerts

---

## 📝 API Documentation

Full API docs available at: http://localhost:8000/docs (when server is running)

Interactive API testing at: http://localhost:8000/redoc

---

## 🎉 You're All Set!

Your Ludomania platform now has:
- ✅ Enterprise-level security
- ✅ Email verification system
- ✅ Multiple login options
- ✅ Device tracking & alerts
- ✅ Professional email templates
- ✅ Secure password reset

**Next Steps:**
1. Test all features thoroughly
2. Customize email templates (in `utils/email_service.py`)
3. Update landing page to link to new auth pages
4. Deploy to production!

---

**Need Help?**
- Check Python backend logs
- Test API at http://localhost:8000/docs
- Review email templates in `utils/email_service.py`
- Check Supabase logs for database issues

🎲 **Happy Gaming!**

