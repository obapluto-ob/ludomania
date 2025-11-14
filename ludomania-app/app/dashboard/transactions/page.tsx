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
        return 'text-green-600';
      case 'withdrawal':
        return 'text-blue-600';
      case 'game_win':
        return 'text-green-700 font-bold';
      case 'game_loss':
        return 'text-red-600';
      case 'game_wager':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard" className="text-purple-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-gray-800">📊 Transaction History</h1>

          {transactions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No transactions yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 text-gray-700">Type</th>
                    <th className="text-right py-3 px-4 text-gray-700">Amount</th>
                    <th className="text-center py-3 px-4 text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                      <td className={`py-3 px-4 text-sm ${getTypeColor(tx.type)}`}>
                        {tx.type.replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium">
                        {tx.type === 'withdrawal' || tx.type === 'game_loss' || tx.type === 'game_wager' ? '-' : '+'}
                        ${tx.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center">
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

