# SESSIONS — the handoff log

## Session 4 — 2026-08-28 — the paper has a shape

*A foundations session. Nothing here adds a land; everything here
changes how every future land is authored.*

### Shipped

- **THE SHEET HAS A SHAPE.** `src/world/elevation.ts` is new and is the
  ONE authority on where the ground is. It is authored in the sheet's
  own vocabulary (WORLD-SYSTEMS §1), not in generic hills:
  - **the crease** — the page was folded once, north to south. The fold
    wanders (`foldX`), the east road dives through it between the common
    and the downs, and the forest track crosses it at the Wood Gate.
  - **the curl** — the east, north and south margins lift in their last
    thirty units and then the page ENDS: a two-unit drop to the next
    sheet and then the desk. The west margin is where the sea runs off
    the torn edge, so it sags instead — wet paper does not curl.
  - **the buckle** — value-noise cockle at ±1.5 units, weighted per land
    by how wet that land's wash went on (`COCKLE`). The downs roll; the
    office park does not. This is texture underfoot, NOT landform: round
    1 of the gate rejected it at four times this amplitude.
  - **the tear** — SPLITROCK is a rip with a ragged fibre-scale lip,
    thirteen units deep, and you can see the desk through the bottom of
    it. Session 9 builds the land on ground that already exists.
  - **what's under the sheet** — a book under the page lifts CASTLE
    GREYWEATHER onto a real scarp with a flat top.
  - **water has beds.** The river's falls monotonically from its source
    in the canyon to its mouth in the sea, so it cuts a notch through the
    crease instead of riding over it; the sea and the ponds are level.
- **`heightAt` routed through the CENTRALISED placement helpers** —
  `ctx.standee`, `ctx.decal`, `ctx.field` (via `StandeeField`'s new
  `ground` option) and the new `ctx.groundY` / `ctx.hang`. Twelve region
  builders needed no placement edits, exactly as WORLD-SYSTEMS predicted;
  only the dozen things HUNG in the air (pennants, bunting, the swing,
  birds) needed a line each. **Standees stay vertical**; decals and
  footprints lie along the surface normal and carry a polygon offset.
- **The walker, footprints, POI labels, bridges and collision lifted.**
  Uphill costs speed and downhill gives a little back (`Character.grade`).
  **Steep is impassable** (`MAX_WALK_SLOPE`), which is what makes the
  banner avenue the only frontal way onto Greyweather's ridge.
- **A fold is DRAWN, not shaded.** The terrain shader gained three marks,
  each keyed off geometry the vertex buffer already carries: tone where
  the page leans out of the light (lamp BEHIND the page, so the face you
  are looking at is the shaded one), a pooled ink line down the bottom of
  a crease, and pen hatching that runs DOWN THE FALL LINE of anything
  that is actually a cliff, at a pitch that keeps the stroke the same
  size on the page at every distance.
- **The camera is a designed system** (`App.CAM`), not three constants.
  Elevation, pitch and fog are parameters with reasons. The frame-top
  ceiling is gone: when the ground ahead rises the camera **retreats**
  — distance is how you reveal a hill, pitching up throws the subject
  out of the bottom of the frame — and climbing pulls the fog back, so
  the curled rim and the castle ridge are vistas.
- **CASTLE GREYWEATHER rebuilt on the real ridge.** The avenue climbs;
  the barbican sits low on the ramp; the curtain wall is placed by asking
  the page where its brow is (`lipZ`) and steps forward around the gate;
  the keep stands on the plateau. Three beats, each clearing the one in
  front, at three real heights. **The four crag stand-ups are gone** —
  they were the high seat drawn, standing in front of the ridge they
  stood in for. What is at the ridge's foot now is fallen stone. The
  king's road climbs the ramp and through the barbican.
- **Portrait is a first-class gated viewport.** `tools/shoot-lib.mjs`
  renders every framing at 1280×720 AND 390×844 and every shoot script
  uses it. Portrait fixes it exposed: the poster's SET OUT sat on Brim's
  keep and out of thumb reach (it now owns the bottom third on its own
  scrap of paper), the interact prompt could land in the top half (it is
  floored at 42%), and the drag-to-walk joystick could be planted on the
  vista it was steering toward (the walk band is now the lower 62%).
- **The margins inheritance audit EXECUTED** (WORLD-SYSTEMS, "The
  inheritance audit"): `AudioDirector` deleted (739 lines, never called),
  59 of 66 `Audio.event` cases deleted (the seven live ones are the
  world's own voices), the two-blues forgery contract and its paling
  tokens retired from `palette.ts`, and the smudge auto-on rule dropped
  from `ink.ts` with the effect kept and made opt-in. ~900 lines of
  another game's story gone.
- **New tools.** `tools/check-terrain.mjs` asserts the height field
  off-screen — amplitude envelope, no road severed, every standing place
  reachable on foot from the spawn by flood fill, Greyweather's south
  face still refuses. `tools/shoot-shape.mjs` photographs every landform.
  `tools/shoot-fps.mjs` reports frame cost and draw/triangle counts.
- **Gate: WOWED** after 7 rounds — `design/critiques/critique-art-3.md`
  (verbatim). The four protected lands are intact; THE COMMON and the
  castle approach are better than they were.

### State
- Build green. 210k terrain triangles in one static draw call, no
  per-frame CPU, no new draw call per prop. Worst frame is still THE
  COMMON at 280 draws, unchanged by elevation.
- Protected now, in BOTH viewports: everything Sessions 2–3 protected,
  plus the castle-reveal / avenue-foot / avenue-climb stack and the
  portrait poster.

### Gotchas (new; Sessions 1–3 all still apply, except where noted)
- **The frame-top ceiling gotcha from Session 3 is RETIRED.** "Height
  contests are won by spread, not by scale" was a rule about a flat
  world. They are won by GROUND now: put the near thing lower down the
  slope and the far thing on the plateau. The keep is 34×17 as before
  and it wins its own gatehouse by thirteen units of ridge.
- **The camera retreats, so things BEHIND the walker get into frame.**
  Anything the walker has walked past can only obstruct — the camera
  only ever looks north. Brim's north wall run and Greyweather's curtain
  wall both fade to ZERO (and `visible = false`), not to a tenth: a
  six-unit wall at ten per cent opacity one unit from the lens is a grey
  rectangle across the whole frame.
- **Amplitude is relative to the FRAME, not to the sheet.** The player's
  frame is about fifty-five units wide. A five-unit swell over ninety
  units is a hill, not cockle. Author landforms big and deliberate;
  author texture small.
- **Nothing in the height field may be finer than ~12 units.** The grid
  pitch is 4 and the mesh samples the same nodes; finer features alias.
- **Hatching is for cliffs.** On gentle ground it reads as corduroy, and
  in world space along the contours it reads as drapery. It runs down
  the fall line (`aShade.zw` carries the gradient) and its pitch scales
  with depth so the stroke is constant on the page.
- **Run `node tools/check-terrain.mjs` before shooting anything.** It is
  three seconds and it catches severed roads, unreachable lands and a
  scarp that stopped refusing.
- **The sandbox has no GPU.** `window.__inklands.fps()` reported 1 fps
  for a scene that renders in 2 ms; `frameCost` replaced it. Frame-rate
  claims from this environment are only ever comparative.
- `layout.ts` gained three points on the king's road (up the castle ramp
  and through the barbican) and `coastX` moved from `terrain.ts` to
  `layout.ts` (re-exported, so importers are unchanged). No rect, river,
  bridge, mood or step-zone change.

## Session 3.5 — 2026-08-28 — owner direction (no code)

Design conversation after the Session 3 gate, baked into the repo as
`design/WORLD-SYSTEMS.md` plus re-cut `PLAN.md` / `QUALITY-BAR.md` /
`PROMPT.md`. Decisions, so nobody re-litigates them:

- **The flat ground was an inheritance, not a decision** — and it goes.
  Paper is flat but not rigid: the sheet creases, curls, buckles and
  tears. Session 4 is a foundations session that gives the page a shape.
- **The ordering rule:** systems that change how a land is authored
  (elevation, camera, traversal, time) ship BEFORE the remaining lands.
  The ladder was re-cut around this; the coast moved to Session 5 so it
  can be authored with elevation rather than re-opened after it.
- **margins is a reference, not an authority.** Every inherited rule is
  now re-ratified or dropped; WORLD-SYSTEMS carries the running audit.
  First pass found `AudioDirector` (739 lines, never called), ~60 dead
  `Audio.event` cases, and the two-blues forgery contract in
  `palette.ts` — all margins plot, none of it ours.
- **Mobile and desktop are both first-class**, enforced at the gate:
  every contact sheet now shoots portrait as well as desktop.
- **Mounts are rewards, one per quadrant, each refusing the others'
  ground** (horse / bicycle / rowboat / the 8:15 / paper plane). Walking
  stays the universal verb; no fast-travel menu, ever.
- **Blots-as-caves parked** until the story gives them a reason.
- **Story is picked at Session 7**, not before.

## Session 3 — 2026-08-28 — the old world

### Shipped
- **THE KINGDOM OF BRIM interior rebuilt to spec**
  (`design/specs/kingdom-of-brim.md`): six places — the south gate
  inside, the high street, Brim Square, the belfry yard, the orchard
  close, the Wood Gate. Terrace runs of half-timbered houses
  (`townRowTexture`, 6 seeds, front- AND side-gabled roofs mixed)
  replace the 14 scattered cottage stamps; the square gets a
  two-tier fountain, market cross, five stalls, bunting, crates,
  cobble-wear; the belfry is now full-pressure with a clock whose
  hands disagree. East + north walls rebuilt in the Session 2 wall
  register with drum towers and a new north gate.
- **CASTLE GREYWEATHER rebuilt to spec**
  (`design/specs/castle-greyweather.md`): the banner avenue tightens
  toward a low gatehouse, the ridge wall rides its crags, the bailey
  keeps a toppled king and the castle well, the moat pool gets reeds
  and a wind-flagged hawthorn, and a pencil pine treeline closes the
  north horizon.
- **The Session 2 vista placeholder is gone.** The pale roofline rank
  is replaced by the real town plus a new `backStreetTexture` far
  rank (long ridges + chimneys, never a picket of triangles) that
  fades as the walker closes on it.
- **New prop box** `src/world/textures-oldworld.ts` (~20 textures).
- **Motion**: bunting breathing, swifts round the belfry, pigeons that
  scatter when you walk into them, rooks circling the keep and a
  parliament on the statue that breaks when you approach, banner-field
  wind. **Sound**: `brim-bell`, `market-murmur`, `pigeon-flap`,
  `banner-snap`, `rook-caw`, wired per region in App's ambience.
- **Gate: WOWED** after 4 rounds — `design/critiques/critique-art-2.md`
  (verbatim). Protected now: the north-gate reveal, the banner avenue
  with the keep clearing its gatehouse, and Brim Square under bunting.

### State
- Build green; `tools/shoot-oldworld.mjs` is the Session 3 contact
  sheet; Session 2's protected framings re-shot and verified richer,
  not regressed.
- Four lands hold the bar (Common, Brim south face + interior,
  Greyweather). Ladder re-cut after this session: Session 4 = THE PAPER
  HAS A SHAPE (foundations), coast moves to Session 5.

### Gotchas (new; Sessions 1–2 all still apply)
- **The frame-top ceiling decides all architecture.** The shipping
  camera shows only ~10 world units of height at 33 units out and
  ~16 at 82. Anything taller crops, and a tall near building fills
  the upper frame so nothing behind it can be seen at all. That is
  why Greyweather's keep is drawn WIDE (640×320, 34×17 units) and its
  gatehouse is only 9.5: height contests are won by spread, not by
  scale. Do not "fix" a hidden landmark by making it taller.
- Gate arches need `passFade(px, pz, gx, lo, hi)` — the camera trails
  12 units behind the walker, so a fade keyed to the walker alone
  pops while the camera is still inside the arch. Both Brim gates,
  the Greyweather gatehouse and the whole ridge wall use it.
- The pale/failing-pressure register is a DISTANCE register only: any
  pale standee within ~16 units reads as a flat grey slab. Fade them.
- Region builders can fire audio without plumbing: dispatch
  `inklands:event` on window (App bridges it to `Audio.event`).
- `layout.ts` gained one road (the market lane, Brim Square → Wood
  Gate). No rect, river, bridge, mood or step-zone change; terrain and
  map pick roads up automatically.
- `bannerTexture(seed, 'red'|'blue')` now takes a forced color — the
  coin-flip was putting blue banners in a land whose accent is red.

## Session 2 — 2026-08-28 — the first minute

### Shipped
- **THE COMMON rebuilt to spec** (`design/specs/the-common.md`, the
  first land spec): six named places (crossroads, well, oaks, gate
  fields, long fence, riverbend), cluster-scattered grass in six
  drawings + tall seedheads + three one-species flower drifts, worn
  ground under every place, two composed voids. New prop box in
  `src/world/textures-common.ts` (~25 textures).
- **The Brim vista** (kingdom south face, in `buildKingdom`): varied
  wall segments + drum towers, the rebuilt south gatehouse
  (`brimGateTexture`) with red pennants (animated), town rooflines +
  belfry stacked behind the battlements, and the false-perspective
  pencil keep (`keepVistaTexture`, a meadow standee) that fades before
  the walker reaches the wall. Roof/belfry layer fades once inside the
  town. East wall stays draft for Session 3.
- **The title poster**: pulled-back pre-start camera, loader now fully
  lets go before the title letters in (title-veil starts `gone` +
  0.75 s delay), portrait subtitle clamped.
- **Engine**: `hatch()` clips itself (was spraying streaks from every
  wide box); StandeeField wind sway + player-bend (`wind` opt,
  `setPlayer`); region updates receive `(dt, t, px, pz)`; meadow
  ambience (`lark`, `well-plink` events + App ticker); swallows,
  rope-swing pendulum.
- **Gate: WOWED** after 6 rounds — `design/critiques/critique-art-1.md`
  (verbatim, all rounds). Title framing, gate stack, and well/poppy
  cluster are now protected compositions.

### State
- Build green; all 12 lands verified walkable (`tools/shoot.mjs`);
  first-minute framings in `tools/shoot-first-minute.mjs`.
- THE COMMON + the Brim south face hold the bar. Kingdom interior,
  castle, and everything else remain scatter drafts — ladder says
  Session 3 = CASTLE GREYWEATHER + KINGDOM interior.

### Gotchas (new; Session 1's all still apply)
- The keep vista is FALSE PERSPECTIVE (meadow-owned standee at
  z≈−52, fog off). Session 3 must keep its fade (gone by z<12) or
  players catch it standing inside the town.
- The camera passes through the gate arch entering Brim — reads as
  "walking under", but Session 3 should add a proximity fade.
- Meadow lean-grass is never x-flipped: the wind lean is drawn in.
- Headless screenshot pages that aren't foregrounded get rAF-throttled
  (the loader tween never finishes) — `bringToFront()` in shoot
  scripts, and close the desktop page before the portrait one.
- Rooflines/belfry and the vista keep are placeholders the Session 3
  town must REPLACE seamlessly from the south approach: re-shoot
  `09/10` framings and diff against the WOWED sheet before removing.

## Session 1 — 2026-08-28 — the sheet

### Shipped
- The whole engine, ported from `uxpreview/margins` branch
  `claude/margins-s13-quality-bar-ulkjig`: ink library, paper, hand
  lettering + handwriting synthesis, footprints, character, paper
  post-pass, all-procedural audio.
- One continuous 760×560 sheet with twelve walkable lands, roads, a
  river with three bridges, ocean/ponds/oasis; painted wash terrain
  whose pixels double as collision, step timbre and print suppression.
- Region streaming with the ink-in cascade; the vista camera (replacing
  margins' steep page camera — that change is what made landmarks
  visible at distance); per-land music moods; three new step surfaces;
  the hand-drawn map (M); 24 POI notes; localStorage save.
- Hosted: Vercel project `adventure` (imported by owner; the connector
  cannot create projects — 403), production tracks this branch at
  https://adventure-ryankm.vercel.app.

### State
- Build green (`npm run build` = tsc + vite). All twelve lands verified
  walkable under Playwright with real keys (`tools/shoot.mjs`).
- **Quality: everything is a scatter draft.** No land has faced a gate;
  design/QUALITY-BAR.md now governs; PLAN.md is the ladder; Session 2
  is THE FIRST MINUTE (see PROMPT.md).

### Gotchas
- **Deployment Protection is still ON** — the URL is team-only until
  the owner flips Vercel Authentication off (Settings → Deployment
  Protection). The permission classifier blocks doing it from here.
- The sandbox egress proxy blocks `*.vercel.app` — verify deploys via
  the Vercel MCP tools (`web_fetch_vercel_url`, build logs), never the
  browser.
- Commits must be authored `Claude <noreply@anthropic.com>` — the
  owner's iCloud email is push-rejected by GitHub email privacy.
- `?debug` exposes `window.__inklands` (goto, region, terrain probes,
  audio); `tools/shoot.mjs` (all-lands contact sheet),
  `tools/verify-live.mjs` (hosted smoke test) depend on it.
- The camera decides everything: standees taller than ~4 units vanish
  above the frame if you steepen it back toward margins' angle. The
  terrain fog cap eases to full fog past ~2.6× fogFar so the desk never
  bands the horizon — keep that if touching fog.
- StandeeField ghost/cascade is the "world inks itself in" mechanic;
  region builders run once per land at stream-in and must stay
  one-frame cheap.
