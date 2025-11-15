'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function FreeGamePage() {
  const [username, setUsername] = useState('');
  const [userId, setUserId] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [joinRoomCode, setJoinRoomCode] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(2);
  const [playWithBot, setPlayWithBot] = useState(false);
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
      .select('username')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUsername(profile.username);
    }
  };

  const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createRoom = async () => {
    setCreating(true);
    try {
      const code = generateRoomCode();

      // Create room in database
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          room_code: code,
          game_mode: 'free',
          wager: 0,
          status: 'waiting',
          created_by: userId,
          max_players: playerCount,
          has_bot: playWithBot,
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add creator as first player
      const { error: playerError } = await supabase
        .from('game_players')
        .insert({
          room_id: room.id,
          user_id: userId,
          color: 'red',
          position: 1,
          is_ready: false,
        });

      if (playerError) throw playerError;

      // If playing with bot, add bot player
      if (playWithBot) {
        // Use a special UUID for bot (all zeros)
        const botUserId = '00000000-0000-0000-0000-000000000000';

        const { error: botError } = await supabase
          .from('game_players')
          .insert({
            room_id: room.id,
            user_id: botUserId, // Use special bot UUID
            color: 'yellow',
            position: 2,
            is_ready: true,
            is_bot: true,
          });

        if (botError) console.error('Bot error:', botError);
      }

      setRoomCode(code);

      // Redirect to game room after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/games/room/${room.id}?players=${playerCount}&bot=${playWithBot}`);
      }, 2000);
    } catch (error: any) {
      console.error('Error creating room:', error);
      alert('Failed to create room. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const joinRoom = async () => {
    if (!joinRoomCode || joinRoomCode.length !== 6) {
      alert('Please enter a valid 6-digit room code');
      return;
    }

    setJoining(true);
    try {
      // Find room by code
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('room_code', joinRoomCode)
        .eq('status', 'waiting')
        .single();

      if (roomError || !room) {
        alert('Room not found or already started');
        return;
      }

      // Check how many players already in room
      const { data: players, error: playersError } = await supabase
        .from('game_players')
        .select('*')
        .eq('room_id', room.id);

      if (playersError) throw playersError;

      if (players.length >= 4) {
        alert('Room is full (max 4 players)');
        return;
      }

      // Check if user already in room
      const alreadyJoined = players.some(p => p.user_id === userId);
      if (alreadyJoined) {
        router.push(`/dashboard/games/room/${room.id}`);
        return;
      }

      // Assign color based on available colors
      const usedColors = players.map(p => p.color);
      const availableColors = ['red', 'yellow', 'green', 'blue'].filter(c => !usedColors.includes(c));
      const assignedColor = availableColors[0];

      // Add player to room
      const { error: joinError } = await supabase
        .from('game_players')
        .insert({
          room_id: room.id,
          user_id: userId,
          color: assignedColor,
          position: players.length + 1,
          is_ready: false,
        });

      if (joinError) throw joinError;

      // Redirect to game room
      router.push(`/dashboard/games/room/${room.id}`);
    } catch (error: any) {
      console.error('Error joining room:', error);
      alert('Failed to join room. Please try again.');
    } finally {
      setJoining(false);
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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Page Title */}
        <div className="text-center mb-12">
          <div className="bg-emerald-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">Free Play</h1>
          <p className="text-gray-400 text-lg">Play Ludo with friends for fun - no money required!</p>
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

            <p className="text-gray-400 mb-6">
              Create a new game room and invite your friends to join using the room code.
            </p>

            {!roomCode && (
              <>
                {/* Player Count Selection */}
                <div className="mb-6">
                  <label className="block text-gray-300 font-medium mb-3">Number of Players</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[2, 3, 4].map((count) => (
                      <button
                        key={count}
                        onClick={() => setPlayerCount(count as 2 | 3 | 4)}
                        className={`py-3 rounded-lg font-bold transition ${
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

                {/* Bot Option */}
                <div className="mb-6">
                  <label className="flex items-center gap-3 cursor-pointer bg-slate-700 p-4 rounded-lg hover:bg-slate-600 transition">
                    <input
                      type="checkbox"
                      checked={playWithBot}
                      onChange={(e) => setPlayWithBot(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <p className="text-white font-semibold">Play with Bot</p>
                      <p className="text-gray-400 text-sm">Add a computer player if you want to play alone</p>
                    </div>
                  </label>
                </div>
              </>
            )}

            {roomCode ? (
              <div className="bg-gradient-to-r from-emerald-900/50 to-green-900/50 border border-emerald-700 rounded-xl p-6 mb-6">
                <p className="text-emerald-400 text-sm mb-2">Your Room Code:</p>
                <div className="bg-slate-900 rounded-lg p-4 mb-4">
                  <p className="text-4xl font-bold text-white text-center tracking-widest">{roomCode}</p>
                </div>
                <p className="text-gray-300 text-sm text-center">Share this code with your friends!</p>
              </div>
            ) : (
              <button
                onClick={createRoom}
                disabled={creating}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-blue-800 transition disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create New Room'}
              </button>
            )}

            {roomCode && (
              <button
                onClick={() => alert('Game board coming soon!')}
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 text-white py-4 rounded-xl font-bold hover:from-emerald-700 hover:to-green-700 transition"
              >
                Start Game
              </button>
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

            <p className="text-gray-400 mb-6">
              Enter a room code to join an existing game created by your friend.
            </p>

            <div className="mb-6">
              <label className="block text-gray-300 font-medium mb-2">Room Code</label>
              <input
                type="text"
                value={joinRoomCode}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white text-center text-2xl tracking-widest uppercase"
                maxLength={6}
                onChange={(e) => setJoinRoomCode(e.target.value.toUpperCase())}
              />
            </div>

            <button
              onClick={joinRoom}
              disabled={joinRoomCode.length !== 6 || joining}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joining ? 'Joining...' : 'Join Game'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 bg-blue-900/30 border border-blue-700 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-blue-300 font-semibold mb-2">How Free Play Works:</p>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Create a room and share the code with friends</li>
                <li>• Or join a friend's room using their code</li>
                <li>• Play classic Ludo with up to 4 players</li>
                <li>• No money involved - just pure fun!</li>
                <li>• Game board and full gameplay coming soon</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

