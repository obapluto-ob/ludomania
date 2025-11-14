// User types
export interface User {
  id: string;
  email: string;
  username: string;
  wallet_balance: number;
  created_at: string;
}

// Transaction types
export type TransactionType = 'deposit' | 'withdrawal' | 'game_win' | 'game_loss' | 'game_wager';
export type TransactionStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  proof_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Game types
export type GameStatus = 'waiting' | 'in_progress' | 'completed' | 'cancelled';
export type PlayerColor = 'red' | 'blue' | 'green' | 'yellow';

export interface Game {
  id: string;
  room_code: string;
  wager_amount: number;
  status: GameStatus;
  player1_id: string;
  player2_id?: string;
  winner_id?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

// Ludo game state types
export interface Token {
  id: number;
  position: number; // -1 = home, 0-51 = board positions, 52-57 = finish lane
  isHome: boolean;
  isFinished: boolean;
}

export interface Player {
  id: string;
  username: string;
  color: PlayerColor;
  tokens: Token[];
  isActive: boolean;
}

export interface GameState {
  gameId: string;
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
  winner: string | null;
  lastMove?: {
    playerId: string;
    tokenId: number;
    from: number;
    to: number;
  };
}

// Deposit/Withdrawal request types
export interface DepositRequest {
  id: string;
  user_id: string;
  amount: number;
  proof_url: string;
  status: TransactionStatus;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  user_id: string;
  amount: number;
  bank_details: string;
  status: TransactionStatus;
  created_at: string;
}

