'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { io, Socket } from 'socket.io-client';
import GameAdapter from '@/components/LudoBoard/GameAdapter';

interface GameInfo {
  id: string;
  room_code: string;
  wager_amount: number;
  status: string;
  player1_id: string;
  player2_id?: string;
}

export default function GamePlayPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const gameId = params.gameId as string;
  const roomCode = searchParams.get('room');

  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [waitingForPlayer, setWaitingForPlayer] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    initGame();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const initGame = async () => {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUserId(user.id);

    // Get username
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single();

    if (profile) {
      setUsername(profile.username);
    }

    // Get game info from game_rooms table
    const { data: game, error: gameError } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      setError('Game not found');
      setLoading(false);
      return;
    }

    // Get players
    const { data: players } = await supabase
      .from('game_players')
      .select('*')
      .eq('room_id', gameId);

    // Convert to old format for compatibility
    const gameInfo = {
      id: game.id,
      room_code: game.room_code,
      wager_amount: game.wager || 0,
      status: game.status,
      player1_id: game.created_by,
      player2_id: players && players.length > 1 ? players[1].user_id : undefined,
    };

    setGameInfo(gameInfo);

    // Check if game is ready to play
    if (game.status === 'playing') {
      setWaitingForPlayer(false);
    }

    // Connect to socket
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Join game room
    if (game.player1_id === user.id && !game.player2_id) {
      newSocket.emit('create-game', {
        gameId,
        playerId: user.id,
        username: profile?.username,
        wagerAmount: game.wager_amount,
      });
    } else {
      newSocket.emit('join-game', {
        gameId,
        playerId: user.id,
        username: profile?.username,
      });
    }

    // Listen for game start
    newSocket.on('game-started', () => {
      setWaitingForPlayer(false);
    });

    // Listen for player disconnect
    newSocket.on('player-disconnected', () => {
      setError('Opponent disconnected');
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (waitingForPlayer) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Waiting for Opponent...</h2>
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600 mb-4">Share this room code with your friend:</p>
          <div className="bg-purple-100 border-2 border-purple-500 rounded-lg p-4 mb-4">
            <div className="text-4xl font-bold text-purple-600">{roomCode}</div>
          </div>
          <p className="text-sm text-gray-500">Wager: ${gameInfo?.wager_amount}</p>
        </div>
      </div>
    );
  }

  return (
    <GameAdapter socket={socket} gameId={gameId} userId={userId} username={username} gameInfo={gameInfo} />
  );
}

