import * as THREE from 'three';

/**
 * Unified input: WASD/arrows on keyboard, and a drag-anywhere virtual
 * joystick that serves both touch and mouse. Exposes one normalized move
 * vector (x = right, y = toward camera-forward/−Z).
 */
export class Input {
  move = new THREE.Vector2();
  enabled = true;
  private keys = new Set<string>();
  private pointerId: number | null = null;
  private origin = new THREE.Vector2();
  private joyVec = new THREE.Vector2();
  private interactCbs: (() => void)[] = [];

  constructor(private canvas: HTMLElement, private joyEl: HTMLElement) {
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      this.keys.add(e.code);
      if ((e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') && this.enabled) {
        this.fireInteract();
      }
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());

    canvas.addEventListener('pointerdown', (e) => {
      if (!this.enabled || this.pointerId !== null) return;
      this.pointerId = e.pointerId;
      this.origin.set(e.clientX, e.clientY);
      this.joyVec.set(0, 0);
      this.joyEl.style.left = `${e.clientX}px`;
      this.joyEl.style.top = `${e.clientY}px`;
      this.joyEl.classList.add('active');
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.pointerId) return;
      const dx = e.clientX - this.origin.x;
      const dy = e.clientY - this.origin.y;
      const len = Math.hypot(dx, dy);
      const max = 48;
      const dead = 8;
      if (len < dead) {
        this.joyVec.set(0, 0);
      } else {
        const m = Math.min(1, (len - dead) / (max - dead));
        this.joyVec.set((dx / len) * m, (dy / len) * m);
      }
      const nub = this.joyEl.firstElementChild as HTMLElement;
      const cl = Math.min(len, max);
      nub.style.transform = `translate(${(dx / (len || 1)) * cl}px, ${(dy / (len || 1)) * cl}px)`;
    });
    const release = (e: PointerEvent) => {
      if (e.pointerId !== this.pointerId) return;
      this.pointerId = null;
      this.joyVec.set(0, 0);
      this.joyEl.classList.remove('active');
      const nub = this.joyEl.firstElementChild as HTMLElement;
      nub.style.transform = '';
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
  }

  onInteract(cb: () => void) {
    this.interactCbs.push(cb);
  }
  fireInteract() {
    for (const cb of this.interactCbs) cb();
  }

  update() {
    if (!this.enabled) {
      this.move.set(0, 0);
      return;
    }
    let x = 0;
    let y = 0;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y += 1;

    if (x !== 0 || y !== 0) {
      const l = Math.hypot(x, y);
      this.move.set(x / l, y / l);
    } else {
      this.move.copy(this.joyVec);
    }
  }
}
