export interface PointerPress {
  x: number;
  y: number;
  /** event.timeStamp: momento real do clique, não o do frame. */
  timeStamp: number;
}

/** Entrada de mouse em coordenadas CSS relativas ao elemento. */
export class PointerInput {
  x = 0;
  y = 0;
  isDown = false;

  constructor(
    private readonly el: HTMLElement,
    private readonly onPress?: (press: PointerPress) => void,
  ) {
    el.addEventListener('pointermove', this.handleMove);
    el.addEventListener('pointerdown', this.handleDown);
    window.addEventListener('pointerup', this.handleUp);
    el.addEventListener('contextmenu', preventDefault);
  }

  dispose(): void {
    this.el.removeEventListener('pointermove', this.handleMove);
    this.el.removeEventListener('pointerdown', this.handleDown);
    window.removeEventListener('pointerup', this.handleUp);
    this.el.removeEventListener('contextmenu', preventDefault);
  }

  private updatePosition(e: PointerEvent): void {
    const rect = this.el.getBoundingClientRect();
    this.x = e.clientX - rect.left;
    this.y = e.clientY - rect.top;
  }

  private handleMove = (e: PointerEvent): void => {
    this.updatePosition(e);
  };

  private handleDown = (e: PointerEvent): void => {
    if (e.button !== 0) return;
    e.preventDefault();
    this.updatePosition(e);
    this.isDown = true;
    this.onPress?.({ x: this.x, y: this.y, timeStamp: e.timeStamp });
  };

  private handleUp = (e: PointerEvent): void => {
    if (e.button === 0) this.isDown = false;
  };
}

function preventDefault(e: Event): void {
  e.preventDefault();
}
