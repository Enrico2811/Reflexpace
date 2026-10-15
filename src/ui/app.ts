import { ResponsiveCanvas } from '../core/canvas';
import { PointerInput, type PointerPress } from '../core/input';
import { GameLoop } from '../core/loop';
import { createRng } from '../core/rng';
import { INITIAL_RATING, type Session } from '../core/session';
import { DIFFICULTY_LABELS, type Difficulty } from '../core/types';
import { TARGET_LOCK_CONFIGS } from '../modes/target-lock/config';
import { TargetLockGame } from '../modes/target-lock/game';
import { TargetLockRenderer } from '../modes/target-lock/renderer';
import { computeTargetLockMetrics } from '../scoring/target-lock';
import { MemorySessionStore } from '../storage/memory-store';
import { $, formatMs, formatPercent, formatScore } from './dom';

type ScreenName = 'menu' | 'game' | 'results';

const COUNTDOWN_STEPS = 3;

export class App {
  private readonly screens: Record<ScreenName, HTMLElement> = {
    menu: $('#screen-menu'),
    game: $('#screen-game'),
    results: $('#screen-results'),
  };
  private readonly hud = {
    time: $('#hud-time'),
    score: $('#hud-score'),
    combo: $('#hud-combo'),
  };
  private readonly countdownEl = $('#countdown');

  private readonly store = new MemorySessionStore();
  private readonly renderer = new TargetLockRenderer();
  private readonly canvas: ResponsiveCanvas;
  private readonly loop: GameLoop;

  private screen: ScreenName = 'menu';
  private difficulty: Difficulty = 'cadet';
  private game: TargetLockGame | null = null;
  private sessionWallStart = 0;
  /** Invalida contagens regressivas pendentes quando o jogador sai no meio. */
  private runId = 0;

  constructor() {
    const canvasEl = $<HTMLCanvasElement>('#arena');
    this.canvas = new ResponsiveCanvas(canvasEl, (size) => this.game?.setArena(size));
    new PointerInput(canvasEl, (press) => this.handlePress(press));
    this.loop = new GameLoop((now) => this.tick(now));

    this.bindMenu();
    $('#btn-again').addEventListener('click', () => this.startTargetLock());
    $('#btn-menu').addEventListener('click', () => this.show('menu'));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.screen === 'game') this.abort();
    });
  }

  private bindMenu(): void {
    const buttons = document.querySelectorAll<HTMLButtonElement>('#difficulty [data-difficulty]');
    for (const btn of buttons) {
      btn.addEventListener('click', () => {
        this.difficulty = btn.dataset.difficulty as Difficulty;
        for (const other of buttons) {
          other.setAttribute('aria-checked', String(other === btn));
        }
      });
    }
    $('#play-target-lock').addEventListener('click', () => this.startTargetLock());
  }

  private show(name: ScreenName): void {
    this.screen = name;
    for (const [key, el] of Object.entries(this.screens)) {
      el.hidden = key !== name;
    }
  }

  private async startTargetLock(): Promise<void> {
    const runId = ++this.runId;
    this.game = null;
    this.renderer.clear();
    this.show('game');
    this.canvas.resize();
    this.updateHud(0, true);
    this.loop.start();

    this.countdownEl.hidden = false;
    for (let n = COUNTDOWN_STEPS; n > 0; n--) {
      this.countdownEl.textContent = String(n);
      await wait(1000);
      if (runId !== this.runId) return;
    }
    this.countdownEl.hidden = true;

    const seed = `free:${Date.now()}`;
    this.sessionWallStart = Date.now();
    this.game = new TargetLockGame(
      TARGET_LOCK_CONFIGS[this.difficulty],
      createRng(seed),
      this.canvas,
      performance.now(),
    );
  }

  private abort(): void {
    this.runId++;
    this.loop.stop();
    this.game = null;
    this.countdownEl.hidden = true;
    this.show('menu');
  }

  private handlePress({ x, y, timeStamp }: PointerPress): void {
    if (!this.game) return;
    const result = this.game.click(x, y, timeStamp);
    if (!result) return;
    const now = performance.now();
    const { event, target } = result;
    if (target)
      this.renderer.addPulse(
        event.type === 'hit' ? 'hit' : 'decoy',
        target.x,
        target.y,
        target.radius,
        now,
      );
    else this.renderer.addPulse('miss', x, y, 8, now);
  }

  private tick(now: number): void {
    const game = this.game;
    if (game) {
      game.update(now);
      if (game.isOver(now)) {
        this.finish(game);
        return;
      }
    }
    this.renderer.draw(this.canvas.ctx, this.canvas.width, this.canvas.height, game, now);
    this.updateHud(game ? game.timeLeft(now) : 0, !game);
  }

  private updateHud(timeLeftMs: number, idle: boolean): void {
    const game = this.game;
    this.hud.time.textContent = idle ? '60.0' : (timeLeftMs / 1000).toFixed(1);
    this.hud.score.textContent = formatScore(game?.score ?? 0);
    this.hud.combo.textContent = String(game?.combo ?? 0);
  }

  private finish(game: TargetLockGame): void {
    this.loop.stop();
    this.game = null;

    const metrics = computeTargetLockMetrics(game.events, game.bestCombo);
    const previousBest = this.store.bestScore('target-lock', this.difficulty);
    const session: Session = {
      id: crypto.randomUUID(),
      mode: 'target-lock',
      difficulty: this.difficulty,
      official: false,
      startedAt: this.sessionWallStart,
      durationMs: game.durationMs,
      score: game.score,
      metrics,
      // Reflex Rating entra na Fase 4.
      ratingBefore: INITIAL_RATING,
      ratingAfter: INITIAL_RATING,
    };
    this.store.add(session);

    $('#res-difficulty').textContent = DIFFICULTY_LABELS[this.difficulty];
    $('#res-score').textContent = formatScore(session.score);
    $('#res-reaction').textContent = formatMs(metrics.reaction_median);
    $('#res-accuracy').textContent = formatPercent(metrics.accuracy);
    $('#res-hits').textContent = String(metrics.hits);
    $('#res-decoys').textContent = String(metrics.decoys_hit);
    $('#res-expired').textContent = String(metrics.expired);
    $('#res-combo').textContent = String(metrics.best_combo);

    const recordEl = $('#res-record');
    const isRecord = previousBest !== null && session.score > previousBest;
    recordEl.classList.toggle('is-record', isRecord);
    recordEl.textContent =
      previousBest === null
        ? 'Primeira sessão nesta dificuldade. Agora é só superar!'
        : isRecord
          ? `Novo recorde! Anterior: ${formatScore(previousBest)}`
          : `Recorde: ${formatScore(previousBest)}`;

    this.show('results');
    $('#btn-again').focus();
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
