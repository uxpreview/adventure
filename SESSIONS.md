# SESSIONS — the handoff log

## Session 6 — 2026-08-29 — traversal & time

*A systems session. Nothing here adds a land; everything here changes
how all six built lands FEEL, and two of the four items change how the
remaining five will be authored. `design/specs/traversal.md` is the
full record — this is the handoff.*

### Shipped

- **SPRINT AS INK WEIGHT** (WORLD-SYSTEMS §3). One continuous scalar,
  `Character.effort`, and there is no sprint state anywhere in the game:
  speed, stride, the print's ink, the step's level and the score's
  intensity are all readouts of it. **The middle of its range is the
  shipped mark** — at press 0.5 the print's gamma is 1.0 and its weight
  is 1.0, so a walk lays exactly the print four lands earned a WOWED
  with, and the system spends its range either side and never through
  it. A run's print is darker, wider and **dragged out 1.4× along the
  line of travel**, which is the part that actually reads at this
  camera. Damp paper (which is not wet paper — wet still refuses the
  print outright) lets it bloom, so running the tide line leaves a
  heavier trail than running the king's road, for one line of code.
  **No button and no stamina**: Shift, ramped, on a keyboard; on a
  phone, HOW FAR PAST THE RING YOU DRAGGED — the stick reaches a full
  walk at forty-eight pixels and the next forty are the run.
- **ROADS THAT CARRY** (§3, and STORY §4 is what authors the numbers).
  Nine roads that had been decoration since Session 1 are infrastructure.
  The carry **BENDS**: it takes a fixed share of the angle between where
  you are pointed and where the road goes, and there is no term anywhere
  in it that points at the centreline — so walking off a road is exactly
  as free as it was, and crossing one is free. Gated on alignment
  (56°–23°), so it can only tidy a walk that was already down the road.
  **Authored per road**: the king's road / main street / commuter spur
  chain carries 1.0, because STORY §4 makes them one road under twelve
  names surveyed as a railway; the canyon trail carries 0.3, because a
  trail does.
- **THE ROWBOAT — the first mount** (§4). Drawn up at THE RIVER MOUTH,
  found in the world and left in the world (saved), taken with one
  prompt and no menu ever. Fast on water, **refuses every other ground**.
  It turns the river — a wall along its whole length except at three
  bridges since Session 1 — into the only east–west road in the world,
  navigable from the salt to the source under all three bridges. And
  **where she STOPS is a decision, written down**: she does not leave
  the shore (34 units off dry paper), because a boat that goes anywhere
  wet would delete the sandbar Session 5 spent a session earning, and
  because the torn west edge is not this session's to spend. The bar
  counts as shore — its crest is dry paper — so the boat works the shelf
  either side of it.
- **THE DAY CYCLE** (§7). Forty minutes; one hundred seconds an hour;
  a fresh page starts at nine in the morning. `src/world/daylight.ts` is
  the clock and the one authority on the hour. **Eight in the morning to
  four in the afternoon is BIT-FOR-BIT the shipped page** — the neutral
  tint is pure white and the neutral haze is `PAPER_HEX`, so the grade
  is provably a no-op and six earned verdicts cannot be re-graded. The
  hour's colour lives at the HORIZON (the fog and clear colour); the
  paper takes a little of it weighted by its own brightness; **the ink
  takes none**. The horizon goes DARKER than the page does, which is the
  whole difference between a filter and a desk lamp. Brim's four square
  lamps light, its high-street windows come on (a third of them stay
  dark), and two braziers burn at Greyweather's gate — the castle's only
  lit things, for a road nobody rides up.
- **`Audio.setMoodIntensity` is called for the first time in this
  game's life** (§9 move 4), and `Audio.setHour` / `Audio.hour` are the
  seam §9 move 5 asked for. Session 8 will not have to re-open the day
  cycle. Two new voices: `oar` (a dip, a rowlock, and a pull, built out
  of the coast's own `surge`) and `oar-ship`.
- **The proof grew two whole sections** (`tools/check-terrain.mjs`):
  the carry is bounded and zero outside the roads' band, **the line
  carries hardest** (asserted, so nobody can quietly flatten STORY §4's
  spine), and a full-speed carried step lands on walkable ground at
  every point on every road and both shoulders in both directions; the
  boat floats where she is left, the river is rowable end to end, the
  open sea and the torn west margin refuse, and — the strongest one —
  **every place the boat can put you ashore is already reachable on
  foot**, checked by flooding the whole water and trying a landing from
  every square unit of it against the walker's own flood fill.
- **Gate: WOWED** after 4 rounds — `design/critiques/critique-art-5.md`
  (verbatim). All six protected lands re-shot at TWO hours and intact.

### State
- Build green. **Frame cost and draw counts unchanged.** THE COMMON is
  still the worst frame in the game at 293 draws / 214k triangles,
  exactly as Session 5 left it; Brim Square is 217. The day cycle is
  five instructions in a post-pass that already existed, the carry is
  one polyline query per frame, and every lit drawing is
  `visible = false` for sixteen hours a day.
- `node tools/check-terrain.mjs` passes, with the two new sections.
- **A protected framing is now protected at TWO HOURS** (QUALITY-BAR §2).
  `HOUR=19.6 node tools/shoot-first-minute.mjs` pins the clock; the
  neutral pass is the same regression check it always was, because the
  neutral hours are bit-identical.
- New: `src/world/daylight.ts`, `src/engine/Boat.ts`,
  `design/specs/traversal.md`, `tools/shoot-traversal.mjs`.

### Gotchas (new; Sessions 1–5 all still apply)
- **THIS SANDBOX RENDERS AT ABOUT 3.5 FRAMES A SECOND** (no GPU, 213k
  terrain triangles), and App clamps `dt` at 0.05 — so **one second of
  wall clock is about a sixth of a second of GAME time**. Any harness
  that drives the walker must hold six times as long as it looks like it
  should. A 2.4-second hold walks two units and lays four footprints,
  which is exactly why the first contact sheet of "sprint as ink weight"
  showed a walk and a run that were identical. `frameCost` is still the
  right way to measure cost; rAF cadence is still meaningless here.
- **A ROTATION APPLIED TO AN INPUT THAT IS RE-READ EVERY FRAME DOES NOT
  ACCUMULATE.** The road carry was first written as a per-second turn
  rate applied to the raw input vector; measured, it deflected a walk by
  **half a degree** and the whole feature was switched off. Anything
  that steers a player must take a SHARE OF THE ANGLE, not a rate.
- **Instrument the things the eye cannot judge.** The carry cost two
  rounds — a rate that did nothing, then a sign that steered people into
  the verge — and neither would ever have been found by looking at a
  screenshot. `window.__inklands.drive(mx, mz, run)` / `carryAt` /
  `release` exist for this; the measured table is in the spec.
- **A DAY CYCLE THAT MULTIPLIES THE WHOLE FRAME BY THE LIGHT'S COLOUR IS
  A SEPIA FILTER**, and it takes the LINE WORK with it. The hour belongs
  at the HORIZON (fog + clear colour), on the paper weighted by its own
  luminance, and on the ink not at all. Then it went the other way and
  the haze at full tint was a tangerine slab; `Key.sky` in daylight.ts
  is that round written down as a number.
- **Make the neutral hours the IDENTITY, not "close to it."** `#ffffff`
  and `PAPER_HEX` mean the grade is provably a no-op for eight hours a
  day, which turns "did the day cycle regress anything?" from a
  screenshot diff into arithmetic.
- **A generated overlay cannot guess where a drawing put its windows.**
  Brim's lit windows were first a separately generated run of panes hung
  in front of each terrace, and they floated over roofs and party walls.
  `townRowTexture` now RECORDS its own casements as it draws them and
  `townRowLitTexture` reads the record.
- **A boat is a cutout like everything else on this sheet.** A hull lying
  flat on the water is Session 5's invisible quad; a hull drawn broadside
  and mirrored by travel direction is the house style. It must sit HALF
  A UNIT SOUTH of whoever is in it (the camera only looks north, so
  south is toward the lens) or the hull does not hide their legs and
  they read as standing ON the boat — and nobody walks in a boat, so the
  walk cycle is held and the stroke goes into a lean.
- **A dinghy is short and DEEP.** The first redraw was long, shallow and
  pointed at both ends and came out a gondola; the freeboard is most of
  what you see of a small boat and it is what hides the legs.
- **The harness must put the walker ashore between framings**, or the
  boat follows them across the world — the first contact sheet had a
  rowboat parked in the middle of THE COMMON, in Session 2's protected
  composition.
- **A GLSL comment inside a JS template literal still may not contain a
  backtick.** Session 5 wrote this down and Session 6 did it again.
- `layout.ts` gained `Road.carry` (a number per road, authored),
  `roadCarryAt`, `riverAt` / `pondAt` / `waterFieldAt` (the river and
  the ponds moved out of `terrain.ts` for the same reason the sea moved
  in Session 5 — the proof has to be able to walk them off-screen),
  `rowableAt` / `offshoreDist` / `ROW_REACH`, and `BOAT_HOME`. No rect,
  road geometry, river, bridge, mood or step-zone change.

## Session 5 — 2026-08-29 — the coast

*The first land session authored on real ground, and the test of whether
Session 4's foundation was worth building.*

### Shipped

- **THE COAST'S OWN GROUND, authored first.** `elevation.ts` had the
  dune line and a sea floor; it now has the three things that make a
  coast a coast, and all three are in the sheet's vocabulary rather
  than a landscape's:
  - **THE HOLDFAST** — the headland. The wet margin tore away in two
    bites and one tongue of fibre held; the point is what the tear went
    ROUND. Eleven and a half units up, ringed by twelve of cliff that
    holds ∇h past the walk limit for more than a stride. **It is a
    POLYGON, not an ellipse**, and that was the session's hardest-won
    lesson: paper tears along its fibres, in straight runs, so the point
    has eight planar faces and a fall line that stays put on each of
    them. A radial headland is a dome, and a pen cannot draw down a dome
    (see the critique — it cost four rounds).
  - **THE CUT** — the ledge somebody chiselled across its seaward face,
    and the only way up. Not a ramp bolted on: the page is GRADED along
    an authored spine, so the ledge is a cut where the page was high and
    its own spoil where the page was low. The floor's profile is built
    from the ground itself at load (sample, make monotone, cap the
    grade at one in three and a half, lift the tail so it still
    arrives) — a fixed formula stopped matching the hill the moment the
    hill changed.
  - **SHELTER COVE** — the bite behind the point, with the dune standing
    up into a bank behind it so the cove opens only to its own water.
  - **THE SANDBAR** — the answer to THE WIDE BLUE, and it comes out of
    the metaphor rather than out of a boat: a wash leaves misses, and
    this one left a dry streak running a hundred and eighty units out to
    sea. It is authored in `layout.ts` (`SANDBAR`, `barDist`, `seaAt`)
    so the height field, the wash field and collision cannot disagree
    about it, and it is a ROUTE — out from the boardwalk, round the
    regatta's mark, back ashore at the foot of the cut.
  - **The shoreline is a LINE.** The sea's ramp went from forty-two
    units to twenty-four; over forty-two a coast is a gradient between
    two beiges and no amount of wrack saves it.
- **LONGSHORE, six places** (`design/specs/longshore.md`): the
  boardwalk, the painted huts, the cut, the holdfast, shelter cove, the
  river mouth, with two composed voids carrying one midpoint each.
  **The boardwalk is a PROMENADE running north** — the camera only ever
  looks north, so a boardwalk laid east–west is two handrails across the
  middle of the frame and nothing else.
- **THE WIDE BLUE, five places**, four of them on the bar. A regatta on
  a real closed course staged so its southern extremity sits twenty
  units due north of where the player stands.
- **New prop box** `src/world/textures-coast.ts` (~20 drawings). Two
  techniques, both stated before a line was drawn: *the dry brush and
  the horizontal* on land (every mark is a long low horizontal or a
  vertical stab against it — nothing is diagonal except the cut, which
  is why the cut reads as made), and *the waterline* at sea (every
  floating drawing stops flat with one hatch of reflection and nothing
  below).
- **Sound is place, and the sea gets louder as you approach it.** Four
  new `Audio.event` voices — `surf-break`, `gull-cry`, `bell-buoy`,
  `halyard` — and the gap between breakers is a function of the walker's
  distance from the water. Two new synthesis helpers: **`surge`** (a
  noise band whose centre sweeps as the wave collapses — the first
  non-sine instrument in the game) and **`glide`** (a pitched sweep, for
  a gull's mew and a halyard's slap). **The step timbre changes when you
  cross onto the bar**, because `ocean`'s step zone is now `sand` and
  the shallows override themselves to `wet`: the player learns the bar
  is paper without being told.
- **Motion.** LONGSHORE: marram in a sea wind that never gusts, the
  windsock, and a gull flock that puts up when you walk into it, wheels
  out over the water and comes down FURTHER ALONG the beach each time.
  THE WIDE BLUE: the fleet sails its course and heels into the turns,
  the bell buoy works the swell and rings, and a shoal breaks and
  scatters when you wade into it.
- **Shared shading, re-audited.** Three changes to `terrain.ts` were
  needed to make a cliff read, and all three were re-shot against the
  four protected lands: the fall line's DIRECTION is taken over a wide
  stencil while its magnitude stays the grid's; the magnitude is scaled
  by the fall line's COHERENCE, so brows and corners take no strokes;
  and **the hatch gate moved from 0.36 to 0.62, which is Session 4's own
  law implemented at a number that means it** ("hatching is for cliffs").
  Greyweather's scarp is better for it.
- **Gate: WOWED** after 6 rounds — `design/critiques/critique-art-4.md`
  (verbatim). The four protected lands are intact.

### State
- Build green. Worst coastal frame is the boardwalk at 176 draws,
  against THE COMMON's 293; 213k terrain triangles in one static call,
  unchanged.
- `node tools/check-terrain.mjs` now proves the coast off-screen: the
  bar is dry the whole way out, the open water refuses everywhere with
  the bar erased, the ledge is walkable end to end, and **with the ledge
  fenced the point is unreachable** while Shelter Cove still is.
- Protected now, in both viewports: everything Sessions 2–4 protected,
  plus the promenade walked north (portrait is the better of the two),
  THE CUT from the lower ledge, the Holdfast from the bight, the bar at
  its middle bend, and THE MARK with the fleet rounding it.

### Gotchas (new; Sessions 1–4 all still apply)
- **THE CAMERA ONLY EVER LOOKS NORTH, and that is a LAYOUT constraint,
  not a camera note.** Anything the player is meant to walk ALONG has to
  run north–south or it crosses the frame; anything they are meant to
  LOOK at has to be north of where they stand. This session laid a
  boardwalk east–west, staged a regatta west of the bar and put a
  viewpoint west of a cliff, and all three had to be rebuilt. Check the
  bearing before you place a thing, not after.
- **A flat quad that runs away from the camera is invisible.** There is
  no such thing as a handrail along a north–south walk in this engine.
  Use a receding line of small standees (the promenade's bollards) and
  put the rails where they face south (the jetty head).
- **A radial landform cannot be hatched.** The shader draws down the
  fall line; on anything doubly curved the fall line rotates, and
  `dot(worldXZ, across)` with a rotating `across` produces caustics —
  thumb prints, then herringbone. Author landforms with PLANAR FACES.
  The paper vocabulary already said so: a tear runs straight and turns
  at corners.
- **Hatching is for cliffs, and 0.36 was never that.** A five-unit dune
  over seventeen clears the old gate comfortably, which is where every
  chevron on this coast was coming from. The gate is 0.62 now.
- **Nothing in the height field may be finer than ~12 units — including
  the things you CARVE.** The ledge's inner wall was five units wide and
  aliased into chevrons until it was widened to eleven.
- **`smax`'s k is measured in HEIGHT, and a generous k rounds a cliff's
  TOE into a walkable ramp.** The Holdfast leaked at k = 2 (a four-unit
  ramp at two thirds of the walk limit, all the way round); it holds at
  0.8.
- **A pale standee within ~16 units is a grey slab — including in front
  of a cliff, especially in front of a cliff.** Four rounds of the gate
  killed four generations of cut wall. If the ground can say it, let the
  ground say it; give the drawings only what the height field cannot.
- **A GLSL comment inside a JS template literal may not contain a
  backtick.** Two of them silently broke the build mid-session and the
  screenshots came back from a stale `dist`.
- `layout.ts` gained `SANDBAR`/`barDist`/`seaAt`, `PLANKS`, one point on
  the coast road (it now reaches the promenade), a reshaped `coastX`,
  and `ocean`'s step zone changed `wet` → `sand`. `Terrain.nearBridge`
  became `Terrain.onPlanks` and answers for the boardwalk too. No rect,
  river, bridge or mood change.
- The `?debug` frame-cost harness now covers five coastal framings.

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
- **The world has an address: https://adventure.ryankm.com.** Set up
  2026-08-29, after the session shipped. The whole arrangement, so no
  future session has to rediscover it:
  - **`main` is the branch.** The four per-session branches were all
    strictly linear, so they were consolidated: `main` created at the
    Session 4 tip, then made the repo default.
  - **Vercel's production branch is a project setting that does NOT
    follow the GitHub default.** It lives under Settings →
    Environments → Production → Branch Tracking (it is no longer under
    Settings → Git, which is where every stale guide says it is). It is
    now `main`, so every push to `main` deploys to production.
  - **A branch created through the GitHub API fires no push event**, so
    Vercel will not even list the branch until something is genuinely
    pushed to it. That is why `main` was invisible in the dashboard at
    first.
  - **The domain is registered at Squarespace but its DNS points at
    Vercel** — `adventure.ryankm.com` is a CNAME to a per-domain
    `*.vercel-dns-017.com` target added as a Squarespace custom record.
    Adding another subdomain later is the same two steps: add it in
    Vercel, paste the CNAME Vercel gives you into Squarespace.
  - "Auto-assign Custom Production Domains" is on, so the domain
    follows every future production deploy with no action.
  - The `.vercel.app` aliases still work and still serve the same
    build; `adventure-three-flax.vercel.app` is the auto-generated
    production one. Prefer the custom domain when sharing.
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
  cannot create projects — 403). **Superseded after Session 4** — the
  world now lives at **https://adventure.ryankm.com**, production
  tracks `main`, and Deployment Protection is off. See Session 4's
  State note.

### State
- Build green (`npm run build` = tsc + vite). All twelve lands verified
  walkable under Playwright with real keys (`tools/shoot.mjs`).
- **Quality: everything is a scatter draft.** No land has faced a gate;
  design/QUALITY-BAR.md now governs; PLAN.md is the ladder; Session 2
  is THE FIRST MINUTE (see PROMPT.md).

### Gotchas
- ~~**Deployment Protection is still ON**~~ — resolved 2026-08-29: no
  password, no Vercel Authentication, no IP allowlist. The link is
  genuinely shareable.
- The sandbox egress proxy blocks the hosted origins — `*.vercel.app`
  AND `ryankm.com` both come back 403 from the CONNECT tunnel. Verify
  deploys through the Vercel MCP tools (`web_fetch_vercel_url`, which
  reaches the custom domain too, plus build logs), never the browser
  and never plain `curl`.
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
