import { GameState, Player, Token, PlayerColor } from './types';

// Board configuration
const BOARD_SIZE = 52; // Main circular path
const HOME_POSITION = -1;
const FINISH_START = 52;
const FINISH_END = 57;
const TOKENS_PER_PLAYER = 4;

// Starting positions for each color on the main board
const START_POSITIONS: Record<PlayerColor, number> = {
  red: 0,
  blue: 13,
  green: 26,
  yellow: 39,
};

// Safe positions where tokens can't be captured
const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

export class LudoEngine {
  private state: GameState;

  constructor(gameId: string, players: { id: string; username: string; color: PlayerColor }[]) {
    this.state = {
      gameId,
      players: players.map((p) => this.createPlayer(p.id, p.username, p.color)),
      currentPlayerIndex: 0,
      diceValue: null,
      winner: null,
    };
  }

  private createPlayer(id: string, username: string, color: PlayerColor): Player {
    return {
      id,
      username,
      color,
      tokens: Array.from({ length: TOKENS_PER_PLAYER }, (_, i) => ({
        id: i,
        position: HOME_POSITION,
        isHome: true,
        isFinished: false,
      })),
      isActive: false,
    };
  }

  getState(): GameState {
    return { ...this.state };
  }

  rollDice(): number {
    const value = Math.floor(Math.random() * 6) + 1;
    this.state.diceValue = value;
    return value;
  }

  canMoveToken(playerId: string, tokenId: number): boolean {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || this.state.currentPlayerIndex !== this.state.players.indexOf(player)) {
      return false;
    }

    const token = player.tokens[tokenId];
    const diceValue = this.state.diceValue;

    if (!diceValue || token.isFinished) return false;

    // Need a 6 to leave home
    if (token.isHome && diceValue !== 6) return false;

    // Check if move would go past finish
    if (!token.isHome && !this.isValidMove(player, token, diceValue)) {
      return false;
    }

    return true;
  }

  private isValidMove(player: Player, token: Token, diceValue: number): boolean {
    if (token.isHome) return diceValue === 6;

    const newPosition = this.calculateNewPosition(player, token, diceValue);
    
    // Can't move past the finish line
    if (newPosition > FINISH_END) return false;

    return true;
  }

  private calculateNewPosition(player: Player, token: Token, diceValue: number): number {
    if (token.isHome) {
      return START_POSITIONS[player.color];
    }

    const startPos = START_POSITIONS[player.color];
    let currentPos = token.position;

    // Check if entering finish lane
    if (currentPos < FINISH_START) {
      const distanceFromStart = (currentPos - startPos + BOARD_SIZE) % BOARD_SIZE;
      const newDistance = distanceFromStart + diceValue;

      if (newDistance >= BOARD_SIZE - 1) {
        // Entering finish lane
        const overflow = newDistance - (BOARD_SIZE - 1);
        return FINISH_START + overflow;
      } else {
        return (currentPos + diceValue) % BOARD_SIZE;
      }
    } else {
      // Already in finish lane
      return currentPos + diceValue;
    }
  }

  moveToken(playerId: string, tokenId: number): boolean {
    if (!this.canMoveToken(playerId, tokenId)) return false;

    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return false;

    const token = player.tokens[tokenId];
    const diceValue = this.state.diceValue!;
    const oldPosition = token.position;

    if (token.isHome) {
      token.position = START_POSITIONS[player.color];
      token.isHome = false;
    } else {
      token.position = this.calculateNewPosition(player, token, diceValue);
    }

    // Check if token finished
    if (token.position === FINISH_END) {
      token.isFinished = true;
    }

    // Check for captures (only on main board, not in finish lane)
    if (token.position < FINISH_START && !SAFE_POSITIONS.includes(token.position)) {
      this.checkCapture(player, token);
    }

    this.state.lastMove = {
      playerId,
      tokenId,
      from: oldPosition,
      to: token.position,
    };

    // Check for winner
    if (this.checkWinner(player)) {
      this.state.winner = playerId;
      return true;
    }

    // Next turn (unless rolled a 6)
    if (diceValue !== 6) {
      this.nextTurn();
    }

    this.state.diceValue = null;
    return true;
  }

  private checkCapture(currentPlayer: Player, movedToken: Token): void {
    this.state.players.forEach((player) => {
      if (player.id === currentPlayer.id) return;

      player.tokens.forEach((token) => {
        if (!token.isHome && !token.isFinished && token.position === movedToken.position) {
          // Send opponent token back home
          token.position = HOME_POSITION;
          token.isHome = true;
        }
      });
    });
  }

  private checkWinner(player: Player): boolean {
    return player.tokens.every((token) => token.isFinished);
  }

  private nextTurn(): void {
    this.state.currentPlayerIndex = (this.state.currentPlayerIndex + 1) % this.state.players.length;
  }

  getCurrentPlayer(): Player {
    return this.state.players[this.state.currentPlayerIndex];
  }
}

