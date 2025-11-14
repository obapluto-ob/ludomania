'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function GamesPage() {
  const [balance, setBalance] = useState(0);
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
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
        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Play Ludo</h1>
          <p className="text-gray-400 text-lg">Choose your game mode and start playing!</p>
        </div>

        {/* Balance Display */}
        <div className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700 max-w-md mx-auto">
          <p className="text-gray-400 text-sm mb-1">Your Balance</p>
          <p className="text-4xl font-bold text-white">KSh {balance.toFixed(2)}</p>
        </div>

        {/* Game Modes */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Play Mode */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 hover:shadow-emerald-500/40 transition">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-emerald-600 p-4 rounded-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Free Play</h2>
                <p className="text-emerald-400 font-semibold">Play for Fun</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-white font-semibold">No Money Required</p>
                  <p className="text-gray-400 text-sm">Play without risking any funds</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-white font-semibold">Play with Friends</p>
                  <p className="text-gray-400 text-sm">Invite friends and have fun</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-white font-semibold">Practice & Learn</p>
                  <p className="text-gray-400 text-sm">Perfect your strategy</p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/games/free"
              className="block w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 rounded-xl font-bold text-center hover:from-emerald-700 hover:to-green-700 transition shadow-lg"
            >
              Start Free Game
            </Link>
          </div>

          {/* Money Play Mode */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20 hover:shadow-yellow-500/40 transition">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-yellow-600 p-4 rounded-xl">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">Money Play</h2>
                <p className="text-yellow-400 font-semibold">Win Real Cash</p>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-white font-semibold">Real Money Prizes</p>
                  <p className="text-gray-400 text-sm">Win and earn KSh instantly</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-white font-semibold">Competitive Matches</p>
                  <p className="text-gray-400 text-sm">Play against skilled opponents</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-white font-semibold">Secure Transactions</p>
                  <p className="text-gray-400 text-sm">Safe and verified payments</p>
                </div>
              </div>
            </div>

            {balance > 0 ? (
              <Link
                href="/dashboard/games/money"
                className="block w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-4 rounded-xl font-bold text-center hover:from-yellow-700 hover:to-orange-700 transition shadow-lg"
              >
                Play for Money
              </Link>
            ) : (
              <div>
                <button
                  disabled
                  className="w-full bg-gray-600 text-gray-300 py-4 rounded-xl font-bold cursor-not-allowed mb-3"
                >
                  Insufficient Balance
                </button>
                <Link
                  href="/dashboard/deposit"
                  className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-green-700 transition text-sm"
                >
                  Deposit Funds First
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-slate-800/50 rounded-xl p-6 border border-slate-700 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-4">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <p className="text-gray-300 text-sm">Choose your game mode</p>
            </div>
            <div>
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <p className="text-gray-300 text-sm">Set your wager (money mode only)</p>
            </div>
            <div>
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <p className="text-gray-300 text-sm">Play and win!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

