import React, { createContext, useContext, useEffect, useState } from 'react';
import { Game, Player } from '../types/game';
import * as defaultStorage from '../storage/gameStorage';
import * as defaultHaptics from '../utils/hapticsService';
import {
  PlayerInput,
  addRoundToGame,
  createNewGame,
  createPlayersFromInputs,
  createRematchGame,
  mergeUniqueSavedPlayers,
  removePlayerFromGame,
  updateGameSettings as applyGameSettingsUpdate,
  updateRoundInGame,
} from '../utils/gameStateTransitions';

export type GameStorageService = typeof defaultStorage;
export type HapticsService = typeof defaultHaptics;

interface GameProviderProps {
  children: React.ReactNode;
  storageService?: GameStorageService;
  hapticsService?: HapticsService;
}

interface GameContextType {
  currentGame: Game | null;
  history: Game[];
  savedPlayers: Player[];
  isLoading: boolean;

  startNewGame: (playerInputs: PlayerInput[], targetScore?: number) => Promise<Game>;
  submitRound: (
    rawScores: Record<string, number>,
    startingPlayerId?: string,
    wakeUpCallerId?: string
  ) => Promise<void>;
  editRoundScore: (
    roundNumber: number,
    rawScores: Record<string, number>,
    wakeUpCallerId?: string
  ) => Promise<void>;
  deletePlayerFromGame: (playerId: string) => Promise<void>;
  deleteCurrentGame: () => Promise<void>;
  deleteHistoryGame: (gameId: string) => Promise<void>;
  rematchSamePlayers: () => Promise<Game | null>;
  updateGameSettings: (
    newTargetScore: number,
    playerNamesById: Record<string, string>
  ) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<GameProviderProps> = ({
  children,
  storageService = defaultStorage,
  hapticsService = defaultHaptics,
}) => {
  const [currentGame, setCurrentGame] = useState<Game | null>(null);
  const [history, setHistory] = useState<Game[]>([]);
  const [savedPlayers, setSavedPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initializeGameState() {
      try {
        const [activeGame, pastGames, storedPlayers] = await Promise.all([
          storageService.loadCurrentGame(),
          storageService.loadGameHistory(),
          storageService.loadSavedPlayers(),
        ]);

        setCurrentGame(activeGame);
        setHistory(pastGames);
        setSavedPlayers(storedPlayers);
      } catch (error) {
        console.error('Błąd inicjalizacji stanu gry:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeGameState();
  }, [storageService]);

  const persistCurrentGame = async (updatedGame: Game | null) => {
    setCurrentGame(updatedGame);
    await storageService.saveCurrentGame(updatedGame);

    if (!updatedGame) {
      return;
    }

    if (updatedGame.isFinished) {
      await storageService.saveGameToHistory(updatedGame);
      const updatedHistory = await storageService.loadGameHistory();
      setHistory(updatedHistory);
    } else if (history.some(historyGame => historyGame.id === updatedGame.id)) {
      const updatedHistory = await storageService.deleteGameFromHistory(updatedGame.id);
      setHistory(updatedHistory);
    }
  };

  const startNewGame = async (
    playerInputs: PlayerInput[],
    targetScore: number = 100
  ): Promise<Game> => {
    const formattedPlayers = createPlayersFromInputs(playerInputs);
    const updatedSavedPlayers = mergeUniqueSavedPlayers(savedPlayers, formattedPlayers);

    setSavedPlayers(updatedSavedPlayers);
    await storageService.saveSavedPlayers(updatedSavedPlayers);

    const newGame = createNewGame(formattedPlayers, targetScore);
    hapticsService.triggerSuccessFeedback();
    await persistCurrentGame(newGame);
    return newGame;
  };

  const submitRound = async (
    rawScores: Record<string, number>,
    startingPlayerId?: string,
    wakeUpCallerId?: string
  ) => {
    if (!currentGame) return;

    const updatedGame = addRoundToGame(
      currentGame,
      rawScores,
      startingPlayerId,
      wakeUpCallerId
    );

    if (updatedGame.isFinished) {
      hapticsService.triggerSuccessFeedback();
    } else {
      hapticsService.triggerImpactFeedback();
    }

    await persistCurrentGame(updatedGame);
  };

  const editRoundScore = async (
    roundNumber: number,
    rawScores: Record<string, number>,
    wakeUpCallerId?: string
  ) => {
    if (!currentGame) return;

    const updatedGame = updateRoundInGame(
      currentGame,
      roundNumber,
      rawScores,
      wakeUpCallerId
    );

    hapticsService.triggerImpactFeedback();
    await persistCurrentGame(updatedGame);
  };

  const deletePlayerFromGame = async (playerId: string) => {
    if (!currentGame || currentGame.players.length <= 2) return;

    const updatedGame = removePlayerFromGame(currentGame, playerId);
    hapticsService.triggerImpactFeedback();
    await persistCurrentGame(updatedGame);
  };

  const deleteCurrentGame = async () => {
    hapticsService.triggerImpactFeedback();
    await persistCurrentGame(null);
  };

  const deleteHistoryGame = async (gameId: string) => {
    hapticsService.triggerImpactFeedback();
    const updatedHistory = await storageService.deleteGameFromHistory(gameId);
    setHistory(updatedHistory);
  };

  const rematchSamePlayers = async (): Promise<Game | null> => {
    if (!currentGame) return null;

    const rematchGame = createRematchGame(currentGame);
    hapticsService.triggerSuccessFeedback();
    await persistCurrentGame(rematchGame);
    return rematchGame;
  };

  const updateGameSettings = async (
    newTargetScore: number,
    playerNamesById: Record<string, string>
  ) => {
    if (!currentGame) return;

    const updatedGame = applyGameSettingsUpdate(
      currentGame,
      newTargetScore,
      playerNamesById
    );
    hapticsService.triggerSelectionFeedback();
    await persistCurrentGame(updatedGame);
  };

  return (
    <GameContext.Provider
      value={{
        currentGame,
        history,
        savedPlayers,
        isLoading,
        startNewGame,
        submitRound,
        editRoundScore,
        deletePlayerFromGame,
        deleteCurrentGame,
        deleteHistoryGame,
        rematchSamePlayers,
        updateGameSettings,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameContextType => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame musi być użyte wewnątrz GameProvider');
  }
  return context;
};
