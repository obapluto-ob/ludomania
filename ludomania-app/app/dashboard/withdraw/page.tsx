'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function WithdrawPage() {
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
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

    // Get balance
    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();

    if (profile) {
      setBalance(profile.wallet_balance);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const withdrawAmount = parseFloat(amount);

      if (withdrawAmount > balance) {
        throw new Error('Insufficient balance');
      }

      const response = await fetch('/api/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: withdrawAmount,
          bankDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit withdrawal');
      }

      setSuccess(true);
      setAmount('');
      setBankDetails('');
      setBalance(balance - withdrawAmount);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-purple-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">💸 Withdraw Funds</h1>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-gray-700">
              <strong>Available Balance:</strong>{' '}
              <span className="text-2xl font-bold text-green-600">
                ${balance.toFixed(2)}
              </span>
            </p>
          </div>

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              Withdrawal request submitted! Funds will be processed manually.
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max={balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Bank Account Details
              </label>
              <textarea
                value={bankDetails}
                onChange={(e) => setBankDetails(e.target.value)}
                placeholder="Bank Name:&#10;Account Number:&#10;Account Name:&#10;Any other details..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || balance === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Withdrawal Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

