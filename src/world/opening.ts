import { notebook } from './notebook';
import { npcs, type NpcState } from './npc';
import { say, type Speaker } from '../ui/speech';
import { toast } from '../ui/toast';
import { fallbackAsk } from '../ui/notebook';
import { knowledge } from './knowledge';
import { worn } from './worn';
import type { WorldPOI } from './regions';
import type { RegionId } from './layout';

/**
 * THE FIRST HOUR — the scripted first ten minutes, as a small state
 * machine App ticks after the voice. It reads the world (the bull, the
 * gate, notes read, the land underfoot, a door taken) and answers with
 * Nell's lines, one job in the notebook, the toasts that name a key
 * the first time it matters, and, at the end, three pins and a horse.
 *
 *   wake      you are in the long grass and the bull has seen you
 *   gate      Nell slammed it; talk to her (E)
 *   talk      she named the signpost (M); the job lands (N)
 *   signpost  read it at THE CROSSROADS
 *   border    take the south road into Maple Court
 *   stone     read the milestone over the border
 *   return    bring the fourth name back: her card
 *   chosen    the choice read back; the cap; then the world opens
 *   done      three people want something; the horse; nothing more
 *
 * Nell's lines while the opening runs come from here, not `lines.ts`
 * (her `lines` on the registry is replaced and put back at the end).
 * Nothing here touches the other eleven people.
 */

export type OpeningStage =
  | 'off' | 'wake' | 'gate' | 'talk' | 'signpost' | 'border' | 'stone' | 'return' | 'chosen' | 'done';

export type OpeningSave = { stage: OpeningStage; said: number };

export const JOB_ID = 'the-fourth-name';
export const JOB_NAME = 'THE FOURTH NAME';
const GIVER = 'NELL';
const REWARD = 'NELL\'S CAP';
const STEPS = [
  'READ THE SIGNPOST AT THE CROSSROADS',
  'TAKE THE SOUTH ROAD INTO MAPLE COURT',
  'READ THE MILESTONE',
  'BRING THE FOURTH NAME BACK TO NELL',
];

const PIN_CROSSROADS = { x: -42, z: 52, label: 'THE CROSSROADS' };
const PIN_MILESTONE = { x: -44.5, z: 123, label: 'THE MILESTONE' };
const PIN_GATE = { x: -13.2, z: 82.2, label: 'THE FIELD GATE' };
const PIN_SOUTH_GATE = { x: -45, z: -14, label: 'THE SOUTH GATE' };

/** Where the stone is drawn (the meadow builder draws it, a stride
 *  short of the border on the road's west verge). */
export const MILESTONE = { x: -46.6, z: 119.2 };

/** The one place the opening adds: over the border, on the road. Its
 *  reach stops a unit inside the Common, so reading it means crossing. */
export const OPENING_POIS: WorldPOI[] = [
  {
    x: PIN_MILESTONE.x, z: PIN_MILESTONE.z, radius: 5.5, label: 'THE MILESTONE',
    prompt: 'READ THE MILESTONE',
    note: {
      title: 'the milestone',
      body: 'brim 3. the sea 5. and under those, cut deeper and older than either: 8:15, and an arrow. the arrow points north, back the way you came, up the king\'s road, through brim, to wherever the road stops. a time, then, and a direction. that is more than the signpost had.',
    },
  },
];

/** The three the world opens on: a person, where to find them, which
 *  road. Pinned in pencil; the nearest is the objective line's fallback
 *  until somebody hands out a job. */
export const THREE_ASKS = [
  { id: 'marget', name: 'MARGET', label: 'BRIM SQUARE', x: -45, z: -82, road: 'north' },
  { id: 'joan', name: 'JOAN HARROW', label: 'THE HOME FIELD', x: 178, z: -24, road: 'east' },
  { id: 'val', name: 'VAL', label: 'MAPLE COURT', x: -78, z: 140, road: 'south' },
];

export type OpeningCtx = {
  walker: () => { x: number; y: number; z: number };
  regionId: () => RegionId;
  started: () => boolean;
  /** Note ids read (`Save.readNotes`) — a POI label, or a note title. */
  readNotes: () => string[];
  showHint: (text: string, holdMs?: number) => void;
  touch: boolean;
  /** The meadow's opening state (`regions/meadow.ts` `common`). */
  common: { bull: { state: string; t: number; face: number }; gate: { shut: boolean }; wake(): void };
  data: () => { opening?: OpeningSave | null };
  persist: () => void;
};

type Timer = { at: number; fn: () => void };
type Nudge = { id: string; test: (x: number, z: number, land: RegionId) => string | null; held: number; last: number };

const NELL_DOORS = ['door:the-cart-turned-north', 'door:the-cart-pushed'];

class Opening {
  stage: OpeningStage = 'off';
  private said = 0;
  private ctx: OpeningCtx | null = null;
  private elapsed = 0;
  private timers: Timer[] = [];
  private settled = false;
  private saidRun = false;
  private origLines: ((s: NpcState) => string[]) | null = null;
  private fallbackId: string | null = null;
  private fallbackAcc = 0;
  private nudges: Nudge[] = [];

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
        test: (x, z, land) => (land === 'meadow' && z < -2 && Math.abs(x + 45) > 7)
          ? `BRIM'S GATE IS ${x < -45 ? 'EAST' : 'WEST'} ALONG THE WALL, WHERE THE ROAD MEETS IT` : null,
      },
      {
        id: 'long-fence', held: 0, last: -99,
        test: (x, z, land) => (land === 'meadow' && x > -10 && x < 46 && z > 64 && z < 68.5)
          ? (ctx.common.gate.shut ? 'THE STILE IS EAST ALONG THE FENCE' : 'THE STILE IS EAST ALONG THE FENCE. THE GATE IS WEST.') : null,
      },
      {
        id: 'shut-gate', held: 0, last: -99,
        test: (x, z, land) => (land === 'meadow' && ctx.common.gate.shut && x > -11 && x < -6 && Math.abs(z - 82) < 6)
          ? 'THE GATE IS SHUT. THE STILE IS NORTH-EAST, ON THE LONG FENCE.' : null,
      },
    ];
  }

  /** A fresh page: SET OUT. */
  begin() {
    if (!this.ctx) return;
    // an old save's walker who already took Nell's door has had the
    // opening, whatever the save says
    if (NELL_DOORS.some((d) => knowledge.has(d))) {
      this.go('done');
      return;
    }
    this.timers.length = 0;
    this.saidRun = false;
    this.settled = true;
    this.go('wake');
    this.ctx.common.wake();
    this.takeNell();
  }

  /** Whether the opening prints its own control line, so App's old
   *  four-item hint stays quiet. */
  get handlesHint() {
    return this.stage !== 'off';
  }

  get active() {
    return this.stage !== 'off' && this.stage !== 'done';
  }

  /** The fourth name is in hand: Nell's place offers her card. */
  hasTheName() {
    return this.stage === 'return' || this.stage === 'chosen' || knowledge.has('fact:the-timetable');
  }

  private go(stage: OpeningStage) {
    if (this.stage === stage) return;
    this.stage = stage;
    this.said = 0;
    this.save();
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
      case 'wake':
      case 'gate':
        return ['Three names on that signpost I could go to tomorrow. It\'s the fourth I want. THE CROSSROADS — it\'s on your map.'];
      case 'talk':
        return ['Read it. Bring me the fourth name and I\'ll owe you.'];
      case 'signpost':
        return pick([
          'The signpost. Where the roads meet, west of here. M shows you.',
          'I\'ll be here. I\'m always here.',
        ]);
      case 'border':
      case 'stone':
        return pick([
          'A time, not a place. The milestone on the south road is older than the signpost. See what it says.',
          'South. Over the border. Then come back.',
        ]);
      default:
        return this.origLines ? this.origLines(npcs.state('nell')) : [];
    }
  }

  private onNellTalk() {
    switch (this.stage) {
      case 'wake':
      case 'gate':
        // E: talk taught. The line named the crossroads and the
        // registry pinned it; now the map is a key.
        toast('M FOR THE MAP', 'learned');
        this.go('talk');
        this.after(3.0, () => this.landJob());
        break;
      default:
        this.said++;
        this.save();
    }
  }

  /* ---- the job ---------------------------------------------------- */
  private jobDef(pin: { x: number; z: number; label: string }) {
    return { id: JOB_ID, name: JOB_NAME, giver: GIVER, steps: STEPS, reward: REWARD, land: 'meadow' as RegionId, pin };
  }

  private landJob() {
    if (this.stage !== 'talk') return;
    notebook.job(this.jobDef(PIN_CROSSROADS));
    notebook.activate(JOB_ID);
    toast('N — YOUR NOTEBOOK', 'learned');
    this.nellSays('Read it. Bring me the fourth name and I\'ll owe you.');
    this.go('signpost');
  }

  private readTheSignpost() {
    this.go('border');
    this.after(1.6, () => {
      say('walker', '8:15. That\'s not a place. That\'s a time.');
      notebook.step(JOB_ID, 1);
      notebook.place(PIN_MILESTONE.label, PIN_MILESTONE.x, PIN_MILESTONE.z);
      notebook.job(this.jobDef(PIN_MILESTONE));
    });
  }

  private crossedTheBorder() {
    toast('OVER THE BORDER: MAPLE COURT', 'found');
    notebook.step(JOB_ID, 2);
    this.go('stone');
  }

  private readTheMilestone() {
    this.go('return');
    this.after(1.6, () => {
      say('walker', 'A time, and an arrow. North.');
      notebook.step(JOB_ID, 3);
      notebook.place(PIN_GATE.label, PIN_GATE.x, PIN_GATE.z, { seen: true, quiet: true });
      notebook.job(this.jobDef(PIN_GATE));
    });
  }

  private doorTaken() {
    this.go('chosen');
    // the choice is read back by the voice (6–18 s); around it: the
    // job closes, the cap, and then the world
    this.after(1.4, () => notebook.complete(JOB_ID));
    this.after(4.0, () => {
      worn.take('nells-cap');
      this.nellSays('Have the cap. It was in the cart. Everything was in the cart.');
    });
    this.after(24, () => this.openTheWorld());
  }

  private openTheWorld() {
    if (this.stage !== 'chosen') return;
    this.nellSays('If you want more to do: MARGET, in Brim\'s square, north. JOAN HARROW, on the Downs, east. VAL, at the top of Maple Court, south.', 9);
    for (const a of THREE_ASKS) notebook.place(a.label, a.x, a.z, { quiet: true });
    notebook.place(PIN_SOUTH_GATE.label, PIN_SOUTH_GATE.x, PIN_SOUTH_GATE.z, { quiet: true });
    toast('THREE PEOPLE WANT SOMETHING. PICK ONE.', 'job');
    toast(`PINNED: ${THREE_ASKS.map((a) => a.label).join(', ').replace(/, ([^,]*)$/, ' AND $1')}`, 'place');
    this.after(6.5, () => {
      this.nellSays('And take the horse. It\'s at the crossroads. Whistle — H — and it comes to you.', 6);
      toast('H WHISTLES THE HORSE', 'learned');
      this.go('done');
      this.giveNellBack();
      npcs.set('nell', { phase: 'done' });
    });
  }

  /* ---- a reloaded page picks up where it was ------------------------ */
  private settle() {
    this.settled = true;
    if (!this.ctx) return;
    switch (this.stage) {
      case 'wake':
        this.ctx.common.wake();
        break;
      case 'talk':
        this.landJob();
        break;
      case 'chosen':
        if (!notebook.list().find((j) => j.id === JOB_ID)?.complete) {
          notebook.complete(JOB_ID);
          worn.take('nells-cap');
        }
        this.after(6, () => this.openTheWorld());
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
    const read = c.readNotes();
    switch (this.stage) {
      case 'wake': {
        /* THE BULL, EVERY TIME. The title's blink teleports the walker a
         * beat after SET OUT, and a bull that watched an empty field
         * went back to grazing (or lying down, at night). The moment
         * the walker is in the field, it is watching, and it charges
         * inside the second. */
        const b = c.common.bull;
        const inField = w.x >= -10 && w.x < 46 && w.z >= 65.6 && w.z < 112;
        if (inField && (b.state === 'graze' || b.state === 'lying')) { b.state = 'watch'; b.t = 0.7; b.face = -1; }
        if (c.common.bull.state === 'charge' && !this.saidRun) {
          this.saidRun = true;
          this.nellSays('RUN. THE GATE. NOW.', 3.2);
        }
        if (c.common.gate.shut) {
          this.go('gate');
          this.after(0.9, () => this.nellSays('That bull is mine. It went for you because you looked at it. It does that.'));
          this.after(3.4, () => c.showHint(
            c.touch ? 'drag low to walk · drag high to look · tap the prompt to talk' : 'wasd to walk · drag to look · E to talk · M map · N notebook',
            7500,
          ));
        }
        break;
      }
      case 'signpost':
        if (read.includes(PIN_CROSSROADS.label)) this.readTheSignpost();
        break;
      case 'border':
        if (read.includes(PIN_MILESTONE.label)) { this.crossedTheBorder(); this.readTheMilestone(); }
        else if (land === 'neighborhood') this.crossedTheBorder();
        break;
      case 'stone':
        if (read.includes(PIN_MILESTONE.label)) this.readTheMilestone();
        break;
      case 'return':
        if (NELL_DOORS.some((d) => knowledge.has(d))) this.doorTaken();
        break;
      default:
        break;
    }
    if (this.stage !== 'wake') this.nudge(dt, w.x, w.z, land);
    if (this.stage === 'done') {
      this.fallbackAcc += dt;
      if (this.fallbackAcc > 1) {
        this.fallbackAcc = 0;
        const id = this.fallback()?.name ?? null;
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
      if (n.id === 'brim-wall') notebook.place(PIN_SOUTH_GATE.label, PIN_SOUTH_GATE.x, PIN_SOUTH_GATE.z, { quiet: true });
    }
  }

  /** With no job, the objective line names the nearest of the three
   *  who has not been met yet. */
  private fallback(): { name: string; want: string } | null {
    if (this.stage !== 'done' || !this.ctx) return null;
    const w = this.ctx.walker();
    let best: (typeof THREE_ASKS)[number] | null = null;
    let bd = Infinity;
    for (const a of THREE_ASKS) {
      if (npcs.state(a.id).phase !== 'idle') continue;
      const d = Math.hypot(a.x - w.x, a.z - w.z);
      if (d < bd) { bd = d; best = a; }
    }
    return best ? { name: best.name, want: best.label } : null;
  }
}

export const opening = new Opening();
