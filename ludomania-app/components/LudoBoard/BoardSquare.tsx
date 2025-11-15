'use client';

import { PlayerColor, COLOR_SCHEMES } from './types';

interface BoardSquareProps {
  type: 'path' | 'home' | 'finish' | 'center' | 'empty';
  color: PlayerColor | null;
  isSafe?: boolean;
  pathIndex?: number;
  className?: string;
}

export default function BoardSquare({
  type,
  color,
  isSafe = false,
  pathIndex = -1,
  className = '',
}: BoardSquareProps) {
  const getSquareStyle = () => {
    const baseClasses = `relative flex items-center justify-center border-2 transition-all ${className}`;

    switch (type) {
      case 'path':
        return `${baseClasses} bg-gradient-to-br from-white via-gray-50 to-gray-100 border-amber-800 hover:bg-yellow-50 shadow-sm`;

      case 'home':
        if (!color) return `${baseClasses} bg-gray-100 border-gray-300`;
        const homeScheme = COLOR_SCHEMES[color];
        return `${baseClasses} bg-gradient-to-br ${homeScheme.gradient} border-4 border-amber-900 rounded-full shadow-lg ${homeScheme.glow}`;

      case 'finish':
        if (!color) return `${baseClasses} bg-gray-200 border-gray-400`;
        const finishScheme = COLOR_SCHEMES[color];
        return `${baseClasses} bg-${color}-200 border-${color}-600 border-2 shadow-inner`;

      case 'center':
        return `${baseClasses} bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 border-4 border-amber-950 rounded-xl shadow-2xl`;

      case 'empty':
      default:
        return `${baseClasses} bg-transparent border-transparent`;
    }
  };

  const renderContent = () => {
    // Safe position (star) - Gold star with glow
    if (isSafe && type === 'path') {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            <svg className="w-7 h-7 text-yellow-500 drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <div className="absolute inset-0 bg-yellow-400 blur-md opacity-50 rounded-full"></div>
          </div>
        </div>
      );
    }

    // Center triangle logo
    if (type === 'center') {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      );
    }

    // Home zone number
    if (type === 'home' && color) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
        </div>
      );
    }

    // Finish lane arrow
    if (type === 'finish' && color) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className={`w-4 h-4 text-${color}-600`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }

    return null;
  };

  return (
    <div className={getSquareStyle()}>
      {renderContent()}
    </div>
  );
}

