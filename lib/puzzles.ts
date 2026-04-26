import type { Difficulty } from './sudoku';
import easy from '../assets/puzzles/easy.json';
import medium from '../assets/puzzles/medium.json';
import hard from '../assets/puzzles/hard.json';

export type Puzzle = { id: string; given: string; solution: string };

const banks: Record<Difficulty, Puzzle[]> = {
  easy: easy as Puzzle[],
  medium: medium as Puzzle[],
  hard: hard as Puzzle[],
};

export function randomPuzzle(difficulty: Difficulty, excludeId?: string): Puzzle {
  const list = banks[difficulty];
  const pool = excludeId ? list.filter((p) => p.id !== excludeId) : list;
  const arr = pool.length ? pool : list;
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getPuzzle(difficulty: Difficulty, id: string): Puzzle | null {
  return banks[difficulty].find((p) => p.id === id) ?? null;
}
