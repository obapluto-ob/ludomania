'use client';

import { useState } from 'react';

interface DiceRollerProps {
  diceValue: number | null;
  onRoll: () => void;
  canRoll: boolean;
  isRolling: boolean;
}

export default function DiceRoller({ diceValue, onRoll, canRoll, isRolling }: DiceRollerProps) {
  const [rolling, setRolling] = useState(false);

  const handleRoll = () => {
    if (!canRoll || rolling) return;
    
    setRolling(true);
    onRoll();
    
    // Stop rolling animation after 1 second
    setTimeout(() => setRolling(false), 1000);
  };

  const getDiceDots = (value: number) => {
    const dotPositions: Record<number, string[]> = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    };

    return dotPositions[value] || [];
  };

  const renderDot = (position: string) => {
    const dotClasses: Record<string, string> = {
      'top-left': 'top-2 left-2',
      'top-right': 'top-2 right-2',
      'middle-left': 'top-1/2 left-2 -translate-y-1/2',
      'middle-right': 'top-1/2 right-2 -translate-y-1/2',
      'bottom-left': 'bottom-2 left-2',
      'bottom-right': 'bottom-2 right-2',
      'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    };

    return (
      <div
        key={position}
        className={`absolute w-3 h-3 bg-red-600 rounded-full ${dotClasses[position]}`}
      ></div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Dice Display */}
      <div className="relative">
        <div
          className={`
            w-20 h-20 bg-white rounded-xl shadow-2xl border-4 border-gray-300
            flex items-center justify-center relative
            transition-transform duration-1000
            ${rolling ? 'animate-spin' : ''}
            ${canRoll ? 'hover:scale-110 cursor-pointer' : 'opacity-50'}
          `}
          onClick={handleRoll}
        >
          {diceValue ? (
            getDiceDots(diceValue).map((position) => renderDot(position))
          ) : (
            <div className="text-4xl text-gray-400">🎲</div>
          )}
        </div>

        {/* Glow effect when can roll */}
        {canRoll && !rolling && (
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 opacity-50 blur-xl animate-pulse -z-10"></div>
        )}
      </div>

      {/* Roll Button */}
      <button
        onClick={handleRoll}
        disabled={!canRoll || rolling}
        className={`
          px-8 py-3 rounded-xl font-bold text-lg
          transition-all duration-300 transform
          ${
            canRoll && !rolling
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:scale-105 hover:shadow-lg'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed'
          }
        `}
      >
        {rolling ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Rolling...
          </span>
        ) : canRoll ? (
          '🎲 Roll Dice'
        ) : (
          'Wait for your turn'
        )}
      </button>

      {/* Dice Value Display */}
      {diceValue && !rolling && (
        <div className="text-center">
          <p className="text-white text-sm">You rolled</p>
          <p className="text-yellow-400 text-3xl font-bold animate-bounce">{diceValue}</p>
        </div>
      )}
    </div>
  );
}

