# Ludomania - Real Money Ludo Gaming Platform

A full-stack web application where players can compete in Ludo games with real money wagers. Built with Next.js, Python FastAPI, Supabase, and Socket.io.

## Features

### Security Features (Python Backend)
- **Email Verification** - Users must verify email with OTP before accessing platform
- **OTP Login** - Passwordless login option with email code
- **Password Reset** - Secure password reset with email verification
- **Device Tracking** - Track user devices and send alerts for new logins
- **Password Visibility Toggle** - Show/hide password in all forms

### Gaming Features (Next.js Frontend)
- **User Authentication** - Secure signup/login with Supabase Auth
- **Wallet System** - Deposit, withdraw, and track your balance
- **Real-time Multiplayer** - Live Ludo games with Socket.io
- **Real Money Wagering** - Play for real cash prizes
- **Email Notifications** - Admin receives notifications for all actions
- **Transaction History** - Complete audit trail of all transactions
- **Automatic Payouts** - Winners receive funds automatically

## Quick Start

**IMPORTANT:** This platform requires both Python backend and Next.js frontend to run.

See **[QUICK_START.md](../QUICK_START.md)** for complete setup instructions.

### Quick Overview

1. **Set up Supabase** (5 minutes)
   - Create project
   - Run database migrations
   - Copy API keys

2. **Start Python Backend** (Port 8000)
   ```bash
   cd python-backend
   pip install -r requirements.txt
   python main.py
   ```

3. **Start Next.js Frontend** (Port 3000)
   ```bash
   cd ludomania-app
   npm install
   npm run dev
   ```

4. **Test the platform**
   - Visit http://localhost:3000
   - Register account at /auth/signup-new
   - Verify email with OTP
   - Start playing!

## Documentation

- **[QUICK_START.md](../QUICK_START.md)** - Complete setup guide (START HERE)
- **[SETUP_COMPLETE.md](../SETUP_COMPLETE.md)** - Configuration summary
- **[PYTHON_SETUP_GUIDE.md](../PYTHON_SETUP_GUIDE.md)** - Python backend details
- **[SECURITY_FEATURES.md](../SECURITY_FEATURES.md)** - Security documentation
- **[ADMIN_GUIDE.md](ADMIN_GUIDE.md)** - Admin operations guide

## 🎯 How It Works

### For Players:
1. Sign up and create an account
2. Deposit funds (manual approval by admin)
3. Create a game or join with a room code
4. Play Ludo in real-time
5. Winner gets 2x the wager amount
6. Withdraw winnings anytime

### For Admin:
1. Receive email notifications for all actions
2. Approve deposits after verifying payment
3. Process withdrawals manually
4. Monitor all transactions via Supabase

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TailwindCSS
- **Backend:** Next.js API Routes, Node.js
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **Real-time:** Socket.io
- **Email:** Nodemailer (SMTP)

## 📁 Project Structure

```
ludomania-app/
├── app/
│   ├── api/              # API routes
│   ├── auth/             # Login/signup pages
│   ├── dashboard/        # User dashboard & wallet
│   ├── game/             # Game creation & play
│   └── page.tsx          # Landing page
├── components/
│   └── LudoBoard.tsx     # Game board component
├── lib/
│   ├── email.ts          # Email notifications
│   ├── ludo-engine.ts    # Game logic
│   ├── supabase.ts       # Supabase client
│   └── types.ts          # TypeScript types
├── server.js             # Socket.io server
├── supabase-schema.sql   # Database schema
└── .env.local            # Environment variables
```

## 🔒 Security

- Row-level security enabled in Supabase
- Users can only access their own data
- All transactions are logged
- Manual approval for deposits
- Secure password hashing
- Environment variables for sensitive data

## 💡 Key Features Explained

### Wallet System
- Users deposit money via bank transfer
- Admin approves after verification
- Balance tracked in real-time
- Withdrawals processed manually

### Game Flow
1. Player 1 creates game with wager
2. Player 2 joins with room code
3. Both players' wagers are locked
4. Real-time Ludo game begins
5. Winner determined automatically
6. Winner receives 2x wager amount

### Email Notifications
Admin receives emails for:
- New user registrations
- Deposit requests (with proof)
- Withdrawal requests (with bank details)
- Game completions (winner/loser info)

## 🎮 Game Rules

- Classic Ludo rules
- 4 tokens per player
- Roll 6 to start
- Capture opponent tokens
- First to finish all tokens wins
- Winner takes all

## 📧 SMTP Setup (Gmail)

1. Enable 2-Factor Authentication
2. Go to Google Account → Security → App Passwords
3. Generate app password for "Mail"
4. Use in `.env.local` as `SMTP_PASSWORD`

## 🗄️ Database Schema

- **profiles** - User accounts and wallet balances
- **transactions** - All financial transactions
- **games** - Game records and results

See `supabase-schema.sql` for full schema.

## 🚨 Important Notes

- This is for private use between friends
- Check local gambling laws before use
- Keep your `.env.local` file secure
- Regularly backup your Supabase database
- Monitor transactions for any issues

## 📝 License

Private use only.

## 🤝 Support

For setup help, see:
- [SETUP.md](SETUP.md) - Installation guide
- [ADMIN_GUIDE.md](ADMIN_GUIDE.md) - Admin operations

---

Built with ❤️ for competitive Ludo gaming
