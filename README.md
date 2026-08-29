# INKLANDS

*A world in one sheet — twelve lands, one pen.*

**Walk it: [adventure.ryankm.com](https://adventure.ryankm.com)**

An open-world adventure drawn entirely in procedural ballpoint, built on
the engine from [margins](https://github.com/uxpreview/margins). The
whole world is a single enormous page lying on a desk: the sea runs off
the torn west edge, and past every margin lies the next sheet down and
then wood. **There is not one image asset in this repository** — every
tree, tower, cactus and traffic light is drawn onto an offscreen canvas
by a seeded wobbly-stroke library at load, and every word the player
reads is hand-lettered by the same pen.

Sketch-like, but real: under the line work sits a field of muted
watercolor washes — one stain per land, ragged at the borders — with
roads, a river and an animated sea painted into it. The same painted
pixels the shader reads also answer the game: whether you can wade
here, what a footstep sounds like, whether the page takes your ink.

## The twelve lands

| | | |
|---|---|---|
| THE WIDE BLUE | open water | the sandbar, the regatta, the bell buoy |
| LONGSHORE | the coast | the promenade, the painted huts, the cut, the point |
| CASTLE GREYWEATHER | the high seat | the keep, the gatehouse, banner avenue |
| THE KINGDOM OF BRIM | the walled town | cottages, Brim Square, the market |
| THE COMMON | where you woke | the crossroads, the old well, three oaks |
| MAPLE COURT | the neighborhood | porch lights, picket fences, the green |
| THE PENWOOD | under the pines | pine dark, mushrooms, the tarn |
| SPLITROCK CANYON | the deep cut | striated walls, the Needle Arch |
| THE HARROW DOWNS | farm country | wheat, hay bales, the mill, a scarecrow |
| THE BLEACH FLATS | the desert | dune script, saguaros, tumbleweeds, the oasis |
| GREYLINE CITY | downtown | hatched towers, lit windows, the Junction |
| THE CUBICLE MILE | the office park | ruled glass, hedges, the 8:15 stop |

A river rises in the canyon, crosses the whole sheet and meets the sea
past the boardwalk; three plank bridges carry the roads over it. On the
coast, a strip the wash never took runs a hundred and eighty units out
into the sea — dry paper, so you can walk it, out past the surf and back
ashore at the foot of the cliff path.

Every border crossing changes the music's mood, the footstep underfoot,
and deals a region card — nothing else, because the sheet is continuous.

## What's here so far

- **Walking is drawing.** Footprints are ink; wet paper refuses them.
- **The land inks itself in.** Each region's furniture is born as faint
  pencil under-drawing and re-inks in a radial wave from wherever you
  first cross its border.
- **Vistas.** The camera sits low enough that the keep reads from the
  meadow and the city towers from across the downs; the fog is a
  horizon, not a curtain.
- **A hand-drawn map** (`M`) that only names the lands you have walked.
- **35 places worth a look**, each with a note in the world's voice.
- **All-procedural audio**: paper-room ambience, pen-scratch steps in
  six surface timbres (sand, grass, stone, planks, water, paper), a
  music-box melody that wanders a different scale in every land, and a
  handful of voices the lands own — a lark, a bell, rooks, and, on the
  coast, surf that comes at shorter intervals the nearer you stand to
  the water.
- Position, discovered lands and strides walked saved to `localStorage`.

The story layer is deliberately not started yet — see `DIRECTION.md`
for where it could go.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build in dist/
```

Desktop: WASD or arrows, `E` to look, `M` for the map. Mobile: drag in
the lower part of the screen to steer (the top is the vista and the
joystick is kept off it), tap to interact.

Append `?debug` to expose `window.__inklands` (teleport, region query,
terrain probes, frame cost, audio) for testing.

```sh
node tools/check-terrain.mjs   # assert the height field, off-screen
node tools/shoot-shape.mjs     # every landform, both viewports
node tools/shoot-first-minute.mjs
node tools/shoot-oldworld.mjs
node tools/shoot-coast.mjs      # LONGSHORE + THE WIDE BLUE
node tools/shoot.mjs           # all twelve lands, walkability smoke test
node tools/shoot-fps.mjs       # frame cost, draw calls, triangles
```

Every shoot script renders **desktop (1280×720) and portrait (390×844)**
through `tools/shoot-lib.mjs`; portrait is a gated viewport, not a
courtesy check.

## How it's made

Ported whole from margins: the ink library (`src/engine/ink.ts`), paper
grain, hand-lettering and handwriting synthesis, footprints, the walk
cycle, the paper post-pass, the audio engine. New for the open world:

- `src/world/layout.ts` — the twelve rects, roads, river, bridges;
  the one authored truth the terrain, map and audio all read.
- `src/world/elevation.ts` — **the shape of the page.** The world is a
  sheet of paper on a desk, and paper is flat but not rigid: it creases
  (one fold, north to south, that the east road dives through), curls at
  its margins, buckles where the wash went on wet, tears (SPLITROCK),
  rides over what is under it (Castle Greyweather's ridge), and on the
  west coast its wet margin tore away in two bites around one tongue of
  fibre that held — THE HOLDFAST, which a ledge somebody chiselled is
  the only way onto. One height grid; the mesh, the shading, the walker,
  every prop and all collision read it and nothing else invents a
  height. Steep is impassable, which is free traversal gating.
- `src/world/terrain.ts` — the whole world as one sheet: wash field
  painted at load (1 texel per world unit), domain-warped borders,
  animated water, the displaced mesh, and the shading that DRAWS the
  page's shape rather than rendering it — tone where the page leans out
  of the light, ink pooled down the bottom of a crease, pen hatching
  down the fall line of anything that is genuinely a cliff. Plus CPU
  queries for collision, step timbre and height.
- `src/world/regions/` — a builder per land placing instanced standee
  fields and one-off drawings; streaming keeps first-visit cost off
  the walk.
- `src/world/textures.ts` — the prop box: forty-odd seeded drawings,
  ink outline over a light wash stain. `textures-common.ts`,
  `textures-oldworld.ts` and `textures-coast.ts` add a box per session,
  each with its own stated ink technique.
