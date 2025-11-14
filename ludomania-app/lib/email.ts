import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

const adminEmail = process.env.ADMIN_EMAIL || '';

export async function sendDepositNotification(
  username: string,
  amount: number,
  proofUrl: string,
  userId: string
) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: adminEmail,
    subject: '💰 New Deposit Request - Ludomania',
    html: `
      <h2>New Deposit Request</h2>
      <p><strong>User:</strong> ${username}</p>
      <p><strong>User ID:</strong> ${userId}</p>
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Proof:</strong> <a href="${proofUrl}">View Proof</a></p>
      <p>Please verify and approve this deposit in the database.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Deposit notification sent');
  } catch (error) {
    console.error('Error sending deposit notification:', error);
  }
}

export async function sendWithdrawalNotification(
  username: string,
  amount: number,
  bankDetails: string,
  userId: string
) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: adminEmail,
    subject: '💸 New Withdrawal Request - Ludomania',
    html: `
      <h2>New Withdrawal Request</h2>
      <p><strong>User:</strong> ${username}</p>
      <p><strong>User ID:</strong> ${userId}</p>
      <p><strong>Amount:</strong> $${amount}</p>
      <p><strong>Bank Details:</strong></p>
      <pre>${bankDetails}</pre>
      <p>Please process this withdrawal manually.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Withdrawal notification sent');
  } catch (error) {
    console.error('Error sending withdrawal notification:', error);
  }
}

export async function sendGameCompletedNotification(
  gameId: string,
  winnerUsername: string,
  loserUsername: string,
  wagerAmount: number
) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: adminEmail,
    subject: '🎮 Game Completed - Ludomania',
    html: `
      <h2>Game Completed</h2>
      <p><strong>Game ID:</strong> ${gameId}</p>
      <p><strong>Winner:</strong> ${winnerUsername}</p>
      <p><strong>Loser:</strong> ${loserUsername}</p>
      <p><strong>Wager Amount:</strong> $${wagerAmount}</p>
      <p><strong>Winner Received:</strong> $${wagerAmount * 2}</p>
      <p>Funds have been automatically transferred.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Game completion notification sent');
  } catch (error) {
    console.error('Error sending game completion notification:', error);
  }
}

// Generate 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send welcome email with verification code to user
export async function sendWelcomeEmail(
  username: string,
  email: string,
  verificationCode: string
) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: email,
    subject: 'Welcome to Ludomania - Verify Your Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #1e40af; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">Welcome to Ludomania!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">Kenya's Premier Ludo Gaming Platform</p>
        </div>

        <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e40af; margin-top: 0;">Hello ${username}!</h2>

          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for joining Ludomania! We're excited to have you as part of our gaming community.
          </p>

          <div style="background-color: #dbeafe; padding: 30px; border-radius: 10px; text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 15px 0; color: #1e40af; font-weight: bold; font-size: 14px;">YOUR VERIFICATION CODE</p>
            <div style="background-color: white; padding: 20px; border-radius: 8px; display: inline-block;">
              <span style="font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 8px; font-family: monospace;">${verificationCode}</span>
            </div>
            <p style="margin: 15px 0 0 0; color: #6b7280; font-size: 12px;">This code expires in 10 minutes</p>
          </div>

          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">What's Next?</h3>
            <ul style="color: #374151; line-height: 1.8; padding-left: 20px;">
              <li>Enter the verification code to activate your account</li>
              <li>Deposit funds using M-Pesa</li>
              <li>Challenge friends to Ludo games</li>
              <li>Win real money!</li>
            </ul>
          </div>

          <div style="background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>⚠️ Security Tip:</strong> Never share your verification code with anyone. Ludomania staff will never ask for your code.
            </p>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://ludomania-iota.vercel.app'}"
               style="background-color: #1e40af; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>Ludomania - Play Responsibly | ${new Date().getFullYear()}</p>
          <p>Nairobi, Kenya</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent to user:', email);
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    throw error;
  }
}

export async function sendNewUserNotification(
  username: string,
  email: string,
  userId: string,
  metadata?: {
    registeredAt?: string;
    ipAddress?: string;
    userAgent?: string;
  }
) {
  const registeredAt = metadata?.registeredAt || new Date().toISOString();
  const ipAddress = metadata?.ipAddress || 'Unknown';
  const userAgent = metadata?.userAgent || 'Unknown';

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: adminEmail,
    subject: '🔔 NEW USER REGISTRATION - Ludomania Security Alert',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
        <div style="background-color: #1e40af; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0;">🔔 New User Registration</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Ludomania Security System</p>
        </div>

        <div style="background-color: white; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1e40af; margin-top: 0;">User Details</h2>

          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: bold; color: #374151;">Username:</td>
              <td style="padding: 12px 0; color: #1f2937;">${username}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: bold; color: #374151;">Email:</td>
              <td style="padding: 12px 0; color: #1f2937;">${email}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: bold; color: #374151;">User ID:</td>
              <td style="padding: 12px 0; color: #1f2937; font-family: monospace; font-size: 12px;">${userId}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: bold; color: #374151;">Registered At:</td>
              <td style="padding: 12px 0; color: #1f2937;">${new Date(registeredAt).toLocaleString('en-KE', { timeZone: 'Africa/Nairobi' })} (EAT)</td>
            </tr>
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 12px 0; font-weight: bold; color: #374151;">IP Address:</td>
              <td style="padding: 12px 0; color: #1f2937; font-family: monospace;">${ipAddress}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #374151;">Device/Browser:</td>
              <td style="padding: 12px 0; color: #1f2937; font-size: 12px;">${userAgent}</td>
            </tr>
          </table>

          <div style="margin-top: 30px; padding: 15px; background-color: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 5px;">
            <p style="margin: 0; color: #92400e;">
              <strong>⚠️ Security Notice:</strong> This is a real money gaming platform.
              Please verify this user's identity if any suspicious activity is detected.
            </p>
          </div>

          <div style="margin-top: 20px; padding: 15px; background-color: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 5px;">
            <p style="margin: 0; color: #1e40af;">
              <strong>📊 Action Required:</strong> Monitor this user's initial transactions and gameplay for security compliance.
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
          <p>Ludomania Security System | ${new Date().getFullYear()}</p>
          <p>This is an automated security notification</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Detailed new user notification sent to admin');
  } catch (error) {
    console.error('❌ Error sending new user notification:', error);
    throw error;
  }
}

