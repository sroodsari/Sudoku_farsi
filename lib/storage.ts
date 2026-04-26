import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Difficulty } from './sudoku';

const KEY = '@sudoku/current';

export type SavedGame = {
  difficulty: Difficulty;
  puzzleId: string;
  given: string;
  values: string;
  solution: string;
  history: { idx: number; prev: number }[];
};

export async function saveGame(g: SavedGame): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(g));
}

export async function loadGame(): Promise<SavedGame | null> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedGame;
  } catch {
    return null;
  }
}

export async function clearGame(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
