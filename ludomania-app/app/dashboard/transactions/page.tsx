'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
  notes?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setTransactions(data);
    }

    setLoading(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-400';
      case 'withdrawal':
        return 'text-blue-400';
      case 'game_win':
        return 'text-emerald-400';
      case 'game_loss':
        return 'text-red-400';
      case 'game_wager':
        return 'text-orange-400';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-900/30 text-yellow-400 border border-yellow-700',
      approved: 'bg-green-900/30 text-green-400 border border-green-700',
      rejected: 'bg-red-900/30 text-red-400 border border-red-700',
      completed: 'bg-blue-900/30 text-blue-400 border border-blue-700',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status as keyof typeof colors]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-xl text-white">Loading...</div>
      </div>
    );
  }

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

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 p-3 rounded-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white">Transaction History</h1>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-slate-700/50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-400 text-lg">No transactions yet</p>
              <p className="text-gray-500 text-sm mt-2">Your deposits, withdrawals, and game history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">Date & Time</th>
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold">Type</th>
                    <th className="text-right py-4 px-4 text-gray-300 font-semibold">Amount</th>
                    <th className="text-center py-4 px-4 text-gray-300 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-slate-700 hover:bg-slate-700/30 transition">
                      <td className="py-4 px-4 text-sm text-gray-400">
                        {new Date(tx.created_at).toLocaleDateString('en-KE', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {tx.type === 'deposit' && (
                            <div className="bg-green-900/30 p-2 rounded">
                              <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </div>
                          )}
                          {tx.type === 'withdrawal' && (
                            <div className="bg-blue-900/30 p-2 rounded">
                              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </div>
                          )}
                          {tx.type === 'game_win' && (
                            <div className="bg-emerald-900/30 p-2 rounded">
                              <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                          {tx.type === 'game_loss' && (
                            <div className="bg-red-900/30 p-2 rounded">
                              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </div>
                          )}
                          <span className={`text-sm font-medium ${getTypeColor(tx.type)}`}>
                            {tx.type.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`text-lg font-bold ${
                          tx.type === 'withdrawal' || tx.type === 'game_loss' || tx.type === 'game_wager'
                            ? 'text-red-400'
                            : 'text-green-400'
                        }`}>
                          {tx.type === 'withdrawal' || tx.type === 'game_loss' || tx.type === 'game_wager' ? '-' : '+'}
                          KSh {tx.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {getStatusBadge(tx.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

