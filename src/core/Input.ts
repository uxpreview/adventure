import * as THREE from 'three';

/**
 * Unified input: WASD/arrows on keyboard, and a drag virtual joystick
 * THAT SERVES TOUCH AND PEN AND NOT THE MOUSE. Exposes one normalized
 * move vector (x = right, y = toward camera-forward/−Z).
 *
 * That sentence used to read "serves both touch and mouse", and it was
 * accurate, and it was the bug (Session 12): a mouse drag anywhere on
 * the desktop canvas raised the phone's ring under the cursor. See the
 * pointerdown handler, and `design/specs/controls.md` for why
 * click-drag-to-walk is not a desktop control in this game.
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
/** How far two fingers travel for a full peek. About a thumb's width
 *  either side of where they went down on a 390-wide screen. */
const PEEK_PX = 90;
export class Input {
  move = new THREE.Vector2();
  /** 0 walking .. 1 flat out. Continuous; never a state. */
  run = 0;
  /**
   * THE PEEK — −1 hard left, +1 hard right, and it is a GESTURE AND
   * NEVER A STATE (WORLD-SYSTEMS §2, candidate 3). It springs back the
   * moment it is let go, so there is no bearing anybody can leave the
   * camera in and no composition in this game that a player can park
   * askew.
   *
   * On a keyboard it is `,` and `.` — the two keys already engraved `<`
   * and `>`, which is the only pair on a keyboard that reads as left and
   * right without being told. They are also well clear of the walking
   * hand, so a peek can never be mistaken for a step, and E stays
   * INTERACT, because "E to look" is the sentence this game has shipped
   * since Session 2 and a camera is not worth breaking it for.
   *
   * On a phone it is TWO FINGERS DRAGGED, the way you want to look —
   * the same direction-you-want metaphor the walk stick already uses.
   * A second finger cancels the walk outright: two fingers are a look,
   * one finger is a walk, and nothing on screen has to say so.
   */
  peek = 0;
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
  /** And the harness's other hand: a held peek, for the bearing sheet. */
  holdPeek: number | null = null;
  private keys = new Set<string>();
  private pointerId: number | null = null;
  private origin = new THREE.Vector2();
  private joyVec = new THREE.Vector2();
  private joyRun = 0;
  private interactCbs: (() => void)[] = [];
  /** Every pointer currently down on the canvas, so a second finger can
   *  be recognised as a second finger. */
  private pts = new Map<number, { x: number; y: number }>();
  private peekIds: number[] = [];
  private peekBase = 0;
  private peekRaw = 0;

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
      /* THE STICK IS A THUMB'S CONTROL AND A MOUSE IS NOT A THUMB.
       * Session 12, and it is the FIRST line of this handler so that a
       * mouse never even enters `pts` — otherwise a hybrid laptop with a
       * finger and a mouse down at once reads as two fingers and takes
       * a peek. The only guard here used to be an ASPECT-RATIO test,
       * which decides WHERE the stick may be grabbed and never whether
       * it should exist, so a mouse drag anywhere on a 1280×720 canvas
       * raised the ring under the cursor and walked the walker.
       *
       * Aspect ratio was never the question; POINTER TYPE is, and the
       * event carries it. `e.pointerType` beats
       * matchMedia('(pointer: coarse)') because it is per-EVENT: a
       * touchscreen laptop answers "fine" to the media query, and this
       * gives it the stick the moment a finger lands on the glass and
       * never when the mouse moves. */
      if (e.pointerType === 'mouse') return;
      this.pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (!this.enabled) return;
      /* TWO FINGERS ARE A LOOK, NOT A WALK. The second one down ends
       * whatever walk the first one was asking for — a thumb and a
       * finger on the glass at once is somebody looking around, and a
       * stick that kept steering underneath it would walk them off the
       * road they were trying to see. */
      if (this.pts.size === 2 && this.peekIds.length === 0) {
        this.peekIds = [...this.pts.keys()];
        this.peekBase = this.peekX();
        this.peekRaw = 0;
        this.dropStick();
        return;
      }
      if (this.pointerId !== null) return;
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
      const p = this.pts.get(e.pointerId);
      if (p) {
        p.x = e.clientX;
        p.y = e.clientY;
      }
      if (this.peekIds.length === 2) {
        if (!this.peekIds.includes(e.pointerId)) return;
        const d = (this.peekX() - this.peekBase) / PEEK_PX;
        this.peekRaw = Math.max(-1, Math.min(1, d));
        return;
      }
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
      this.pts.delete(e.pointerId);
      if (this.peekIds.includes(e.pointerId)) {
        // a gesture and never a state: lift a finger and it springs back
        this.peekIds = [];
        this.peekRaw = 0;
      }
      if (e.pointerId !== this.pointerId) return;
      this.dropStick();
    };
    canvas.addEventListener('pointerup', release);
    canvas.addEventListener('pointercancel', release);
  }

  /** Where the two peeking fingers are, between them. */
  private peekX() {
    let sum = 0;
    for (const id of this.peekIds) sum += this.pts.get(id)?.x ?? 0;
    return sum / Math.max(1, this.peekIds.length);
  }

  /** Let go of the walk stick, wherever it was. */
  private dropStick() {
    this.pointerId = null;
    this.joyVec.set(0, 0);
    this.joyRun = 0;
    this.joyEl.classList.remove('active', 'running');
    const nub = this.joyEl.firstElementChild as HTMLElement;
    if (nub) nub.style.transform = '';
  }

  onInteract(cb: () => void) {
    this.interactCbs.push(cb);
  }
  fireInteract() {
    for (const cb of this.interactCbs) cb();
  }

  update(dt = 1 / 60) {
    this.peekTick(dt);
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

  /** The peek, ramped like the run and for the same reason: a body
   *  turns its head over about a fifth of a second, and a tapped key
   *  must never be able to snap the whole world sideways for one frame. */
  private peekTick(dt: number) {
    let want = 0;
    if (this.holdPeek !== null) want = this.holdPeek;
    else if (this.enabled) {
      const k = (this.keys.has('Period') ? 1 : 0) - (this.keys.has('Comma') ? 1 : 0);
      want = k !== 0 ? k : this.peekRaw;
    }
    this.peek += (want - this.peek) * (1 - Math.exp(-dt * 6));
    if (want === 0 && Math.abs(this.peek) < 0.002) this.peek = 0;
  }
}
