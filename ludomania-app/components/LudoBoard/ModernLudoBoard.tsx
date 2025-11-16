'use client';

import React from 'react';
import { PlayerColor } from './types';

interface ModernLudoBoardProps {
  children?: React.ReactNode; // For tokens
}

/**
 * Modern Professional Ludo Board - Looks like Ludo King!
 * Uses CSS Grid for perfect layout with vibrant colors
 */
export default function ModernLudoBoard({ children }: ModernLudoBoardProps) {
  // Safe positions (stars) on the main path
  const safePositions = [0, 8, 13, 21, 26, 34, 39, 47];

  const renderHomeZone = (color: PlayerColor, position: 'tl' | 'tr' | 'bl' | 'br') => {
    const colorClasses = {
      red: 'bg-gradient-to-br from-red-500 via-red-400 to-red-500',
      blue: 'bg-gradient-to-br from-blue-500 via-blue-400 to-blue-500',
      green: 'bg-gradient-to-br from-green-500 via-green-400 to-green-500',
      yellow: 'bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-400',
    };

    const positions = {
      tl: 'top-0 left-0',
      tr: 'top-0 right-0',
      bl: 'bottom-0 left-0',
      br: 'bottom-0 right-0',
    };

    return (
      <div className={`absolute ${positions[position]} w-[40%] h-[40%] ${colorClasses[color]} rounded-lg shadow-2xl border-4 border-white`}>
        {/* Home circles for tokens */}
        <div className="relative w-full h-full p-4">
          <div className="grid grid-cols-2 gap-3 w-full h-full">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                style={{ borderColor: color === 'red' ? '#DC2626' : color === 'blue' ? '#2563EB' : color === 'green' ? '#16A34A' : '#EAB308' }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPathSquare = (index: number, isSafe: boolean = false) => {
    return (
      <div
        key={index}
        className={`
          relative w-full h-full border-2 border-gray-800 bg-white
          flex items-center justify-center
          ${isSafe ? 'bg-yellow-50' : ''}
        `}
      >
        {isSafe && (
          <svg className="w-6 h-6 text-yellow-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        )}
      </div>
    );
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-square">
      {/* Wooden board background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 rounded-2xl shadow-2xl p-4">
        
        {/* Main board container */}
        <div className="relative w-full h-full bg-gradient-to-br from-amber-700 to-amber-800 rounded-xl shadow-inner p-2">
          
          {/* Home Zones */}
          {renderHomeZone('blue', 'tl')}
          {renderHomeZone('green', 'tr')}
          {renderHomeZone('red', 'bl')}
          {renderHomeZone('yellow', 'br')}
          
          {/* Center cross-shaped path */}
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Horizontal bar */}
            <div className="absolute w-full h-[20%] bg-white border-4 border-gray-800" style={{ top: '40%' }} />
            
            {/* Vertical bar */}
            <div className="absolute h-full w-[20%] bg-white border-4 border-gray-800" style={{ left: '40%' }} />
            
            {/* Center triangle */}
            <div className="absolute w-[20%] h-[20%] bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 border-4 border-white shadow-2xl flex items-center justify-center"
                 style={{ 
                   clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                   top: '40%',
                   left: '40%'
                 }}>
              <div className="text-white font-bold text-2xl">🎲</div>
            </div>
          </div>
          
          {/* Path grid - We'll create a 15x15 grid */}
          <div className="absolute inset-0 grid grid-cols-15 grid-rows-15 gap-0">
            {/* This will be populated with path squares */}
            {/* For now, showing the structure */}
          </div>
          
          {/* Tokens layer (absolute positioned) */}
          <div className="absolute inset-0 pointer-events-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

