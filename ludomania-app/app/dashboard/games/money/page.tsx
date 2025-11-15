'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MoneyGamePage() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [balance, setBalance] = useState(0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [wager, setWager] = useState(50);
  const [playerCount, setPlayerCount] = useState(2);
  const [roomCode, setRoomCode] = useState('');
  const [roomId, setRoomId] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const wagerOptions = [50, 100, 200, 500, 1000, 2000];

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
      .select('username, wallet_balance, locked_balance')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUsername(profile.username);
      setBalance(profile.wallet_balance);
      setLockedBalance(profile.locked_balance || 0);
    }
  };

  const createRoom = async () => {
    setError('');
    setSuccess('');

    if (balance < wager) {
      setError(`Insufficient balance. You have KSh ${balance.toFixed(2)} available.`);
      return;
    }

    setCreating(true);

    try {
      const response = await fetch('/api/games/money/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wager,
          playerCount,
          withBot: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create room');
        setCreating(false);
        return;
      }

      // Success!
      setRoomCode(data.roomCode);
      setRoomId(data.roomId);
      setBalance(data.newBalance);
      setLockedBalance(data.lockedBalance);
      setSuccess(`Room created! KSh ${wager} locked. Platform fee: KSh ${data.platformFee.toFixed(2)}`);

    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async () => {
    setError('');
    setSuccess('');

    if (!joinRoomCode || joinRoomCode.length !== 6) {
      setError('Please enter a valid 6-digit room code');
      return;
    }

    setJoining(true);

    try {
      const response = await fetch('/api/games/money/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: joinRoomCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to join room');
        setJoining(false);
        return;
      }

      // Success! Redirect to game room
      setSuccess(`Joined room! KSh ${data.wager} locked.`);
      setBalance(data.newBalance);
      setLockedBalance(data.lockedBalance);

      // Redirect to waiting lobby
      setTimeout(() => {
        router.push(`/dashboard/games/room/${data.roomId}`);
      }, 1000);

    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please try again.');
    } finally {
      setJoining(false);
    }
  };

  const goToRoom = () => {
    if (roomId) {
      router.push(`/dashboard/games/room/${roomId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard/games" className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Game Modes
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Page Title */}
        <div className="text-center mb-8">
          <div className="bg-yellow-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Money Play</h1>
          <p className="text-gray-400 text-lg">Compete for real cash prizes!</p>
        </div>

        {/* Balance Display */}
        <div className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 border border-emerald-700 rounded-xl p-6 mb-8 max-w-md mx-auto">
          <div className="flex justify-between items-center mb-2">
            <p className="text-emerald-400 text-sm">Available Balance</p>
            <p className="text-3xl font-bold text-white">KSh {balance.toFixed(2)}</p>
          </div>
          {lockedBalance > 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-emerald-700/50">
              <p className="text-yellow-400 text-xs">Locked in Games</p>
              <p className="text-yellow-400 text-sm font-semibold">KSh {lockedBalance.toFixed(2)}</p>
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}
        {success && (
          <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-green-400 text-center">{success}</p>
          </div>
        )}

        {/* Wager Selection */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Select Your Wager</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {wagerOptions.map((amount) => (
              <button
                key={amount}
                onClick={() => setWager(amount)}
                disabled={balance < amount}
                className={`p-4 rounded-xl font-bold text-lg transition ${
                  wager === amount
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                    : balance < amount
                    ? 'bg-slate-700 text-gray-500 cursor-not-allowed'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                KSh {amount}
              </button>
            ))}
          </div>

          {/* Player Count Selection */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-3">Number of Players</label>
            <div className="grid grid-cols-3 gap-3">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => setPlayerCount(count)}
                  className={`p-3 rounded-lg font-bold transition ${
                    playerCount === count
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {count} Players
                </button>
              ))}
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Your Wager:</span>
              <span className="text-yellow-400 font-bold text-xl">KSh {wager}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300">Total Pot:</span>
              <span className="text-blue-400 font-bold text-xl">KSh {(wager * playerCount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-sm">Platform Fee (2%):</span>
              <span className="text-gray-400 text-sm">-KSh {(wager * playerCount * 0.02).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-blue-700">
              <span className="text-gray-300 font-semibold">Winner Gets:</span>
              <span className="text-green-400 font-bold text-xl">KSh {(wager * playerCount * 0.98).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Create or Join */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Room */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600 p-3 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Create Room</h2>
            </div>

            {roomCode ? (
              <div className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 border border-emerald-700 rounded-xl p-6 mb-6">
                <p className="text-emerald-400 text-sm mb-2">Your Room Code:</p>
                <div className="bg-slate-900 rounded-lg p-4 mb-4">
                  <p className="text-4xl font-bold text-white text-center tracking-widest">{roomCode}</p>
                </div>
                <p className="text-gray-300 text-sm text-center mb-3">Share this code with your friends!</p>
                <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg p-3 mb-3">
                  <p className="text-yellow-400 text-xs">
                    <strong>Wager Locked:</strong> KSh {wager} has been reserved from your balance
                  </p>
                </div>
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
                  <p className="text-blue-400 text-xs">
                    <strong>Waiting for {playerCount - 1} more player(s)</strong>
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={createRoom}
                disabled={creating || balance < wager}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {creating ? 'Creating Room...' : `Create Room (Lock KSh ${wager})`}
              </button>
            )}

            {roomCode && (
              <button
                onClick={goToRoom}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition"
              >
                Go to Waiting Lobby
              </button>
            )}

            {balance < wager && !roomCode && (
              <Link
                href="/dashboard/deposit"
                className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold text-center hover:bg-green-700 transition text-sm"
              >
                Deposit More Funds
              </Link>
            )}
          </div>

          {/* Join Room */}
          <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-purple-600 p-3 rounded-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white">Join Room</h2>
            </div>

            <p className="text-gray-400 mb-6 text-sm">
              Enter a room code to join. Make sure you have enough balance to match the wager!
            </p>

            <div className="mb-6">
              <label className="block text-gray-300 font-medium mb-2">Room Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                value={joinRoomCode}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-center text-2xl tracking-widest uppercase"
                maxLength={6}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
              />
            </div>

            <button
              onClick={joinRoom}
              disabled={joining || joinRoomCode.length !== 6}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joining ? 'Joining...' : 'Join Game'}
            </button>

            <div className="mt-4 bg-purple-900/30 border border-purple-700 rounded-lg p-3">
              <p className="text-purple-400 text-xs">
                <strong>Note:</strong> Your wager will be locked when you join. Make sure you have enough balance!
              </p>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-yellow-900/30 border border-yellow-700 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-yellow-300 font-semibold mb-2">Important Rules & Fees:</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• <strong>Platform Fee:</strong> 2% of total pot (deducted from winner)</li>
                <li>• <strong>Withdrawal Fee:</strong> 5% when you cash out</li>
                <li>• <strong>Wager Locking:</strong> Your wager is locked when you create/join</li>
                <li>• <strong>Reconnection:</strong> You can rejoin if disconnected (60 seconds)</li>
                <li>• <strong>Quitting Penalty:</strong> 10% penalty + forfeit wager if you quit mid-game</li>
                <li>• <strong>3 Penalties = 24-hour ban</strong></li>
                <li>• <strong>Fair Play:</strong> Cheating results in permanent account ban</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

