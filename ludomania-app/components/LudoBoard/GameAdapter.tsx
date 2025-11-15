'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';
import VisualBoard from './VisualBoard';
import { GameState, Player, Token, PlayerColor } from './types';
import { VoiceRoom, MicControls } from '../VoiceChat';
import { LudoBotAI } from '@/lib/bot-ai';
import { DailyCall } from '@daily-co/daily-js';

interface GameAdapterProps {
  socket: Socket | null;
  gameId: string;
  userId: string;
  username: string;
  gameInfo: any;
}

/**
 * Adapter component that bridges the old LudoBoard interface with the new VisualBoard
 * Handles socket communication and game state management
 */
export default function GameAdapter({ socket, gameId, userId, username, gameInfo }: GameAdapterProps) {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>({
    gameId,
    players: [],
    currentPlayerIndex: 0,
    diceValue: null,
    winner: null,
    status: 'waiting',
  });
  const [canRoll, setCanRoll] = useState(false);
  const [voiceRoomUrl, setVoiceRoomUrl] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [playerProgress, setPlayerProgress] = useState<Record<string, number>>({});
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [turnTimeout, setTurnTimeout] = useState<NodeJS.Timeout | null>(null);

  // Calculate player progress (0-100%)
  const calculatePlayerProgress = (player: Player): number => {
    const BOARD_SIZE = 52;
    const FINISH_START = 52;
    const START_POSITIONS: Record<PlayerColor, number> = {
      red: 0,
      blue: 13,
      green: 26,
      yellow: 39,
    };

    let totalProgress = 0;

    player.tokens.forEach((token) => {
      if (token.isFinished) {
        totalProgress += 25; // Each finished token = 25%
      } else if (token.isHome) {
        totalProgress += 0; // Token at home = 0%
      } else {
        const startPos = START_POSITIONS[player.color];
        let distanceTraveled = 0;

        if (token.position >= FINISH_START) {
          // In finish lane
          const finishProgress = token.position - FINISH_START;
          distanceTraveled = BOARD_SIZE + finishProgress;
        } else {
          // On main board
          distanceTraveled = (token.position - startPos + BOARD_SIZE) % BOARD_SIZE;
        }

        // Total journey = 58 steps (52 main + 6 finish)
        const tokenProgress = (distanceTraveled / 58) * 25;
        totalProgress += tokenProgress;
      }
    });

    return Math.round(totalProgress * 10) / 10;
  };

  // Update progress whenever game state changes
  useEffect(() => {
    const progress: Record<string, number> = {};
    gameState.players.forEach((player) => {
      progress[player.id] = calculatePlayerProgress(player);
    });
    setPlayerProgress(progress);
  }, [gameState.players]);

  // Check if game has bot players
  const hasBot = gameState.players.some((p: any) => p.isBot);

  // Create voice room when component mounts (only for real multiplayer)
  useEffect(() => {
    if (!hasBot && gameState.players.length > 0) {
      createVoiceRoom();
    } else if (hasBot) {
      console.log('🤖 Bot game detected - voice chat disabled');
    }
  }, [gameState.players.length]);

  const createVoiceRoom = async () => {
    try {
      const response = await fetch('/api/voice/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId }),
      });

      if (response.ok) {
        const data = await response.json();
        setVoiceRoomUrl(data.roomUrl);
        setVoiceEnabled(true);
        console.log('✅ Voice chat enabled for multiplayer game');
      } else {
        console.error('Failed to create voice room');
      }
    } catch (error) {
      console.error('Error creating voice room:', error);
    }
  };

  useEffect(() => {
    if (!socket) return;

    // Initialize players when game starts
    socket.on('game-started', (data) => {
      const players: Player[] = data.players.map((p: any, index: number) => {
        const colors: PlayerColor[] = ['red', 'blue', 'green', 'yellow'];
        const color = colors[index];
        
        return {
          id: p.id,
          username: p.username,
          color,
          tokens: Array.from({ length: 4 }, (_, i) => ({
            id: i,
            position: -1,
            color,
            playerId: p.id,
            isHome: true,
            isFinished: false,
          })),
          position: index + 1,
          isReady: true,
        };
      });

      setGameState((prev) => ({
        ...prev,
        players,
        status: 'playing',
        currentPlayerIndex: 0,
      }));

      // Set first player's turn
      if (players[0].id === userId) {
        setCanRoll(true);
      }
    });

    // Handle dice roll
    socket.on('dice-rolled', (data) => {
      console.log('🎲 Dice rolled:', data);

      setGameState((prev) => {
        const newState = {
          ...prev,
          diceValue: data.diceValue,
          currentPlayerIndex: data.currentPlayerIndex,
        };

        // Check if it's bot's turn and auto-play (use fresh state)
        const currentPlayer = newState.players[newState.currentPlayerIndex];
        if (currentPlayer && (currentPlayer as any).isBot) {
          console.log('🤖 Bot turn detected, calculating move...');
          setTimeout(() => {
            handleBotMove(currentPlayer, data.diceValue);
          }, 1500); // 1.5 second delay for realism
        }

        return newState;
      });
    });

    // Handle token movement
    socket.on('token-moved', (data) => {
      console.log('🚀 Token moved:', data);

      // Clear any existing turn timeout
      if (turnTimeout) {
        clearTimeout(turnTimeout);
        setTurnTimeout(null);
      }

      setGameState((prev) => {
        const updatedPlayers = prev.players.map((player) => {
          if (player.id === data.playerId) {
            return {
              ...player,
              tokens: player.tokens.map((token) => {
                if (token.id === data.tokenId) {
                  return {
                    ...token,
                    position: data.newPosition,
                    isHome: data.newPosition === -1,
                    isFinished: data.newPosition >= 57,
                  };
                }
                return token;
              }),
            };
          }
          return player;
        });

        const newState = {
          ...prev,
          players: updatedPlayers,
          currentPlayerIndex: data.nextPlayerIndex,
          diceValue: null,
        };

        // Update turn and start timeout
        const nextPlayer = newState.players[data.nextPlayerIndex];
        const isMyTurn = nextPlayer?.id === userId;
        setCanRoll(isMyTurn);

        // Start 50-second timeout for next player
        const timeout = setTimeout(() => {
          console.log('⏰ Turn timeout - auto-rolling dice');
          if (socket) {
            socket.emit('roll-dice', { gameId, playerId: nextPlayer.id });
          }
        }, 50000); // 50 seconds
        setTurnTimeout(timeout);

        // Auto-roll for bot (immediate)
        if (nextPlayer && (nextPlayer as any).isBot) {
          console.log('🤖 Bot turn, auto-rolling dice...');
          setTimeout(() => {
            if (socket) {
              socket.emit('roll-dice', { gameId, playerId: nextPlayer.id });
            }
          }, 1000); // 1 second delay before rolling
        }

        return newState;
      });
    });

    // Handle turn skipped (when player has no valid moves)
    socket.on('turn-skipped', (data) => {
      console.log(`Turn skipped for player ${data.playerId}`);

      // Clear any existing turn timeout
      if (turnTimeout) {
        clearTimeout(turnTimeout);
        setTurnTimeout(null);
      }

      setGameState((prev) => {
        const newState = {
          ...prev,
          currentPlayerIndex: data.nextPlayerIndex,
          diceValue: null,
        };

        const nextPlayer = newState.players[data.nextPlayerIndex];
        const isMyTurn = nextPlayer?.id === userId;
        setCanRoll(isMyTurn);

        // Start 50-second timeout for next player
        const timeout = setTimeout(() => {
          console.log('⏰ Turn timeout - auto-rolling dice');
          if (socket) {
            socket.emit('roll-dice', { gameId, playerId: nextPlayer.id });
          }
        }, 50000);
        setTurnTimeout(timeout);

        // Check if next player is bot
        if (nextPlayer && (nextPlayer as any).isBot) {
          console.log('🤖 Next player is bot, auto-rolling...');
          setTimeout(() => {
            if (socket) {
              socket.emit('roll-dice', { gameId, playerId: nextPlayer.id });
            }
          }, 1000);
        }

        return newState;
      });
    });

    // Handle game end
    socket.on('game-ended', (data) => {
      setGameState((prev) => ({
        ...prev,
        status: 'completed',
        winner: data.winnerId,
      }));
    });

    return () => {
      // Clear timeout on unmount
      if (turnTimeout) {
        clearTimeout(turnTimeout);
      }

      socket.off('game-started');
      socket.off('dice-rolled');
      socket.off('token-moved');
      socket.off('turn-skipped');
      socket.off('game-ended');
    };
  }, [socket, userId]);

  const handleRollDice = () => {
    if (!socket || !canRoll) return;

    // Clear turn timeout when user manually rolls
    if (turnTimeout) {
      clearTimeout(turnTimeout);
      setTurnTimeout(null);
    }

    socket.emit('roll-dice', { gameId, playerId: userId });
    setCanRoll(false);
  };

  const handleBotMove = (botPlayer: Player, diceValue: number) => {
    if (!socket) return;

    // Use bot AI to choose best move
    const tokenId = LudoBotAI.chooseBestMove(botPlayer, diceValue, gameState.players);

    if (tokenId === null) {
      console.log('🤖 Bot has no valid moves');
      // No valid moves, skip turn
      socket.emit('skip-turn', { gameId, playerId: botPlayer.id });
      return;
    }

    // Execute bot move
    const token = botPlayer.tokens[tokenId];
    let newPosition = token.position;

    if (token.isHome && diceValue === 6) {
      // Move out of home
      const startPositions: Record<PlayerColor, number> = {
        red: 0,
        blue: 13,
        green: 26,
        yellow: 39,
      };
      newPosition = startPositions[botPlayer.color];
    } else if (!token.isHome) {
      newPosition = token.position + diceValue;
    }

    console.log(`🤖 Bot moving token ${tokenId} to position ${newPosition}`);

    socket.emit('move-token', {
      gameId,
      playerId: botPlayer.id,
      tokenId,
      newPosition,
    });
  };

  const handleMoveToken = (tokenId: number) => {
    if (!socket || !gameState.diceValue) return;

    const myPlayer = gameState.players.find((p) => p.id === userId);
    if (!myPlayer) return;

    const token = myPlayer.tokens[tokenId];
    let newPosition = token.position;

    // Need 6 to leave home
    if (token.position === -1 && gameState.diceValue === 6) {
      newPosition = 0; // Start position
    } else if (token.position >= 0) {
      newPosition = token.position + gameState.diceValue;
    } else {
      return; // Can't move
    }

    // Emit move to server
    socket.emit('move-token', {
      gameId,
      playerId: userId,
      tokenId,
      newPosition,
    });

    // Check if won (all tokens finished)
    const updatedTokens = myPlayer.tokens.map((t) =>
      t.id === tokenId ? { ...t, position: newPosition } : t
    );
    const allFinished = updatedTokens.every((t) => t.position >= 57);

    if (allFinished) {
      socket.emit('game-won', { gameId, winnerId: userId });
    }
  };

  // Game ended screen
  if (gameState.status === 'completed') {
    const isWinner = gameState.winner === userId;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="bg-slate-800 rounded-2xl shadow-2xl p-12 max-w-md text-center border-4 border-yellow-500">
          <div className="text-8xl mb-6">{isWinner ? '🏆' : '😢'}</div>
          <h2 className="text-4xl font-bold mb-4 text-white">
            {isWinner ? 'Victory!' : 'Defeat'}
          </h2>
          <p className="text-2xl mb-8 text-gray-300">
            {isWinner
              ? `You won KSh ${(gameInfo.wager_amount * 2 * 0.98).toFixed(2)}!`
              : `Better luck next time!`}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:scale-105 transform transition-all shadow-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <VisualBoard
        gameState={gameState}
        currentUserId={userId}
        onRollDice={handleRollDice}
        onMoveToken={handleMoveToken}
        canRoll={canRoll}
        playerProgress={playerProgress}
      />

      {/* Voice Chat */}
      {voiceEnabled && voiceRoomUrl && (
        <div className="fixed bottom-4 right-4 z-50">
          <VoiceRoom
            roomUrl={voiceRoomUrl}
            username={username}
            onError={(error) => console.error('Voice chat error:', error)}
            onCallObjectReady={(call) => setCallObject(call)}
          />

          {/* Mic Controls */}
          {callObject && (
            <div className="mt-3">
              <MicControls callObject={callObject} />
            </div>
          )}
        </div>
      )}
    </>
  );
}

