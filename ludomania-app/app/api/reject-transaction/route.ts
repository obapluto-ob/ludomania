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
    const { transactionId, reason } = await request.json();

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

    // Update transaction status
    const { error: updateTxError } = await supabase
      .from('transactions')
      .update({
        status: 'rejected',
        admin_notes: reason,
      })
      .eq('id', transactionId);

    if (updateTxError) {
      throw updateTxError;
    }

    // Get user email
    const { data: userData } = await supabase.auth.admin.getUserById(transaction.user_id);
    const userEmail = userData?.user?.email;

    // Send rejection email to user
    if (userEmail) {
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: userEmail,
        subject: `❌ ${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Rejected - Ludomania`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
            <div style="background-color: #dc2626; color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="margin: 0; font-size: 32px;">❌ ${transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'} Rejected</h1>
            </div>

            <div style="background-color: white; padding: 40px; border-radius: 0 0 10px 10px;">
              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Hello <strong>${transaction.profiles.username}</strong>,
              </p>

              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                Unfortunately, your ${transaction.type} request has been rejected.
              </p>

              <div style="background-color: #fee2e2; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc2626;">
                <p style="margin: 0 0 10px 0; color: #991b1b; font-weight: bold;">Rejection Reason:</p>
                <p style="margin: 0; color: #991b1b;">${reason}</p>
              </div>

              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <table style="width: 100%;">
                  <tr>
                    <td style="padding: 8px 0; color: #374151;">Amount:</td>
                    <td style="padding: 8px 0; color: #374151; font-weight: bold; text-align: right;">
                      KSh ${transaction.amount.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #374151;">Current Balance:</td>
                    <td style="padding: 8px 0; color: #374151; font-weight: bold; text-align: right;">
                      KSh ${transaction.profiles.wallet_balance.toFixed(2)}
                    </td>
                  </tr>
                </table>
              </div>

              <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                If you believe this is an error, please contact support or try again with correct information.
              </p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="https://ludomania-iota.vercel.app/dashboard" style="background-color: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Back to Dashboard
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
      message: `${transaction.type} rejected successfully`,
    });
  } catch (error: any) {
    console.error('Error rejecting transaction:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to reject transaction' },
      { status: 500 }
    );
  }
}

