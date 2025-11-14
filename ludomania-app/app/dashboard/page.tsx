'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Profile {
  id: string;
  username: string;
  wallet_balance: number;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
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

    // Get profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }
    
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
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
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-600">🎲 LUDOMANIA</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Hi, {profile?.username}!</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Wallet Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">💰 Your Wallet</h2>
          <div className="text-4xl font-bold text-green-600 mb-4">
            ${profile?.wallet_balance?.toFixed(2) || '0.00'}
          </div>
          <div className="flex gap-4">
            <Link
              href="/dashboard/deposit"
              className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600"
            >
              Deposit
            </Link>
            <Link
              href="/dashboard/withdraw"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-600"
            >
              Withdraw
            </Link>
            <Link
              href="/dashboard/transactions"
              className="bg-gray-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-600"
            >
              History
            </Link>
          </div>
        </div>

        {/* Game Section */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">🎮 Create Game</h2>
            <p className="text-gray-600 mb-4">
              Start a new game and invite your friend with a room code
            </p>
            <Link
              href="/game/create"
              className="block w-full bg-purple-600 text-white text-center px-6 py-3 rounded-lg font-bold hover:bg-purple-700"
            >
              Create New Game
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">🔗 Join Game</h2>
            <p className="text-gray-600 mb-4">
              Enter a room code to join an existing game
            </p>
            <Link
              href="/game/join"
              className="block w-full bg-pink-600 text-white text-center px-6 py-3 rounded-lg font-bold hover:bg-pink-700"
            >
              Join Game
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

