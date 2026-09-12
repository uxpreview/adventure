/**
 * THE LOOK — the camera under the player's hand, and only the hand.
 *
 * One rule, from the owner's stomach: THE FRAME NEVER TURNS UNLESS A
 * HAND TURNS IT. No auto-follow, no spring-back, no bearing taken from
 * travel. The camera keeps whatever yaw the player left it at, and the
 * only motions here that are not a hand are the short drain that makes
 * a drag feel like a drag instead of a jump, and the recentre a key
 * pressed — both bounded in rate.
 *
 * Controls:
 *   desktop  drag on the canvas with any button orbits (yaw) and
 *            pitches; the wheel dollies; `,` `.` turn while held (no
 *            spring-back); `R` recentres behind the walker.
 *   phone    one finger in the vista band (the top of a tall screen)
 *            orbits; two fingers anywhere orbit; a pinch dollies. The
 *            walk stick (Input.ts) keeps the lower band, so no ring is
 *            ever under the vista.
 *
 * `yaw` is radians east of due north (the direction looked along);
 * `pitch` is the camera's height angle about the aim point; `zoom` is a
 * multiplier on the rig's resting distance.
 */
/** Radians of yaw per pixel dragged (0.3°) — a full turn is about four
 *  screen widths on a phone, three on a desktop. Asserted by
 *  tools/check-camera.mjs. */
export const YAW_PER_PX = 0.0052;
export const PITCH_PER_PX = 0.0036;
export const PITCH_MIN = (10 * Math.PI) / 180;
export const PITCH_MAX = (50 * Math.PI) / 180;
export const ZOOM_MIN = 0.55;
export const ZOOM_MAX = 2.1;
/** How fast a held `,` or `.` turns, radians a second (75°/s). */
export const KEY_TURN = 1.3;
/** The recentre's ceiling, radians a second (115°/s) — a head turn the
 *  player asked for, and never a whip. */
export const RECENTRE_RATE = 2.0;
/** A dragged delta drains into the yaw at this rate a second: about a
 *  twentieth of a second of lag, which reads as weight, not as mush. */
const DRAIN = 24;
/** The vista band on a tall screen — the same 0.38 Input.ts keeps clear
 *  of the walk stick; a finger there is a look. */
const VISTA_BAND = 0.38;

const TAU = Math.PI * 2;
const wrap = (a: number) => {
  a = a % TAU;
  if (a > Math.PI) a -= TAU;
  if (a <= -Math.PI) a += TAU;
  return a;
};
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export class Look {
  yaw = 0;
  pitch = (16 * Math.PI) / 180;
  zoom = 1;
  /** False pins everything: the old contact sheets (`setBearing(false)`)
   *  and the poster. */
  enabled = true;
  /** Pending hand input, drained by `tick`. Zoom is kept in log space so
   *  a wheel notch in is the same size as one out. */
  private dYaw = 0;
  private dPitch = 0;
  private dZoom = 0;
  private recentreAsk = false;
  private target: { yaw: number; pitch: number } | null = null;
  private dragging = false;
  /** Gate round 1: whether this player has ever turned the lens (App
   *  nudges once if not, after a minute). */
  everDragged = false;
  private lastX = 0;
  private lastY = 0;
  private touches = new Map<number, { x: number; y: number; look: boolean }>();
  private pairDist = 0;
  private pairX = 0;
  private pairY = 0;

  constructor(canvas: HTMLElement) {
    /* THE MOUSE. Input.ts ignores it outright (the walk stick is a
     * thumb's control), so a drag with any button is free for the look.
     * Captured, so a drag that leaves the canvas keeps turning. */
    canvas.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') {
        this.dragging = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      this.touchDown(e);
    });
    canvas.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse') {
        if (!this.dragging) return;
        this.orbitBy(e.clientX - this.lastX, e.clientY - this.lastY);
        this.lastX = e.clientX;
        this.lastY = e.clientY;
        return;
      }
      this.touchMove(e);
    });
    const up = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') {
        this.dragging = false;
        return;
      }
      this.touchUp(e);
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      // a trackpad pinch arrives as a wheel with ctrl held, finer
      this.zoomBy(e.deltaY * (e.ctrlKey ? 0.004 : 0.0012));
    }, { passive: false });
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (e.code === 'KeyR') this.recentreAsk = true;
    });
  }

  /* ---- the hands ------------------------------------------------- */

  /** A drag of (px, py) pixels: right turns the look right, down tips
   *  the camera up over the walker. Also the harness's hand. */
  orbitBy(px: number, py: number) {
    this.everDragged = true;
    if (!this.enabled) return;
    this.target = null;
    this.dYaw += px * YAW_PER_PX;
    this.dPitch += py * PITCH_PER_PX;
  }

  /** Dolly by a log-zoom amount: positive is further away. */
  zoomBy(d: number) {
    if (!this.enabled) return;
    this.dZoom += d;
  }

  /** Turn to look along `yaw` (and settle the pitch), eased and capped
   *  at RECENTRE_RATE. Any hand input cancels it. */
  recentre(yaw: number, pitch = this.pitch) {
    if (!this.enabled) return;
    this.target = { yaw: wrap(yaw), pitch: clamp(pitch, PITCH_MIN, PITCH_MAX) };
    this.dYaw = 0;
    this.dPitch = 0;
  }

  /** Did somebody press R since the last ask? */
  takeRecentre() {
    const v = this.recentreAsk;
    this.recentreAsk = false;
    return v;
  }

  get recentring() {
    return this.target !== null;
  }

  setYaw(v: number) {
    this.yaw = wrap(v);
    this.dYaw = 0;
    this.target = null;
  }

  setPitch(v: number) {
    this.pitch = clamp(v, PITCH_MIN, PITCH_MAX);
    this.dPitch = 0;
    this.target = null;
  }

  setZoom(v: number) {
    this.zoom = clamp(v, ZOOM_MIN, ZOOM_MAX);
    this.dZoom = 0;
  }

  /** One tick. `turn` is the held key, −1..1, already ramped by Input. */
  tick(dt: number, turn = 0) {
    if (!this.enabled) {
      this.dYaw = this.dPitch = this.dZoom = 0;
      this.target = null;
      return;
    }
    const k = 1 - Math.exp(-dt * DRAIN);
    if (this.dYaw !== 0) {
      const step = this.dYaw * k;
      this.yaw = wrap(this.yaw + step);
      this.dYaw -= step;
      if (Math.abs(this.dYaw) < 1e-4) this.dYaw = 0;
    }
    if (this.dPitch !== 0) {
      const step = this.dPitch * k;
      this.pitch = clamp(this.pitch + step, PITCH_MIN, PITCH_MAX);
      this.dPitch -= step;
      if (Math.abs(this.dPitch) < 1e-4) this.dPitch = 0;
    }
    if (this.dZoom !== 0) {
      const step = this.dZoom * k;
      this.zoom = clamp(this.zoom * Math.exp(step), ZOOM_MIN, ZOOM_MAX);
      this.dZoom -= step;
      if (Math.abs(this.dZoom) < 1e-4) this.dZoom = 0;
    }
    if (turn !== 0) {
      this.target = null;
      this.yaw = wrap(this.yaw + turn * KEY_TURN * dt);
    }
    if (this.target) {
      const t = this.target;
      const dy = wrap(t.yaw - this.yaw);
      const dp = t.pitch - this.pitch;
      const ease = 1 - Math.exp(-dt * 3.2);
      const cap = RECENTRE_RATE * dt;
      const sy = clamp(dy * ease, -cap, cap);
      const sp = clamp(dp * ease, -cap, cap);
      this.yaw = wrap(this.yaw + sy);
      this.pitch = this.pitch + sp;
      if (Math.abs(wrap(t.yaw - this.yaw)) < 0.0015 && Math.abs(t.pitch - this.pitch) < 0.0015) {
        // it ARRIVES: exactly behind the walker, not asymptotically near
        this.yaw = t.yaw;
        this.pitch = t.pitch;
        this.target = null;
      }
    }
  }

  /* ---- touch ------------------------------------------------------ *
   * Input.ts tracks the same fingers for the walk stick and already
   * drops the stick when a second one lands; this keeps its own map so
   * the two never have to agree on anything but the band. */
  private touchDown(e: PointerEvent) {
    const tall = window.innerWidth / window.innerHeight < 0.8;
    const look = tall && e.clientY < window.innerHeight * VISTA_BAND;
    this.touches.set(e.pointerId, { x: e.clientX, y: e.clientY, look });
    if (this.touches.size === 2) this.pairStart();
  }

  private pairStart() {
    const [a, b] = [...this.touches.values()];
    this.pairDist = Math.hypot(a.x - b.x, a.y - b.y);
    this.pairX = (a.x + b.x) / 2;
    this.pairY = (a.y + b.y) / 2;
  }

  private touchMove(e: PointerEvent) {
    const t = this.touches.get(e.pointerId);
    if (!t) return;
    const dx = e.clientX - t.x;
    const dy = e.clientY - t.y;
    t.x = e.clientX;
    t.y = e.clientY;
    if (this.touches.size === 2) {
      const [a, b] = [...this.touches.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const cx = (a.x + b.x) / 2;
      const cy = (a.y + b.y) / 2;
      this.orbitBy(cx - this.pairX, cy - this.pairY);
      if (this.pairDist > 1 && d > 1) this.zoomBy(-Math.log(d / this.pairDist));
      this.pairDist = d;
      this.pairX = cx;
      this.pairY = cy;
      return;
    }
    // one finger that landed in the vista band: the whole move is a look
    if (t.look && this.touches.size === 1) this.orbitBy(dx, dy);
  }

  private touchUp(e: PointerEvent) {
    this.touches.delete(e.pointerId);
    if (this.touches.size === 2) this.pairStart();
  }
}
