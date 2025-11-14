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

export async function sendNewUserNotification(username: string, email: string, userId: string) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: adminEmail,
    subject: '👤 New User Registration - Ludomania',
    html: `
      <h2>New User Registered</h2>
      <p><strong>Username:</strong> ${username}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>User ID:</strong> ${userId}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('New user notification sent');
  } catch (error) {
    console.error('Error sending new user notification:', error);
  }
}

