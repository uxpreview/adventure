import { regionAt, SPEC_BY_ID, type RegionId } from './layout';
import { toast } from '../ui/toast';

/**
 * THE NOTEBOOK (VOICE) — what the walker has in hand: jobs, things
 * heard, places named, things found, choices made. Saved whole as one
 * field of the save. The page that draws it is `ui/notebook.ts`; this
 * is the state and the toasts that answer each change.
 */

export type JobDef = {
  id: string;
  name: string;
  giver: string;
  steps: string[];
  reward?: string;
  land?: RegionId;
  pin?: { x: number; z: number; label: string };
};

export type Job = JobDef & {
  /** Steps done: everything before this index is ticked. */
  done: number;
  complete: boolean;
  /** The line it ended on, if any. */
  line?: string;
};

export type Heard = { who: string; line: string; day: number };
export type Place = { label: string; x: number; z: number; land: string; seen: boolean };
export type Choice = { id: string; what: string; consequence: string; day: number };

export type NotebookSave = {
  jobs: Job[];
  heard: Heard[];
  places: Place[];
  found: Record<string, { items: string[]; of: number }>;
  choices: Choice[];
  scores: Record<string, number>;
  learned: string[];
  activeId: string | null;
  /** Who the walker has met and what they have been asked (`npc.ts`). */
  npcs: Record<string, unknown>;
};

const HEARD_CAP = 40;

/** The day the clock is on, when somebody has told us. */
let dayNow: () => number = () => 0;

class Notebook {
  jobs: Job[] = [];
  heardList: Heard[] = [];
  places: Place[] = [];
  foundMap: Record<string, { items: string[]; of: number }> = {};
  choices: Choice[] = [];
  scores: Record<string, number> = {};
  /** Plain-English lines for things learned, most recent last. */
  learned: string[] = [];
  npcs: Record<string, unknown> = {};
  private activeId: string | null = null;
  /** Set when anything changed, so App persists without polling. */
  dirty = false;
  /** The page and the objective line listen here. */
  private listeners: (() => void)[] = [];
  /** The page, once it exists (`ui/notebook.ts`). */
  ui: { open(): void; close(): void; toggle(): void; readonly isOpen: boolean } | null = null;

  onChange(fn: () => void) {
    this.listeners.push(fn);
  }
  private changed() {
    this.dirty = true;
    for (const fn of this.listeners) fn();
  }

  setDayClock(fn: () => number) {
    dayNow = fn;
  }

  /* ---- jobs ------------------------------------------------------- */
  job(def: JobDef) {
    const have = this.jobs.find((j) => j.id === def.id);
    if (have) {
      Object.assign(have, def);
      this.changed();
      return;
    }
    const j: Job = { ...def, steps: [...def.steps], done: 0, complete: false };
    this.jobs.push(j);
    if (!this.activeId) this.activeId = j.id;
    toast(`NEW JOB: ${j.name}`, 'job');
    if (j.pin) this.place(j.pin.label, j.pin.x, j.pin.z, { quiet: true });
    if (j.steps[0]) toast(`${j.giver} — ${j.steps[0]}`, 'plain');
    this.changed();
  }

  /** Marks steps < index done, toasts the next. */
  step(id: string, index: number) {
    const j = this.jobs.find((x) => x.id === id);
    if (!j || j.complete) return;
    const was = j.done;
    j.done = Math.max(j.done, Math.min(index, j.steps.length));
    if (j.done === was) return;
    if (j.steps[was]) toast(`DONE: ${j.steps[was]}`, 'done');
    const next = j.steps[j.done];
    if (next) toast(`NEXT: ${next}`, 'plain');
    this.changed();
  }

  complete(id: string, line?: string) {
    const j = this.jobs.find((x) => x.id === id);
    if (!j || j.complete) return;
    j.complete = true;
    j.done = j.steps.length;
    j.line = line;
    toast(`DONE: ${j.name}`, 'done');
    if (j.reward) toast(`YOURS: ${j.reward}`, 'found');
    if (line) toast(line, 'plain');
    if (this.activeId === id) {
      const next = this.jobs.find((x) => !x.complete);
      this.activeId = next ? next.id : null;
    }
    this.changed();
  }

  /** Make a job the one the objective line shows. */
  activate(id: string) {
    if (this.jobs.some((j) => j.id === id && !j.complete)) {
      this.activeId = id;
      this.changed();
    }
  }

  active(): Job | null {
    const a = this.jobs.find((j) => j.id === this.activeId && !j.complete);
    return a ?? this.jobs.find((j) => !j.complete) ?? null;
  }

  list(): Job[] {
    return [...this.jobs];
  }

  /* ---- heard ------------------------------------------------------ */
  heard(who: string, line: string) {
    this.heardList.unshift({ who, line, day: dayNow() });
    if (this.heardList.length > HEARD_CAP) this.heardList.length = HEARD_CAP;
    this.changed();
  }

  /* ---- places ----------------------------------------------------- */
  /** A pin on the map and a line under PLACES. `seen` = the walker
   *  stood there; otherwise somebody named it. */
  place(label: string, x: number, z: number, opts: { seen?: boolean; quiet?: boolean } = {}) {
    const key = label.toUpperCase();
    const have = this.places.find((p) => p.label === key);
    const land = regionAt(x, z).id;
    if (have) {
      const wasSeen = have.seen;
      have.x = x;
      have.z = z;
      have.land = land;
      if (opts.seen) have.seen = true;
      if (opts.seen && !wasSeen && !opts.quiet) toast(`FOUND: ${key}`, 'found');
      this.changed();
      return;
    }
    this.places.push({ label: key, x, z, land, seen: !!opts.seen });
    if (!opts.quiet) toast(opts.seen ? `FOUND: ${key}` : `PINNED: ${key}`, opts.seen ? 'found' : 'place');
    this.changed();
  }

  placeNamed(label: string): Place | null {
    const key = label.toUpperCase();
    return this.places.find((p) => p.label === key) ?? null;
  }

  /* ---- found ------------------------------------------------------ */
  found(collection: string, item: string, total: number) {
    const c = (this.foundMap[collection] ??= { items: [], of: total });
    c.of = total;
    if (c.items.includes(item)) return;
    c.items.push(item);
    toast(`FOUND: ${item} — ${c.items.length} OF ${total}`, 'found');
    this.changed();
  }

  /** A thing learned, in plain English (VOICE's knowledge labels). */
  learn(label: string) {
    if (this.learned.includes(label)) return;
    this.learned.push(label);
    this.changed();
  }

  /* ---- choices ---------------------------------------------------- */
  chose(id: string, what: string, consequence: string) {
    if (this.choices.some((c) => c.id === id)) return;
    this.choices.push({ id, what, consequence, day: dayNow() });
    toast(`YOU CHOSE: ${what}`, 'done');
    this.changed();
  }

  /* ---- scores ----------------------------------------------------- */
  score(toy: string, value: number): { best: number; isBest: boolean } {
    const best = this.scores[toy] ?? -Infinity;
    const isBest = value > best;
    if (isBest) this.scores[toy] = value;
    toast(isBest && best > -Infinity ? `${toy}: ${value} — A NEW BEST` : `${toy}: ${value}`, 'score');
    this.changed();
    return { best: Math.max(best, value), isBest };
  }

  counts(): Record<string, { have: number; of: number }> {
    const out: Record<string, { have: number; of: number }> = {};
    for (const [k, c] of Object.entries(this.foundMap)) out[k] = { have: c.items.length, of: c.of };
    return out;
  }

  /* ---- the page --------------------------------------------------- */
  open() { this.ui?.open(); }
  close() { this.ui?.close(); }
  toggle() { this.ui?.toggle(); }
  get isOpen() { return this.ui?.isOpen ?? false; }

  /* ---- the save --------------------------------------------------- */
  get saved(): NotebookSave {
    return {
      jobs: this.jobs, heard: this.heardList, places: this.places, found: this.foundMap,
      choices: this.choices, scores: this.scores, learned: this.learned, activeId: this.activeId, npcs: this.npcs,
    };
  }

  load(s: Partial<NotebookSave> | null | undefined) {
    if (!s) return;
    this.jobs = s.jobs ?? [];
    this.heardList = s.heard ?? [];
    this.places = s.places ?? [];
    this.foundMap = s.found ?? {};
    this.choices = s.choices ?? [];
    this.scores = s.scores ?? {};
    this.learned = s.learned ?? [];
    this.activeId = s.activeId ?? null;
    this.npcs = s.npcs ?? {};
    for (const fn of this.listeners) fn();
  }

  /** The land's name for a place's line. */
  landName(id: string): string {
    return SPEC_BY_ID[id as RegionId]?.name ?? id.toUpperCase();
  }
}

export const notebook = new Notebook();
