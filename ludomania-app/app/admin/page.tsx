'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  payment_method: string;
  mpesa_number: string;
  mpesa_name: string;
  proof_url: string;
  created_at: string;
  profiles: {
    username: string;
    wallet_balance: number;
  };
}

export default function AdminDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const router = useRouter();

  useEffect(() => {
    checkAdmin();
    fetchTransactions();
  }, [filter]);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    // Check if user is admin (you can add admin check here)
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    // For now, any logged-in user can access admin (you should add proper admin role check)
    if (!profile) {
      router.push('/dashboard');
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (username, wallet_balance)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (tx: Transaction) => {
    if (!confirm(`Approve ${tx.type} of KSh ${tx.amount} for ${tx.profiles.username}?`)) {
      return;
    }

    setProcessing(tx.id);
    try {
      const response = await fetch('/api/approve-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: tx.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve transaction');
      }

      alert('Transaction approved successfully!');
      fetchTransactions();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (tx: Transaction) => {
    const reason = prompt(`Reject ${tx.type} of KSh ${tx.amount} for ${tx.profiles.username}?\n\nEnter rejection reason:`);
    if (!reason) return;

    setProcessing(tx.id);
    try {
      const response = await fetch('/api/reject-transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId: tx.id, reason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject transaction');
      }

      alert('Transaction rejected successfully!');
      fetchTransactions();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 transition">
            Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            All Pending ({transactions.length})
          </button>
          <button
            onClick={() => setFilter('deposit')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              filter === 'deposit'
                ? 'bg-green-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Deposits
          </button>
          <button
            onClick={() => setFilter('withdrawal')}
            className={`px-6 py-3 rounded-lg font-semibold transition ${
              filter === 'withdrawal'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Withdrawals
          </button>
        </div>

        {/* Transactions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-white text-xl">Loading transactions...</div>
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-slate-800 rounded-2xl p-12 text-center border border-slate-700">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-400 text-lg">No pending transactions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Side - Transaction Details */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-3 rounded-lg ${
                        tx.type === 'deposit' ? 'bg-green-900/30' : 'bg-blue-900/30'
                      }`}>
                        <svg className={`w-6 h-6 ${
                          tx.type === 'deposit' ? 'text-green-400' : 'text-blue-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {tx.type === 'deposit' ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white capitalize">{tx.type}</h3>
                        <p className="text-gray-400 text-sm">{new Date(tx.created_at).toLocaleString('en-KE')}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Username:</span>
                        <span className="text-white font-semibold">{tx.profiles.username}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className={`font-bold text-xl ${
                          tx.type === 'deposit' ? 'text-green-400' : 'text-blue-400'
                        }`}>KSh {tx.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Current Balance:</span>
                        <span className="text-white font-semibold">KSh {tx.profiles.wallet_balance.toFixed(2)}</span>
                      </div>
                      {tx.type === 'withdrawal' && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Balance After:</span>
                          <span className="text-white font-semibold">
                            KSh {(tx.profiles.wallet_balance - tx.amount).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-400">M-Pesa Number:</span>
                        <span className="text-white font-mono">{tx.mpesa_number}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">M-Pesa Name:</span>
                        <span className="text-white">{tx.mpesa_name}</span>
                      </div>
                    </div>

                    {/* Fraud Check for Withdrawals */}
                    {tx.type === 'withdrawal' && tx.amount > tx.profiles.wallet_balance && (
                      <div className="mt-4 bg-red-900/30 border border-red-700 rounded-lg p-3">
                        <p className="text-red-400 text-sm font-semibold">
                          🚨 FRAUD ALERT: User trying to withdraw more than balance!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Side - Proof & Actions */}
                  <div>
                    {tx.proof_url && (
                      <div className="mb-4">
                        <p className="text-gray-400 text-sm mb-2">Proof:</p>
                        {tx.proof_url.startsWith('http') ? (
                          <a
                            href={tx.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-slate-700 rounded-lg p-3 hover:bg-slate-600 transition"
                          >
                            <p className="text-blue-400 text-sm">View Screenshot →</p>
                          </a>
                        ) : (
                          <div className="bg-slate-700 rounded-lg p-3">
                            <p className="text-white font-mono text-sm">{tx.proof_url}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3 mt-6">
                      <button
                        onClick={() => handleApprove(tx)}
                        disabled={processing === tx.id}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50"
                      >
                        {processing === tx.id ? 'Processing...' : '✓ Approve'}
                      </button>
                      <button
                        onClick={() => handleReject(tx)}
                        disabled={processing === tx.id}
                        className="w-full bg-gradient-to-r from-red-600 to-rose-600 text-white py-3 rounded-lg font-bold hover:from-red-700 hover:to-rose-700 transition disabled:opacity-50"
                      >
                        {processing === tx.id ? 'Processing...' : '✗ Reject'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


