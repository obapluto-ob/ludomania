'use client';

import { useState, useEffect } from 'react';
import { DailyCall } from '@daily-co/daily-js';

interface MicControlsProps {
  callObject: DailyCall | null;
}

export default function MicControls({ callObject }: MicControlsProps) {
  const [isMuted, setIsMuted] = useState(true); // Start muted
  const [isDeafened, setIsDeafened] = useState(false); // Can hear others
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!callObject) return;

    // Listen for connection state changes
    const handleParticipantUpdated = (event: any) => {
      if (event.participant.local) {
        setIsMuted(event.participant.audio === false);
        setIsConnected(true);
      }
    };

    const handleJoinedMeeting = () => {
      setIsConnected(true);
      // Start with mic muted
      callObject.setLocalAudio(false);
      setIsMuted(true);
    };

    const handleLeftMeeting = () => {
      setIsConnected(false);
    };

    callObject.on('participant-updated', handleParticipantUpdated);
    callObject.on('joined-meeting', handleJoinedMeeting);
    callObject.on('left-meeting', handleLeftMeeting);

    return () => {
      callObject.off('participant-updated', handleParticipantUpdated);
      callObject.off('joined-meeting', handleJoinedMeeting);
      callObject.off('left-meeting', handleLeftMeeting);
    };
  }, [callObject]);

  const toggleMute = () => {
    if (!callObject) return;
    
    const newMutedState = !isMuted;
    callObject.setLocalAudio(!newMutedState);
    setIsMuted(newMutedState);
  };

  const toggleDeafen = () => {
    if (!callObject) return;
    
    const newDeafenedState = !isDeafened;
    
    // When deafening, also mute the mic
    if (newDeafenedState) {
      callObject.setLocalAudio(false);
      setIsMuted(true);
    }
    
    // Set subscription to receive audio from others
    callObject.updateParticipants({
      '*': {
        setSubscribedTracks: {
          audio: !newDeafenedState,
          video: false,
        },
      },
    });
    
    setIsDeafened(newDeafenedState);
  };

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-lg">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        <span className="text-gray-400 text-sm">Connecting voice chat...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-sm px-4 py-3 rounded-xl border border-slate-700 shadow-lg">
      {/* Connection indicator */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-green-400 text-sm font-medium">Voice Connected</span>
      </div>

      <div className="h-6 w-px bg-slate-600"></div>

      {/* Microphone toggle */}
      <button
        onClick={toggleMute}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          isMuted
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-green-600 hover:bg-green-700 text-white'
        }`}
        title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
      >
        {isMuted ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            <span>Muted</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <span>Unmute</span>
          </>
        )}
      </button>

      {/* Deafen toggle */}
      <button
        onClick={toggleDeafen}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
          isDeafened
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-slate-700 hover:bg-slate-600 text-gray-300'
        }`}
        title={isDeafened ? 'Undeafen (hear others)' : 'Deafen (mute all)'}
      >
        {isDeafened ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            <span>Deafened</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span>Listening</span>
          </>
        )}
      </button>
    </div>
  );
}

