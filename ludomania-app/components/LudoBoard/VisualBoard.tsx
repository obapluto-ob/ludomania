'use client';

import React, { useState, useEffect } from 'react';
import { PlayerColor, Player, GameState, PATH_COORDINATES, HOME_ZONES, COLOR_SCHEMES, BOARD_CONFIG } from './types';
import BoardSquare from './BoardSquare';
import TokenPiece from './TokenPiece';
import DiceRoller from './DiceRoller';
import PlayerPanel from './PlayerPanel';

interface VisualBoardProps {
  gameState: GameState;
  currentUserId: string;
  onRollDice: () => void;
  onMoveToken: (tokenId: number) => void;
  canRoll: boolean;
}

export default function VisualBoard({
  gameState,
  currentUserId,
  onRollDice,
  onMoveToken,
  canRoll,
}: VisualBoardProps) {
  const [selectedToken, setSelectedToken] = useState<number | null>(null);
  const [validMoves, setValidMoves] = useState<number[]>([]);

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === currentUserId;
  const myPlayer = gameState.players.find(p => p.id === currentUserId);

  // Calculate valid moves when dice is rolled
  useEffect(() => {
    if (gameState.diceValue && isMyTurn && myPlayer) {
      const moves: number[] = [];
      myPlayer.tokens.forEach((token, index) => {
        if (canMoveToken(token, gameState.diceValue!)) {
          moves.push(index);
        }
      });
      setValidMoves(moves);
    } else {
      setValidMoves([]);
      setSelectedToken(null);
    }
  }, [gameState.diceValue, isMyTurn]);

  const canMoveToken = (token: any, diceValue: number): boolean => {
    // Need 6 to leave home
    if (token.isHome && diceValue !== 6) return false;
    
    // Can't move if finished
    if (token.isFinished) return false;
    
    // Check if move would go past finish
    if (!token.isHome) {
      const newPos = token.position + diceValue;
      if (newPos > BOARD_CONFIG.FINISH_END) return false;
    }
    
    return true;
  };

  const handleTokenClick = (tokenId: number) => {
    if (!isMyTurn || !gameState.diceValue) return;
    
    if (validMoves.includes(tokenId)) {
      setSelectedToken(tokenId);
      onMoveToken(tokenId);
    }
  };

  // Render the 15x15 grid board
  const renderBoard = () => {
    const grid = [];
    const cellSize = 'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14';

    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        const key = `${x}-${y}`;
        
        // Determine cell type
        let cellType: 'path' | 'home' | 'finish' | 'center' | 'empty' = 'empty';
        let color: PlayerColor | null = null;
        let isSafe = false;
        let pathIndex = -1;

        // Check if it's a path square
        pathIndex = PATH_COORDINATES.findIndex(coord => coord.x === x && coord.y === y);
        if (pathIndex !== -1) {
          cellType = 'path';
          isSafe = BOARD_CONFIG.SAFE_POSITIONS.includes(pathIndex);
        }

        // Check if it's a home zone
        for (const [playerColor, zones] of Object.entries(HOME_ZONES)) {
          if (zones.some(zone => zone.x === x && zone.y === y)) {
            cellType = 'home';
            color = playerColor as PlayerColor;
            break;
          }
        }

        // Check if it's the center
        if ((x >= 6 && x <= 8) && (y >= 6 && y <= 8)) {
          if (x === 7 && y === 7) {
            cellType = 'center';
          } else {
            cellType = 'finish';
            // Determine which color's finish lane
            if (x === 7 && y > 7) color = 'red';
            else if (x < 7 && y === 7) color = 'blue';
            else if (x === 7 && y < 7) color = 'green';
            else if (x > 7 && y === 7) color = 'yellow';
          }
        }

        grid.push(
          <BoardSquare
            key={key}
            type={cellType}
            color={color}
            isSafe={isSafe}
            pathIndex={pathIndex}
            className={cellSize}
          />
        );
      }
    }

    return grid;
  };

  // Render all tokens on the board
  const renderTokens = () => {
    const tokens: React.ReactElement[] = [];

    gameState.players.forEach((player) => {
      player.tokens.forEach((token, index) => {
        const isValid = validMoves.includes(index) && player.id === currentUserId;
        const isSelected = selectedToken === index && player.id === currentUserId;

        tokens.push(
          <TokenPiece
            key={`${player.id}-${index}`}
            token={token}
            isValid={isValid}
            isSelected={isSelected}
            onClick={() => player.id === currentUserId && handleTokenClick(index)}
            playerColor={player.color}
          />
        );
      });
    });

    return tokens;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">Ludomania</h1>
          <p className="text-gray-300">
            {isMyTurn ? "🎲 Your Turn!" : `Waiting for ${currentPlayer?.username}...`}
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
          {/* Left Players */}
          <div className="space-y-4">
            {gameState.players.slice(0, 2).map((player) => (
              <PlayerPanel
                key={player.id}
                player={player}
                isCurrentTurn={player.id === currentPlayer?.id}
                isYou={player.id === currentUserId}
              />
            ))}
          </div>

          {/* Board */}
          <div className="relative">
            <div className="bg-gradient-to-br from-amber-100 to-yellow-50 p-4 rounded-2xl shadow-2xl border-4 border-amber-900">
              <div className="grid grid-cols-15 gap-0 relative">
                {renderBoard()}
                {renderTokens()}
              </div>
            </div>

            {/* Dice Roller */}
            <div className="mt-6">
              <DiceRoller
                diceValue={gameState.diceValue}
                onRoll={onRollDice}
                canRoll={canRoll && isMyTurn}
                isRolling={false}
              />
            </div>
          </div>

          {/* Right Players */}
          <div className="space-y-4">
            {gameState.players.slice(2, 4).map((player) => (
              <PlayerPanel
                key={player.id}
                player={player}
                isCurrentTurn={player.id === currentPlayer?.id}
                isYou={player.id === currentUserId}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

