'use client';

import { useState, useEffect } from 'react';
import { Token, PlayerColor, COLOR_SCHEMES, PATH_COORDINATES, HOME_ZONES } from './types';

interface TokenPieceProps {
  token: Token;
  isValid: boolean;
  isSelected: boolean;
  onClick: () => void;
  playerColor: PlayerColor;
}

export default function TokenPiece({
  token,
  isValid,
  isSelected,
  onClick,
  playerColor,
}: TokenPieceProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const colorScheme = COLOR_SCHEMES[playerColor];

  // Get token position on the grid
  const getTokenPosition = () => {
    if (token.isHome) {
      // Token is in home zone
      const homeZone = HOME_ZONES[playerColor];
      const homePos = homeZone[token.id];
      return {
        x: homePos.x,
        y: homePos.y,
      };
    } else if (token.isFinished) {
      // Token is in finish area
      return {
        x: 7,
        y: 7,
      };
    } else {
      // Token is on the main path
      const pathPos = PATH_COORDINATES[token.position];
      return {
        x: pathPos.x,
        y: pathPos.y,
      };
    }
  };

  const position = getTokenPosition();

  // Trigger animation when position changes
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [token.position]);

  // Calculate grid position (CSS Grid uses 1-based indexing)
  const gridColumn = position.x + 1;
  const gridRow = position.y + 1;

  const tokenClasses = `
    absolute z-10
    w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12
    rounded-full
    flex items-center justify-center
    cursor-pointer
    transform transition-all duration-500
    ${isAnimating ? 'scale-110' : 'scale-100'}
    ${isValid ? 'ring-4 ring-white ring-opacity-75 animate-pulse' : ''}
    ${isSelected ? 'scale-125 ring-4 ring-yellow-400' : ''}
    ${!isValid && !isSelected ? 'hover:scale-110' : ''}
  `;

  const tokenStyle = {
    gridColumn: gridColumn,
    gridRow: gridRow,
    background: `linear-gradient(135deg, ${colorScheme.light} 0%, ${colorScheme.primary} 50%, ${colorScheme.dark} 100%)`,
    boxShadow: isValid || isSelected
      ? `0 0 20px ${colorScheme.primary}, 0 4px 6px rgba(0,0,0,0.3)`
      : `0 4px 6px rgba(0,0,0,0.3)`,
  };

  return (
    <div
      className={tokenClasses}
      style={tokenStyle}
      onClick={onClick}
    >
      {/* Inner circle */}
      <div
        className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-white shadow-inner flex items-center justify-center"
      >
        <div
          className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full"
          style={{ backgroundColor: colorScheme.primary }}
        ></div>
      </div>

      {/* Glow effect for valid moves */}
      {isValid && (
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-75"
          style={{ backgroundColor: colorScheme.primary }}
        ></div>
      )}

      {/* Particle effect for selected token */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-200"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-300"></div>
        </>
      )}
    </div>
  );
}

