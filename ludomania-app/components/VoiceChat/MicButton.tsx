'use client';

import { MicButtonProps } from './types';

export default function MicButton({ isMuted, onToggle, disabled = false }: MicButtonProps) {
  return (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`
        w-14 h-14 rounded-full flex items-center justify-center
        transition-all duration-300 transform hover:scale-110
        shadow-lg
        ${isMuted
          ? 'bg-red-600 hover:bg-red-700'
          : 'bg-green-600 hover:bg-green-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
      title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
    >
      {isMuted ? (
        // Muted icon
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2"
          />
        </svg>
      ) : (
        // Unmuted icon
        <svg
          className="w-7 h-7 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
      )}

      {/* Pulsing ring when active */}
      {!isMuted && (
        <div className="absolute inset-0 rounded-full bg-green-400 opacity-50 animate-ping"></div>
      )}
    </button>
  );
}

