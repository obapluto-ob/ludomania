'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Player {
  id: string;
  user_id: string;
  color: string;
  position: number;
  is_ready: boolean;
  is_bot?: boolean;
  profiles: {
    username: string;
  };
}

interface GameRoom {
  id: string;
  room_code: string;
  game_mode: string;
  wager: number;
  status: string;
  created_by: string;
  max_players?: number;
  has_bot?: boolean;
}

export default function GameRoomPage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const router = useRouter();
  
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [userId, setUserId] = useState('');
  const [loading, setLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkUser();
    fetchRoomData();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_players',
        filter: `room_id=eq.${roomId}`,
      }, () => {
        fetchRoomData();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'game_rooms',
        filter: `id=eq.${roomId}`,
      }, (payload) => {
        setRoom(payload.new as GameRoom);
        if (payload.new.status === 'playing') {
          // Game started - could redirect to game board
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUserId(user.id);
  };

  const fetchRoomData = async () => {
    try {
      // Fetch room details
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;
      setRoom(roomData);

      // Fetch players
      const { data: playersData, error: playersError } = await supabase
        .from('game_players')
        .select(`
          *,
          profiles:user_id (username)
        `)
        .eq('room_id', roomId)
        .order('position');

      if (playersError) throw playersError;
      setPlayers(playersData || []);
      
      // Check if current user is ready
      const currentPlayer = playersData?.find(p => p.user_id === userId);
      setIsReady(currentPlayer?.is_ready || false);
    } catch (error) {
      console.error('Error fetching room data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleReady = async () => {
    try {
      const newReadyState = !isReady;

      const { error } = await supabase
        .from('game_players')
        .update({ is_ready: newReadyState })
        .eq('room_id', roomId)
        .eq('user_id', userId);

      if (error) throw error;
      setIsReady(newReadyState);

      // Auto-start game if:
      // 1. User just became ready
      // 2. Room has a bot
      // 3. Max players is 2 (user + bot)
      // 4. User is the host
      if (newReadyState && room?.has_bot && room?.max_players === 2 && room?.created_by === userId) {
        // Check if we have exactly 2 players (user + bot)
        const { data: currentPlayers } = await supabase
          .from('game_players')
          .select('*')
          .eq('room_id', roomId);

        if (currentPlayers && currentPlayers.length === 2) {
          // Check if all players are ready (user just became ready, bot is always ready)
          const allReady = currentPlayers.every(p => p.is_ready);

          if (allReady) {
            // Auto-start the game!
            await supabase
              .from('game_rooms')
              .update({
                status: 'playing',
                started_at: new Date().toISOString(),
              })
              .eq('id', roomId);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling ready:', error);
    }
  };

  const startGame = async () => {
    if (!room || room.created_by !== userId) return;

    // Check if all players are ready
    const allReady = players.every(p => p.is_ready);
    if (!allReady) {
      alert('All players must be ready before starting');
      return;
    }

    if (players.length < 2) {
      alert('Need at least 2 players to start');
      return;
    }

    try {
      const { error } = await supabase
        .from('game_rooms')
        .update({
          status: 'playing',
          started_at: new Date().toISOString(),
        })
        .eq('id', roomId);

      if (error) throw error;

      alert('Game starting! Full game board coming soon...');
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-600',
      yellow: 'bg-yellow-500',
      green: 'bg-green-600',
      blue: 'bg-blue-600',
    };
    return colors[color] || 'bg-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading room...</div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-xl mb-4">Room not found</p>
          <Link href="/dashboard/games" className="text-blue-400 hover:text-blue-300">
            Back to Games
          </Link>
        </div>
      </div>
    );
  }

  const isHost = room.created_by === userId;
  const allReady = players.length > 0 && players.every(p => p.is_ready);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard/games" className="text-blue-400 hover:text-blue-300 transition flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Leave Room
          </Link>
          <div className="text-white">
            <span className="text-gray-400">Room Code:</span>
            <span className="ml-2 font-bold text-2xl tracking-widest">{room.room_code}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Room Info */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            {room.game_mode === 'free' ? 'Free Play' : 'Money Game'}
            {room.has_bot && room.max_players === 2 && (
              <span className="text-blue-400 text-2xl ml-3">🤖 vs Bot</span>
            )}
          </h1>
          {room.game_mode === 'money' && (
            <p className="text-yellow-400 text-xl">Wager: KSh {room.wager.toFixed(2)}</p>
          )}
          <p className="text-gray-400 mt-2">
            {room.status === 'waiting'
              ? (room.has_bot && room.max_players === 2
                  ? 'Playing with Bot - Click Ready to start!'
                  : 'Waiting for players...')
              : 'Game in progress'}
          </p>
        </div>

        {/* Players Grid */}
        <div className={`grid gap-6 mb-8 ${
          room.max_players === 2 ? 'md:grid-cols-2 max-w-2xl mx-auto' :
          room.max_players === 3 ? 'md:grid-cols-3 max-w-4xl mx-auto' :
          'md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {Array.from({ length: room.max_players || 4 }, (_, i) => i + 1).map((position) => {
            const player = players.find(p => p.position === position);
            return (
              <div
                key={position}
                className={`bg-slate-800 rounded-xl p-6 border-2 ${
                  player ? 'border-slate-600' : 'border-dashed border-slate-700'
                }`}
              >
                {player ? (
                  <div className="text-center">
                    <div className={`w-16 h-16 ${getColorClass(player.color)} rounded-full mx-auto mb-3 flex items-center justify-center`}>
                      <span className="text-white text-2xl font-bold">
                        {player.is_bot ? '🤖' : player.profiles.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-white font-bold mb-1">
                      {player.is_bot ? '🤖 Bot Player' : player.profiles.username}
                    </p>
                    <p className="text-gray-400 text-sm capitalize mb-2">{player.color} Player</p>
                    {player.is_ready ? (
                      <div className="bg-green-900/30 border border-green-700 rounded-lg py-2">
                        <p className="text-green-400 font-semibold">✓ Ready</p>
                      </div>
                    ) : (
                      <div className="bg-yellow-900/30 border border-yellow-700 rounded-lg py-2">
                        <p className="text-yellow-400 font-semibold">Waiting...</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <p className="text-gray-500">Waiting for player...</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto space-y-4">
          {room.status === 'waiting' && (
            <>
              <button
                onClick={toggleReady}
                className={`w-full py-4 rounded-xl font-bold transition ${
                  isReady
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isReady ? 'Not Ready' : 'Ready to Play'}
              </button>

              {/* Show different UI for bot games vs multiplayer games */}
              {room.has_bot && room.max_players === 2 ? (
                // Bot game: Auto-starts when user clicks ready
                <div className="bg-blue-900/30 border border-blue-700 rounded-xl p-4 text-center">
                  <p className="text-blue-400 font-semibold">
                    {isReady ? '🎮 Game will start automatically!' : '👆 Click "Ready to Play" to start'}
                  </p>
                  <p className="text-gray-400 text-sm mt-2">
                    Playing with bot - no need to wait for other players
                  </p>
                </div>
              ) : (
                // Multiplayer game: Host can manually start
                isHost && (
                  <button
                    onClick={startGame}
                    disabled={!allReady || players.length < 2}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {allReady && players.length >= 2 ? 'Start Game' : 'Waiting for all players to be ready'}
                  </button>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

