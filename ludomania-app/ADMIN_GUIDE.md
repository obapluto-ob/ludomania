# Admin Guide - Managing Ludomania

## Quick Start

You'll receive all notifications via email. Here's how to handle each type:

## 📧 Email Notifications You'll Receive

### 1. New User Registration
**Subject:** 👤 New User Registration - Ludomania

**What to do:** Just for your information. No action needed.

---

### 2. Deposit Request
**Subject:** 💰 New Deposit Request - Ludomania

**Email contains:**
- Username
- User ID
- Amount
- Link to payment proof

**What to do:**
1. Click the proof link to verify the payment
2. Check your bank account for the deposit
3. If verified, approve in Supabase:

```sql
-- Step 1: Update transaction status
UPDATE transactions 
SET status = 'approved' 
WHERE user_id = 'USER_ID_FROM_EMAIL' 
  AND type = 'deposit' 
  AND status = 'pending'
  AND amount = AMOUNT_FROM_EMAIL;

-- Step 2: Add funds to user wallet
UPDATE profiles 
SET wallet_balance = wallet_balance + AMOUNT_FROM_EMAIL 
WHERE id = 'USER_ID_FROM_EMAIL';
```

**To reject:**
```sql
UPDATE transactions 
SET status = 'rejected' 
WHERE user_id = 'USER_ID_FROM_EMAIL' 
  AND type = 'deposit' 
  AND status = 'pending';
```

---

### 3. Withdrawal Request
**Subject:** 💸 New Withdrawal Request - Ludomania

**Email contains:**
- Username
- User ID
- Amount
- Bank account details

**What to do:**
1. Send the money to the provided bank account
2. After sending, mark as completed in Supabase:

```sql
UPDATE transactions 
SET status = 'completed' 
WHERE user_id = 'USER_ID_FROM_EMAIL' 
  AND type = 'withdrawal' 
  AND status = 'pending'
  AND amount = AMOUNT_FROM_EMAIL;
```

**Note:** The amount is already deducted from user's wallet when they request.

**To reject (refund):**
```sql
-- Refund to wallet
UPDATE profiles 
SET wallet_balance = wallet_balance + AMOUNT_FROM_EMAIL 
WHERE id = 'USER_ID_FROM_EMAIL';

-- Mark as rejected
UPDATE transactions 
SET status = 'rejected' 
WHERE user_id = 'USER_ID_FROM_EMAIL' 
  AND type = 'withdrawal' 
  AND status = 'pending';
```

---

### 4. Game Completed
**Subject:** 🎮 Game Completed - Ludomania

**Email contains:**
- Game ID
- Winner username
- Loser username
- Wager amount
- Total winnings

**What to do:** Nothing! This is automatic. Just for your records.

---

## 🗄️ Accessing Supabase

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your project
3. Click **SQL Editor** on the left sidebar
4. Paste the SQL commands from above
5. Click **Run** or press Ctrl+Enter

---

## 📊 Useful Queries

### View All Pending Deposits
```sql
SELECT 
  t.id,
  t.amount,
  t.proof_url,
  t.created_at,
  p.username,
  p.id as user_id
FROM transactions t
JOIN profiles p ON t.user_id = p.id
WHERE t.type = 'deposit' 
  AND t.status = 'pending'
ORDER BY t.created_at DESC;
```

### View All Pending Withdrawals
```sql
SELECT 
  t.id,
  t.amount,
  t.notes as bank_details,
  t.created_at,
  p.username,
  p.id as user_id
FROM transactions t
JOIN profiles p ON t.user_id = p.id
WHERE t.type = 'withdrawal' 
  AND t.status = 'pending'
ORDER BY t.created_at DESC;
```

### View User Balance
```sql
SELECT username, wallet_balance 
FROM profiles 
WHERE username = 'USERNAME_HERE';
```

### View All Games
```sql
SELECT 
  g.id,
  g.room_code,
  g.wager_amount,
  g.status,
  p1.username as player1,
  p2.username as player2,
  w.username as winner
FROM games g
LEFT JOIN profiles p1 ON g.player1_id = p1.id
LEFT JOIN profiles p2 ON g.player2_id = p2.id
LEFT JOIN profiles w ON g.winner_id = w.id
ORDER BY g.created_at DESC
LIMIT 20;
```

### Total Platform Stats
```sql
-- Total users
SELECT COUNT(*) as total_users FROM profiles;

-- Total money in system
SELECT SUM(wallet_balance) as total_balance FROM profiles;

-- Total games played
SELECT COUNT(*) as total_games FROM games WHERE status = 'completed';

-- Total deposits
SELECT SUM(amount) as total_deposits 
FROM transactions 
WHERE type = 'deposit' AND status = 'approved';

-- Total withdrawals
SELECT SUM(amount) as total_withdrawals 
FROM transactions 
WHERE type = 'withdrawal' AND status = 'completed';
```

---

## 🔧 Common Tasks

### Manually Add Funds to User
```sql
UPDATE profiles 
SET wallet_balance = wallet_balance + AMOUNT 
WHERE username = 'USERNAME';

-- Create transaction record
INSERT INTO transactions (user_id, type, amount, status, notes)
SELECT id, 'deposit', AMOUNT, 'approved', 'Manual credit by admin'
FROM profiles 
WHERE username = 'USERNAME';
```

### Manually Deduct Funds
```sql
UPDATE profiles 
SET wallet_balance = wallet_balance - AMOUNT 
WHERE username = 'USERNAME';

-- Create transaction record
INSERT INTO transactions (user_id, type, amount, status, notes)
SELECT id, 'withdrawal', AMOUNT, 'completed', 'Manual deduction by admin'
FROM profiles 
WHERE username = 'USERNAME';
```

### Cancel a Game
```sql
UPDATE games 
SET status = 'cancelled' 
WHERE id = 'GAME_ID';

-- Refund both players
-- (You'll need to manually refund the wager amounts)
```

---

## 🚨 Troubleshooting

**User says they deposited but didn't receive funds:**
1. Check your email for deposit notification
2. Verify payment in your bank
3. Check transaction status in Supabase
4. If approved but not credited, run the wallet update query

**User can't withdraw:**
1. Check their wallet balance
2. Verify they have sufficient funds
3. Check for pending withdrawal requests

**Game stuck:**
1. Check game status in database
2. If needed, manually set to 'cancelled'
3. Refund players if necessary

---

## 💡 Tips

- Check your email regularly for notifications
- Process deposits/withdrawals within 24 hours
- Keep records of all bank transactions
- Monitor the total balance in the system
- Back up your Supabase database regularly

---

## 📞 Support

If you need to modify anything:
- Email templates: `lib/email.ts`
- Bank details shown to users: `app/dashboard/deposit/page.tsx`
- Minimum wager: `app/game/create/page.tsx`

