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
  playerProgress?: Record<string, number>; // Progress percentage for each player
}

export default function VisualBoard({
  gameState,
  currentUserId,
  onRollDice,
  onMoveToken,
  canRoll,
  playerProgress = {},
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
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-900 to-amber-950 p-2 sm:p-4 md:p-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 mb-2 drop-shadow-lg">
            Ludomania
          </h1>
          <p className="text-amber-200 text-sm sm:text-base md:text-lg font-semibold">
            {isMyTurn ? "🎲 Your Turn!" : `Waiting for ${currentPlayer?.username}...`}
          </p>
        </div>

        {/* Mobile Player List */}
        <div className="lg:hidden mb-4 grid grid-cols-2 gap-2 sm:gap-3">
          {gameState.players.map((player) => (
            <div
              key={player.id}
              className={`p-2 sm:p-3 rounded-lg border-2 ${
                player.id === currentPlayer?.id
                  ? 'border-yellow-400 bg-yellow-900/30'
                  : 'border-amber-700 bg-amber-900/20'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full`}
                  style={{ backgroundColor: COLOR_SCHEMES[player.color].primary }}
                />
                <span className="text-amber-100 text-xs sm:text-sm font-semibold truncate">
                  {player.username}
                </span>
                {(player as any).isBot && <span className="text-xs">🤖</span>}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 sm:gap-6 items-start">
          {/* Left Players */}
          <div className="space-y-4 hidden lg:block">
            {gameState.players.slice(0, 2).map((player) => (
              <PlayerPanel
                key={player.id}
                player={player}
                isCurrentTurn={player.id === currentPlayer?.id}
                isYou={player.id === currentUserId}
                progress={playerProgress[player.id] || 0}
              />
            ))}
          </div>

          {/* Board */}
          <div className="relative w-full max-w-2xl mx-auto lg:max-w-none">
            {/* Wooden board with texture */}
            <div className="bg-gradient-to-br from-amber-800 via-yellow-700 to-amber-900 p-3 sm:p-4 md:p-6 rounded-2xl sm:rounded-3xl shadow-2xl border-4 sm:border-6 md:border-8 border-amber-950 relative overflow-hidden">
              {/* Wood grain effect */}
              <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0id29vZCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjOEI0NTEzIi8+PHBhdGggZD0iTTAgMEwyMDAgMjAwTTIwMCAwTDAgMjAwIiBzdHJva2U9IiM2QjM0MTAiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjd29vZCkiLz48L3N2Zz4=')]"></div>

              {/* Inner playing area */}
              <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl shadow-inner border-2 sm:border-3 md:border-4 border-amber-700 relative">
                <div className="grid grid-cols-15 gap-0 relative aspect-square w-full">
                  {renderBoard()}
                  {renderTokens()}
                </div>
              </div>
            </div>

            {/* Dice Roller */}
            <div className="mt-4 sm:mt-6">
              <DiceRoller
                diceValue={gameState.diceValue}
                onRoll={onRollDice}
                canRoll={canRoll && isMyTurn}
                isRolling={false}
              />
            </div>
          </div>

          {/* Right Players */}
          <div className="space-y-4 hidden lg:block">
            {gameState.players.slice(2, 4).map((player) => (
              <PlayerPanel
                key={player.id}
                player={player}
                isCurrentTurn={player.id === currentPlayer?.id}
                isYou={player.id === currentUserId}
                progress={playerProgress[player.id] || 0}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

