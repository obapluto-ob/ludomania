'use client';

import { Player, COLOR_SCHEMES } from './types';

interface PlayerPanelProps {
  player: Player;
  isCurrentTurn: boolean;
  isYou: boolean;
}

export default function PlayerPanel({ player, isCurrentTurn, isYou }: PlayerPanelProps) {
  const colorScheme = COLOR_SCHEMES[player.color];
  
  const tokensHome = player.tokens.filter(t => t.isHome).length;
  const tokensFinished = player.tokens.filter(t => t.isFinished).length;
  const tokensInPlay = player.tokens.length - tokensHome - tokensFinished;

  return (
    <div
      className={`
        bg-slate-800 rounded-xl p-4 border-2 transition-all
        ${isCurrentTurn ? `border-${player.color}-500 shadow-lg shadow-${player.color}-500/50` : 'border-slate-700'}
        ${isYou ? 'ring-2 ring-yellow-400' : ''}
      `}
    >
      {/* Player Header */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg`}
          style={{
            background: `linear-gradient(135deg, ${colorScheme.light} 0%, ${colorScheme.primary} 50%, ${colorScheme.dark} 100%)`,
          }}
        >
          {player.username.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="text-white font-bold">{player.username}</p>
            {isYou && (
              <span className="bg-yellow-500 text-black text-xs px-2 py-0.5 rounded-full font-semibold">
                YOU
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm capitalize">{player.color} Player</p>
        </div>

        {/* Turn Indicator */}
        {isCurrentTurn && (
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-xs font-semibold">Turn</span>
          </div>
        )}
      </div>

      {/* Token Status */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-slate-700 rounded-lg p-2">
          <p className="text-gray-400 text-xs">Home</p>
          <p className="text-white font-bold">{tokensHome}</p>
        </div>
        <div className="bg-slate-700 rounded-lg p-2">
          <p className="text-gray-400 text-xs">Playing</p>
          <p className="text-blue-400 font-bold">{tokensInPlay}</p>
        </div>
        <div className="bg-slate-700 rounded-lg p-2">
          <p className="text-gray-400 text-xs">Finished</p>
          <p className="text-green-400 font-bold">{tokensFinished}</p>
        </div>
      </div>

      {/* Token Visual Indicators */}
      <div className="flex gap-1 mt-3 justify-center">
        {player.tokens.map((token, index) => (
          <div
            key={index}
            className={`w-6 h-6 rounded-full border-2 transition-all ${
              token.isFinished
                ? 'bg-green-500 border-green-700'
                : token.isHome
                ? 'bg-gray-600 border-gray-700'
                : 'border-white'
            }`}
            style={{
              backgroundColor: !token.isFinished && !token.isHome ? colorScheme.primary : undefined,
            }}
            title={`Token ${index + 1}: ${token.isFinished ? 'Finished' : token.isHome ? 'Home' : `Position ${token.position}`}`}
          ></div>
        ))}
      </div>
    </div>
  );
}

