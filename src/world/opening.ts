import { notebook } from './notebook';
import { npcs, type NpcState } from './npc';
import { say, type Speaker } from '../ui/speech';
import { toast } from '../ui/toast';
import { fallbackAsk } from '../ui/notebook';
import { knowledge } from './knowledge';
import { THE_LIST } from './thelist';
import type { WorldPOI } from './regions';
import type { RegionId } from './layout';

/**
 * THE FIRST FIVE MINUTES — the opening on the story of record
 * (`design/foundation/08_Inklands_Story_Foundation_v1.md` §7), as a
 * small state machine App ticks after the voice.
 *
 *   bench   you wake sitting on a bench on the green, under a note in
 *           your own hand. Nell, hanging washing by the gate: "You're
 *           back." "It's been three years." She asks what to call you
 *   named   the name is lettered onto the notebook. The bull, loose on
 *           the green, has seen you
 *   bull    it comes for you. RUN. It knows you. Nell whistles the horse
 *   horse   GET IT HOME: get on the horse, and the bull follows the
 *           horse; lead it through the gate and Nell shuts it
 *   home    "That's more like you." Morrow goes past with the dog and
 *           does not stop
 *   list    the notebook's first page: TWELVE THINGS. THEN I CAN GO
 *           HOME. Twelve pins. The bell rings the wrong hour
 *   done    the world is open
 *
 * Nell's lines while the opening runs come from here, not `lines.ts`.
 * Nothing here touches the other eleven people.
 */

export type OpeningStage = 'off' | 'bench' | 'named' | 'bull' | 'horse' | 'home' | 'list' | 'done';

export type OpeningSave = { stage: OpeningStage; said: number };

/** Where you wake: a bench on the green between the road and Nell's
 *  gate, facing the road. The note is on its east end. */
export const BENCH = { x: -26, z: 92 };
export const BENCH_NOTE = { x: -23.7, z: 91.6 };
/** The milestone at the Common's south border (the meadow draws it). */
export const MILESTONE = { x: -46.6, z: 119.2 };

export const JOB_ID = 'get-it-home';
export const JOB_NAME = 'GET IT HOME';
const GIVER = 'NELL';
const REWARD = 'THE HORSE';
const STEPS = ['GET ON THE HORSE', 'LEAD THE BULL THROUGH THE GATE'];

const PIN_GATE = { x: -13.2, z: 82.2, label: 'THE FIELD GATE' };
const PIN_BENCH = { x: BENCH.x, z: BENCH.z, label: 'THE BENCH' };

/** THE FIELD, so the opening can tell a penned bull from a loose one
 *  (the same rect `regions/meadow.ts` keeps). */
const FIELD = { minX: -10, maxX: 46, minZ: 65.6, maxZ: 112 };
const HEDGE_X = -12;

/** Morrow's walk past, from the coast road's end, past the bench and
 *  the gate, and away east. He does not stop. */
const MORROW_PATH: [number, number][] = [[-60, 62], [-40, 74], [-28, 82], [-22, 88], [-30, 100], [-42, 112], [-45, 128]];
const MORROW_PACE = 3.4;
const DOG_GAP = 2.6;

/** The one place the opening adds beyond the meadow's own: the
 *  milestone over the south border, kept from before. */
export const OPENING_POIS: WorldPOI[] = [
  {
    x: -44.5, z: 123, radius: 5.5, label: 'THE MILESTONE',
    prompt: 'READ THE MILESTONE',
    note: {
      title: 'the milestone',
      body: 'brim 3. the sea 5. and under those, cut deeper and older than either: 8:15. no distance after it. somebody cut a time into a stone that only ever gave distances, and nobody has cut anything since.',
    },
  },
];

export type OpeningCtx = {
  walker: () => { x: number; y: number; z: number };
  regionId: () => RegionId;
  started: () => boolean;
  readNotes: () => string[];
  showHint: (text: string, holdMs?: number) => void;
  touch: boolean;
  /** The meadow's opening state (`regions/meadow.ts` `common`). */
  common: {
    bull: { x: number; z: number; state: string; t: number; face: number; loose: boolean; follow: boolean; hold: boolean; knocks: number };
    gate: { shut: boolean };
    walkby: { on: boolean; mx: number; mz: number; mpose: number; mface: -1 | 1; dx: number; dz: number; dpose: number; dface: -1 | 1 };
    note: { second: boolean };
    /** Nell stands at the gate (the job) rather than at her line. */
    nellAtGate: boolean;
    wake(): void;
    pen(): void;
    loose(): void;
  };
  data: () => { opening?: OpeningSave | null; name?: string | null };
  persist: () => void;
  /* ---- the verbs the opening needs from App ---- */
  mounted: () => boolean;
  whistleTo: (x: number, z: number) => void;
  sitOnBench: () => void;
  openName: (submit: (name: string) => void) => void;
  nameOpen: () => boolean;
  openList: () => void;
  notebookOpen: () => boolean;
};

type Timer = { at: number; fn: () => void };
type Nudge = { id: string; test: (x: number, z: number, land: RegionId) => string | null; held: number; last: number };

class Opening {
  stage: OpeningStage = 'off';
  private said = 0;
  private ctx: OpeningCtx | null = null;
  private elapsed = 0;
  private timers: Timer[] = [];
  private settled = false;
  private saidRun = false;
  private whistled = false;
  private mountedOnce = false;
  private origLines: ((s: NpcState) => string[]) | null = null;
  private fallbackId: string | null = null;
  private fallbackAcc = 0;
  private nudges: Nudge[] = [];
  /** Morrow's walk: distance along the path, and whether he has spoken. */
  private walk = { d: 0, said: false, dogPause: -1, dogPaused: false, t: 0 };
  private walkbyDue = false;
  private walkbyWaited = 0;
  private walkbyRuns = 0;
  private listWasOpen = false;

  /* ---- wiring --------------------------------------------------- */
  install(ctx: OpeningCtx) {
    this.ctx = ctx;
    const s = ctx.data().opening;
    if (s) {
      this.stage = s.stage;
      this.said = s.said ?? 0;
    }
    if (this.active) this.takeNell();
    fallbackAsk.get = () => this.fallback();
    this.nudges = [
      {
        id: 'brim-wall', held: 0, last: -99,
        test: (x, z, land) => ((land === 'meadow' || land === 'kingdom') && z < -2 && z > -17 && Math.abs(x + 45) > 2.6)
          ? `BRIM'S GATE IS ${x < -45 ? 'EAST' : 'WEST'} ALONG THE WALL, ON THE ROAD` : null,
      },
      {
        id: 'shut-gate', held: 0, last: -99,
        test: (x, z, land) => (land === 'meadow' && ctx.common.gate.shut
          && x > HEDGE_X && x < FIELD.maxX && z > FIELD.minZ + 3 && z < FIELD.maxZ)
          ? 'THE GATE IS SHUT. THE STILE IS ON THE LONG FENCE, NORTH.' : null,
      },
      {
        /* riding the hedge with the bull behind: the gap is the one
         * thing on it with a person in it */
        id: 'the-gap', held: 0, last: -99,
        test: (x, z, land) => (land === 'meadow' && this.stage === 'horse' && ctx.mounted()
          && Math.abs(x - HEDGE_X) < 9 && z > 60 && z < 116
          && !(Math.abs(z - PIN_GATE.z) < 3.4 && Math.abs(x - HEDGE_X) < 2.5))
          ? 'THE GAP IS WHERE NELL STANDS.' : null,
      },
    ];
  }

  /** A fresh page: SET OUT. */
  begin() {
    if (!this.ctx) return;
    this.timers.length = 0;
    this.saidRun = false;
    this.whistled = false;
    this.mountedOnce = false;
    this.settled = true;
    this.go('bench');
    this.ctx.common.wake();
    this.ctx.sitOnBench();
    this.takeNell();
    this.greet();
  }

  /** Whether the opening prints its own control line, so App's old
   *  four-item hint stays quiet. */
  get handlesHint() {
    return this.stage !== 'off';
  }

  get active() {
    return this.stage !== 'off' && this.stage !== 'done';
  }

  /** Kept for the meadow: no card at the gate any more. */
  hasTheName() {
    return false;
  }

  private go(stage: OpeningStage) {
    if (this.stage === stage) return;
    this.stage = stage;
    this.said = 0;
    this.save();
    fallbackAsk.refresh();
  }

  private save() {
    if (!this.ctx) return;
    this.ctx.data().opening = { stage: this.stage, said: this.said };
    this.ctx.persist();
  }

  private after(sec: number, fn: () => void) {
    this.timers.push({ at: this.elapsed + sec, fn });
  }

  private get nell(): Speaker | null {
    return npcs.speakerOf('nell');
  }

  private nellSays(line: string, hold?: number) {
    const who = this.nell;
    if (!who) return;
    say(who, line, hold ? { hold } : undefined);
    notebook.heard('NELL', line);
  }

  private get name(): string {
    return this.ctx?.data().name ?? '';
  }

  /* ---- Nell's lines, by stage ------------------------------------- */
  private takeNell() {
    const n = npcs.get('nell');
    if (!n || this.origLines) return;
    this.origLines = n.def.lines;
    n.def.lines = (s) => this.nellLines(s);
    n.def.onTalk = () => this.onNellTalk();
  }

  private giveNellBack() {
    const n = npcs.get('nell');
    if (!n || !this.origLines) return;
    n.def.lines = this.origLines;
    n.def.onTalk = undefined;
    this.origLines = null;
  }

  private nellLines(s: NpcState): string[] {
    void s;
    const pick = (lines: string[]) => [lines[Math.min(this.said, lines.length - 1)]];
    switch (this.stage) {
      case 'bench':
        /* the timed lines are hers to say; E gets something else, so a
         * press is always answered (gate round 4: E "did nothing twice") */
        return pick(['Don\'t look at me like that.', 'Three years, and you just stand there.', 'Well. Go on.']);
      case 'named':
      case 'bull':
        return pick(['Mind the bull. It knows you.', 'RUN.']);
      case 'horse':
        return pick([
          'Get on the horse. It follows the horse. Bring it in through this gate, and I\'ll shut it behind it.',
          'In through the gate, well in. I\'ll do the rest.',
        ]);
      case 'home':
      case 'list':
        return pick(['That\'s more like you.', 'Keep the horse. You always did.', 'Morrow\'s got a copy of your notebook. He got most of it wrong.']);
      default:
        return this.origLines ? this.origLines(npcs.state('nell')) : [];
    }
  }

  private onNellTalk() {
    this.said++;
    this.save();
  }

  /* ---- the bench --------------------------------------------------- */
  private greet() {
    this.after(1.6, () => this.nellSays('Oh. You\'re back.'));
    this.after(2.2, () => this.ctx?.showHint(this.ctx.touch ? 'drag low to walk · drag high to look' : 'wasd to walk · drag to look · E to act', 6000));
    this.after(4.8, () => this.nellSays('You said you\'d only be gone an hour.'));
    this.after(8.4, () => this.nellSays('It\'s been three years.', 3.4));
    this.after(11.6, () => this.askName());
  }

  private askName() {
    if (!this.ctx || this.stage !== 'bench') return;
    if (this.name) { this.named(this.name, true); return; }
    this.nellSays('What do I call you? — You don\'t know. Course you don\'t.', 3.2);
    this.after(2.2, () => {
      if (!this.ctx || this.stage !== 'bench') return;
      this.ctx.openName((name) => this.named(name, false));
    });
  }

  private named(name: string, reloaded: boolean) {
    if (!this.ctx) return;
    this.ctx.data().name = name;
    notebook.setName(name);
    this.ctx.persist();
    this.go('named');
    if (!reloaded) {
      this.nellSays(`${name}, then. Right.`, 2.4);
      toast(`WRITTEN ON THE COVER: ${name.toUpperCase()}`, 'learned');
    }
    this.after(2.0, () => {
      if (!this.ctx) return;
      this.ctx.common.bull.hold = false;
      this.go('bull');
    });
  }

  /* ---- the job ---------------------------------------------------- */
  private jobDef(pin: { x: number; z: number; label: string }) {
    return { id: JOB_ID, name: JOB_NAME, giver: GIVER, steps: STEPS, reward: REWARD, land: 'meadow' as RegionId, pin };
  }

  private whistle() {
    if (!this.ctx || this.whistled) return;
    this.whistled = true;
    const w = this.ctx.walker();
    this.nellSays('It knows you. Hang on —', 2.0);
    this.ctx.whistleTo(w.x, w.z);
    // she goes to the gate, and her prompt gets out of the horse's way
    this.ctx.common.nellAtGate = true;
    npcs.mute('nell', true);
    this.after(1.4, () => {
      this.nellSays('Get on the horse. It follows the horse. Bring it in through this gate, and I\'ll shut it behind it.', 7);
      notebook.job(this.jobDef(PIN_GATE));
      notebook.activate(JOB_ID);
      toast('E — GET ON THE HORSE WHEN IT COMES', 'learned');
      this.go('horse');
    });
  }

  private penned() {
    if (!this.ctx) return;
    npcs.mute('nell', false);
    this.ctx.common.pen();
    const w = this.ctx.walker();
    const inside = w.x > HEDGE_X && w.z > FIELD.minZ && w.z < FIELD.maxZ && w.x < FIELD.maxX;
    /* said last, and held, so the next line does not paint over it */
    if (inside) this.after(13.0, () => this.nellSays('You\'re in with it. Stile\'s at the top of the field, north.', 5));
    notebook.step(JOB_ID, 2);
    notebook.complete(JOB_ID, 'It went in. It always did, for you.');
    this.go('home');
    this.after(1.2, () => this.nellSays('There. That\'s more like you.', 3));
    this.after(4.6, () => this.nellSays('I was beginning to think you weren\'t coming back.', 4));
    this.after(9.0, () => {
      this.nellSays('Keep the horse. You always did.', 3.5);
      toast('H WHISTLES THE HORSE', 'learned');
    });
    this.after(11.5, () => { this.walkbyDue = true; });
  }

  /** Morrow's walk is for the walker to see: it waits until they are
   *  out of the field and near the green, and if it ran and they were
   *  not there for it, it runs once more. */
  private tickWalkbyWait(dt: number) {
    const c = this.ctx;
    if (!c || !this.walkbyDue || c.common.walkby.on) return;
    this.walkbyWaited += dt;
    const w = c.walker();
    const inField = w.x > HEDGE_X - 1 && w.x < FIELD.maxX && w.z > FIELD.minZ && w.z < FIELD.maxZ;
    const near = Math.hypot(w.x - BENCH.x, w.z - BENCH.z) < 48;
    /* thirty seconds is as long as he waits for anybody: a walker who
     * has gone to Brim still gets the list (gate round 4 never saw it) */
    if ((inField || !near || c.notebookOpen()) && this.walkbyWaited < 30) return;
    this.walkbyDue = false;
    this.walkbyWaited = 0;
    this.startWalkby();
  }

  /* ---- Morrow goes past ------------------------------------------- */
  private startWalkby() {
    if (!this.ctx || this.stage !== 'home') return;
    this.walk = { d: 0, said: false, dogPause: -1, dogPaused: false, t: 0 };
    this.walkbyRuns++;
    const wb = this.ctx.common.walkby;
    wb.on = true;
    const [x, z] = MORROW_PATH[0];
    wb.mx = x; wb.mz = z; wb.dx = x - 2; wb.dz = z + 0.6;
  }

  private pathAt(d: number): { x: number; z: number; face: -1 | 1; end: boolean } {
    let acc = 0;
    for (let i = 0; i < MORROW_PATH.length - 1; i++) {
      const [x0, z0] = MORROW_PATH[i];
      const [x1, z1] = MORROW_PATH[i + 1];
      const L = Math.hypot(x1 - x0, z1 - z0);
      if (d <= acc + L) {
        const k = (d - acc) / L;
        return { x: x0 + (x1 - x0) * k, z: z0 + (z1 - z0) * k, face: x1 >= x0 ? 1 : -1, end: false };
      }
      acc += L;
    }
    const [x, z] = MORROW_PATH[MORROW_PATH.length - 1];
    return { x, z, face: 1, end: true };
  }

  private tickWalkby(dt: number) {
    const c = this.ctx;
    if (!c) return;
    const wb = c.common.walkby;
    if (!wb.on) return;
    const W = this.walk;
    W.t += dt;
    W.d += MORROW_PACE * dt;
    const m = this.pathAt(W.d);
    wb.mx = m.x; wb.mz = m.z; wb.mface = m.face;
    wb.mpose = Math.floor(W.t / 0.32) % 2;
    const w = c.walker();
    const md = Math.hypot(w.x - m.x, w.z - m.z);
    if (!W.said && md < 16) {
      W.said = true;
      say({ name: 'MORROW', get x() { return wb.mx; }, get z() { return wb.mz; } }, 'Did you fix the bridge?', { hold: 3.2 });
      notebook.heard('MORROW', 'Did you fix the bridge?');
    }
    // the dog: behind him, until it notices you; then it stops, and
    // looks, and goes after him again
    const dd = Math.hypot(w.x - wb.dx, w.z - wb.dz);
    if (W.dogPause < 0 && !W.dogPaused && dd < 7) { W.dogPause = 1.8; W.dogPaused = true; }
    if (W.dogPause > 0) {
      W.dogPause -= dt;
      wb.dpose = 3;
      wb.dface = w.x < wb.dx ? -1 : 1;
    } else {
      const target = this.pathAt(Math.max(0, W.d - DOG_GAP));
      const gx = target.x - wb.dx;
      const gz = target.z - wb.dz;
      const g = Math.hypot(gx, gz);
      const speed = g > 4 ? 6.4 : MORROW_PACE;
      const step = Math.min(g, speed * dt);
      if (g > 0.05) { wb.dx += (gx / g) * step; wb.dz += (gz / g) * step; wb.dface = gx >= 0 ? 1 : -1; }
      wb.dpose = g > 4 ? 2 : g > 0.3 ? 1 : 0;
    }
    if (m.end || (W.said && W.d > 70) || W.t > 40) {
      wb.on = false;
      // he went past and nobody was there to see it: once more, later,
      // unless they have left the green altogether
      const far = Math.hypot(w.x - BENCH.x, w.z - BENCH.z) > 60;
      if (!W.said && this.walkbyRuns < 2 && !far) { this.after(6, () => { this.walkbyDue = true; }); return; }
      this.openTheList();
    }
  }

  /* ---- the list --------------------------------------------------- */
  private openTheList() {
    if (!this.ctx || this.stage !== 'home') return;
    this.go('list');
    notebook.listShown = true;
    notebook.dirty = true;
    toast('N — YOUR NOTEBOOK', 'learned');
    this.listWasOpen = false;
    this.after(1.2, () => { this.ctx?.openList(); });
  }

  private tickList() {
    const c = this.ctx;
    if (!c) return;
    const open = c.notebookOpen();
    if (open) { this.listWasOpen = true; return; }
    if (!this.listWasOpen) return;
    // the page is shut again: the world opens
    this.go('done');
    for (const l of THE_LIST) notebook.place(l.pin.label, l.pin.x, l.pin.z, { quiet: true });
    notebook.place(PIN_BENCH.label, PIN_BENCH.x, PIN_BENCH.z, { seen: true, quiet: true });
    toast('PINNED: TWELVE PLACES. ANY ORDER.', 'place');
    c.common.note.second = true;
    this.after(2.0, () => {
      try { window.dispatchEvent(new CustomEvent('inklands:event', { detail: 'brim-bell' })); } catch { /* no ears */ }
    });
    this.after(3.4, () => this.nellSays('That\'s the bell. Morrow rings it. He\'s had the hour wrong for three years.', 6));
    this.after(7.0, () => {
      this.giveNellBack();
      npcs.set('nell', { phase: 'met' });
      fallbackAsk.refresh();
    });
  }

  /* ---- a reloaded page picks up where it was ------------------------ */
  private settle() {
    this.settled = true;
    const c = this.ctx;
    if (!c) return;
    switch (this.stage) {
      case 'bench':
        c.common.wake();
        c.sitOnBench();
        this.after(2.5, () => this.askName());
        break;
      case 'named':
        c.common.loose();
        c.common.bull.hold = false;
        this.go('bull');
        break;
      case 'bull':
      case 'horse':
        c.common.loose();
        c.common.bull.hold = false;
        this.whistled = this.stage === 'horse';
        c.common.nellAtGate = this.stage === 'horse';
        if (this.stage === 'horse' && !notebook.list().some((j) => j.id === JOB_ID)) {
          notebook.job(this.jobDef(PIN_GATE));
          notebook.activate(JOB_ID);
        }
        break;
      case 'home':
        c.common.nellAtGate = true;
        c.common.pen();
        if (!notebook.list().find((j) => j.id === JOB_ID)?.complete) notebook.complete(JOB_ID);
        this.after(3, () => { this.walkbyDue = true; });
        break;
      case 'list':
        c.common.pen();
        notebook.listShown = true;
        this.after(1.5, () => c.openList());
        break;
      default:
        break;
    }
  }

  /* ---- the frame -------------------------------------------------- */
  tick(dt: number) {
    const c = this.ctx;
    if (!c || !c.started()) return;
    this.elapsed += dt;
    if (!this.settled) this.settle();
    if (this.timers.length) {
      const due = this.timers.filter((t) => t.at <= this.elapsed);
      if (due.length) {
        this.timers = this.timers.filter((t) => t.at > this.elapsed);
        for (const t of due) t.fn();
      }
    }
    const w = c.walker();
    const land = c.regionId();
    const b = c.common.bull;
    switch (this.stage) {
      case 'bull': {
        if (b.state === 'charge' && !this.saidRun) {
          this.saidRun = true;
          this.nellSays('RUN.', 2.4);
          window.dispatchEvent(new CustomEvent('inklands:run-now'));
          this.after(2.6, () => this.whistle());
        }
        // it reached you before it charged twice: whistle sooner
        if (b.knocks > 0 && !this.whistled) this.whistle();
        break;
      }
      case 'horse': {
        const mounted = c.mounted();
        b.follow = mounted;
        if (mounted && !this.mountedOnce) {
          this.mountedOnce = true;
          npcs.mute('nell', false);
          notebook.step(JOB_ID, 1);
          this.nellSays('Now bring it here. In through the gate, well in.', 4);
        }
        /* PENNED: the bull is well inside the field — five units past
         * the hedge line — whether you are in there with it or not, and
         * nobody is standing in the gap. Nell shuts the gate; the field's
         * own clamp keeps it in. A walker shut in with it leaves over the
         * stile, and the nudge says so. */
        const bullIn = b.x > HEDGE_X + 5 && b.x < FIELD.maxX - 0.5 && b.z > FIELD.minZ + 0.3 && b.z < FIELD.maxZ - 0.5;
        const inGap = Math.abs(w.z - PIN_GATE.z) < 3.4 && Math.abs(w.x - HEDGE_X) < 2.4;
        if (bullIn && !inGap && b.loose) this.penned();
        else if (c.common.gate.shut && !b.loose) this.penned();
        break;
      }
      case 'home':
        this.tickWalkbyWait(dt);
        this.tickWalkby(dt);
        break;
      case 'list':
        this.tickList();
        break;
      default:
        break;
    }
    this.nudge(dt, w.x, w.z, land);
    if (this.stage === 'done') {
      this.fallbackAcc += dt;
      if (this.fallbackAcc > 1) {
        this.fallbackAcc = 0;
        const id = this.fallback()?.want ?? null;
        if (id !== this.fallbackId) { this.fallbackId = id; fallbackAsk.refresh(); }
      }
    }
  }

  /** A wall or a fence is never a dead end for more than two seconds. */
  private nudge(dt: number, x: number, z: number, land: RegionId) {
    for (const n of this.nudges) {
      const text = n.test(x, z, land);
      if (!text) { n.held = 0; continue; }
      n.held += dt;
      if (n.held < 2.2 || this.elapsed - n.last < 45) continue;
      n.last = this.elapsed;
      toast(text, 'place');
    }
  }

  /** With no job, the objective line names the nearest line of the
   *  list whose person is not done with you. */
  private fallback(): { name: string; want: string } | null {
    if (!this.ctx) return null;
    if (this.stage === 'bench') return { name: 'NELL', want: 'AT THE WASHING LINE' };
    if (this.stage === 'bull') return this.saidRun ? { name: 'NELL', want: 'RUN' } : null;
    if (this.stage !== 'done') return null;
    const w = this.ctx.walker();
    let best: (typeof THE_LIST)[number] | null = null;
    let bd = Infinity;
    for (const l of THE_LIST) {
      if (l.kept || npcs.state(l.id).phase === 'done' || knowledge.decided(l.land)
        || notebook.list().some((j) => j.land === l.land && j.complete)) continue;
      const d = Math.hypot(l.pin.x - w.x, l.pin.z - w.z);
      if (d < bd) { bd = d; best = l; }
    }
    return best ? { name: 'THE LIST', want: `${best.who}, ${best.pin.label}` } : null;
  }
}

export const opening = new Opening();
