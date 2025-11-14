import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
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

export async function POST(request: NextRequest) {
  try {
    const { transactionId } = await request.json();

    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select(`
        *,
        profiles:user_id (username, wallet_balance, id)
      `)
      .eq('id', transactionId)
      .single();

    if (txError || !transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Check if already processed
    if (transaction.status !== 'pending') {
      return NextResponse.json(
        { error: 'Transaction already processed' },
        { status: 400 }
      );
    }

    // Calculate new balance
    let newBalance = transaction.profiles.wallet_balance;
    if (transaction.type === 'deposit') {
      newBalance += transaction.amount;
    } else if (transaction.type === 'withdrawal') {
      // Check if user has sufficient balance
      if (transaction.amount > transaction.profiles.wallet_balance) {
        return NextResponse.json(
          { error: 'Insufficient balance for withdrawal' },
          { status: 400 }
        );
      }
      newBalance -= transaction.amount;
    }

    // Update transaction status
    const { error: updateTxError } = await supabase
      .from('transactions')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
      })
      .eq('id', transactionId);

    if (updateTxError) {
      throw updateTxError;
    }

    // Update user balance
    const { error: updateBalanceError } = await supabase
      .from('profiles')
      .update({ wallet_balance: newBalance })
      .eq('id', transaction.user_id);

    if (updateBalanceError) {
      throw updateBalanceError;
    }

    // Get user email
    const { data: userData } = await supabase.auth.admin.getUserById(transaction.user_id);
    const userEmail = userData?.user?.email;

    // Send confirmation email to user
    if (userEmail) {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: userEmail,
        subject: `✅ ${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Approved - Ludomania`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #16a34a; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 32px;">✅ ${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Approved!</h1>
            </div>

            <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Hello <strong>${transaction.profiles.username}</strong>,
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Great news! Your ${transaction.type} request has been approved.
              </p>

              <div style="background-color: #d1fae5; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; color: #065f46;">Amount:</td>
                    <td style="padding: 8px 0; color: #065f46; font-weight: bold; text-align: right; font-size: 24px;">
                      KSh ${transaction.amount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #065f46;">Previous Balance:</td>
                    <td style="padding: 8px 0; color: #065f46; font-weight: bold; text-align: right;">
                      KSh ${transaction.profiles.wallet_balance.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #065f46;">New Balance:</td>
                    <td style="padding: 8px 0; color: #065f46; font-weight: bold; text-align: right; font-size: 20px;">
                      KSh ${newBalance.toFixed(2)}
                    </td>
                  </tr>
                </table>
              </div>

              ${transaction.type === 'withdrawal' ? `
                <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                  The money has been sent to your M-Pesa number: <strong>${transaction.mpesa_number}</strong>
                </p>
              ` : ''}

              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                You can now view your updated balance in your dashboard.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://ludomania-iota.vercel.app/dashboard" style="background-color: #16a34a; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  View Dashboard
                </a>
              </div>
            </div>

            <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px;">
              <p>Ludomania | ${new Date().getFullYear()}</p>
            </div>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
    }

    return NextResponse.json({
      success: true,
      newBalance,
      message: `${transaction.type} approved successfully`,
    });
  } catch (error: any) {
    console.error('Error approving transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to approve transaction' },
      { status: 500 }
    );
  }
}

