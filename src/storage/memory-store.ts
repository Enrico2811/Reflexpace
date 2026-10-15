import type { Session } from '../core/session';
import type { Difficulty, GameMode } from '../core/types';

/** Sessões em memória (Fase 1). Será trocado por localStorage/IndexedDB na Fase 4. */
export class MemorySessionStore {
  private readonly sessions: Session[] = [];

  add(session: Session): void {
    this.sessions.push(session);
  }

  all(): readonly Session[] {
    return this.sessions;
  }

  bestScore(mode: GameMode, difficulty: Difficulty): number | null {
    let best: number | null = null;
    for (const s of this.sessions) {
      if (s.mode === mode && s.difficulty === difficulty && (best === null || s.score > best)) {
        best = s.score;
      }
    }
    return best;
  }
}
