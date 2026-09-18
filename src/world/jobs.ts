import type * as THREE from 'three';
import { notebook } from './notebook';
import { npcs } from './npc';
import { knowledge } from './knowledge';
import { say, shout } from '../ui/speech';
import { converse } from '../ui/converse';
import { toast } from '../ui/toast';
import { REGION_SPECS, type RegionId } from './layout';
import type { WorldPOI } from './regions';
import { stamps, STAMP_POIS } from './stamps';
import { toys, TOY_POIS } from './toys';
import { monsters } from './monsters';
import * as T from './jobs/triggers';
import type { JobSpec } from './jobs/triggers';
import { handle } from './handle'; /* THE THREE VERBS */
import { TIER1_JOBS } from './jobs/tier1';
import { tier1, hourKnown } from './tier1';
import { clock } from './daylight';
import { THE_LIST } from './thelist';
import { CIVIC_JOBS } from './jobs/civic';
import { WILDS_JOBS } from './jobs/wilds';
import { COAST_JOBS } from './jobs/coast';

/**
 * THINGS TO DO — the hub. A job registry with triggers (`jobs/*.ts`),
 * ticked once a frame from App; the collection (`stamps.ts`), the toys
 * (`toys.ts`) and the monsters (`monsters.ts`) are ticked from here so
 * App carries one insertion.
 *
 * A job is given when its person reaches the `asked` phase (the second
 * conversation): `notebook.job(...)`, pinned, made the objective. Each
 * step's trigger is watched while it is the next step; ticked, the
 * notebook says DONE and NEXT. The last step completes the job: the
 * reward is handed over, the person moves to `done`, and the world says
 * the consequence out loud — the person's own line if they are near,
 * the land's shout if not.
 *
 * THE TWELVE LINES. Every job hangs on a line of THE LIST
 * (`thelist.ts`), in his order, and the notebook heads it with that
 * line verbatim. Tier 1 (`jobs/tier1.ts`) is rebuilt on the story of
 * record: a PROMISE is the job from the first word its person says to
 * him, and only doing it keeps it. The other nine hang on their lines
 * with the steps they had, until their tier's session.
 *
 * Nell's line is the opening's (`opening.ts` gives and ticks it); it
 * is not here, and `landsDone` counts it like any other job.
 */

export type { JobSpec };

export type JobsCtx = {
  scene: THREE.Scene;
  root: HTMLElement;
  groundAt: (x: number, z: number) => number;
  waterAt: (x: number, z: number) => number;
  walker: () => { x: number; y: number; z: number };
  bicycle: { aboard: boolean };
  mounted: () => boolean;
  wake: (x: number, z: number) => void;
  blink: (cut: () => void) => void;
  started: () => boolean;
};

/** The registry, in the list's own order. */
const SPECS: JobSpec[] = [...TIER1_JOBS, ...CIVIC_JOBS, ...WILDS_JOBS, ...COAST_JOBS]
  .sort((a, b) => THE_LIST.findIndex((l) => l.id === a.line) - THE_LIST.findIndex((l) => l.id === b.line));
const LINE_OF = new Map(THE_LIST.map((l) => [l.id, l.line]));
/** Lands whose promise is rebuilt: a card's old door does not keep it. */
const PROMISE_LANDS = new Set<string>(SPECS.filter((s) => s.promise).map((s) => s.land));
const BY_GIVER = new Map(SPECS.map((s) => [s.giver, s]));
const BY_ID = new Map(SPECS.map((s) => [s.id, s]));

/** How many of the twelve lands are done: a job complete there, or its
 *  wait decided at a card. The 8:15 reads this; the notebook shows it. */
export function landsDone(): number {
  let n = 0;
  for (const spec of REGION_SPECS) if (landKept(spec.id as RegionId)) n++;
  return n;
}
/** Whether a land's line is kept: its job done, or (for a land whose
 *  promise is not rebuilt yet) its old wait decided. One rule, so the
 *  count on the toast and the strikes on THE LIST agree (gate round 6:
 *  "3 OF 12 KEPT" at the tarn with two lines struck). */
export function landKept(id: string): boolean {
  return notebook.list().some((j) => j.land === id && j.complete) || (!PROMISE_LANDS.has(id) && knowledge.decided(id));
}
export const LANDS_TOTAL = 12;

class Jobs {
  private ctx: JobsCtx | null = null;
  private doneWas = -1;
  private elapsed = 0;

  init(ctx: JobsCtx) {
    this.ctx = ctx;
    /* THE TALK, WRAPPED: every conversation goes through here so a job
     * can be given at the ask, a talk can tick a step, and a person
     * whose job is done can hint at a stamp. */
    npcs.onTalked = (id) => this.afterTalk(id);
    stamps.init(ctx.scene, ctx.groundAt);
    toys.init({ scene: ctx.scene, groundAt: ctx.groundAt, waterAt: ctx.waterAt, walker: ctx.walker, bicycle: ctx.bicycle, root: ctx.root });
    monsters.init({ scene: ctx.scene, groundAt: ctx.groundAt, walker: ctx.walker, wake: ctx.wake, blink: ctx.blink, started: ctx.started, mounted: ctx.mounted });
    this.doneWas = landsDone();
    tier1.install(ctx.walker);
  }

  /* ---- giving ------------------------------------------------------ */
  private afterTalk(id: string) {
    T.noteTalk(id);
    tier1.talked(id);
    const spec = BY_GIVER.get(id);
    if (!spec) return;
    const s = npcs.state(id);
    const have = notebook.list().find((j) => j.id === spec.id);
    /* a promise is the job from the first word; the rest still ask twice */
    if (!have && (spec.promise || s.phase === 'asked')) {
      this.give(spec);
      if (spec.firstTalkCounts) T.arm(spec.id, 0, 0.001);
    }
    // done with you: a hint at the nearest stamp still out
    /* (a promise's person has things of their own to say first: the
     * stamp comes up every third time) */
    if ((have?.complete || s.phase === 'done') && stamps.count < 12 && (!spec.promise || s.said % 3 === 0)) {
      const p = npcs.positionOf(id);
      const hint = stamps.hint(p?.x ?? 0, p?.z ?? 0);
      const speaker = npcs.speakerOf(id);
      if (hint && speaker) converse([{ who: speaker, text: hint }]);
    }
  }

  give(spec: JobSpec) {
    if (notebook.list().some((j) => j.id === spec.id)) return;
    notebook.job(this.jobDef(spec, 0));
    notebook.activate(spec.id);
    T.arm(spec.id, 0);
    try { window.dispatchEvent(new CustomEvent('inklands:event', { detail: 'page' })); } catch { /* no ears */ }
    /* THE THREE VERBS: the giver offers their own part with the job */
    if (spec.offer) {
      const n = npcs.get(spec.giver);
      handle.offer({
        id: spec.id, who: n?.def.name ?? spec.giver.toUpperCase(), speaker: n?.speaker ?? null,
        line: spec.offer.line, yes: spec.offer.yes, mine: spec.offer.mine,
      });
    }
  }

  /** The notebook's entry for a job whose next step is `i`: pinned
   *  where that step happens, or where the job as a whole does. */
  private jobDef(spec: JobSpec, i: number) {
    const sp = spec.steps[i]?.pin;
    const pin = (typeof sp === 'function' ? sp() : sp) ?? spec.pin;
    return {
      id: spec.id, name: spec.name, giver: npcs.get(spec.giver)?.def.name ?? spec.giver.toUpperCase(),
      steps: spec.steps.map((st) => (typeof st.text === 'function' ? st.text() : st.text)),
      reward: spec.reward, land: spec.land, pin,
      line: LINE_OF.get(spec.line),
    };
  }

  /** Gate round 1: a step with its own place moves the pin there. */
  private pinStep(spec: JobSpec, i: number) {
    const sp = spec.steps[i]?.pin;
    const pin = typeof sp === 'function' ? sp() : sp;
    const dynamic = typeof spec.steps[i]?.text === 'function';
    if (!pin && !dynamic) return;
    if (pin) notebook.place(pin.label, pin.x, pin.z, { quiet: true });
    notebook.job(this.jobDef(spec, i));
  }

  /* ---- the frame --------------------------------------------------- */
  tick(dt: number) {
    const ctx = this.ctx;
    if (!ctx || !ctx.started()) return;
    this.elapsed += dt;
    T.advance(dt);
    const w = ctx.walker();
    T.walker.x = w.x;
    T.walker.z = w.z;
    T.walker.y = w.y;

    for (const spec of SPECS) {
      const j = notebook.list().find((x) => x.id === spec.id);
      /* a place that starts it: the chain, read, is the old road */
      if (!j && spec.startsAt && notebook.listShown
        && Math.hypot(w.x - spec.startsAt.x, w.z - spec.startsAt.z) < spec.startsAt.r) this.give(spec);
      if (!j || j.complete) continue;
      const i = j.done;
      const step = spec.steps[i];
      if (!step) continue;
      if (T.armedAt(spec.id, i) < 0) T.arm(spec.id, i);
      T.current.jobId = spec.id;
      T.current.step = i;
      /* a step whose words hang on an answer (who takes the chain down)
       * is re-lettered when the answer changes them */
      if (typeof step.text === 'function' && step.text() !== j.steps[i]) notebook.job(this.jobDef(spec, i));
      if (!step.when()) continue;
      step.onDone?.();
      if (i + 1 >= spec.steps.length) this.complete(spec);
      else {
        /* the words first (what is next may hang on what was chosen),
         * then the tick, so the objective line letters the right step */
        this.pinStep(spec, i + 1);
        notebook.step(spec.id, i + 1);
        T.arm(spec.id, i + 1);
      }
    }

    // a land decided at a card without the job: its person is done too
    for (const spec of SPECS) {
      if (spec.promise) continue; // only doing it keeps it
      const s = npcs.state(spec.giver);
      if (s.phase !== 'done' && knowledge.decided(spec.land)) {
        npcs.set(spec.giver, { phase: 'done' });
        const j = notebook.list().find((x) => x.id === spec.id);
        if (j && !j.complete) this.complete(spec, true);
      }
    }

    const n = landsDone();
    if (n !== this.doneWas) {
      this.doneWas = n;
      toast(`${n} OF ${LANDS_TOTAL} KEPT`, 'job');
    }

    tier1.tick(dt);
    stamps.tick(this.elapsed);
    toys.tick(dt);
    monsters.tick(dt);
  }

  private complete(spec: JobSpec, quiet = false) {
    const j = notebook.list().find((x) => x.id === spec.id);
    if (!j || j.complete) return;
    notebook.complete(spec.id);
    npcs.set(spec.giver, { phase: 'done' });
    spec.onComplete?.();
    try { window.dispatchEvent(new CustomEvent('inklands:event', { detail: 'done' })); } catch { /* no ears */ }
    if (quiet || spec.doorEnds) return; // the VOICE reads a card door back itself
    this.readBack(spec);
  }

  /** The consequence, said: the person's line if they are near, the
   *  world's shout if not. */
  private readBack(spec: JobSpec) {
    const text = typeof spec.shout === 'function' ? spec.shout() : spec.shout;
    const n = npcs.get(spec.giver);
    if (n && T.nearPerson(spec.giver)) {
      const lines = n.def.lines(npcs.state(spec.giver));
      const line = lines[0];
      if (line) {
        say(n.speaker, line);
        notebook.heard(n.def.name, line);
        npcs.state(spec.giver).said = 1;
        notebook.dirty = true;
      }
      /* ONE VOICE: a promise kept in front of its person is theirs to
       * say; the world only says it when nobody is there to */
      if (!spec.promise) window.setTimeout(() => shout(text), 0);
      return;
    }
    shout(text);
  }

  /* ---- for the harness ------------------------------------------- */
  get debug() {
    return {
      specs: SPECS.map((s) => s.id),
      give: (id: string) => {
        const spec = BY_ID.get(id) ?? BY_GIVER.get(id);
        if (!spec) return false;
        npcs.set(spec.giver, { phase: 'asked', want: npcs.get(spec.giver)?.def.want });
        this.give(spec);
        return true;
      },
      complete: (id: string) => {
        const spec = BY_ID.get(id) ?? BY_GIVER.get(id);
        if (!spec) return false;
        if (!notebook.list().some((j) => j.id === spec.id)) this.give(spec);
        this.complete(spec);
        return true;
      },
      landsDone,
      stamps,
      toys,
      monsters,
    };
  }
}

export const jobs = new Jobs();

/** The places this pillar adds to the world, for App's list. */
export const JOB_POIS: WorldPOI[] = [
  {
    /* THE BELFRY BENCH: a seat in the yard, so Marget's hour can be
     * waited for at six times the pace. */
    x: -61.5, z: -46, radius: 3.4, label: 'THE BELFRY BENCH', labelHeight: 2.6,
    /* TIER 1: the bench is the first thing in the yard a foot reaches,
     * and until the lamps have been seen its verb is the yard's: wait */
    prompt: () => (hourKnown() ? 'SIT ON THE BENCH' : 'WAIT HERE FOR THE LAMPS'),
    wait: {
      until: () => hourKnown() || clock.lamp > 0.3,
      hint: 'waiting in the yard for the lamps — step away to stop',
      done: 'The lamps. One hand on that clock agrees with them.',
    },
    sit: { x: -61.5, z: -46 },
  } as unknown as WorldPOI,
];

export const THINGS_POIS: WorldPOI[] = [...JOB_POIS, ...STAMP_POIS, ...TOY_POIS];
