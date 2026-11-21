import AsyncStorage from '@react-native-async-storage/async-storage';
import { Game, Player } from '../types/game';

const STORAGE_KEYS = {
  CURRENT_GAME: '@sen_asistant_current_game',
  GAME_HISTORY: '@sen_asistant_game_history',
  SAVED_PLAYERS: '@sen_asistant_saved_players',
};

// --- Current Game CRUD ---
export async function saveCurrentGame(game: Game | null): Promise<void> {
  try {
    if (game === null) {
      await AsyncStorage.removeItem(STORAGE_KEYS.CURRENT_GAME);
    } else {
      await AsyncStorage.setItem(STORAGE_KEYS.CURRENT_GAME, JSON.stringify(game));
    }
  } catch (error) {
    console.error('Błąd podczas zapisywania aktualnej gry:', error);
  }
}

export async function loadCurrentGame(): Promise<Game | null> {
  try {
    const serializedGame = await AsyncStorage.getItem(STORAGE_KEYS.CURRENT_GAME);
    return serializedGame ? JSON.parse(serializedGame) : null;
  } catch (error) {
    console.error('Błąd podczas wczytywania aktualnej gry:', error);
    return null;
  }
}

// --- History CRUD ---
export async function saveGameToHistory(game: Game): Promise<void> {
  try {
    const history = await loadGameHistory();
    const updatedHistory = [
      game,
      ...history.filter(historyGame => historyGame.id !== game.id),
    ];
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error('Błąd podczas zapisywania historii gry:', error);
  }
}

export async function loadGameHistory(): Promise<Game[]> {
  try {
    const serializedHistory = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    return serializedHistory ? JSON.parse(serializedHistory) : [];
  } catch (error) {
    console.error('Błąd podczas wczytywania historii gier:', error);
    return [];
  }
}

export async function deleteGameFromHistory(gameId: string): Promise<Game[]> {
  try {
    const history = await loadGameHistory();
    const updatedHistory = history.filter(historyGame => historyGame.id !== gameId);
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(updatedHistory));
    return updatedHistory;
  } catch (error) {
    console.error('Błąd podczas usuwania gry z historii:', error);
    return [];
  }
}

// --- Saved Players List CRUD ---
export async function saveSavedPlayers(players: Player[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SAVED_PLAYERS, JSON.stringify(players));
  } catch (error) {
    console.error('Błąd podczas zapisywania listy graczy:', error);
  }
}

export async function loadSavedPlayers(): Promise<Player[]> {
  try {
    const serializedPlayers = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_PLAYERS);
    return serializedPlayers ? JSON.parse(serializedPlayers) : [];
  } catch (error) {
    console.error('Błąd podczas wczytywania listy graczy:', error);
    return [];
  }
}
