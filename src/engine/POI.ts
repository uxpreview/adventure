import * as THREE from 'three';
import { letterEl, S } from '../ui/lettering';

export type POIDef = {
  x: number;
  z: number;
  radius: number;
  /** Label that fades in when near (like the reference's artwork labels). */
  label?: string;
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
    this.def = { enabled: true, labelHeight: 2.0, ...def };
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

  /** Returns the active interactable POI (for the interact key). */
  update(charPos: THREE.Vector3): POI | null {
    let active: POI | null = null;
    let best = Infinity;

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
        if (show) this.place(p.labelEl, p.def.x, p.def.labelHeight!, p.def.z);
      }
      if (inR && p.def.onInteract && d < best) {
        best = d;
        active = p;
      }
    }

    if (active) {
      letterEl(this.promptEl, active.def.prompt ?? 'look', S.voice(11.5));
      this.promptEl.classList.add('show');
      this.place(this.promptEl, active.def.x, 1.4, active.def.z);
    } else {
      this.promptEl.classList.remove('show');
    }
    return active;
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
    sy = Math.min(Math.max(sy, hh + pad), window.innerHeight - pad);
    el.style.left = `${sx}px`;
    el.style.top = `${sy}px`;
  }
}
