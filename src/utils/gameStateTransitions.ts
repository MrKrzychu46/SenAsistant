import { Game, Player, RoundScore } from '../types/game';
import { COLORS } from '../theme/theme';
import { calculateRoundScoresWithWakeUp, checkGameEndCondition } from './gameUtils';

export interface PlayerInput {
  name: string;
  color?: string;
}

export function createPlayersFromInputs(
  playerInputs: PlayerInput[],
  timestamp: number = Date.now()
): Player[] {
  return playerInputs.map((input, index) => ({
    id: `player_${timestamp}_${index}`,
    name: input.name.trim(),
    color: input.color || COLORS.playerColors[index % COLORS.playerColors.length],
  }));
}

export function mergeUniqueSavedPlayers(
  existingSavedPlayers: Player[],
  newPlayers: Player[]
): Player[] {
  const mergedPlayers = [...existingSavedPlayers];

  newPlayers.forEach(newPlayer => {
    const alreadyExists = mergedPlayers.some(
      savedPlayer => savedPlayer.name.toLowerCase() === newPlayer.name.toLowerCase()
    );
    if (!alreadyExists) {
      mergedPlayers.push(newPlayer);
    }
  });

  return mergedPlayers;
}

export function createNewGame(
  players: Player[],
  targetScore: number = 100,
  timestamp: number = Date.now()
): Game {
  return {
    id: `game_${timestamp}`,
    dateStarted: timestamp,
    targetScore,
    players,
    rounds: [],
    isFinished: false,
  };
}

export function applyGameEndEvaluation(
  game: Game,
  timestamp: number = Date.now()
): Game {
  const endCondition = checkGameEndCondition(game);

  if (endCondition.isFinished) {
    return {
      ...game,
      isFinished: true,
      dateEnded: game.dateEnded || timestamp,
      winnerId: endCondition.winnerId,
      loserId: endCondition.loserId,
    };
  }

  return {
    ...game,
    isFinished: false,
    dateEnded: undefined,
    winnerId: undefined,
    loserId: undefined,
  };
}

export function addRoundToGame(
  game: Game,
  rawScores: Record<string, number>,
  startingPlayerId?: string,
  wakeUpCallerId?: string,
  timestamp: number = Date.now()
): Game {
  const { finalScores } = calculateRoundScoresWithWakeUp(
    rawScores,
    game.players,
    wakeUpCallerId
  );

  const newRound: RoundScore = {
    roundNumber: game.rounds.length + 1,
    rawScores,
    scores: finalScores,
    startingPlayerId,
    wakeUpCallerId,
    timestamp,
  };

  const gameWithNewRound: Game = {
    ...game,
    rounds: [...game.rounds, newRound],
  };

  return applyGameEndEvaluation(gameWithNewRound, timestamp);
}

export function updateRoundInGame(
  game: Game,
  roundNumber: number,
  rawScores: Record<string, number>,
  wakeUpCallerId?: string,
  timestamp: number = Date.now()
): Game {
  const updatedRounds = game.rounds.map(round => {
    if (round.roundNumber !== roundNumber) {
      return round;
    }

    const { finalScores } = calculateRoundScoresWithWakeUp(
      rawScores,
      game.players,
      wakeUpCallerId
    );

    return {
      ...round,
      rawScores,
      scores: finalScores,
      wakeUpCallerId,
    };
  });

  return applyGameEndEvaluation(
    {
      ...game,
      rounds: updatedRounds,
    },
    timestamp
  );
}

export function renamePlayerInGame(
  game: Game,
  playerId: string,
  newName: string
): Game {
  const trimmedName = newName.trim();
  if (!trimmedName) {
    return game;
  }

  const updatedPlayers = game.players.map(player =>
    player.id === playerId ? { ...player, name: trimmedName } : player
  );

  return {
    ...game,
    players: updatedPlayers,
  };
}

export function removePlayerFromGame(
  game: Game,
  playerId: string,
  timestamp: number = Date.now()
): Game {
  if (game.players.length <= 2) {
    return game;
  }

  const remainingPlayers = game.players.filter(player => player.id !== playerId);

  const updatedRounds = game.rounds.map(round => {
    const sourceRawScores = round.rawScores
      ? { ...round.rawScores }
      : { ...round.scores };
    delete sourceRawScores[playerId];

    const updatedStartingPlayerId =
      round.startingPlayerId === playerId ? undefined : round.startingPlayerId;
    const updatedWakeUpCallerId =
      round.wakeUpCallerId === playerId ? undefined : round.wakeUpCallerId;

    const { finalScores } = calculateRoundScoresWithWakeUp(
      sourceRawScores,
      remainingPlayers,
      updatedWakeUpCallerId
    );

    return {
      ...round,
      rawScores: sourceRawScores,
      scores: finalScores,
      startingPlayerId: updatedStartingPlayerId,
      wakeUpCallerId: updatedWakeUpCallerId,
    };
  });

  return applyGameEndEvaluation(
    {
      ...game,
      players: remainingPlayers,
      rounds: updatedRounds,
    },
    timestamp
  );
}

export function updateGameTargetScore(
  game: Game,
  newTargetScore: number,
  timestamp: number = Date.now()
): Game {
  if (newTargetScore <= 0) {
    return game;
  }

  return applyGameEndEvaluation(
    {
      ...game,
      targetScore: newTargetScore,
    },
    timestamp
  );
}

export function updateGameSettings(
  game: Game,
  newTargetScore: number,
  playerNamesById: Record<string, string>,
  timestamp: number = Date.now()
): Game {
  const effectiveTargetScore =
    newTargetScore > 0 ? newTargetScore : game.targetScore;

  const updatedPlayers = game.players.map(player => {
    const candidateName = playerNamesById[player.id]?.trim();
    if (candidateName && candidateName !== player.name) {
      return { ...player, name: candidateName };
    }
    return player;
  });

  return applyGameEndEvaluation(
    {
      ...game,
      targetScore: effectiveTargetScore,
      players: updatedPlayers,
    },
    timestamp
  );
}

export function createRematchGame(
  game: Game,
  timestamp: number = Date.now()
): Game {
  return createNewGame(game.players, game.targetScore, timestamp);
}
