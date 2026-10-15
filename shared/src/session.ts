import type { Difficulty, GameMode } from './types';

export interface Session {
  id: string;
  mode: GameMode;
  difficulty: Difficulty;
  /** Conta para rating e streak. */
  official: boolean;
  dailySeed?: string;
  startedAt: number;
  durationMs: number;
  score: number;
  metrics: Record<string, number>;
  ratingBefore: number;
  ratingAfter: number;
}

export const INITIAL_RATING = 1000;
