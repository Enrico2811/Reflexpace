export type TickFn = (now: number, dtMs: number) => void;

/**
 * Loop baseado em requestAnimationFrame. `now` usa a mesma origem de
 * performance.now() e de event.timeStamp, então os tempos são comparáveis.
 */
export class GameLoop {
  private rafId = 0;
  private last = 0;
  private running = false;

  constructor(private readonly tick: TickFn) {}

  get isRunning(): boolean {
    return this.running;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.rafId = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  private frame = (now: number): void => {
    if (!this.running) return;
    // Limita o delta para não "pular" a simulação após a aba voltar do segundo plano.
    const dt = Math.min(now - this.last, 100);
    this.last = now;
    this.tick(now, dt);
    if (this.running) this.rafId = requestAnimationFrame(this.frame);
  };
}
