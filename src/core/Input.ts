import * as THREE from 'three';

/**
 * Unified input: WASD/arrows on keyboard, and a drag virtual joystick
 * that serves both touch and mouse. Exposes one normalized move vector
 * (x = right, y = toward camera-forward/−Z).
 *
 * Session 4, portrait as a first-class viewport (WORLD-SYSTEMS §8): "the
 * joystick must never sit under the thing it is steering toward." On a
 * tall screen the top of the frame is the VISTA — the keep on its ridge,
 * the thing you are walking to — and a drag-anywhere stick puts a ring
 * and a thumb right on it. So on a tall screen the walk drag belongs to
 * the lower band of the page and the vista band stays clear. On a wide
 * screen there is no vista band to protect, and the whole canvas drags.
 *
 * SESSION 6 — RUNNING, WITHOUT A BUTTON.
 *
 * `move` keeps exactly the meaning it has always had: a direction whose
 * length is how much of the WALK you are asking for. Running is a
 * second scalar, `run`, and it is deliberately not a mode:
 *
 *   · on a keyboard it is Shift, RAMPED — a body leans into a run over
 *     about a third of a second and settles out of one faster, and the
 *     ramp is here rather than in Character so a tap of shift can never
 *     produce one dark footprint on its own;
 *   · on a phone it is HOW FAR PAST THE RING YOU DRAGGED. The stick
 *     already reaches full walk at forty-eight pixels; the next forty
 *     are the run. No second control, no double-tap, nothing new on
 *     screen, and it is the one gesture a thumb finds without being
 *     told — you push harder to go faster.
 *
 * The UI never mentions it. Rule 1 of WORLD-SYSTEMS §0: no UI where the
 * world can say it, and what says this one is the trail behind you.
 */
const WALK_BAND_TOP = 0.38;
/** Where the stick reaches a full walk, and where it reaches a run. */
const JOY_WALK = 48;
const JOY_RUN = 88;
export class Input {
  move = new THREE.Vector2();
  /** 0 walking .. 1 flat out. Continuous; never a state. */
  run = 0;
  enabled = true;
  /**
   * THE HARNESS'S HANDS. `tools/shoot-*.mjs` has always pressed real
   * keys, which is right — but a contact sheet of a road at speed needs
   * a HELD direction at a HELD pace, and `keyboard.down('ShiftLeft')`
   * plus a ramp is a race against the shutter. Set this and the walker
   * is driven exactly as a player would drive them, ramp and all.
   * Null in the shipping game and never set from anywhere but `?debug`.
   */
  hold: { x: number; y: number; run: number } | null = null;
  private keys = new Set<string>();
  private pointerId: number | null = null;
  private origin = new THREE.Vector2();
  private joyVec = new THREE.Vector2();
  private joyRun = 0;
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
      const tall = window.innerWidth / window.innerHeight < 0.8;
      if (tall && e.clientY < window.innerHeight * WALK_BAND_TOP) return;
      this.pointerId = e.pointerId;
      this.origin.set(e.clientX, e.clientY);
      this.joyVec.set(0, 0);
      this.joyRun = 0;
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
      const max = JOY_WALK;
      const dead = 8;
      if (len < dead) {
        this.joyVec.set(0, 0);
      } else {
        const m = Math.min(1, (len - dead) / (max - dead));
        this.joyVec.set((dx / len) * m, (dy / len) * m);
      }
      // past the ring is the run — the same gesture, pushed further
      this.joyRun = Math.max(0, Math.min(1, (len - JOY_WALK) / (JOY_RUN - JOY_WALK)));
      const nub = this.joyEl.firstElementChild as HTMLElement;
      // the nub keeps travelling a little past the ring, so the thumb
      // can see that pushing further is doing something
      const cl = Math.min(len, max + (JOY_RUN - JOY_WALK) * 0.34 * this.joyRun);
      nub.style.transform = `translate(${(dx / (len || 1)) * cl}px, ${(dy / (len || 1)) * cl}px)`;
      this.joyEl.classList.toggle('running', this.joyRun > 0.45);
    });
    const release = (e: PointerEvent) => {
      if (e.pointerId !== this.pointerId) return;
      this.pointerId = null;
      this.joyVec.set(0, 0);
      this.joyRun = 0;
      this.joyEl.classList.remove('active', 'running');
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

  update(dt = 1 / 60) {
    if (this.hold) {
      this.move.set(this.hold.x, this.hold.y);
      const rate = this.hold.run > this.run ? 3.0 : 5.0;
      this.run += (this.hold.run - this.run) * (1 - Math.exp(-dt * rate));
      return;
    }
    if (!this.enabled) {
      this.move.set(0, 0);
      this.run = 0;
      return;
    }
    let x = 0;
    let y = 0;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) x -= 1;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) x += 1;
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) y -= 1;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) y += 1;

    const keyed = x !== 0 || y !== 0;
    if (keyed) {
      const l = Math.hypot(x, y);
      this.move.set(x / l, y / l);
    } else {
      this.move.copy(this.joyVec);
    }

    /* THE RUN, ramped. Shift on the keys, the drag's overshoot on a
     * phone; either way the value moves toward its target over about a
     * third of a second up and a fifth back down, because a body has
     * mass and because one tapped key must never be able to lay a
     * single black footprint in the middle of a walk. */
    const wantRun = keyed
      ? (this.keys.has('ShiftLeft') || this.keys.has('ShiftRight') ? 1 : 0)
      : this.joyRun;
    const rate = wantRun > this.run ? 3.0 : 5.0;
    this.run += (wantRun - this.run) * (1 - Math.exp(-dt * rate));
  }
}
