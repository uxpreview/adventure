# PROMPT — Session 5: THE COAST

You are continuing INKLANDS in `uxpreview/adventure` on `main` — the
default branch, and what Vercel project `adventure` deploys to
production. Read, in order: `design/QUALITY-BAR.md` (binding),
`design/WORLD-SYSTEMS.md`, `PLAN.md`, `README.md`, `SESSIONS.md` —
Session 4's gotchas especially, because that session changed the ground
under every land and retired one of Session 3's rules. Story stays
parked until Session 7.

**This is a LAND session, and the first one authored on real ground.**
Session 4 gave the sheet a shape; this is the session that finds out
whether that was worth it.

## The job

**LONGSHORE and THE WIDE BLUE**, to spec, to WOWED.

1. **Write the specs** (`design/specs/`, per `LAND-SPEC-TEMPLATE.md`) —
   one pass, cheap, the spec serves the build. 4–7 named places each,
   with walks between them that earn their length.
2. **Author the coast's ground first.** `src/world/elevation.ts` already
   has the dune line (`duneX`) and a sea floor, and nothing else may
   invent a height. What it does not have yet is what makes a coast a
   coast: **a headland**, a **cliff path** that is only walkable because
   somebody cut it, and a **sheltered cove** behind the point. Author
   them in the sheet's vocabulary — a coast is where the page's wet
   margin cockled and tore, not where a hill happens to end — then run
   `node tools/check-terrain.mjs`.
3. **Then build the lands on it.** The boardwalk, the footbridge that
   already exists at (−200, 210), the regatta out on the water, the
   dune grass, the tide line. THE WIDE BLUE needs a reason to walk into
   it at all: what do you see from the water that you cannot see from
   the sand?
4. **Sound is place** (QUALITY-BAR §4): surf, gulls, halyards. At least
   one land-specific `Audio.event` each — and note that Session 4's
   audit deleted every dead case, so the file is now only what the world
   actually says. Add to it deliberately.
5. **Two idle motions and one that answers the player**, per land.

## The gate

Shoot with `tools/shoot-lib.mjs` (both viewports, free) — the coast's
own sheet plus the protected framings from
`tools/shoot-first-minute.mjs` and `tools/shoot-oldworld.mjs`. LOOK at
every image. Run the hostile art-director critique per QUALITY-BAR §2,
log it to `design/critiques/critique-art-4.md`, iterate to WOWED.
**The four WOWED lands may not regress.**

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets; all marks via `src/engine/ink.ts`; washes only from
`palette.ts`; `elevation.ts` is the only authority on where the ground
is and water may never climb a hill; layout rects move only with a
layout-wide audit; standees stay vertical, decals follow the surface;
a fold is drawn, not shaded; 60fps mobile with DPR capped at 2; build
green before every push; the walker has two dots and nobody else has a
face; nothing reads as an array; portrait is judged, not checked. End
the session: pushed, `SESSIONS.md` handoff updated, verdicts logged.
