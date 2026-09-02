import * as THREE from 'three';
import { letterEl, S } from '../ui/lettering';

/** How far around a place to look for something a name must clear, and
 *  how much air to leave over it. Three and a half units is a signpost,
 *  a stall or a milestone — the thing the label is FOR — and not the
 *  oak forty feet behind it. */
const LABEL_CLEAR_R = 3.5;
const LABEL_CLEAR = 0.9;
/** Air between two pieces of hand-lettering before they read as one. */
const LABEL_GAP = 6;
/** How far beside a place its prompt is written: at least this, and
 *  never further than a place is wide. */
const PROMPT_SIDE = 2.2;
const PROMPT_SIDE_MAX = 5.5;

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
  /** If set, an interact prompt appears in range; tapping/E triggers it.
   *  Since Session 15 it may be a FUNCTION, because one key does
   *  several things and the prompt says which: a stone in hand is
   *  THROW THE STONE at a walk and PUT DOWN THE STONE standing still,
   *  and the king's plinth offers a choice until a door is taken. */
  prompt?: string | (() => string);
  onInteract?: () => void;
  onEnter?: () => void;
  onExit?: () => void;
  /** Setting false hides the POI entirely. */
  enabled?: boolean;
  /** Only wins when no other prompt is in reach (Session 15: the thing
   *  in the walker's hand). */
  weak?: boolean;
  /** Internal: remembered state across a blanket suppression. */
  userWasEnabled?: boolean;
};

export class POI {
  def: POIDef;
  inRange = false;
  labelEl: HTMLDivElement | null = null;
  constructor(def: POIDef) {
    /* NOT A SPREAD. Session 15 found that `{ ...def }` evaluates every
     * getter on the definition ONCE and copies its value — so a place
     * whose coordinates are meant to be read live (the rowboat's prompt
     * has said so since Session 6, the 8:15's since Session 14, the
     * cart's and the stone's since now) was nailed to wherever the thing
     * stood on page load. Row the boat somewhere and step out, and
     * TAKE THE OARS stayed at the river mouth until the tab was closed.
     * The definition is kept as itself and only its defaults filled. */
    if (def.enabled === undefined) def.enabled = true;
    if (def.labelHeight === undefined) def.labelHeight = 3.4;
    this.def = def;
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
  /** And since Session 9, how tall the page is there: see below. */
  skylineAt: ((x: number, z: number, r: number) => number) | null = null;
  private v = new THREE.Vector3();
  /** Screen boxes already spoken for this frame: the chrome, then the
   *  prompt, then every label that has already found a home. */
  private taken: { l: number; r: number; t: number; b: number }[] = [];
  /** Elements the world's writing may not be written across — the HUD
   *  buttons and the region card. Set by App from `UI.chrome`. */
  reserved: HTMLElement[] = [];

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
    const shown: { p: POI; d: number }[] = [];

    if (this.suppressed) {
      for (const p of this.pois) p.labelEl?.classList.remove('show');
      this.promptEl.classList.remove('show');
      // the nearest POI is still returned, so closing the card and
      // pressing E does what the player expects
      for (const p of this.pois) {
        if (!p.enabled || !p.def.onInteract || p.def.weak) continue;
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
        if (show) shown.push({ p, d });
      }
      if (inR && p.def.onInteract && !p.def.weak && d < best) {
        best = d;
        active = p;
      }
    }
    /* THE THING IN HAND is at distance zero from the walker and would
     * win every contest; it is offered only when nothing else is. */
    if (!active) {
      for (const p of this.pois) {
        if (!p.enabled || !p.def.weak || !p.def.onInteract) continue;
        if (Math.hypot(charPos.x - p.def.x, charPos.z - p.def.z) < p.def.radius) active = p;
      }
    }

    /* ================================================================ *
     * WHAT IS WRITTEN OVER A PLACE, AND WHAT IT MAY NOT BE WRITTEN OVER.
     *
     * The oldest visible defect in this game (Session 9): a label was
     * projected wherever its POI happened to land and drawn there, over
     * whatever was already in that part of the frame. "THE CROSSROADS"
     * printed across the signpost it names, and nothing anywhere ever
     * looked to see whether two names landed on each other.
     *
     * Two rules, and the ORDER of them is the design:
     *
     *   1. A LABEL CLEARS WHAT IT NAMES. It is written above the tallest
     *      thing standing under it (the world's skyline, built as the
     *      world is — src/world/regions/index.ts) and not above the
     *      dirt, so a four-and-a-half-unit signpost gets a label at five
     *      and a half and a stall gets one just over its awning.
     *   2. A LABEL NEVER LANDS ON ANOTHER, OR ON THE PROMPT — and when
     *      two collide the FARTHER one goes UP, never sideways. A label
     *      is a caption on a place: slide it sideways and it is a
     *      caption on a different place, which is a worse bug than the
     *      one being fixed. The prompt is placed first and holds its
     *      ground, because the prompt is a CONTROL and the player is
     *      reaching for it.
     *
     * And this is the session it lands in because a turning camera moves
     * every label relative to the thing it labels: fixing it anywhere
     * else means fixing it against a relationship that is about to
     * change. Here it can be watched moving.
     * ================================================================ */
    this.taken.length = 0;
    for (const c of this.reserved) {
      const r = c.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && getComputedStyle(c).opacity !== '0') {
        this.taken.push({ l: r.left, r: r.right, t: r.top, b: r.bottom });
      }
    }

    if (active) {
      const p = active.def.prompt;
      letterEl(this.promptEl, (typeof p === 'function' ? p() : p) ?? 'look', S.voice(11.5));
      this.promptEl.classList.add('show');
      /* AND THE PROMPT IS WRITTEN BESIDE THE THING, ON THE OPEN PAGE.
       *
       * Anchored at the POI it printed READ THE SIGNPOST straight down
       * the signpost's own post — the same defect as the label, one and
       * a half units lower. It cannot go UP, because a prompt is a
       * CONTROL and Session 4 already floored it into thumb reach; and
       * it cannot come toward the lens, because the thing between the
       * lens and a place you are interacting with is USUALLY THE WALKER
       * — the first version of this fix lettered LOOK DOWN THE WELL
       * across the walker's chest.
       *
       * So it goes sideways, a stride and a half along the camera's own
       * right, on whichever side the walker is not: lettering on the
       * grass next to the thing, where there is nothing to print over.
       * Along the CAMERA'S right rather than due east, because the
       * camera can turn now — the prompt stays beside the thing from
       * every bearing the envelope allows. */
      const px = active.def.x;
      const pz = active.def.z;
      const dx = px - this.camera.position.x;
      const dz = pz - this.camera.position.z;
      const dl = Math.hypot(dx, dz) || 1;
      const rx = -dz / dl;
      const rz = dx / dl;
      const walkerSide = (charPos.x - px) * rx + (charPos.z - pz) * rz;
      const side = walkerSide > 0.15 ? -1 : 1;
      /* AND IT GOES PAST THE EDGE OF THE THING, not a fixed stride from
       * its middle: a milestone is a unit wide and the market cross is
       * eight, and one number cannot serve both. The skyline knows where
       * each of them stops, so walk out along the camera's right until
       * there is nothing standing, and write it there. */
      let out = PROMPT_SIDE;
      for (let d = PROMPT_SIDE; d <= PROMPT_SIDE_MAX; d += 1.1) {
        out = d;
        const qx = px + rx * side * d;
        const qz = pz + rz * side * d;
        if (!this.skylineAt || this.skylineAt(qx, qz, 1.2) === -Infinity) break;
      }
      /* And the anchor is its INNER edge, so the lettering runs away
       * from the thing rather than back across it — on a WIDE screen
       * only. On a tall one the prompt is pinned centre-bottom in thumb
       * reach (see `place`) and is not beside anything; nudging a pinned
       * control sideways is just a control that moved.
       *
       * It is handed to `place` rather than applied after it, because
       * `place` is where the viewport clamp lives: the first version
       * nudged the element AFTER clamping and pushed READ THE SIGNPOST
       * off the left edge of the frame, where it read "D THE SIGNPOST". */
      const tall = window.innerWidth / window.innerHeight < 0.8;
      const nudge = tall ? 0 : side * Math.min(this.promptEl.offsetWidth * 0.5, 56);
      this.place(
        this.promptEl,
        px + rx * side * out,
        this.ground(px, pz) + 0.35,
        pz + rz * side * out,
        nudge
      );
      this.taken.push(this.boxOf(this.promptEl));
    } else {
      this.promptEl.classList.remove('show');
    }

    // nearest first: the place you are standing in keeps its name where
    // its name belongs, and the distance behind it moves
    shown.sort((a, b) => a.d - b.d);
    for (const { p } of shown) {
      const gx = this.ground(p.def.x, p.def.z);
      const sky = this.skylineAt ? this.skylineAt(p.def.x, p.def.z, LABEL_CLEAR_R) : -Infinity;
      const over = sky > -Infinity ? sky - gx + LABEL_CLEAR : 0;
      const on = this.place(
        p.labelEl!, p.def.x, gx + Math.max(p.def.labelHeight!, over), p.def.z
      );
      if (on && this.avoid(p.labelEl!)) this.taken.push(this.boxOf(p.labelEl!));
      else p.labelEl!.classList.remove('show');
    }
    return active;
  }

  private boxOf(el: HTMLElement) {
    const x = parseFloat(el.style.left);
    const y = parseFloat(el.style.top);
    const hw = el.offsetWidth * 0.5;
    return { l: x - hw, r: x + hw, t: y - el.offsetHeight, b: y };
  }

  /** Lift `el` until it is clear of everything already placed. Up only
   *  (see rule 2 above), and false if there was nowhere to put it. */
  private avoid(el: HTMLElement) {
    const h = el.offsetHeight;
    /* AND IT MAY NOT WANDER. A caption lifted far enough stops being a
     * caption on anything; a fifth of the frame is as far as a name can
     * travel and still read as belonging to the thing under it. */
    const floor0 = parseFloat(el.style.top) - window.innerHeight * 0.2;
    for (let pass = 0; pass < 8; pass++) {
      const b = this.boxOf(el);
      let hit = null;
      for (const t of this.taken) {
        if (b.r + LABEL_GAP > t.l && b.l - LABEL_GAP < t.r
          && b.b + LABEL_GAP > t.t && b.t - LABEL_GAP < t.b) { hit = t; break; }
      }
      if (!hit) return true;
      const top = hit.t - LABEL_GAP;
      /* AND IF IT WILL NOT FIT, IT IS NOT WRITTEN. There is nowhere left
       * to put it: sideways is a caption on the wrong place, down is
       * under the thing, and off the top of the page is not writing at
       * all. A name the player cannot read is worse than no name — and
       * they are already a proximity fade, so it goes the way it always
       * goes, and comes back when there is room. */
      if (top - h < 8 || top < floor0) return false;
      el.style.top = `${top}px`;
    }
    return false;
  }

  private ground(x: number, z: number) {
    return this.groundAt ? this.groundAt(x, z) : 0;
  }

  /**
   * Project a world point and put `el` there, clamped into the frame.
   * Returns false when the point is not really in the picture at all.
   *
   * THE CLAMP IS A NUDGE AND NOT A PARKING SPACE. It has been here since
   * Session 4 (a juror fix: world labels clipped at the portrait edge),
   * and on its own it will take a place that is BEHIND THE CAMERA and
   * letter its name into the corner of the frame — THE CUT was written
   * across the bottom-right of the coast sheet like a watermark. A name
   * pinned to a corner is a caption on nothing, so a caller that cares
   * (a label does; the prompt is a control and stays where a thumb can
   * find it) is told and can decline to write it.
   */
  private place(el: HTMLElement, x: number, y: number, z: number, nudge = 0) {
    this.v.set(x, y, z).project(this.camera);
    const inFrame =
      this.v.z < 1 && Math.abs(this.v.x) < 1.12 && Math.abs(this.v.y) < 1.2;
    let sx = (this.v.x * 0.5 + 0.5) * window.innerWidth + nudge;
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
    return inFrame;
  }
}
