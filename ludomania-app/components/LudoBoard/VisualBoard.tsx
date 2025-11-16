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

  // Helper to get home zone background color
  const getHomeZoneBackground = (x: number, y: number): string | null => {
    if (x >= 0 && x <= 5 && y >= 9 && y <= 14) return 'red';
    if (x >= 0 && x <= 5 && y >= 0 && y <= 5) return 'blue';
    if (x >= 9 && x <= 14 && y >= 0 && y <= 5) return 'green';
    if (x >= 9 && x <= 14 && y >= 9 && y <= 14) return 'yellow';
    return null;
  };

  // Render the 15x15 grid board
  const renderBoard = () => {
    const grid = [];
    const cellSize = 'w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14';

    for (let y = 0; y < 15; y++) {
      for (let x = 0; x < 15; x++) {
        const key = `${x}-${y}`;

        // Determine cell type
        let cellType: 'path' | 'home' | 'finish' | 'center' | 'empty' = 'empty';
        let color: PlayerColor | null = null;
        let isSafe = false;
        let pathIndex = -1;

        // Check if in home zone area (for background color)
        const homeZoneBg = getHomeZoneBackground(x, y);

        // Check if it's a path square
        pathIndex = PATH_COORDINATES.findIndex(coord => coord.x === x && coord.y === y);
        if (pathIndex !== -1) {
          cellType = 'path';
          isSafe = BOARD_CONFIG.SAFE_POSITIONS.includes(pathIndex);
        }

        // Check if it's a home zone (6x6 areas in corners with colored backgrounds)
        // Red home zone (bottom-left): 0-5, 9-14
        if (x >= 0 && x <= 5 && y >= 9 && y <= 14) {
          if (HOME_ZONES.red.some(zone => zone.x === x && zone.y === y)) {
            cellType = 'home';
            color = 'red';
          }
          // Don't mark as empty - let it show the colored background
        }
        // Blue home zone (top-left): 0-5, 0-5
        else if (x >= 0 && x <= 5 && y >= 0 && y <= 5) {
          if (HOME_ZONES.blue.some(zone => zone.x === x && zone.y === y)) {
            cellType = 'home';
            color = 'blue';
          }
        }
        // Green home zone (top-right): 9-14, 0-5
        else if (x >= 9 && x <= 14 && y >= 0 && y <= 5) {
          if (HOME_ZONES.green.some(zone => zone.x === x && zone.y === y)) {
            cellType = 'home';
            color = 'green';
          }
        }
        // Yellow home zone (bottom-right): 9-14, 9-14
        else if (x >= 9 && x <= 14 && y >= 9 && y <= 14) {
          if (HOME_ZONES.yellow.some(zone => zone.x === x && zone.y === y)) {
            cellType = 'home';
            color = 'yellow';
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

        // Add SOLID VIBRANT home zone background - EXACTLY like Ludo King/Star! 🎮
        let bgClass = '';
        if (homeZoneBg && cellType === 'empty') {
          const bgColors: Record<string, string> = {
            red: 'bg-red-500',      // SOLID bright red - like Ludo King!
            blue: 'bg-blue-500',    // SOLID bright blue - like Ludo King!
            green: 'bg-green-500',  // SOLID bright green - like Ludo King!
            yellow: 'bg-yellow-400', // SOLID bright yellow - like Ludo King!
          };
          bgClass = bgColors[homeZoneBg] || '';
        }

        grid.push(
          <BoardSquare
            key={key}
            type={cellType}
            color={color}
            isSafe={isSafe}
            pathIndex={pathIndex}
            className={`${cellSize} ${bgClass}`}
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
            {/* PROFESSIONAL WOODEN BOARD - Like Ludo King! */}
            <div className="bg-gradient-to-br from-amber-900 via-amber-800 to-amber-950 p-6 sm:p-8 md:p-10 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] border-[12px] border-amber-950 relative overflow-hidden">
              {/* Wood grain texture overlay */}
              <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0id29vZCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiPjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjOEI0NTEzIi8+PHBhdGggZD0iTTAgMEwyMDAgMjAwTTIwMCAwTDAgMjAwIiBzdHJva2U9IiM2QjM0MTAiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjd29vZCkiLz48L3N2Zz4=')]"></div>

              {/* Glossy highlight on top edge */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/10 to-transparent rounded-t-3xl"></div>

              {/* Inner playing area - RAISED 3D EFFECT */}
              <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 p-2 rounded-2xl shadow-[inset_0_4px_12px_rgba(0,0,0,0.3),0_8px_24px_rgba(0,0,0,0.2)] border-[6px] border-amber-900 relative">
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 via-transparent to-black/10 pointer-events-none"></div>

                {/* Board grid */}
                <div className="grid grid-cols-15 gap-[2px] relative aspect-square w-full bg-gray-800 rounded-lg overflow-hidden shadow-lg">
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

