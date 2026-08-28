# PROMPT — Session 3: THE OLD WORLD

You are continuing INKLANDS in `uxpreview/adventure`, branch
`claude/open-world-adventure-game-hsf9nj` (default; pushes auto-deploy
to Vercel project `adventure`). Read, in order: `design/QUALITY-BAR.md`
(binding), `PLAN.md`, `README.md`, `SESSIONS.md` (Session 2's gotchas
especially). Story is parked — this is a WORLD session.

## The job

CASTLE GREYWEATHER + THE KINGDOM OF BRIM interior, to the bar:

1. **THE KINGDOM interior** — spec per `design/LAND-SPEC-TEMPLATE.md`,
   then rebuild: the square, the lanes, both gates as places. The
   Session 2 vista layer (rooflines, belfry, the false-perspective
   keep in `meadow.ts`) is a PLACEHOLDER your real town must replace
   seamlessly — the south-approach framings (`tools/
   shoot-first-minute.mjs` 09/10) are WOWED and may not regress.
   Add the gate-arch proximity fade Session 2 noted.
2. **CASTLE GREYWEATHER** — the keep approach is the game's flagship
   walk: spec it, rebuild it (keep, gatehouse, ridge wall, moat pool,
   banners taking the only wind).

## The gate

Shoot wide/mid/detail per subject from the shipping camera plus the
protected Session 2 framings, LOOK at every image, run the hostile
art-director critique per QUALITY-BAR §2, log to
`design/critiques/critique-art-2.md`, iterate to WOWED. Do not end the
session on NOT YET with fixes unattempted.

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets; all marks via `src/engine/ink.ts`; washes only from
`palette.ts`; layout rects move only with a layout-wide audit; 60fps
mobile; build green before every push; no faces on doodle-folk; nothing
reads as an array; WOWED lands may not regress. End the session:
pushed, `SESSIONS.md` handoff updated, verdicts logged.
