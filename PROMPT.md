# PROMPT — Session 4: THE PAPER HAS A SHAPE

You are continuing INKLANDS in `uxpreview/adventure`, branch
`claude/open-world-adventure-game-hsf9nj` (default; pushes auto-deploy
to Vercel project `adventure`). Read, in order: `design/QUALITY-BAR.md`
(binding), `design/WORLD-SYSTEMS.md` (the standing systems plan, new),
`PLAN.md`, `README.md`, `SESSIONS.md` (Session 3's gotchas especially —
the frame-top ceiling and `passFade`). Story stays parked until Session
7.

**This is a FOUNDATIONS session, not a land session.** Nothing here
adds a new land; everything here changes how every future land is
authored. That is why it comes before the coast.

## The job

1. **Terrain elevation.** Give the sheet a shape, per WORLD-SYSTEMS §1:
   crease, curl, buckle, tear, and things under the page. Low amplitude
   (~0–12 units) with two or three authored exceptions. Add
   `heightAt(x, z)` to `Terrain` and route it through the *centralised*
   placement helpers in `src/world/regions/index.ts` (`ctx.standee`,
   `ctx.decal`, the field setters) so twelve region builders do not each
   need editing. Standees stay **vertical** on slopes. Lift footprints,
   the character controller and collision; steep becomes impassable.
2. **The camera, redesigned around it.** The frame-top ceiling
   (Session 3) is an unchosen constant and elevation breaks it anyway.
   Make elevation, pitch and fog designed parameters: rising ground must
   actually reveal more, and the camera must follow the surface without
   seasickness.
3. **Mobile and desktop parity.** Now a standing law in the bar. Extend
   the shoot tooling so every contact sheet renders **portrait
   (390×844) as well as desktop (1280×720)**, and judge both. Fix what
   portrait exposes.
4. **Execute the inheritance audit** (WORLD-SYSTEMS, "The inheritance
   audit"): delete `AudioDirector` and the ~60 dead `Audio.event` cases,
   retire the two-blues forgery contract in `palette.ts` and the
   smudge-auto-on rule in `ink.ts` (keep the *effect*), and re-word the
   no-faces rule's violation. Keep everything the audit says to keep.
5. **Re-audit the four WOWED lands on the new ground** — THE COMMON,
   Brim's south face, Brim interior, Greyweather — and **put Greyweather
   on a real ridge** instead of the drawn crags standing in for one.

## The gate

Re-shoot every protected framing (`tools/shoot-first-minute.mjs`,
`tools/shoot-oldworld.mjs`) in both viewports, LOOK at every image, and
run the hostile art-director critique per QUALITY-BAR §2 on the
elevation work and the re-audited lands. Log to
`design/critiques/critique-art-3.md`, iterate to WOWED. **A WOWED land
that elevation regresses is the session's problem to fix, not to note.**

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets; all marks via `src/engine/ink.ts`; washes only from
`palette.ts`; layout rects move only with a layout-wide audit; 60fps
mobile with DPR capped at 2; build green before every push; the walker
has two dots and nobody else has a face; nothing reads as an array;
WOWED lands may not regress. End the session: pushed, `SESSIONS.md`
handoff updated, verdicts logged.
