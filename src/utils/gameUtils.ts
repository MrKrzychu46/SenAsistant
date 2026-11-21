import { Game, Player, PlayerStat, PlayerTurnInfo } from '../types/game';

export interface WakeUpCalculationResult {
  finalScores: Record<string, number>;
  callerResult?: 'success' | 'failed';
  callerBonusOrPenalty?: number;
}

export interface GameEndEvaluation {
  isFinished: boolean;
  winnerId?: string;
  loserId?: string;
}

export function sanitizeNumericInput(inputValue: string): string {
  return inputValue.replace(/[^0-9]/g, '');
}

export function parseNonNegativeScore(inputValue: string | undefined): number {
  if (!inputValue) {
    return 0;
  }
  const parsed = parseInt(inputValue, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    return 0;
  }
  return parsed;
}

export function calculatePlayerTotal(game: Game, playerId: string): number {
  return game.rounds.reduce((totalSum, round) => {
    return totalSum + (round.scores[playerId] || 0);
  }, 0);
}

export function getPlayerStats(game: Game): PlayerStat[] {
  if (!game.players || game.players.length === 0) {
    return [];
  }

  const playerTotals = game.players.map(player => ({
    player,
    totalScore: calculatePlayerTotal(game, player.id),
  }));

  playerTotals.sort((first, second) => first.totalScore - second.totalScore);

  const lowestScore = playerTotals[0].totalScore;
  const highestScore = playerTotals[playerTotals.length - 1].totalScore;

  return playerTotals.map(entry => {
    const firstMatchingIndex = playerTotals.findIndex(
      candidate => candidate.totalScore === entry.totalScore
    );

    return {
      player: entry.player,
      totalScore: entry.totalScore,
      rank: firstMatchingIndex + 1,
      isWinner: entry.totalScore === lowestScore,
      isLoser: entry.totalScore === highestScore && highestScore > lowestScore,
    };
  });
}

export function checkGameEndCondition(game: Game): GameEndEvaluation {
  if (game.rounds.length === 0) {
    return { isFinished: false };
  }

  const stats = getPlayerStats(game);
  const hasReachedTarget = stats.some(
    playerStat => playerStat.totalScore >= game.targetScore
  );

  if (!hasReachedTarget) {
    return { isFinished: false };
  }

  const winner = stats[0];
  const loser = stats[stats.length - 1];

  return {
    isFinished: true,
    winnerId: winner.player.id,
    loserId: loser.player.id,
  };
}

export function getMinimumOpponentScore(
  rawScores: Record<string, number>,
  players: Player[],
  wakeUpCallerId: string
): number {
  const opponents = players.filter(player => player.id !== wakeUpCallerId);
  if (opponents.length === 0) {
    return rawScores[wakeUpCallerId] ?? 0;
  }

  return opponents.reduce((minimumScore, opponent) => {
    const opponentScore = rawScores[opponent.id] ?? 0;
    return opponentScore < minimumScore ? opponentScore : minimumScore;
  }, Infinity);
}

export function calculateRoundScoresWithWakeUp(
  rawScores: Record<string, number>,
  players: Player[],
  wakeUpCallerId?: string
): WakeUpCalculationResult {
  const finalScores: Record<string, number> = {};

  players.forEach(player => {
    finalScores[player.id] = Math.max(0, rawScores[player.id] ?? 0);
  });

  const isCallerValid =
    Boolean(wakeUpCallerId) && players.some(player => player.id === wakeUpCallerId);

  if (!wakeUpCallerId || !isCallerValid) {
    return { finalScores };
  }

  const callerRawScore = finalScores[wakeUpCallerId] ?? 0;
  const minimumOpponentScore = getMinimumOpponentScore(
    finalScores,
    players,
    wakeUpCallerId
  );

  if (callerRawScore <= minimumOpponentScore) {
    finalScores[wakeUpCallerId] = 0;
    return {
      finalScores,
      callerResult: 'success',
      callerBonusOrPenalty: 0,
    };
  }

  const failurePenalty = 5;
  finalScores[wakeUpCallerId] = callerRawScore + failurePenalty;
  return {
    finalScores,
    callerResult: 'failed',
    callerBonusOrPenalty: failurePenalty,
  };
}

export function getStartingPlayerIdForRound(
  game: Game,
  roundIndex: number,
  customStarterId?: string
): string {
  if (!game.players || game.players.length === 0) {
    return '';
  }

  if (customStarterId && game.players.some(player => player.id === customStarterId)) {
    return customStarterId;
  }

  const defaultIndex = roundIndex % game.players.length;
  return game.players[defaultIndex].id;
}

export function getTurnOrder(players: Player[], startingPlayerId: string): PlayerTurnInfo[] {
  if (!players || players.length === 0) {
    return [];
  }

  const foundStarterIndex = players.findIndex(player => player.id === startingPlayerId);
  const starterIndex = foundStarterIndex !== -1 ? foundStarterIndex : 0;

  return players.map((player, playerIndex) => {
    const orderNumber =
      ((playerIndex - starterIndex + players.length) % players.length) + 1;

    return {
      player,
      orderNumber,
      isStarter: orderNumber === 1,
    };
  });
}
