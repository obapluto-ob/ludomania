'use client';

import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import { useRouter } from 'next/navigation';

interface Token {
  id: number;
  position: number;
  color: string;
  playerId: string;
}

interface LudoBoardProps {
  socket: Socket | null;
  gameId: string;
  userId: string;
  username: string;
  gameInfo: any;
}

export default function LudoBoard({ socket, gameId, userId, username, gameInfo }: LudoBoardProps) {
  const router = useRouter();
  const [diceValue, setDiceValue] = useState<number | null>(null);
  const [currentTurn, setCurrentTurn] = useState<string>('');
  const [myTokens, setMyTokens] = useState<Token[]>([
    { id: 0, position: -1, color: 'red', playerId: userId },
    { id: 1, position: -1, color: 'red', playerId: userId },
    { id: 2, position: -1, color: 'red', playerId: userId },
    { id: 3, position: -1, color: 'red', playerId: userId },
  ]);
  const [opponentTokens, setOpponentTokens] = useState<Token[]>([]);
  const [gameEnded, setGameEnded] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [canRoll, setCanRoll] = useState(false);

  useEffect(() => {
    if (!socket) return;

    socket.on('game-started', (data) => {
      const players = data.players;
      // Set first player's turn
      setCurrentTurn(players[0].id);
      if (players[0].id === userId) {
        setCanRoll(true);
      }
    });

    socket.on('dice-rolled', (data) => {
      setDiceValue(data.diceValue);
    });

    socket.on('token-moved', (data) => {
      // Update token positions
      if (data.playerId === userId) {
        setMyTokens((prev) =>
          prev.map((token) =>
            token.id === data.tokenId ? { ...token, position: data.newPosition } : token
          )
        );
      } else {
        setOpponentTokens((prev) =>
          prev.map((token) =>
            token.id === data.tokenId ? { ...token, position: data.newPosition } : token
          )
        );
      }

      // Switch turns
      setCurrentTurn(data.playerId === userId ? gameInfo.player2_id : userId);
      setCanRoll(data.playerId !== userId);
      setDiceValue(null);
    });

    socket.on('game-ended', (data) => {
      setGameEnded(true);
      setWinner(data.winnerId);
    });

    return () => {
      socket.off('game-started');
      socket.off('dice-rolled');
      socket.off('token-moved');
      socket.off('game-ended');
    };
  }, [socket, userId]);

  const rollDice = () => {
    if (!socket || !canRoll) return;
    socket.emit('roll-dice', { gameId });
    setCanRoll(false);
  };

  const moveToken = (tokenId: number) => {
    if (!socket || !diceValue) return;

    const token = myTokens[tokenId];
    let newPosition = token.position;

    if (token.position === -1 && diceValue === 6) {
      newPosition = 0; // Start position
    } else if (token.position >= 0) {
      newPosition = token.position + diceValue;
    } else {
      return; // Can't move
    }

    socket.emit('move-token', {
      gameId,
      playerId: userId,
      tokenId,
      newPosition,
    });

    // Check if won (all tokens at position 57)
    const updatedTokens = myTokens.map((t) =>
      t.id === tokenId ? { ...t, position: newPosition } : t
    );
    const allFinished = updatedTokens.every((t) => t.position >= 57);

    if (allFinished) {
      socket.emit('game-won', { gameId, winnerId: userId });
    }
  };

  if (gameEnded) {
    const isWinner = winner === userId;
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">{isWinner ? '🎉' : '😢'}</div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">
            {isWinner ? 'You Won!' : 'You Lost'}
          </h2>
          <p className="text-xl mb-6 text-gray-600">
            {isWinner
              ? `You won $${(gameInfo.wager_amount * 2).toFixed(2)}!`
              : `Better luck next time!`}
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Ludo Game</h2>
            <p className="text-gray-600">Wager: ${gameInfo.wager_amount}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              {currentTurn === userId ? "Your turn" : "Opponent's turn"}
            </p>
            {diceValue && (
              <div className="text-4xl font-bold text-purple-600">🎲 {diceValue}</div>
            )}
          </div>
        </div>
      </div>

      {/* Simplified Ludo Board */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {myTokens.map((token) => (
            <button
              key={token.id}
              onClick={() => moveToken(token.id)}
              disabled={!diceValue}
              className={`p-4 rounded-lg border-2 ${
                token.position === -1
                  ? 'bg-red-100 border-red-500'
                  : token.position >= 57
                  ? 'bg-green-100 border-green-500'
                  : 'bg-yellow-100 border-yellow-500'
              } disabled:opacity-50`}
            >
              <div className="text-2xl">🔴</div>
              <div className="text-sm">Token {token.id + 1}</div>
              <div className="text-xs">Pos: {token.position}</div>
            </button>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={rollDice}
            disabled={!canRoll}
            className="bg-purple-600 text-white px-8 py-4 rounded-lg font-bold text-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {canRoll ? '🎲 Roll Dice' : 'Wait for your turn'}
          </button>
        </div>
      </div>
    </div>
  );
}

