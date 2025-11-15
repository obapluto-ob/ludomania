# 📧 EMAIL NOTIFICATIONS - COMPLETE SETUP GUIDE

## ✅ WHAT EMAILS ARE SENT

### **1. USER EMAILS** (Sent to users)
- ✅ **Welcome Email with Verification Code** - When user registers
- ❌ **Deposit Confirmation** - When deposit is approved (NOT IMPLEMENTED YET)
- ❌ **Withdrawal Confirmation** - When withdrawal is processed (NOT IMPLEMENTED YET)
- ❌ **Game Win Notification** - When user wins a game (NOT IMPLEMENTED YET)

### **2. ADMIN EMAILS** (Sent to michealbyers750@gmail.com)
- ✅ **New User Registration Alert** - When new user signs up
- ✅ **Deposit Request** - When user requests deposit
- ✅ **Withdrawal Request** - When user requests withdrawal
- ❌ **Game Completed** - When a money game finishes (NOT IMPLEMENTED YET)

---

## 🔧 CURRENT EMAIL SETUP

### **SMTP Configuration** (Already configured in .env.local)
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=skillstakes01@gmail.com
SMTP_PASSWORD=gdcblzfhdfupmwgm
ADMIN_EMAIL=michealbyers750@gmail.com
```

### **Email Service** (Using Nodemailer)
- Location: `ludomania-app/lib/email.ts`
- Functions:
  - `sendWelcomeEmail()` - Sends verification code to user
  - `sendNewUserNotification()` - Alerts admin of new user
  - `sendDepositNotification()` - Alerts admin of deposit request
  - `sendWithdrawalNotification()` - Alerts admin of withdrawal request

---

## 🚨 CURRENT ISSUES

### **1. Verification Email Not Sending** ❌
**Problem:** RLS policy blocking database insert

**Fix:** Run `COMPLETE_FIX.sql` in Supabase SQL Editor

**Test:**
1. Register new user
2. Check if email arrives
3. Check terminal logs for errors

---

### **2. Missing User Notifications** ❌

Users should receive emails when:
- ✅ They register (WORKING after RLS fix)
- ❌ Deposit is approved
- ❌ Withdrawal is processed
- ❌ They win a game

**Need to create:**
- `sendDepositApprovedEmail()` function
- `sendWithdrawalProcessedEmail()` function
- `sendGameWinEmail()` function

---

## 📋 STEP-BY-STEP FIX

### **STEP 1: Fix Database (5 minutes)**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Open file: `ludomania-app/COMPLETE_FIX.sql`
3. Copy ALL the SQL
4. Paste into Supabase SQL Editor
5. Click **"Run"**

This fixes:
- ✅ Verification codes RLS policy
- ✅ Game tables creation
- ✅ All necessary permissions

---

### **STEP 2: Test Verification Email (5 minutes)**

1. Make sure frontend is running: `npm run dev`
2. Go to: `http://localhost:3000/auth/signup`
3. Register with **YOUR REAL EMAIL**
4. Check:
   - ✅ Did you receive verification email?
   - ✅ Did admin receive new user alert?
5. Check terminal logs for errors

---

### **STEP 3: Test Deposit/Withdrawal Emails (5 minutes)**

1. Login to dashboard
2. Click **"Deposit"**
3. Fill form and submit
4. Check:
   - ✅ Did admin receive deposit notification?
5. Click **"Withdraw"**
6. Fill form and submit
7. Check:
   - ✅ Did admin receive withdrawal notification?

---

## 🔨 MISSING EMAIL FUNCTIONS TO CREATE

### **1. Deposit Approved Email** (Send to user)
```typescript
export async function sendDepositApprovedEmail(
  username: string,
  email: string,
  amount: number,
  newBalance: number
) {
  // Email template:
  // Subject: "Deposit Approved - KSh {amount} Added to Your Wallet"
  // Body: Confirmation that deposit was approved
}
```

### **2. Withdrawal Processed Email** (Send to user)
```typescript
export async function sendWithdrawalProcessedEmail(
  username: string,
  email: string,
  amount: number,
  mpesaNumber: string
) {
  // Email template:
  // Subject: "Withdrawal Processed - KSh {amount} Sent to M-Pesa"
  // Body: Confirmation that money was sent
}
```

### **3. Game Win Email** (Send to user)
```typescript
export async function sendGameWinEmail(
  username: string,
  email: string,
  amount: number,
  opponentUsername: string
) {
  // Email template:
  // Subject: "You Won! KSh {amount} Added to Your Wallet"
  // Body: Congratulations message
}
```

---

## ✅ CHECKLIST

### **Database Setup**
- [ ] Run `COMPLETE_FIX.sql` in Supabase
- [ ] Verify game tables exist
- [ ] Verify RLS policies are correct

### **Email Testing**
- [ ] Test registration email (user receives code)
- [ ] Test admin new user alert
- [ ] Test deposit notification (admin receives)
- [ ] Test withdrawal notification (admin receives)

### **Missing Features**
- [ ] Create deposit approved email function
- [ ] Create withdrawal processed email function
- [ ] Create game win email function
- [ ] Add email sending to admin approval workflow

---

## 🎯 NEXT STEPS

**After fixing emails, you need to:**

1. **Build Admin Panel** - To approve deposits/withdrawals
2. **Add User Email Notifications** - When admin approves/rejects
3. **Test Game Flow** - Make sure games work end-to-end
4. **Integrate M-Pesa API** - For automatic processing

---

## 📞 SUPPORT

If emails still don't work after running the SQL:

1. Check Supabase logs
2. Check frontend terminal logs
3. Verify SMTP credentials are correct
4. Test SMTP connection manually
5. Check Gmail "Less secure apps" settings

---

**Created:** 2025-11-15
**Last Updated:** 2025-11-15

