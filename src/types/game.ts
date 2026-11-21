export interface Player {
  id: string;
  name: string;
  color: string;
}

export interface RoundScore {
  roundNumber: number;
  rawScores?: Record<string, number>; // Raw raven counts from cards before Wake Up rule calculation
  scores: Record<string, number>; // Final points after applying Wake Up bonus/penalty
  startingPlayerId?: string; // ID of the player who started this round
  wakeUpCallerId?: string; // ID of the player who called "Budzimy się!" (undefined if draw pile ran out)
  timestamp: number;
}

export interface Game {
  id: string;
  dateStarted: number;
  dateEnded?: number;
  targetScore: number; // Default 100 ravens
  players: Player[];
  rounds: RoundScore[];
  isFinished: boolean;
  winnerId?: string;
  loserId?: string;
}

export interface PlayerStat {
  player: Player;
  totalScore: number;
  rank: number;
  isWinner: boolean;
  isLoser: boolean;
}

export interface PlayerTurnInfo {
  player: Player;
  orderNumber: number; // 1, 2, 3...
  isStarter: boolean;
}
