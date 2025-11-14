'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function JoinGamePage() {
  const [roomCode, setRoomCode] = useState('');
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

  const handleJoinGame = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Find game by room code
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('room_code', roomCode.toUpperCase())
        .eq('status', 'waiting')
        .single();

      if (gameError || !game) {
        throw new Error('Game not found or already started');
      }

      if (game.player1_id === userId) {
        throw new Error('You cannot join your own game');
      }

      if (game.player2_id) {
        throw new Error('Game is already full');
      }

      const wager = game.wager_amount;

      if (wager > balance) {
        throw new Error('Insufficient balance for this game');
      }

      // Update game with player 2
      const { error: updateError } = await supabase
        .from('games')
        .update({
          player2_id: userId,
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', game.id);

      if (updateError) throw updateError;

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
        notes: `Game: ${game.id}`,
      });

      // Redirect to game room
      router.push(`/game/play/${game.id}?room=${roomCode.toUpperCase()}`);
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
          <h1 className="text-3xl font-bold mb-6 text-gray-800">🔗 Join Game</h1>

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

          <form onSubmit={handleJoinGame} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-character code"
                maxLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800 uppercase"
                required
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 Enter the room code shared by your friend. You'll need to match their wager amount to join.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || balance === 0}
              className="w-full bg-pink-600 text-white py-3 rounded-lg font-bold hover:bg-pink-700 transition disabled:opacity-50"
            >
              {loading ? 'Joining Game...' : 'Join Game'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

