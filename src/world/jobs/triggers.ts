import { knowledge } from '../knowledge';
import { things } from '../things';
import { notebook } from '../notebook';
import { npcs } from '../npc';
import { clock } from '../daylight';
import type { RegionId } from '../layout';

/**
 * THINGS TO DO — a job and what advances it.
 *
 * A job is `notebook.job(...)` plus a trigger per step: a place reached,
 * a person talked to, a thing carried somewhere, a door taken, an hour,
 * a score. `jobs.ts` ticks every step's `when` while it is the next
 * one, and the notebook shows the tick. The helpers here are the whole
 * vocabulary; a land's job file composes them.
 */

export type Trigger = () => boolean;

export type JobStep = {
  /** What the notebook shows: short, imperative, plain. */
  text: string;
  when: Trigger;
  /** Fired once, the frame the step is ticked. */
  onDone?: () => void;
};

export type JobSpec = {
  /** `job:marget` — readable, like everything else. */
  id: string;
  land: RegionId;
  /** The npc id of the person who gives it. */
  giver: string;
  /** THE EIGHTH POT, THE FIFTH BANNER: the name on the page. */
  name: string;
  steps: JobStep[];
  /** What you get, as the notebook writes it: `for: THE RED SCARF`. */
  reward?: string;
  pin?: { x: number; z: number; label: string };
  /** The world's line when it is done, if nobody is near to say it. */
  shout: string;
  /** Hands over the reward and changes the land. */
  onComplete?: () => void;
  /** True when the last step is a card door the VOICE already reads
   *  back, so the job does not say it twice. */
  doorEnds?: boolean;
};

/* ---- the clock the triggers read ---------------------------------- */
let elapsed = 0;
export const now = () => elapsed;
export const advance = (dt: number) => { elapsed += dt; };

/** The walker, set every frame by `jobs.ts`. */
export const walker = { x: 0, z: 0, y: 0 };

/** When each person was last talked to, on the trigger clock. */
const talked = new Map<string, number>();
export const noteTalk = (id: string) => { talked.set(id, elapsed); };

/** Each step arms when it becomes the next one; a talk before that
 *  does not count. */
const armed = new Map<string, number>();
export const arm = (jobId: string, step: number) => { armed.set(`${jobId}#${step}`, elapsed); };
export const armedAt = (jobId: string, step: number) => armed.get(`${jobId}#${step}`) ?? -1;

/** The step being evaluated, so `talkedTo` can compare against its arm
 *  time without every helper taking the job id. */
export const current = { jobId: '', step: 0 };

/* ---- the vocabulary ---------------------------------------------- */
export const reach = (x: number, z: number, r: number): Trigger =>
  () => Math.hypot(walker.x - x, walker.z - z) < r;

export const talkedTo = (npcId: string): Trigger =>
  () => (talked.get(npcId) ?? -1) > armedAt(current.jobId, current.step);

export const holding = (thingId: string): Trigger => () => things.held === thingId;

/** Carry `thingId` to within `r` of (x, z) — in hand, or set down there. */
export const carried = (thingId: string, x: number, z: number, r: number): Trigger => () => {
  const t = things.get(thingId);
  if (!t) return false;
  if (t.state === 'held') return Math.hypot(walker.x - x, walker.z - z) < r;
  if (t.state === 'ground') return Math.hypot(t.x - x, t.z - z) < r;
  return false;
};

export const known = (id: string): Trigger => () => knowledge.has(id);
export const decided = (land: RegionId): Trigger => () => knowledge.decided(land);

/** Between two o'clocks, wrapping midnight. */
export const hourBetween = (from: number, to: number): Trigger => () => {
  const h = clock.hour;
  return from <= to ? h >= from && h < to : h >= from || h < to;
};
export const atNight: Trigger = () => clock.lamp > 0.5;

export const scoreAtLeast = (toy: string, n: number): Trigger =>
  () => (notebook.scores[toy] ?? -Infinity) >= n;

export const foundAtLeast = (collection: string, n: number): Trigger =>
  () => (notebook.counts()[collection]?.have ?? 0) >= n;

export const namesKnown = (n: number): Trigger => () => {
  let k = 0;
  for (const id of ['ocean', 'beach', 'castle', 'kingdom', 'meadow', 'neighborhood', 'forest', 'canyon', 'downs', 'desert', 'city', 'office']) {
    if (knowledge.has(`name:${id}`)) k++;
  }
  return k >= n;
};

export const all = (...ts: Trigger[]): Trigger => () => ts.every((t) => t());
export const any = (...ts: Trigger[]): Trigger => () => ts.some((t) => t());

/** Whether a person is on the page and near enough to say something. */
export const nearPerson = (npcId: string, r = 45): boolean => {
  const p = npcs.positionOf(npcId);
  return !!p && p.present && Math.hypot(p.x - walker.x, p.z - walker.z) < r;
};

/* ---- a door taken by doing, not by a card ------------------------- */
import { CONSEQUENCES } from '../lines';
/** A job whose doing IS the land's first door writes that door: the
 *  land reads it and changes, the person's `chose:` line comes up, and
 *  the CHOICES page records what it did. */
export function takeDoor(land: RegionId, door: string, what: string) {
  if (knowledge.has(door)) return;
  knowledge.learn(door);
  npcs.doorTaken(land, door);
  notebook.chose(door, what, CONSEQUENCES[door]?.hint ?? '');
}
