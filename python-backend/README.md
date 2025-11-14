# 🐍 Ludomania Python Security Backend

Enhanced security layer for Ludomania with email verification, OTP login, password reset, and device tracking.

## 🔒 Features

- ✅ **Email Verification** - OTP-based email verification for new users
- ✅ **OTP Login** - Passwordless login with email code
- ✅ **Password Reset** - Secure password reset with OTP
- ✅ **Device Tracking** - Track user devices and alert on new device logins
- ✅ **Password Visibility Toggle** - Show/hide password in forms
- ✅ **Welcome Emails** - Automated welcome emails after registration
- ✅ **Security Alerts** - Email notifications for new device logins

## 🚀 Quick Start

### 1. Install Python Dependencies

```bash
cd python-backend
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- Supabase URL, keys (including service role key)
- SMTP settings
- Secret key (generate with: `openssl rand -hex 32`)

### 3. Run Database Migration

Go to Supabase SQL Editor and run:
```sql
-- Copy and paste contents of migrations/add_device_tracking.sql
```

### 4. Start the Server

```bash
python main.py
```

Or with uvicorn:
```bash
uvicorn main:app --reload --port 8000
```

Server runs on: `http://localhost:8000`

## 📡 API Endpoints

### Registration & Verification

**POST** `/auth/register`
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "SecurePass123!"
}
```

**POST** `/auth/verify-email`
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**POST** `/auth/resend-verification`
```json
{
  "email": "user@example.com"
}
```

### OTP Login

**POST** `/auth/request-otp-login`
```json
{
  "email": "user@example.com"
}
```

**POST** `/auth/verify-otp-login`
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### Password Reset

**POST** `/auth/forgot-password`
```json
{
  "email": "user@example.com"
}
```

**POST** `/auth/reset-password`
```json
{
  "email": "user@example.com",
  "code": "123456",
  "new_password": "NewSecurePass123!"
}
```

### Device Management

**POST** `/auth/check-device`
```json
{
  "user_id": "uuid-here"
}
```

**GET** `/auth/devices/{user_id}`

## 🔐 Security Features

### Email Verification
- 6-digit OTP sent to email
- 10-minute expiry
- Max 5 attempts
- Beautiful HTML email templates

### Device Tracking
- Unique device fingerprinting
- Browser, OS, and device type detection
- IP address tracking
- Email alerts for new devices
- Login count tracking

### OTP System
- Secure random code generation
- Time-based expiry
- Attempt limiting
- Purpose-based OTP (verification, login, reset)

### Password Security
- Bcrypt hashing
- Strong password requirements (implement in frontend)
- Secure reset flow

## 📧 Email Templates

All emails include:
- Professional branding
- Clear call-to-action
- Security information
- Responsive design

Templates:
1. **Verification Code** - Welcome + OTP
2. **Login Code** - Quick login OTP
3. **Password Reset** - Reset OTP
4. **Welcome Email** - Post-verification
5. **New Device Alert** - Security notification

## 🗄️ Database Schema

### user_devices Table
```sql
- id (UUID)
- user_id (UUID, FK to auth.users)
- device_fingerprint (TEXT)
- browser (TEXT)
- os (TEXT)
- device_type (TEXT)
- ip_address (TEXT)
- first_seen (TIMESTAMP)
- last_seen (TIMESTAMP)
- login_count (INTEGER)
- is_trusted (BOOLEAN)
```

### profiles Table (Updated)
```sql
- email_verified (BOOLEAN)
- verification_code (TEXT)
- verification_expiry (TIMESTAMP)
```

## 🔧 Configuration

### Environment Variables

```env
# Supabase
SUPABASE_URL=your_url
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key  # Important!

# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
ADMIN_EMAIL=admin@example.com

# Security
SECRET_KEY=generate_with_openssl_rand_hex_32
OTP_EXPIRY_MINUTES=10

# App
APP_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000
```

## 🧪 Testing

Test the API with curl:

```bash
# Register
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Test123!"}'

# Verify
curl -X POST http://localhost:8000/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

## 📝 Notes

- OTPs are stored in-memory (use Redis in production)
- Device fingerprints are SHA-256 hashed
- All emails are HTML formatted
- CORS enabled for localhost:3000
- Service role key needed for admin operations

## 🚀 Production Deployment

1. Use Redis for OTP storage
2. Add rate limiting
3. Enable HTTPS
4. Use environment-specific configs
5. Add logging and monitoring
6. Implement IP geolocation for device alerts

## 📚 Integration with Next.js

See frontend documentation for integration examples.

---

Built with FastAPI 🚀

