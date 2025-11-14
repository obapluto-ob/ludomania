'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { v4 as uuidv4 } from 'uuid';

export default function CreateGamePage() {
  const [wagerAmount, setWagerAmount] = useState('');
  const [loading, setLoading] = useState(false);
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

    const { data: profile } = await supabase
      .from('profiles')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();

    if (profile) {
      setBalance(profile.wallet_balance);
    }
  };

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const wager = parseFloat(wagerAmount);

      if (wager > balance) {
        throw new Error('Insufficient balance');
      }

      if (wager < 1) {
        throw new Error('Minimum wager is $1');
      }

      const roomCode = generateRoomCode();
      const gameId = uuidv4();

      // Create game in database
      const { error: gameError } = await supabase.from('games').insert({
        id: gameId,
        room_code: roomCode,
        wager_amount: wager,
        status: 'waiting',
        player1_id: userId,
      });

      if (gameError) throw gameError;

      // Deduct wager from wallet
      const { error: walletError } = await supabase
        .from('profiles')
        .update({ wallet_balance: balance - wager })
        .eq('id', userId);

      if (walletError) throw walletError;

      // Create transaction record
      await supabase.from('transactions').insert({
        user_id: userId,
        type: 'game_wager',
        amount: wager,
        status: 'completed',
        notes: `Game: ${gameId}`,
      });

      // Redirect to game room
      router.push(`/game/play/${gameId}?room=${roomCode}`);
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
          <h1 className="text-3xl font-bold mb-6 text-gray-800">🎮 Create New Game</h1>

          <div className="bg-gray-100 rounded-lg p-4 mb-6">
            <p className="text-gray-700">
              <strong>Available Balance:</strong>{' '}
              <span className="text-2xl font-bold text-green-600">
                ${balance.toFixed(2)}
              </span>
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateGame} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Wager Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="1"
                max={balance}
                value={wagerAmount}
                onChange={(e) => setWagerAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Winner takes ${wagerAmount ? (parseFloat(wagerAmount) * 2).toFixed(2) : '0.00'}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 After creating the game, you'll get a room code to share with your friend.
                Both players must wager the same amount to play.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || balance === 0}
              className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating Game...' : 'Create Game'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

