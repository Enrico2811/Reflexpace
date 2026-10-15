import type { Size } from './types';

/** Canvas que acompanha o tamanho do elemento e a densidade de pixels da tela. */
export class ResponsiveCanvas implements Size {
  readonly ctx: CanvasRenderingContext2D;
  width = 0;
  height = 0;
  private readonly observer: ResizeObserver;

  constructor(
    readonly canvas: HTMLCanvasElement,
    private readonly onResize?: (size: Size) => void,
  ) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D não suportado neste navegador.');
    this.ctx = ctx;
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(canvas);
    this.resize();
  }

  /** Coordenadas de desenho ficam em pixels CSS; o DPR é aplicado na transformação. */
  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.width = rect.width;
    this.height = rect.height;
    this.canvas.width = Math.round(rect.width * dpr);
    this.canvas.height = Math.round(rect.height * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.onResize?.({ width: this.width, height: this.height });
  }

  dispose(): void {
    this.observer.disconnect();
  }
}
