# Ludomania - Setup Instructions

## 🎲 Welcome to Ludomania!

A real-money Ludo gaming platform where players can compete with friends for cash prizes.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- SMTP email credentials (Gmail, etc.)

## Setup Steps

### 1. Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings** → **API**
3. Copy your:
   - Project URL
   - Anon/Public Key

4. Go to **SQL Editor** in Supabase dashboard
5. Copy the contents of `supabase-schema.sql` and run it in the SQL editor
6. This will create all necessary tables and policies

### 2. Environment Variables

1. Open `.env.local` file
2. Update the following:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# SMTP Configuration (Gmail example)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password
ADMIN_EMAIL=your_admin_email@gmail.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Gmail SMTP Setup (if using Gmail)

1. Go to your Google Account settings
2. Enable 2-Factor Authentication
3. Go to **Security** → **App Passwords**
4. Generate a new app password for "Mail"
5. Use this password in `SMTP_PASSWORD`

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Application

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## How It Works

### For Users:

1. **Sign Up** - Create an account
2. **Deposit** - Submit deposit request with proof
3. **Wait for Approval** - You'll receive email when approved
4. **Create/Join Game** - Start a game or join with room code
5. **Play Ludo** - Real-time multiplayer game
6. **Win Money** - Winner gets 2x the wager
7. **Withdraw** - Request withdrawal anytime

### For Admin (You):

You'll receive email notifications for:
- New user registrations
- Deposit requests (with proof link)
- Withdrawal requests (with bank details)
- Game completions (winner/loser info)

### Manual Processing:

1. **Deposits**: Check email → Verify payment → Update in Supabase
2. **Withdrawals**: Check email → Process payment → Update in Supabase

## Database Management

### Approve a Deposit:

```sql
-- 1. Update transaction status
UPDATE transactions 
SET status = 'approved' 
WHERE id = 'transaction_id';

-- 2. Add funds to user wallet
UPDATE profiles 
SET wallet_balance = wallet_balance + amount 
WHERE id = 'user_id';
```

### Process a Withdrawal:

```sql
-- After sending money, mark as completed
UPDATE transactions 
SET status = 'completed' 
WHERE id = 'transaction_id';
```

### Reject a Deposit/Withdrawal:

```sql
-- For withdrawal rejection, refund the amount
UPDATE profiles 
SET wallet_balance = wallet_balance + amount 
WHERE id = 'user_id';

UPDATE transactions 
SET status = 'rejected' 
WHERE id = 'transaction_id';
```

## Features

✅ User authentication (Supabase Auth)
✅ Wallet system with deposits/withdrawals
✅ Real-time multiplayer Ludo game
✅ Email notifications for all actions
✅ Transaction history
✅ Secure game wagering
✅ Automatic winner payout

## Security Notes

- All transactions are logged
- Row-level security enabled in Supabase
- Users can only access their own data
- Manual approval required for deposits
- Funds are held securely in database

## Customization

### Update Bank Details:

Edit `app/dashboard/deposit/page.tsx` and update the bank information section.

### Change Minimum Wager:

Edit `app/game/create/page.tsx` and modify the minimum wager validation.

## Troubleshooting

**Email not sending?**
- Check SMTP credentials in `.env.local`
- Verify Gmail app password is correct
- Check spam folder

**Database errors?**
- Ensure `supabase-schema.sql` was run successfully
- Check Supabase project is active
- Verify API keys are correct

**Game not connecting?**
- Ensure server is running on port 3000
- Check browser console for errors
- Verify Socket.io is working

## Support

For issues or questions, check the code comments or Supabase documentation.

## License

Private use only.

