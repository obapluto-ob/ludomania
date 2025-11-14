# Next.js Frontend - How to Run

## Prerequisites

- Node.js 18 or higher
- npm (comes with Node.js)
- Python backend running on port 8000
- Supabase account with project created

---

## Step 1: Install Dependencies

```bash
cd ludomania-app
npm install
```

This will install:
- Next.js 16
- React 19
- Supabase client
- Socket.io client
- TailwindCSS
- All other dependencies

---

## Step 2: Configure Environment

The `.env.local` file is already created with SMTP credentials configured.

**You only need to add your Supabase credentials:**

1. Open `ludomania-app/.env.local`
2. Replace these lines:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to get Supabase keys:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click Settings (gear icon) → API
4. Copy:
   - Project URL → NEXT_PUBLIC_SUPABASE_URL
   - anon public key → NEXT_PUBLIC_SUPABASE_ANON_KEY

**Already configured:**
- SMTP_USER=skillstakes01@gmail.com
- SMTP_PASSWORD=gdcblzfhdfupmwgm
- ADMIN_EMAIL=michealbyers750@gmail.com
- NEXT_PUBLIC_PYTHON_BACKEND_URL=http://localhost:8000

---

## Step 3: Run Database Migration

Before starting the app, run the main migration:

1. Go to Supabase dashboard → SQL Editor
2. Open file: `ludomania-app/supabase-schema.sql`
3. Copy ALL the SQL code
4. Paste into Supabase SQL Editor
5. Click "Run"

This creates:
- profiles table
- transactions table
- games table
- All necessary indexes and policies

---

## Step 4: Make Sure Python Backend is Running

The frontend requires the Python backend to be running for authentication features.

**Check if Python backend is running:**
Open browser: http://localhost:8000

If you see an error, start the Python backend first:
```bash
cd python-backend
python main.py
```

---

## Step 5: Start the Frontend

```bash
npm run dev
```

You should see:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- Local:        http://localhost:3000
```

The app is now running on **http://localhost:3000**

---

## Step 6: Test the Platform

### Test 1: Access the landing page

Open browser: http://localhost:3000

You should see the Ludomania landing page.

### Test 2: Register a new account

1. Click "Get Started" or go to: http://localhost:3000/auth/signup-new
2. Fill in:
   - Username: testuser
   - Email: your-email@gmail.com (use real email)
   - Password: test123
3. Click "Sign Up"
4. Check your email for 6-digit code
5. Enter the code
6. You should receive welcome email
7. Admin receives new user notification
8. Redirected to dashboard

### Test 3: Test OTP Login

1. Logout
2. Go to: http://localhost:3000/auth/login-new
3. Click "Email Code" tab
4. Enter your email
5. Check email for login code
6. Enter code
7. Logged in!

### Test 4: Test Device Tracking

1. Login from Chrome
2. No email alert (first device)
3. Open Firefox or Incognito
4. Login again
5. Check email - New Device Alert!

---

## Available Pages

### Public Pages
- `/` - Landing page
- `/auth/signup-new` - Registration with email verification
- `/auth/login-new` - Login (password or OTP)
- `/auth/forgot-password` - Password reset

### Protected Pages (require login)
- `/dashboard` - User dashboard with wallet
- `/dashboard/deposit` - Deposit funds
- `/dashboard/withdrawal` - Request withdrawal
- `/dashboard/transactions` - Transaction history
- `/game/create` - Create new game
- `/game/join` - Join game with room code
- `/game/play/[gameId]` - Play Ludo game

---

## Troubleshooting

### Port 3000 already in use

```bash
# Windows - Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <process_id> /F

# Or use different port
PORT=3001 npm run dev
```

### "supabaseUrl is required" error

This means `.env.local` is not configured properly.

1. Make sure file is named `.env.local` (not `.env.local.txt`)
2. Check that Supabase URL and key are added
3. Restart the dev server after changing .env

### Python backend connection errors

1. Make sure Python backend is running on port 8000
2. Check `NEXT_PUBLIC_PYTHON_BACKEND_URL` in `.env.local`
3. Check browser console for CORS errors

### Socket.io connection errors

1. Make sure custom server is running (npm run dev uses server.js)
2. Check if port 3000 is available
3. Restart the server

### Database errors

1. Make sure Supabase migration was run
2. Check Supabase keys in `.env.local`
3. Verify RLS policies are enabled
4. Check Supabase logs

---

## Running in Production

### Deploy to Vercel (Recommended - Free tier)

1. Create account at https://vercel.com
2. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```
3. Deploy:
   ```bash
   vercel
   ```
4. Add environment variables in Vercel dashboard
5. Update `NEXT_PUBLIC_PYTHON_BACKEND_URL` to your Python backend URL

**Note:** Vercel free tier includes:
- Unlimited deployments
- Automatic HTTPS
- Global CDN
- 100GB bandwidth/month

### Important for Production

1. **Update CORS in Python backend** - Allow only your Vercel domain
2. **Use production Supabase** - Don't use test database
3. **Enable HTTPS** - Required for security
4. **Update environment variables** - Use production URLs
5. **Test thoroughly** - Test all features before launch

---

## Keeping Data Safe

### User Data Protection

1. **Supabase handles backups** - Automatic daily backups
2. **Row-level security** - Users can only access their own data
3. **Encrypted connections** - All data encrypted in transit
4. **No data loss on updates** - Database is separate from code

### Before Deploying Updates

1. **Test locally first** - Always test changes locally
2. **Backup database** - Export data before major changes
3. **Use staging environment** - Test on staging before production
4. **Monitor after deployment** - Check logs for errors

### Database Migrations

When adding new features that need database changes:

1. Create new SQL migration file
2. Test on local Supabase project first
3. Backup production database
4. Run migration on production
5. Verify data integrity

---

## Development vs Production

### Development (localhost)
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Hot reload enabled
- Debug mode on
- Test payments

### Production
- Frontend: https://your-app.vercel.app
- Backend: https://your-backend.render.com
- Optimized build
- Error tracking
- Real payments

---

## Next Steps

1. Test all features locally
2. Customize branding (colors, logo)
3. Add your bank details to deposit page
4. Test with friends
5. Deploy to production
6. Start accepting real money!

---

## Support

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Supabase: https://supabase.com/dashboard
- Admin Email: michealbyers750@gmail.com

