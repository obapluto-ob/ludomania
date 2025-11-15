// Ludo Board Types and Constants

export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Token {
  id: number;
  position: number; // -1 = home, 0-51 = main path, 52-57 = finish lane
  color: PlayerColor;
  playerId: string;
  isHome: boolean;
  isFinished: boolean;
}

export interface Player {
  id: string;
  username: string;
  color: PlayerColor;
  tokens: Token[];
  position: number; // Player position (1-4)
  isReady: boolean;
}

export interface GameState {
  gameId: string;
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
  winner: string | null;
  status: 'waiting' | 'playing' | 'completed';
}

// Board configuration
export const BOARD_CONFIG = {
  MAIN_PATH_SIZE: 52,
  HOME_POSITION: -1,
  FINISH_START: 52,
  FINISH_END: 57,
  TOKENS_PER_PLAYER: 4,
  SAFE_POSITIONS: [0, 8, 13, 21, 26, 34, 39, 47], // Star positions
};

// Starting positions for each color on the main board
export const START_POSITIONS: Record<PlayerColor, number> = {
  red: 0,
  blue: 13,
  green: 26,
  yellow: 39,
};

// Color schemes for each player
export const COLOR_SCHEMES = {
  red: {
    primary: '#EF4444',
    light: '#FCA5A5',
    dark: '#991B1B',
    gradient: 'from-red-600 to-red-800',
    glow: 'shadow-red-500/50',
  },
  blue: {
    primary: '#3B82F6',
    light: '#93C5FD',
    dark: '#1E3A8A',
    gradient: 'from-blue-600 to-blue-800',
    glow: 'shadow-blue-500/50',
  },
  green: {
    primary: '#10B981',
    light: '#6EE7B7',
    dark: '#065F46',
    gradient: 'from-green-600 to-green-800',
    glow: 'shadow-green-500/50',
  },
  yellow: {
    primary: '#F59E0B',
    light: '#FCD34D',
    dark: '#92400E',
    gradient: 'from-yellow-600 to-yellow-800',
    glow: 'shadow-yellow-500/50',
  },
};

// Path coordinates for the Ludo board (15x15 grid)
// Each position on the main path has a grid coordinate
export const PATH_COORDINATES: { x: number; y: number }[] = [
  // Red starting area (bottom-left to top)
  { x: 6, y: 13 }, // 0 - Red start
  { x: 6, y: 12 },
  { x: 6, y: 11 },
  { x: 6, y: 10 },
  { x: 6, y: 9 },
  { x: 6, y: 8 }, // 5
  
  // Turn to Blue area (left side going up)
  { x: 5, y: 8 },
  { x: 4, y: 8 },
  { x: 3, y: 8 }, // 8 - Safe (star)
  { x: 2, y: 8 },
  { x: 1, y: 8 },
  { x: 0, y: 8 }, // 11
  
  // Turn corner to top
  { x: 0, y: 7 },
  { x: 0, y: 6 }, // 13 - Blue start
  { x: 1, y: 6 },
  { x: 2, y: 6 },
  { x: 3, y: 6 },
  { x: 4, y: 6 },
  { x: 5, y: 6 },
  
  // Turn to Green area (top side going right)
  { x: 6, y: 5 },
  { x: 6, y: 4 },
  { x: 6, y: 3 }, // 21 - Safe (star)
  { x: 6, y: 2 },
  { x: 6, y: 1 },
  { x: 6, y: 0 }, // 24
  
  // Turn corner to right
  { x: 7, y: 0 },
  { x: 8, y: 0 }, // 26 - Green start
  { x: 8, y: 1 },
  { x: 8, y: 2 },
  { x: 8, y: 3 },
  { x: 8, y: 4 },
  { x: 8, y: 5 },
  
  // Turn to Yellow area (right side going down)
  { x: 9, y: 6 },
  { x: 10, y: 6 },
  { x: 11, y: 6 }, // 34 - Safe (star)
  { x: 12, y: 6 },
  { x: 13, y: 6 },
  { x: 14, y: 6 }, // 37
  
  // Turn corner to bottom
  { x: 14, y: 7 },
  { x: 14, y: 8 }, // 39 - Yellow start
  { x: 13, y: 8 },
  { x: 12, y: 8 },
  { x: 11, y: 8 },
  { x: 10, y: 8 },
  { x: 9, y: 8 },
  
  // Turn back to Red area (bottom side going left)
  { x: 8, y: 9 },
  { x: 8, y: 10 },
  { x: 8, y: 11 }, // 47 - Safe (star)
  { x: 8, y: 12 },
  { x: 8, y: 13 },
  { x: 8, y: 14 }, // 50
  
  // Final turn to complete circle
  { x: 7, y: 14 },
];

// Home zone positions (where tokens start)
export const HOME_ZONES: Record<PlayerColor, { x: number; y: number }[]> = {
  red: [
    { x: 1, y: 11 },
    { x: 3, y: 11 },
    { x: 1, y: 13 },
    { x: 3, y: 13 },
  ],
  blue: [
    { x: 1, y: 1 },
    { x: 3, y: 1 },
    { x: 1, y: 3 },
    { x: 3, y: 3 },
  ],
  green: [
    { x: 11, y: 1 },
    { x: 13, y: 1 },
    { x: 11, y: 3 },
    { x: 13, y: 3 },
  ],
  yellow: [
    { x: 11, y: 11 },
    { x: 13, y: 11 },
    { x: 11, y: 13 },
    { x: 13, y: 13 },
  ],
};

