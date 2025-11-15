'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [mpesaName, setMpesaName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0);
  const router = useRouter();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUserId(user.id);

    // Get balance and username
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance, username')
      .eq('id', user.id)
      .single();

    if (profile) {
      setBalance(profile.wallet_balance);
      setUsername(profile.username);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const withdrawAmount = parseFloat(amount);

      // Validate balance
      if (withdrawAmount > balance) {
        throw new Error('Insufficient balance. You cannot withdraw more than you have.');
      }

      if (withdrawAmount < 50) {
        throw new Error('Minimum withdrawal amount is KSh 50');
      }

      // Create transaction record
      const { error: txError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'withdrawal',
          amount: withdrawAmount,
          status: 'pending',
          payment_method: 'mpesa',
          mpesa_number: mpesaNumber,
          mpesa_name: mpesaName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (txError) {
        console.error('Transaction error:', txError);
        throw new Error(txError.message || 'Failed to create withdrawal request');
      }

      // Send admin notification
      await fetch('/api/withdrawal-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          userId,
          amount: withdrawAmount,
          balance,
          mpesaNumber,
          mpesaName,
        }),
      });

      setSuccess(true);
      setAmount('');
      setMpesaNumber('');
      setMpesaName('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          {/* Title with M-Pesa Logo */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">Withdraw Funds</h1>
            <div className="bg-green-600 px-4 py-2 rounded-lg">
              <span className="text-white font-bold text-xl">M-PESA</span>
            </div>
          </div>

          {/* Balance Display */}
          <div className="bg-gradient-to-r from-blue-900/50 to-emerald-900/50 rounded-xl p-6 mb-6 border border-blue-700">
            <p className="text-gray-300 text-sm mb-1">Available Balance</p>
            <p className="text-4xl font-bold text-white">
              KSh {balance.toFixed(2)}
            </p>
          </div>

          {success && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg mb-6">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Withdrawal request submitted! Funds will be sent to your M-Pesa within 24 hours.</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Withdrawal Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Withdrawal Amount (KSh)
              </label>
              <input
                type="number"
                step="1"
                min="50"
                max={balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="e.g. 500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Minimum: KSh 50 | Maximum: KSh {balance.toFixed(2)}</p>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Your M-Pesa Number
              </label>
              <input
                type="tel"
                value={mpesaNumber}
                onChange={(e) => setMpesaNumber(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="e.g. 0712345678"
                required
                pattern="[0-9]{10}"
              />
              <p className="text-xs text-gray-400 mt-1">The number to receive funds</p>
            </div>

            <div>
              <label className="block text-gray-300 font-medium mb-2">
                Your Name (as on M-Pesa)
              </label>
              <input
                type="text"
                value={mpesaName}
                onChange={(e) => setMpesaName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="e.g. John Doe"
                required
              />
            </div>

            {/* Warning if insufficient balance */}
            {balance === 0 && (
              <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-200 px-4 py-3 rounded-lg">
                <p className="text-sm">You have no funds to withdraw. Please deposit first or win some games!</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || balance === 0}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-lg font-bold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 shadow-lg shadow-blue-500/30"
            >
              {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-900/30 border border-blue-700 rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              <strong className="text-blue-400">🔒 Secure Withdrawal:</strong> Your request will be reviewed and processed within 24 hours. Funds will be sent directly to your M-Pesa number.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


