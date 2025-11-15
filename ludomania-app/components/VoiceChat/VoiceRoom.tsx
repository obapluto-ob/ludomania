'use client';

import { useEffect, useState, useRef } from 'react';
import DailyIframe, { DailyCall } from '@daily-co/daily-js';
import { VoiceRoomProps, Participant, ConnectionState } from './types';
import MicButton from './MicButton';
import SpeakingIndicator from './SpeakingIndicator';

export default function VoiceRoom({
  roomUrl,
  username,
  onJoined,
  onLeft,
  onError,
  onCallObjectReady,
}: VoiceRoomProps) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [isMuted, setIsMuted] = useState(true); // Start muted
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const callObjectRef = useRef<DailyCall | null>(null);

  useEffect(() => {
    // Prevent duplicate instances
    if (callObjectRef.current) {
      console.log('⚠️ Daily call object already exists, skipping creation');
      return;
    }

    // Create Daily call object
    const daily = DailyIframe.createCallObject({
      audioSource: true,
      videoSource: false, // Audio only
    });

    callObjectRef.current = daily;
    setCallObject(daily);

    // Notify parent component that call object is ready
    onCallObjectReady?.(daily);

    // Join the room
    joinRoom(daily);

    // Cleanup on unmount
    return () => {
      if (callObjectRef.current) {
        callObjectRef.current.leave().then(() => {
          callObjectRef.current?.destroy();
          callObjectRef.current = null;
        }).catch((err) => {
          console.error('Error cleaning up Daily call:', err);
          callObjectRef.current = null;
        });
      }
    };
  }, [roomUrl]);

  const joinRoom = async (daily: DailyCall) => {
    try {
      setConnectionState('connecting');

      // Join the room
      await daily.join({
        url: roomUrl,
        userName: username,
        startAudioOff: true, // Start with mic muted
        startVideoOff: true, // No video
      });

      setConnectionState('connected');
      onJoined?.();

      // Set up event listeners
      daily.on('participant-joined', handleParticipantJoined);
      daily.on('participant-updated', handleParticipantUpdated);
      daily.on('participant-left', handleParticipantLeft);
      daily.on('active-speaker-change', handleActiveSpeakerChange);
      daily.on('error', handleError);

      // Get initial participants
      updateParticipants(daily);
    } catch (err: any) {
      console.error('Failed to join voice room:', err);
      setError(err.message || 'Failed to join voice chat');
      setConnectionState('error');
      onError?.(err.message || 'Failed to join voice chat');
    }
  };

  const updateParticipants = (daily: DailyCall) => {
    const participantsObj = daily.participants();
    const participantsList: Participant[] = Object.values(participantsObj).map((p: any) => ({
      user_id: p.user_id || p.session_id,
      user_name: p.user_name || 'Unknown',
      local: p.local,
      audio: p.audio,
      video: p.video,
    }));
    setParticipants(participantsList);
  };

  const handleParticipantJoined = () => {
    if (callObject) {
      updateParticipants(callObject);
    }
  };

  const handleParticipantUpdated = () => {
    if (callObject) {
      updateParticipants(callObject);
    }
  };

  const handleParticipantLeft = () => {
    if (callObject) {
      updateParticipants(callObject);
    }
  };

  const handleActiveSpeakerChange = (event: any) => {
    setActiveSpeaker(event?.activeSpeaker?.peerId || null);
  };

  const handleError = (event: any) => {
    console.error('Daily.co error:', event);
    setError(event.errorMsg || 'Voice chat error');
    setConnectionState('error');
    onError?.(event.errorMsg || 'Voice chat error');
  };

  const toggleMute = () => {
    if (!callObject) return;

    const newMutedState = !isMuted;
    callObject.setLocalAudio(!newMutedState);
    setIsMuted(newMutedState);
  };

  // Keyboard shortcut (M key to toggle mute)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isMuted, callObject]);

  if (connectionState === 'error') {
    return (
      <div className="fixed bottom-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-semibold">Voice Chat Error</p>
        <p className="text-xs">{error}</p>
      </div>
    );
  }

  if (connectionState === 'connecting') {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
        <p className="text-sm font-semibold">Connecting to voice chat...</p>
      </div>
    );
  }

  if (connectionState !== 'connected') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2">
      {/* Speaking Indicators */}
      <SpeakingIndicator participants={participants} activeSpeaker={activeSpeaker} />

      {/* Mic Button */}
      <MicButton isMuted={isMuted} onToggle={toggleMute} />

      {/* Connection Status */}
      <div className="bg-green-600 text-white px-3 py-1 rounded-lg shadow-lg text-xs text-center">
        Voice Connected ✓
      </div>
    </div>
  );
}

