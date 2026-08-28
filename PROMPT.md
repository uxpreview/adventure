# PROMPT — Session 4: THE COAST

You are continuing INKLANDS in `uxpreview/adventure`, branch
`claude/open-world-adventure-game-hsf9nj` (default; pushes auto-deploy
to Vercel project `adventure`). Read, in order: `design/QUALITY-BAR.md`
(binding), `PLAN.md`, `README.md`, `SESSIONS.md` (Session 3's gotchas
especially — the frame-top ceiling and the gate-fade helper). Story is
parked — this is a WORLD session.

## The job

LONGSHORE + THE WIDE BLUE, to the bar:

1. **LONGSHORE** — spec per `design/LAND-SPEC-TEMPLATE.md`, then
   rebuild. The coastline is the composition: the whole west edge of
   the sheet is one long seam between paper-sea and paper-sand, and it
   is currently a scatter of huts and umbrellas. It needs 4–7 named
   places — the boardwalk as a real place, the dune line, the
   footbridge where the river meets the sea, a jetty or wreck to walk
   out onto — and a shot that makes people want the walk.
2. **THE WIDE BLUE** — the ocean is a land you can wade the edge of,
   not a blue rectangle: the surf line, the regatta of sails at
   distance, gulls, something on the horizon worth squinting at.
   Watch the terrain shader's foam/crest bands — they are the land's
   ink and should be composed with, not fought.

Both lands are seen mostly from the coast road at speed, so the
sightline west matters more than density anywhere.

## The gate

Shoot wide/mid/detail per subject from the shipping camera (a
`tools/shoot-coast.mjs` on the Session 3 pattern), LOOK at every
image, run the hostile art-director critique per QUALITY-BAR §2, log
to `design/critiques/critique-art-3.md`, iterate to WOWED. Re-shoot
the protected framings (`tools/shoot-first-minute.mjs` 09/10 + title,
`tools/shoot-oldworld.mjs` 14/15 + the square) and diff before you
finish. Do not end the session on NOT YET with fixes unattempted.

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets; all marks via `src/engine/ink.ts`; washes only from
`palette.ts`; layout rects move only with a layout-wide audit; 60fps
mobile; build green before every push; no faces on doodle-folk; nothing
reads as an array; WOWED lands may not regress. End the session:
pushed, `SESSIONS.md` handoff updated, verdicts logged.
