'use client';

import { SpeakingIndicatorProps } from './types';

export default function SpeakingIndicator({ participants, activeSpeaker }: SpeakingIndicatorProps) {
  if (participants.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-3 max-w-xs">
      <p className="text-white text-xs font-semibold mb-2">Voice Chat</p>
      <div className="space-y-2">
        {participants.map((participant) => {
          const isSpeaking = activeSpeaker === participant.user_id;
          const isMuted = !participant.audio;

          return (
            <div
              key={participant.user_id}
              className={`
                flex items-center gap-2 px-2 py-1 rounded
                transition-all duration-300
                ${isSpeaking ? 'bg-green-600/30' : 'bg-slate-700/50'}
              `}
            >
              {/* Avatar */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center
                  text-white text-xs font-bold
                  ${isSpeaking ? 'bg-green-600 animate-pulse' : 'bg-gray-600'}
                `}
              >
                {participant.user_name.charAt(0).toUpperCase()}
              </div>

              {/* Name */}
              <div className="flex-1">
                <p className="text-white text-sm">
                  {participant.user_name}
                  {participant.local && (
                    <span className="text-yellow-400 text-xs ml-1">(You)</span>
                  )}
                </p>
              </div>

              {/* Mic Status */}
              <div className="w-5 h-5">
                {isMuted ? (
                  <svg
                    className="w-5 h-5 text-red-500"
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
                ) : isSpeaking ? (
                  <svg
                    className="w-5 h-5 text-green-500 animate-pulse"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

