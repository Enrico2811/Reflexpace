export type GameMode = 'target-lock' | 'tracking';
export type Difficulty = 'cadet' | 'guardian' | 'master';

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  cadet: 'Cadete',
  guardian: 'Guardião',
  master: 'Mestre',
};

export interface Size {
  width: number;
  height: number;
}
