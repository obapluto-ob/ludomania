# ⚡ Quick Start Guide

Get Ludomania running in 10 minutes!

## Step 1: Supabase Setup (3 minutes)

1. Go to **https://supabase.com** → Sign up (free)
2. Click **"New Project"**
3. Fill in:
   - Name: `ludomania`
   - Database Password: (save this!)
   - Region: Choose closest to you
4. Wait for project to be created (~2 minutes)

## Step 2: Database Setup (2 minutes)

1. In Supabase dashboard, click **"SQL Editor"** (left sidebar)
2. Click **"New Query"**
3. Open `supabase-schema.sql` file in your code editor
4. Copy ALL the SQL code
5. Paste into Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter)
7. You should see "Success. No rows returned"

## Step 3: Get API Keys (1 minute)

1. In Supabase, click **"Project Settings"** (gear icon, bottom left)
2. Click **"API"** in the left menu
3. Copy these two values:
   - **Project URL** (looks like: https://xxxxx.supabase.co)
   - **anon public** key (long string starting with "eyJ...")

## Step 4: Configure App (2 minutes)

1. Open `.env.local` file in your code editor
2. Replace these values:

```env
NEXT_PUBLIC_SUPABASE_URL=paste_your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
```

3. For email (Gmail example):

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=your_app_password_here
ADMIN_EMAIL=your.email@gmail.com
```

### Getting Gmail App Password:
1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already)
3. Go to https://myaccount.google.com/apppasswords
4. Create app password for "Mail"
5. Copy the 16-character password
6. Paste as `SMTP_PASSWORD` (no spaces)

## Step 5: Run the App (2 minutes)

```bash
# Install dependencies (first time only)
npm install

# Start the app
npm run dev
```

Wait for:
```
> Ready on http://localhost:3000
```

## Step 6: Test It! 🎉

1. Open browser: **http://localhost:3000**
2. Click **"Get Started"**
3. Create an account
4. Check your email - you should receive a notification!

---

## ✅ You're Done!

### What's Next?

**Update Your Bank Details:**
1. Open `app/dashboard/deposit/page.tsx`
2. Find the "Bank Details" section (around line 85)
3. Replace with your actual bank info

**Test the Full Flow:**
1. Create 2 accounts (use different emails)
2. Deposit money with account 1
3. Approve deposit in Supabase (see ADMIN_GUIDE.md)
4. Create a game
5. Join with account 2
6. Play and test!

---

## 🆘 Troubleshooting

**"Invalid API key" error:**
- Double-check your Supabase URL and key in `.env.local`
- Make sure there are no extra spaces
- Restart the dev server (`npm run dev`)

**Email not sending:**
- Verify Gmail app password is correct
- Check spam folder
- Make sure 2FA is enabled on Gmail

**Database errors:**
- Make sure you ran the entire `supabase-schema.sql`
- Check Supabase dashboard for error messages
- Try running the SQL again

**Port 3000 already in use:**
```bash
# Kill the process and restart
npm run dev
```

---

## 📚 Full Documentation

- **[README.md](README.md)** - Complete overview
- **[SETUP.md](SETUP.md)** - Detailed setup guide
- **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** - Managing users & transactions

---

## 🎮 Ready to Play!

Your Ludomania platform is now live at **http://localhost:3000**

Share the link with your friends and start playing! 🎲

