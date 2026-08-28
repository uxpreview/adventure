# PROMPT — Session 2: THE FIRST MINUTE

You are continuing INKLANDS in `uxpreview/adventure`, branch
`claude/open-world-adventure-game-hsf9nj` (default; pushes auto-deploy
to Vercel project `adventure`). Read, in order: `design/QUALITY-BAR.md`
(binding), `PLAN.md`, `README.md`, `SESSIONS.md`. Story is parked —
this is a WORLD session.

## The job

Take the two things every visitor sees first and hold them to the bar:

1. **THE COMMON** — the spawn land. Today it is a scatter draft: even
   grass, floating props, no composition. Spec it per
   `design/LAND-SPEC-TEMPLATE.md` (THE SHOT, 4–7 named places,
   composition plan, ink technique, motion, sound), then rebuild it.
   The crossroads, the well, and the oaks should become PLACES with
   weight — clustering, occlusion layers, deliberate voids, worn
   ground where feet have been, texture variants so no silhouette
   repeats in frame.
2. **The title framing + the northern horizon** — the title screen is
   the game's poster: compose it deliberately (walker, meadow
   foreground, Brim's wall and the castle stacked in the fog). Rebuild
   the KINGDOM's south face only as far as the vista needs (the wall,
   the gatehouse, roofline silhouettes behind it) — the town interior
   is Session 3.

Also fix while you are in there: the loader's fade overlapping the
title for a beat.

## The gate

When the build is green, shoot a contact sheet from the running game
(`tools/shoot.mjs` plus hand-framed walks via `?debug` /
`window.__inklands.goto`) — wide, mid, and detail per subject, plus the
title screen. LOOK at every image. Then run the hostile art-director
critique from `design/QUALITY-BAR.md` §2 against the screenshots, write
it to `design/critiques/critique-art-1.md` with a WOWED / NOT YET
verdict and mandatory fixes, and iterate until WOWED. Do not end the
session on NOT YET with fixes unattempted.

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets; all marks via `src/engine/ink.ts`; washes only from
`palette.ts`; layout rects move only with a layout-wide audit; 60fps
mobile; build green before every push; no faces on doodle-folk; nothing
reads as an array. End the session: pushed, `SESSIONS.md` handoff
updated, verdicts logged.
