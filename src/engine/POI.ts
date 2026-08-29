import * as THREE from 'three';
import { letterEl, S } from '../ui/lettering';

export type POIDef = {
  x: number;
  z: number;
  radius: number;
  /** Label that fades in when near (like the reference's artwork labels). */
  label?: string;
  /**
   * How high over the place its name is written. Session 4 raised the
   * default and dropped the prompt's: on the castle ramp the two were
   * six-tenths of a unit apart and printed on top of each other.
   */
  labelHeight?: number;
  /** If set, an interact prompt appears in range; tapping/E triggers it. */
  prompt?: string;
  onInteract?: () => void;
  onEnter?: () => void;
  onExit?: () => void;
  /** Setting false hides the POI entirely. */
  enabled?: boolean;
  /** Internal: remembered state across a blanket suppression. */
  userWasEnabled?: boolean;
};

export class POI {
  def: POIDef;
  inRange = false;
  labelEl: HTMLDivElement | null = null;
  constructor(def: POIDef) {
    this.def = { enabled: true, labelHeight: 3.4, ...def };
  }
  get enabled() {
    return this.def.enabled !== false;
  }
  setEnabled(v: boolean) {
    this.def.enabled = v;
    if (!v && this.labelEl) this.labelEl.classList.remove('show');
  }
}

/**
 * Proximity system: fades labels in and out with distance and surfaces one
 * interact prompt for the nearest interactable POI in range.
 */
export class POIManager {
  /** Exposed so the shoot harness can walk to a chapter's own triggers
   *  by label instead of hard-coding coordinates that drift with staging. */
  pois: POI[] = [];
  /** The ground under a world point — labels are written over places,
   *  and since Session 4 places have a height. */
  groundAt: ((x: number, z: number) => number) | null = null;
  private v = new THREE.Vector3();

  constructor(
    private camera: THREE.PerspectiveCamera,
    private labelRoot: HTMLElement,
    private promptEl: HTMLElement
  ) {}

  add(def: POIDef): POI {
    const poi = new POI(def);
    if (def.label) {
      const el = document.createElement('div');
      el.className = 'poi-label';
      // Fix 5: a world label is written on the page, not set over it
      letterEl(el, def.label, S.quiet(10.5));
      this.labelRoot.appendChild(el);
      poi.labelEl = el;
    }
    this.pois.push(poi);
    return poi;
  }

  clear() {
    for (const p of this.pois) p.labelEl?.remove();
    this.pois = [];
    this.promptEl.classList.remove('show');
  }

  /**
   * Silence the page (ch03 §6): for the blank sea's ninety seconds
   * nothing may be on screen but paper, Pip, and prints. Remembers what
   * was enabled so restoring can't accidentally open a locked exit.
   */
  setAllEnabled(v: boolean) {
    if (!v) {
      for (const p of this.pois) {
        p.def.userWasEnabled = p.enabled;
        p.setEnabled(false);
      }
      this.promptEl.classList.remove('show');
    } else {
      for (const p of this.pois) p.setEnabled(p.def.userWasEnabled !== false);
    }
  }

  /**
   * A CARD IS OPEN AND THE WORLD IS BEHIND IT.
   *
   * Set while a note or the map has the screen. Labels and the interact
   * prompt live in the DOM over the canvas, and they were being drawn
   * straight through the veil: a phone screenshot of a note card had
   * CRANE YOUR NECK lettered across the walker underneath it. When a
   * card is up, the world's own writing is behind it and stays behind
   * it.
   */
  suppressed = false;

  /** Returns the active interactable POI (for the interact key). */
  update(charPos: THREE.Vector3): POI | null {
    let active: POI | null = null;
    let best = Infinity;

    if (this.suppressed) {
      for (const p of this.pois) p.labelEl?.classList.remove('show');
      this.promptEl.classList.remove('show');
      // the nearest POI is still returned, so closing the card and
      // pressing E does what the player expects
      for (const p of this.pois) {
        if (!p.enabled || !p.def.onInteract) continue;
        const d = Math.hypot(charPos.x - p.def.x, charPos.z - p.def.z);
        if (d < p.def.radius && d < best) {
          best = d;
          active = p;
        }
      }
      return active;
    }

    for (const p of this.pois) {
      if (!p.enabled) continue;
      const dx = charPos.x - p.def.x;
      const dz = charPos.z - p.def.z;
      const d = Math.hypot(dx, dz);
      const inR = d < p.def.radius;
      if (inR !== p.inRange) {
        p.inRange = inR;
        if (inR) p.def.onEnter?.();
        else p.def.onExit?.();
      }
      if (p.labelEl) {
        const show = d < p.def.radius * 1.6;
        p.labelEl.classList.toggle('show', show);
        if (show) this.place(p.labelEl, p.def.x, this.ground(p.def.x, p.def.z) + p.def.labelHeight!, p.def.z);
      }
      if (inR && p.def.onInteract && d < best) {
        best = d;
        active = p;
      }
    }

    if (active) {
      letterEl(this.promptEl, active.def.prompt ?? 'look', S.voice(11.5));
      this.promptEl.classList.add('show');
      this.place(this.promptEl, active.def.x, this.ground(active.def.x, active.def.z) + 0.55, active.def.z);
    } else {
      this.promptEl.classList.remove('show');
    }
    return active;
  }

  private ground(x: number, z: number) {
    return this.groundAt ? this.groundAt(x, z) : 0;
  }

  private place(el: HTMLElement, x: number, y: number, z: number) {
    this.v.set(x, y, z).project(this.camera);
    let sx = (this.v.x * 0.5 + 0.5) * window.innerWidth;
    let sy = (-this.v.y * 0.5 + 0.5) * window.innerHeight;
    // Clamp into the viewport (juror Fix 2: world labels clipped at the
    // portrait edge). The element is centred on sx and sits above sy, so
    // its extents are half its width each side and its height above.
    const hw = el.offsetWidth * 0.5;
    const hh = el.offsetHeight;
    const pad = 10;
    sx = Math.min(Math.max(sx, hw + pad), window.innerWidth - hw - pad);
    const tall = window.innerWidth / window.innerHeight < 0.8;
    /* ON A PHONE THE PROMPT IS PINNED, NOT FLOATED.
     *
     * Session 4 floored it at 42% of a tall screen because a tappable
     * thing in the top half is out of thumb reach. That was half the
     * problem. The other half only shows on a real device: the walker
     * sits around two thirds down a tall frame and a POI you are
     * STANDING ON projects to exactly there — so the prompt lands on
     * the walker's head, and when a label is up too, on the label. Both
     * were in the first phone screenshot anybody took of this game.
     *
     * So on a tall screen it goes where a thumb already is and stays
     * there: centred, low, always the same place. Labels still float
     * where their place is — a label is a caption on the world, and it
     * is the PROMPT that is a control. */
    if (tall && el === this.promptEl) {
      sx = window.innerWidth * 0.5;
      sy = window.innerHeight - Math.max(96, window.innerHeight * 0.13);
    } else {
      sy = Math.min(Math.max(sy, hh + pad), window.innerHeight - pad);
    }
    el.style.left = `${sx}px`;
    el.style.top = `${sy}px`;
  }
}
