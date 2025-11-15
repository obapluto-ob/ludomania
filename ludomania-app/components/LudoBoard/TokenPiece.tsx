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
    ${isAnimating ? 'scale-110 rotate-[360deg]' : 'scale-100'}
    ${isValid ? 'ring-4 ring-amber-300 ring-opacity-90 animate-pulse' : ''}
    ${isSelected ? 'scale-125 ring-4 ring-yellow-400 shadow-2xl' : ''}
    ${!isValid && !isSelected ? 'hover:scale-110 hover:shadow-xl' : ''}
  `;

  const tokenStyle = {
    gridColumn: gridColumn,
    gridRow: gridRow,
    background: `radial-gradient(circle at 30% 30%, ${colorScheme.light} 0%, ${colorScheme.primary} 40%, ${colorScheme.dark} 100%)`,
    boxShadow: isValid || isSelected
      ? `0 0 25px ${colorScheme.primary}, 0 8px 15px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.4)`
      : `0 6px 12px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3)`,
    border: `2px solid ${colorScheme.dark}`,
  };

  return (
    <div
      className={tokenClasses}
      style={tokenStyle}
      onClick={onClick}
    >
      {/* Glossy highlight effect */}
      <div className="absolute top-1 left-1 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full bg-white opacity-40 blur-sm"></div>

      {/* Inner circle with gem effect */}
      <div
        className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-full bg-gradient-to-br from-white via-gray-100 to-gray-300 shadow-inner flex items-center justify-center border-2"
        style={{ borderColor: colorScheme.dark }}
      >
        <div
          className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full shadow-lg"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${colorScheme.light}, ${colorScheme.primary})`,
            boxShadow: `inset 0 1px 2px rgba(255,255,255,0.5), 0 2px 4px rgba(0,0,0,0.3)`
          }}
        ></div>
      </div>

      {/* Glow effect for valid moves */}
      {isValid && (
        <>
          <div
            className="absolute inset-0 rounded-full animate-ping opacity-75"
            style={{ backgroundColor: colorScheme.primary }}
          ></div>
          <div className="absolute -inset-2 rounded-full bg-yellow-400 opacity-20 animate-pulse"></div>
        </>
      )}

      {/* Sparkle effect for selected token */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-bounce shadow-lg shadow-yellow-400"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full animate-bounce delay-100 shadow-lg shadow-yellow-400"></div>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-yellow-300 rounded-full animate-bounce delay-200 shadow-lg shadow-yellow-400"></div>
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-bounce delay-300 shadow-lg shadow-yellow-400"></div>
        </>
      )}
    </div>
  );
}

