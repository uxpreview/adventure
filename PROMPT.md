# PROMPT — Session 6: TRAVERSAL & TIME

You are continuing INKLANDS in `uxpreview/adventure` on `main` — the
default branch, and what Vercel project `adventure` deploys to
production (https://adventure.ryankm.com). Read, in order:
`design/QUALITY-BAR.md` (binding), `design/WORLD-SYSTEMS.md`, `PLAN.md`,
`README.md`, `SESSIONS.md` — **Session 5's gotchas especially**, because
that session found two laws the hard way that will bite this one:
*the camera only ever looks north, and that is a LAYOUT constraint*, and
*a flat quad that runs away from the camera is invisible*. Story stays
parked until Session 7.

**This is a SYSTEMS session.** Nothing here adds a land. Everything here
changes how all six built lands feel, and two of the four items change
how the remaining five will be authored — which is why they come first
(PLAN.md, the ordering rule).

Six lands hold the bar now: THE COMMON, the Brim south face, the Brim
interior, CASTLE GREYWEATHER, LONGSHORE, THE WIDE BLUE. **None of them
may regress**, and this session touches the character controller, the
collision rules and every wash on the sheet, so that is a real risk and
not a formality.

## The job

### 1. Sprint as ink weight

WORLD-SYSTEMS §3 calls traversal the game's weakest verb, and this is
the cheapest fix on the list: **your speed is legible in the marks you
leave behind you.** Footprints already exist (`engine/Footprints.ts`)
and already know about wet paper. Run and they press darker and wetter;
walk and they feather. Continuous, not two-state — the print is a
readout of the foot that made it.

Two things fall out of it and both are in scope: the walk cycle and the
step audio should agree with the ink, and **`Audio.setMoodIntensity`
exists and nothing in this game has ever called it** (WORLD-SYSTEMS §9,
move 4). Running should lean the score in; standing still should let it
thin. Session 8 builds the score proper — leave it that seam.

### 2. Roads that carry

`terrain.roadAt` is already a CPU-readable mask, and the road web is
already nine authored roads that the terrain paints and the map draws.
Today it is decoration. Make a road **carry**: faster along it, and
gently auto-steering, *because a pen likes following a line it already
drew.* That single change turns the whole web into infrastructure and
makes the crossroads mean something.

It has to be **felt, not fought**. If a player ever notices they are
being steered, it is wrong; if they walk off the road and the game
tugs them back, it is wrong. Author the strength, do not guess it, and
judge it on the king's road climb to Greyweather and the east road's
dive through the crease, which are the two places it will misbehave.

### 3. The rowboat — the first mount

WORLD-SYSTEMS §4 is explicit and the rules are not negotiable: **every
mount is fast on its own ground and refuses every other ground**, and it
is *found in the world and left in the world* — yours is where you left
it. Walking stays the universal verb. No menu, ever.

Session 5 built this mount's whole quadrant without meaning to: there is
a boat drawn up on the sand in SHELTER COVE, another resting on the
south beach, mooring posts on the bar, and THE RIVER MOUTH is a place.
`rowboatTexture` has been sitting unused in the prop box since Session 1.

The rowboat's ground is **water**, and water is the one thing on this
sheet that currently only ever says no: the river crosses the entire
page and is a wall along its whole length except at three bridges. Make
it a route. Then decide — and write down — where the boat *stops*:
the open sea past the shallows is a real design question, not an
oversight, and "you can row to the torn west edge of the page" is either
the best reward in the world or the thing that breaks it.

Two Session-5 facts the boat must respect: `layout.PLANKS` /
`Terrain.onPlanks` is how decked ground works (bridges and the
boardwalk), and `layout.seaAt` is the one authority on where the sea is.

### 4. The day cycle

**The highest-return item in WORLD-SYSTEMS** (§7), because every land
already built improves for free: washes shift, the fog warms, Brim's
lamps light, the city's windows come on, moods change, and the metaphor
pays for all of it — *the desk lamp comes on*.

Constraints that are already law and will decide the implementation:
washes come only from `palette.ts`, so the hour modulates the wash
field rather than inventing colours; the terrain shader's lamp is
BEHIND the page (Session 4, and the castle scarp depends on it); and a
fold is drawn, not shaded, so dusk may not become a gradient.

**Leave the score's seam in.** The hour must be a parameter the audio
mixer can read (WORLD-SYSTEMS §9, move 5). If Session 8 has to re-open
the day cycle to make the music answer the hour, this session did it
wrong.

### 5. Traversal may not break the world's gates

Steep ground and deep water are this world's only traversal gating, and
two proofs in `tools/check-terrain.mjs` depend on them: **Greyweather's
south scarp refuses everywhere off the banner avenue**, and **with the
ledge fenced, THE HOLDFAST is unreachable**. A boat that goes anywhere
wet, or a road-carry that flings the walker off the cut, silently
deletes both. Extend the tool with whatever new proof this session's
traversal needs, and run it before you look at anything.

## The gate

This is a systems pass, so the contact sheet is the **whole build**:
`tools/shoot-first-minute.mjs`, `tools/shoot-oldworld.mjs`,
`tools/shoot-coast.mjs` and `tools/shoot-shape.mjs`, both viewports,
plus new framings for what this session adds — a road crossing at
speed, the river under oar, and **every protected framing shot at two
hours of the day** (the day cycle is not done until dusk is as good as
noon). LOOK at every image. Run the hostile art-director critique per
QUALITY-BAR §2, log it verbatim to `design/critiques/critique-art-5.md`,
iterate to WOWED. Then run `tools/shoot-fps.mjs`: a day cycle that
costs a frame is a day cycle that gets redesigned.

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets; all marks via `src/engine/ink.ts`; washes only from
`palette.ts`; `elevation.ts` is the only authority on where the ground
is and water may never climb a hill; layout rects move only with a
layout-wide audit; standees stay vertical, decals follow the surface;
a fold is drawn, not shaded; hatching is for cliffs; the camera only
ever looks north and that decides layout; author landforms with planar
faces; 60fps mobile with DPR capped at 2; build green before every push;
the walker has two dots and nobody else has a face; nothing reads as an
array; portrait is judged, not checked. End the session: pushed,
`SESSIONS.md` handoff updated, verdicts logged.
