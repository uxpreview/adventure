import { notebook } from './notebook';
import { npcs, type NpcState } from './npc';
import { say, shout, beckon, inFrame, type Speaker } from '../ui/speech';
import type { Page } from '../ui/converse';
import { toast } from '../ui/toast';
import { fallbackAsk } from '../ui/notebook';
import { knowledge } from './knowledge';
import { THE_LIST } from './thelist';
import { handle } from './handle'; /* THE THREE VERBS */
import { cameraRight } from '../engine/billboard';

/** Which way a world direction lies on the screen, in a player's words. */
function screenWay(dx: number, dz: number): 'LEFT' | 'RIGHT' | 'AHEAD' | 'BEHIND' {
  const [rx, rz] = cameraRight();
  const side = dx * rx + dz * rz;
  const ahead = dx * rz - dz * rx; // forward is right turned a quarter left
  if (Math.abs(side) >= Math.abs(ahead)) return side > 0 ? 'RIGHT' : 'LEFT';
  return ahead > 0 ? 'AHEAD' : 'BEHIND';
}
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

export type OpeningSave = { stage: OpeningStage; said: number; gateMine?: boolean; homeTalked?: boolean };

/** Where you wake: a bench on the green between the road and Nell's
 *  gate, facing the road. The note is tacked to its east upright. */
export const BENCH = { x: -26, z: 92 };
export const BENCH_NOTE = { x: BENCH.x + 1.24, z: BENCH.z };
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
/* (west of the washing line since it moved nearer the bench) */
const MORROW_PATH: [number, number][] = [[-60, 62], [-40, 74], [-30, 82], [-28.8, 88], [-31, 100], [-42, 112], [-45, 128]];
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
    /** Nell sat down on her basket: he said he would handle it. */
    nellSat: boolean;
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
  /** Put the walker (and whatever he is riding) a step aside. */
  stepAside: (x: number, z: number) => void;
  nameOpen: () => boolean;
  /** Ease the look toward a place, once; a hand on the lens cancels it. */
  lookAt: (x: number, z: number) => void;
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
  /** THE THREE VERBS: "I'll handle it." The gate is his to shut. */
  gateMine = false;
  private gateNudge = 0;
  /** SHE WAITS TO BE ASKED (the owner, 2026-09-18). Nell calls across
   *  the green once and the mark goes up over her; what she has to say
   *  is a conversation, and it starts when the walker goes and asks. */
  private called = false;
  private callAcc = 0;
  private calls = 0;
  /** After the gate: she has had her say, or has not yet. */
  private homeTalked = false;
  private homeWaited = 0;
  private listWaited = 0;

  /* ---- wiring --------------------------------------------------- */
  install(ctx: OpeningCtx) {
    this.ctx = ctx;
    const s = ctx.data().opening;
    if (s) {
      this.stage = s.stage;
      this.said = s.said ?? 0;
      this.gateMine = !!s.gateMine;
      this.homeTalked = !!s.homeTalked;
    }
    if (this.active) this.takeNell();
    notebook.hush = this.quiet;
    fallbackAsk.get = () => this.fallback();
    this.nudges = [
      {
        id: 'brim-wall', held: 0, last: -99,
        /* gate round 4: it fired ten strides from the arch and sent the
         * walker past it, in compass words a free camera makes
         * meaningless (the owner, 2026-09-12). Now: only well off the
         * gate, and LEFT / RIGHT / AHEAD / BEHIND as the screen has it. */
        test: (x, z, land) => ((land === 'meadow' || land === 'kingdom') && z < -2 && z > -17 && Math.abs(x + 45) > 14)
          ? `BRIM'S GATE IS ${screenWay(-45 - x, 0)} ALONG THE WALL, UNDER ITS NAME` : null,
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
          ? (this.gateMine ? 'THE GAP IS UNDER ITS NAME: THE FIELD GATE.' : 'THE GAP IS WHERE NELL STANDS.') : null,
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
    this.gateMine = false;
    this.homeTalked = false;
    this.called = false;
    this.calls = 0;
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

  /** THE BENCH'S MINUTE IS ONE VOICE (the owner, 2026-09-17: "in the
   *  first 10 seconds a ton of things pop up"). It was a land's card,
   *  two FOUND lines written across it, an objective, two place names,
   *  a prompt, the controls and Nell, all inside three seconds. While
   *  she is talking to a man on a bench nothing else is said: no place
   *  is named, nothing is FOUND, there is no objective, and the
   *  controls come when there is something to walk away from. */
  get quiet() {
    return this.stage === 'bench' || this.stage === 'named';
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
    notebook.hush = this.quiet;
    this.said = 0;
    this.save();
    fallbackAsk.refresh();
  }

  private save() {
    if (!this.ctx) return;
    this.ctx.data().opening = { stage: this.stage, said: this.said, gateMine: this.gateMine, homeTalked: this.homeTalked };
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
    n.def.converse = () => this.nellConverse();
    /* a bull is loose: she says her line over her head and he keeps his feet */
    n.def.barks = () => this.stage === 'named' || this.stage === 'bull' || this.stage === 'horse';
  }

  private giveNellBack() {
    const n = npcs.get('nell');
    if (!n || !this.origLines) return;
    n.def.lines = this.origLines;
    n.def.onTalk = undefined;
    n.def.converse = undefined;
    n.def.barks = undefined;
    this.origLines = null;
    this.wave(false);
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
        if (this.gateMine) return pick(['Your gate. You said.', 'Ride through it with him behind you. Once he\'s past the posts, E at the gate.', 'Past the posts. Then E. I\'m sat.']);
        return pick([
          'Get on the horse. It follows the horse. Bring it in through this gate, and I\'ll shut it behind it.',
          'In through the gate, well in. I\'ll do the rest.',
        ]);
      case 'home':
      case 'list':
        if (this.gateMine) return pick(['All of it, on your own. Same as ever.', 'I used to pen him myself, you know. I stopped when you started.', 'Keep the horse. You always did.']);
        return pick(['That\'s more like you.', 'Keep the horse. You always did.', 'Morrow\'s got a copy of your notebook. He got most of it wrong.']);
      default:
        return this.origLines ? this.origLines(npcs.state('nell')) : [];
    }
  }

  private onNellTalk() {
    this.said++;
    this.save();
    /* gate round 5: FAIL FORWARD. He said he would handle it and has
     * come back to her twice with the bull still out: she offers again.
     * Taking help is always on the table; the basket stays where she
     * left it. */
    if (this.gateMine && this.stage === 'horse' && this.said >= 2 && this.ctx) {
      const c = this.ctx;
      handle.offer({
        id: `nell-gate-again-${this.said}`, who: 'NELL', speaker: this.nell,
        line: 'Shall I get the gate after all?',
        yes: {
          label: 'GO ON, NELL. YOU GET IT.', said: 'Go on, Nell.', reply: 'There. That wasn\'t hard to say.',
          run: () => {
            this.gateMine = false;
            c.common.nellSat = false;
            c.common.nellAtGate = true;
            this.save();
          },
        },
        mine: {
          reply: 'Suit yourself. Past the posts, then E.',
          what: 'STILL MINE',
          cost: 'NELL STAYS SAT.',
          run: () => { /* she was already sat */ },
        },
        seconds: 12, unanswered: 'nothing', live: true,
      });
    }
  }

  /* ---- the bench --------------------------------------------------- */
  private waving = false;
  private wave(on: boolean) {
    const who = this.nell;
    if (who) beckon(who, on);
    if (this.waving !== on) { this.waving = on; fallbackAsk.refresh(); }
  }

  /** She calls across, once, and then she waits to be asked. */
  private call() {
    if (!this.ctx || this.stage !== 'bench' || this.called) return;
    this.called = true;
    this.callAcc = 0;
    this.nellSays('Oh. You\'re back.', 3.2);
    this.wave(true);
    fallbackAsk.refresh();
  }

  private greet() {
    /* the land's card has the page for its three seconds, alone; then
     * she calls, and the controls come, because now there is somewhere
     * to walk to */
    this.after(3.8, () => this.call());
    this.after(7.4, () => { if (this.stage === 'bench') this.controls(); });
  }

  private controls() {
    this.ctx?.showHint(this.ctx.touch
      ? 'drag low to walk · drag high to look'
      : 'wasd to walk · drag to look · E or a click to act', 7000);
  }

  /** What Nell has to say when she is asked, by stage. Null: her lines. */
  private nellConverse(): { pages: Page[]; then?: () => void } | null {
    const who = this.nell;
    if (!who || !this.ctx) return null;
    const nell = (text: string): Page => ({ who, text });
    if (this.stage === 'bench') {
      this.called = true;
      this.wave(false);
      if (this.name) return { pages: [nell(`${this.name}. You\'re back, then.`)], then: () => this.named(this.name, true) };
      return {
        pages: [
          { who: 'walker', text: 'Do I know you?' },
          nell('You said you\'d only be gone an hour.'),
          nell('It\'s been three years.'),
          nell('What do I call you? — You don\'t know. Course you don\'t.'),
        ],
        /* the card comes when she has finished asking, and he has read it */
        then: () => this.askName(),
      };
    }
    if (this.stage === 'home' && !this.homeTalked) {
      return {
        pages: [
          nell(this.gateMine ? 'All of it, on your own. Same as ever.' : 'I was beginning to think you weren\'t coming back.'),
          nell('Keep the horse. You always did.'),
        ],
        then: () => this.heardNellOut(),
      };
    }
    return null;
  }

  private askName() {
    if (!this.ctx || this.stage !== 'bench') return;
    if (this.name) { this.named(this.name, true); return; }
    npcs.mute('nell', true);
    this.ctx.openName((name) => this.named(name, false));
  }

  private named(name: string, reloaded: boolean) {
    if (!this.ctx) return;
    this.ctx.data().name = name;
    npcs.mute('nell', false);
    notebook.setName(name);
    this.ctx.persist();
    this.go('named');
    this.wave(false);
    if (!reloaded) {
      this.nellSays(`${name}, then. Right.`, 2.4);
      toast(`WRITTEN ON THE COVER: ${name.toUpperCase()}`, 'learned');
    }
    this.after(4.0, () => {
      if (!this.ctx) return;
      this.ctx.common.bull.hold = false;
      this.go('bull');
    });
  }

  /** After the gate, she has been heard out: the horse is his, and the
   *  green gets on with its evening (Morrow). */
  private heardNellOut() {
    if (this.homeTalked) return;
    this.homeTalked = true;
    this.wave(false);
    this.save();
    fallbackAsk.refresh();
    toast('H WHISTLES THE HORSE', 'learned');
    this.after(2.5, () => { this.walkbyDue = true; });
  }

  /* ---- the job ---------------------------------------------------- */
  private jobDef(pin: { x: number; z: number; label: string }) {
    /* THE TWELVE LINES: her job hangs on the second line of the list */
    return { id: JOB_ID, name: JOB_NAME, giver: GIVER, steps: STEPS, reward: REWARD, land: 'meadow' as RegionId, pin, line: THE_LIST.find((l) => l.id === 'nell')?.line };
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
      /* said once, short: the gate is hers to say when he is up and the
       * lens is on it (`tick`, the offer); the objective line letters
       * the step; the horse's own prompt is the key. It used to be this
       * line at twice the length, NEW JOB, the step again and the key
       * again, all at once. */
      this.nellSays('Get on the horse. The bull follows the horse.', 4.5);
      notebook.job(this.jobDef(PIN_GATE));
      notebook.activate(JOB_ID);
      this.go('horse');
    });
  }

  private bullIn = false;
  private inGap = false;
  /** Whether SHUT THE GATE is the thing the key does here and now. */
  get gateKey(): boolean {
    if (!this.ctx || !this.gateMine || this.stage !== 'horse') return false;
    const w = this.ctx.walker();
    return Math.hypot(w.x - PIN_GATE.x, w.z - PIN_GATE.z) < 9;
  }
  /** E at the gate, when the gate is his. It always works, if he does it. */
  shutGate() {
    if (!this.gateKey) return;
    if (!this.bullIn) {
      say('walker', 'Not yet. He\'s this side of it. Through the gate first, him behind me.', { now: true });
      return;
    }
    if (this.inGap && this.ctx) this.ctx.stepAside(this.ctx.walker().x < HEDGE_X ? HEDGE_X - 3.2 : HEDGE_X + 3.2, PIN_GATE.z + 3.6);
    handle.withdraw();
    this.penned();
  }

  private penned() {
    if (!this.ctx) return;
    handle.withdraw();
    npcs.mute('nell', false);
    this.ctx.common.pen();
    const w = this.ctx.walker();
    const inside = w.x > HEDGE_X && w.z > FIELD.minZ && w.z < FIELD.maxZ && w.x < FIELD.maxX;
    /* said last, and held, so the next line does not paint over it */
    if (inside) this.after(6.0, () => this.nellSays('You\'re in with it. Stile\'s at the top of the field, north.', 5));
    notebook.step(JOB_ID, 2);
    notebook.complete(JOB_ID, 'It went in. It always did, for you.');
    this.go('home');
    /* one line called over the gate, and the mark: the rest is hers to
     * say when he comes and asks. It was three lines on a clock, read or
     * not, and then a boy and a notebook on top of them. */
    this.homeTalked = false;
    this.homeWaited = 0;
    this.after(1.2, () => {
      this.nellSays('There. That\'s more like you.', 3);
      if (!this.homeTalked) this.wave(true);
      fallbackAsk.refresh();
    });
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
    /* he asks where he can be seen asking: in the frame, not from the
     * corner of the page */
    if (!W.said && md < 16 && inFrame({ x: wb.mx, z: wb.mz })) {
      W.said = true;
      const morrow = { name: 'MORROW', get x() { return wb.mx; }, get z() { return wb.mz; } };
      /* THE THREE VERBS: he asks, and does not stop for the answer */
      handle.offer({
        id: 'morrow-bridge', who: 'MORROW', speaker: morrow,
        line: 'Did you fix the bridge?',
        yes: { label: 'NOT YET.', said: 'Not yet.', reply: 'Didn\'t think so.' },
        mine: {
          reply: 'Already handled.',
          what: 'THE BRIDGE IS MINE',
          cost: 'MORROW DOES NOT LOOK ROUND. THE DOG GOES WITH HIM.',
          run: () => { W.dogPause = -1; W.dogPaused = true; },
        },
        seconds: 9, live: true,
      });
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
    /* THE NOTEBOOK IS HIS TO OPEN. It used to open itself over whatever
     * he was doing. Now the walker says it, the objective line says how,
     * and it opens itself only for somebody who has let half a minute go. */
    say('walker', 'The notebook. Under my coat.', { hold: 3.5 });
    toast(this.ctx.touch ? 'TAP NOTEBOOK' : 'N — YOUR NOTEBOOK', 'learned');
    this.listWasOpen = false;
    this.listWaited = 0;
  }

  private tickList(dt: number) {
    const c = this.ctx;
    if (!c) return;
    const open = c.notebookOpen();
    if (open) { this.listWasOpen = true; return; }
    if (!this.listWasOpen) {
      this.listWaited += dt;
      if (this.listWaited > 30) { this.listWaited = -999; c.openList(); }
      return;
    }
    // the page is shut again: the world opens
    this.go('done');
    for (const l of THE_LIST) notebook.place(l.pin.label, l.pin.x, l.pin.z, { quiet: true });
    notebook.place(PIN_BENCH.label, PIN_BENCH.x, PIN_BENCH.z, { seen: true, quiet: true });
    toast('PINNED: TWELVE PLACES. ANY ORDER.', 'place');
    c.common.note.second = true;
    this.after(2.0, () => {
      try { window.dispatchEvent(new CustomEvent('inklands:event', { detail: 'brim-bell' })); } catch { /* no ears */ }
    });
    this.after(3.4, () => {
      const line = 'That\'s the bell. Morrow rings it. He\'s had the hour wrong for three years.';
      const who = this.nell;
      // in earshot she says it; a field away, the world does
      if (who && say(who, line, { hold: 6 })) notebook.heard('NELL', line);
      else shout('BRIM\'S BELL. IT HAS THE HOUR WRONG.');
    });
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
        this.after(2.5, () => this.call());
        this.after(6, () => { if (this.stage === 'bench') this.controls(); });
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
        c.common.nellAtGate = this.stage === 'horse' && !this.gateMine;
        c.common.nellSat = this.gateMine;
        if (this.stage === 'horse' && !notebook.list().some((j) => j.id === JOB_ID)) {
          notebook.job(this.jobDef(PIN_GATE));
          notebook.activate(JOB_ID);
        }
        break;
      case 'home':
        c.common.nellAtGate = !this.gateMine;
        c.common.nellSat = this.gateMine;
        c.common.pen();
        if (!notebook.list().find((j) => j.id === JOB_ID)?.complete) notebook.complete(JOB_ID);
        if (this.homeTalked) this.after(3, () => { this.walkbyDue = true; });
        else this.after(1.5, () => { this.wave(true); fallbackAsk.refresh(); });
        break;
      case 'list':
        c.common.nellSat = this.gateMine;
        c.common.pen();
        notebook.listShown = true;
        this.after(1.5, () => c.openList());
        break;
      default:
        if (this.stage === 'done') c.common.nellSat = this.gateMine;
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
      case 'bench': {
        /* she calls again, twice, and then leaves it: the mark stays */
        if (!this.called || !this.waving || this.calls >= 2 || c.nameOpen()) break;
        this.callAcc += dt;
        if (this.callAcc > 24) {
          this.callAcc = 0;
          this.nellSays(['Well? Come over here, then.', 'I\'m not shouting it across the green.'][this.calls++], 3.2);
        }
        break;
      }
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
          /* THE LENS TURNS TO THE GATE, ONCE (the owner, 2026-09-17: "the
           * camera is always facing one direction unless the user moves
           * it"). The hedge runs away from a lens looking north and the
           * gate is a gap in it seen end on. Up in the saddle, at the
           * press that put him there, the look eases round to the gate
           * with Nell in it, and since the walk is relative to the lens,
           * forward is the gate. A hand on the lens cancels it, and it
           * never happens twice. */
          c.lookAt(PIN_GATE.x, PIN_GATE.z);
          /* THE THREE VERBS: her part is the gate, and she offers it.
           * Unanswered, she does it, as she always would have. */
          handle.offer({
            id: 'nell-gate', who: 'NELL', speaker: this.nell,
            line: 'Bring him in through this gate, well in. I\'ll shut it behind him.',
            yes: { label: 'YOU SHUT IT, NELL.', said: 'You shut it, Nell.' },
            mine: {
              reply: 'Course you will.',
              what: 'I SHUT THE GATE MYSELF',
              cost: 'NELL SITS DOWN ON HER BASKET. THE GATE IS YOURS.',
              run: () => {
                this.gateMine = true;
                c.common.nellAtGate = false;
                c.common.nellSat = true;
                this.save();
                toast('LEAD HIM THROUGH THE GATE. E AT THE GATE SHUTS IT BEHIND HIM.', 'learned');
              },
            },
            seconds: 9, live: true,
          });
        }
        /* PENNED: the bull is well inside the field — five units past
         * the hedge line — whether you are in there with it or not, and
         * nobody is standing in the gap. Nell shuts the gate; the field's
         * own clamp keeps it in. A walker shut in with it leaves over the
         * stile, and the nudge says so. */
        const bullIn = b.x > HEDGE_X + 5 && b.x < FIELD.maxX - 0.5 && b.z > FIELD.minZ + 0.3 && b.z < FIELD.maxZ - 0.5;
        const inGap = Math.abs(w.z - PIN_GATE.z) < 3.4 && Math.abs(w.x - HEDGE_X) < 2.4;
        /* his gate: "in" is past the posts, because a bull on a gallop's
         * tail is only ever a few strides behind the horse going out */
        /* gate round 5: the cold player tried ten times and never shut it.
         * The bull keeps pace with anything, so "in" is AT THE POSTS OR
         * PAST THEM, and a walker stood in the gap is stepped aside by
         * the leaf. It always works, if he does it. */
        this.bullIn = b.loose && b.x > HEDGE_X - 1.2 && b.x < FIELD.maxX - 0.5 && b.z > FIELD.minZ + 0.3 && b.z < FIELD.maxZ - 0.5;
        this.inGap = inGap;
        if (this.gateMine) {
          /* his gate: nothing shuts it but him. If he has forgotten, it
           * says so once in a while. */
          if (this.bullIn) {
            this.gateNudge += dt;
            if (this.gateNudge > 3 && this.gateKey) { this.gateNudge = -20; toast('HE IS THROUGH. E AT THE GATE, NOW.', 'place'); }
          } else if (this.gateNudge > 0) this.gateNudge = 0;
        } else if (bullIn && !inGap && b.loose) this.penned();
        else if (c.common.gate.shut && !b.loose) this.penned();
        break;
      }
      case 'home':
        /* the list always comes (gate round 4): a walker who never goes
         * back to her still gets Morrow, and the horse is still his */
        if (!this.homeTalked) {
          this.homeWaited += dt;
          const far = Math.hypot(w.x - BENCH.x, w.z - BENCH.z) > 60;
          if (this.homeWaited > 50 || far) this.heardNellOut();
        }
        this.tickWalkbyWait(dt);
        this.tickWalkby(dt);
        break;
      case 'list':
        this.tickList(dt);
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
    if (this.stage === 'bench') return this.waving ? { name: 'NELL', want: 'GO AND TALK TO HER' } : null;
    if (this.stage === 'home') return this.waving ? { name: 'NELL', want: 'GO AND TALK TO HER' } : null;
    if (this.stage === 'list') return { name: 'YOUR NOTEBOOK', want: this.ctx.touch ? 'TAP NOTEBOOK' : 'N OPENS IT' };
    if (this.stage === 'bull') return this.saidRun ? { name: 'NELL', want: 'RUN' } : null;
    if (this.stage !== 'done') return null;
    const w = this.ctx.walker();
    let best: (typeof THE_LIST)[number] | null = null;
    let bd = Infinity;
    for (const l of THE_LIST) {
      if (l.kept || notebook.crossed.includes(l.id) || npcs.state(l.id).phase === 'done' || knowledge.decided(l.land)
        || notebook.list().some((j) => j.land === l.land && j.complete)) continue;
      const d = Math.hypot(l.pin.x - w.x, l.pin.z - w.z);
      if (d < bd) { bd = d; best = l; }
    }
    return best ? { name: 'THE LIST', want: `${best.who}, ${best.pin.label}` } : null;
  }
}

export const opening = new Opening();
