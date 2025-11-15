/**
 * Bot AI for Ludo Game
 * Implements intelligent bot moves with strategy
 */

import { Player, Token, PlayerColor } from '@/components/LudoBoard/types';

export interface BotMove {
  tokenId: number;
  priority: number;
  reason: string;
}

export class LudoBotAI {
  /**
   * Choose the best move for the bot
   * Strategy priority:
   * 1. Finish a token (highest priority)
   * 2. Capture opponent token
   * 3. Move token out of home (if rolled 6)
   * 4. Move token closest to finish
   * 5. Move token furthest from home (spread strategy)
   */
  static chooseBestMove(
    botPlayer: Player,
    diceValue: number,
    allPlayers: Player[]
  ): number | null {
    const possibleMoves: BotMove[] = [];

    botPlayer.tokens.forEach((token, index) => {
      if (this.canMoveToken(token, diceValue)) {
        const priority = this.calculateMovePriority(
          token,
          index,
          diceValue,
          botPlayer,
          allPlayers
        );
        possibleMoves.push({
          tokenId: index,
          priority,
          reason: this.getReasonForMove(token, diceValue, botPlayer, allPlayers),
        });
      }
    });

    if (possibleMoves.length === 0) return null;

    // Sort by priority (highest first)
    possibleMoves.sort((a, b) => b.priority - a.priority);

    const bestMove = possibleMoves[0];
    console.log(`🤖 Bot choosing move: Token ${bestMove.tokenId} - ${bestMove.reason}`);

    return bestMove.tokenId;
  }

  private static canMoveToken(token: Token, diceValue: number): boolean {
    // Can't move if finished
    if (token.isFinished) return false;

    // Need 6 to leave home
    if (token.isHome && diceValue !== 6) return false;

    // Check if move would go past finish (57)
    if (!token.isHome) {
      const newPos = token.position + diceValue;
      if (newPos > 57) return false;
    }

    return true;
  }

  private static calculateMovePriority(
    token: Token,
    tokenId: number,
    diceValue: number,
    botPlayer: Player,
    allPlayers: Player[]
  ): number {
    let priority = 0;

    // 1. Finishing a token (HIGHEST PRIORITY)
    if (!token.isHome && token.position + diceValue === 57) {
      priority += 1000;
    }

    // 2. Capturing opponent token
    const newPosition = token.isHome ? this.getStartPosition(botPlayer.color) : token.position + diceValue;
    if (this.canCaptureOpponent(newPosition, botPlayer, allPlayers)) {
      priority += 500;
    }

    // 3. Moving out of home (if rolled 6)
    if (token.isHome && diceValue === 6) {
      priority += 300;
    }

    // 4. Token closest to finish
    if (!token.isHome) {
      const distanceToFinish = 57 - token.position;
      priority += (57 - distanceToFinish) * 2; // Closer = higher priority
    }

    // 5. Avoid keeping all tokens at home
    const tokensAtHome = botPlayer.tokens.filter(t => t.isHome).length;
    if (tokensAtHome >= 3 && !token.isHome) {
      priority += 100; // Encourage spreading out
    }

    return priority;
  }

  private static canCaptureOpponent(
    newPosition: number,
    botPlayer: Player,
    allPlayers: Player[]
  ): boolean {
    // Safe positions where capture is not possible
    const safePositions = [0, 8, 13, 21, 26, 34, 39, 47];
    if (safePositions.includes(newPosition)) return false;

    // Check if any opponent token is at this position
    for (const player of allPlayers) {
      if (player.id === botPlayer.id) continue;

      for (const token of player.tokens) {
        if (!token.isHome && !token.isFinished && token.position === newPosition) {
          return true;
        }
      }
    }

    return false;
  }

  private static getStartPosition(color: PlayerColor): number {
    const startPositions: Record<PlayerColor, number> = {
      red: 0,
      blue: 13,
      green: 26,
      yellow: 39,
    };
    return startPositions[color];
  }

  private static getReasonForMove(
    token: Token,
    diceValue: number,
    botPlayer: Player,
    allPlayers: Player[]
  ): string {
    const newPosition = token.isHome ? this.getStartPosition(botPlayer.color) : token.position + diceValue;

    if (!token.isHome && token.position + diceValue === 57) {
      return 'Finishing token! 🎯';
    }

    if (this.canCaptureOpponent(newPosition, botPlayer, allPlayers)) {
      return 'Capturing opponent! ⚔️';
    }

    if (token.isHome && diceValue === 6) {
      return 'Moving out of home 🏠';
    }

    if (!token.isHome && token.position > 40) {
      return 'Advancing toward finish 🏁';
    }

    return 'Strategic move 🎲';
  }
}

