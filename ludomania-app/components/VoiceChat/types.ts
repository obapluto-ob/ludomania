// Voice Chat Types

export interface Participant {
  user_id: string;
  user_name: string;
  local: boolean;
  audio: boolean;
  video: boolean;
}

export interface VoiceRoomProps {
  roomUrl: string;
  username: string;
  onJoined?: () => void;
  onLeft?: () => void;
  onError?: (error: string) => void;
}

export interface MicButtonProps {
  isMuted: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export interface SpeakingIndicatorProps {
  participants: Participant[];
  activeSpeaker: string | null;
}

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'error' | 'left';

