# SCALE AND MOTION — report (pillar 4, branch `wt/scale`)

Two engineers worked this branch. The first built the horse, the pace change and the traffic module (commit `772dbf8`) and was cut off mid-playtest. This pass played all of it through the harness, fixed what the play found, added movers where the frames were still, retuned the walk, and measured. Everything below was seen in a screenshot or read off the harness clock.

## 1. What was built

**The walker's pace is scaled to the world; the sheet is not scaled.** `WORLD` (760 × 560) and every rect in `REGION_SPECS` are unchanged, so nothing authored in absolute coordinates moves. The rect table is at the end for the record.

**Mounts everywhere, and fast.**
- **Horse** (`src/engine/Horse.ts`, drawn in `src/world/textures-mounts.ts`, seven frames on one sheet: stand, trot ×2, gallop ×2, graze ×2). Lives by a hitching post at the Common's crossroads, `HORSE_HOME (−36, 66)`. One prompt with three meanings, the bicycle's pattern: parked → **GET ON THE HORSE**; moving → **WHOA** (stops it); stopped → **GET OFF** (you step down onto the verge, it stays where it is and is saved). Trot on the key, gallop on shift. Refuses only what a foot refuses: deep water, the steep, a barrier. It wades to 0.62 water, crosses fords and bridges. **H** whistles it from within 120 units: it trots over at 5.2 u/s, sliding along banks per axis like a cart, and gives up if the page holds it. Beyond 120 units the world says "the horse is too far to hear you". Left standing, it grazes (head down, tail swish, on an 11 s cycle) so the crossroads is never a still frame; never with a rider on. Hooves sound off its own stride (`hooves` event, harder at a gallop); the whistle is its own event. Saved in `Save.horse`, old saves read `null` → the post.
- **Bicycle**: no `neighborhood`-only refusal. Goes anywhere flat and dry; sand is a 0.45× speed penalty, not a refusal. Two pre-existing water rules stopped it dead the moment it left Maple Court: a bridge's approach (0.38 water one unit outside the plank radius) and the mill lane's ford. It now accepts wet to the hub (≤ 0.5), planks with a 2-unit pad, and fords, and refuses deeper water — same as a foot.
- **Rowboat**: `rowableAt` already covered the whole river; verified by rowing it end to end (see §2). Unchanged.
- **Followers** (goat, both dogs) cross borders: `company.ts` clamps to `WORLD`, only `keepOut` holds them. **Things** cross borders: `things.ts` clamps to `WORLD`.

**Something moving in every frame** — `src/world/traffic.ts` + `src/world/textures-traffic.ts`. Four instanced sprite fields (folk, wheels, birds, marks), each one draw call, one atlas each, fogged like every standee, animated on the harness clock (`dt`, `elapsed`) and the day clock, never the wall clock. Every sprite squares up to the lens using the walker→camera bearing, so it survives a free camera. Movers per land are in §4. The horizon lures move: mill smoke (six puffs, blown by `windK`), the keep's flag (snaps faster in wind), three sea glints, four blinking tower lamps after 18:40, and a rain curtain (twelve soft panels) that stands at the horizon and closes in ahead of `weather.state.rain`, using a new `weather.ahead` forecast a third of an hour on; fields gust before it (`windK` pulses when `ahead > rain`).

**Retuned to the new speeds**: the bull's charge (8.4 → 5.6, still faster than the run and still catchable), the goat (2.2 walk / 5.4 trot), the dawn dog (2.5 / 5.6), the Downs dog (2.5 / 5.7). Left alone on purpose: the run ramp (time-based), footprint spacing and the oar stroke (both distance-based), the teach-the-run timer (6 s of walking is 14 units now, still inside the first minute), road carry (its band was tuned against "under a second at a run", which the slower run only helps).

## 2. Final speeds and measured crossing times

| Thing | u/s |
|---|---|
| Walk | **2.3** (`App.WALK.max`) |
| Run | **4.37** (×1.9) |
| Row | 3.6, 4.7 on shift |
| Bicycle | 6.4 flat, up to 9.6 downhill, 2.9 on sand |
| Horse | 5.6 trot, **10.1 gallop**; 5.2 when called |
| Bull's charge | 5.6 |
| Carts / cars / main-street cars | 2.3–2.75 / 8.5–10.6 / 7.2–7.8 |

Measured on the harness clock (30 ticks = one game-second), desktop rig, weather pinned clear:

| Trip | Time |
|---|---|
| The Common, west edge → east edge along the road (206 u), at a walk | **82 s** (75 s before the walk came down from 2.5) |
| The Common at a run | ≈ 45 s |
| Coast to coast at a run: west road's end on the sand (−234, 58) → east edge (376, 18) along the west and east roads, ≈ 615 u | **131 s** (2 min 11 s) |
| Bicycle, Maple Court (−58, 150) → Brim's square (−48, −58) up the king's road | 44 s |
| Horse, crossroads → the coast at (−210, 58), gallop | ≈ 18 s |
| Row, the Common's bank (52, 100) → the sea past the river mouth (−258, 222), under the king's road bridge | 103 s |
| Row upstream, the Downs bridge (82, 72) → the source in the canyon (296, −116), on shift | 70 s |
| Whistle from 98 u | the horse arrived in 29 s; from 176 u it refused with the hint |

**The brief's numbers do not agree with each other.** At the walk it names (≈2.5) the Common takes 75–84 s; at the run it names (≈4.4) coast to coast is about 2¼ minutes, not 4–5. I kept the named speeds and nudged the walk to 2.3 to get the Common near 90 s. A 4–5 minute coast-to-coast would need a run around 2.3, slower than the walk it names. That is a decision for the integrator, and it is one constant (`App.WALK`).

## 3. Files owned, and every insertion in shared files

**Owned (only SCALE touches these):** `src/engine/Horse.ts`, `src/world/textures-mounts.ts`, `src/world/traffic.ts`, `src/world/textures-traffic.ts`, `tools/play-go.mjs`, `tools/play-cost.mjs`, `tools/play-sweep.mjs`, this report.

**Shared files — labelled insertions** (`/* ---- SCALE: ... ---- */`, line numbers as of commit on this branch; re-locate with `grep -n SCALE`):

| File:line | Label / what |
|---|---|
| `src/core/App.ts:17` | imports: `Horse`, `HORSE_HOME`, `HITCHING_POST`, `traffic`, `fordAt` |
| `src/core/App.ts:80` | `private horse = new Horse()` |
| `src/core/App.ts:175` | constructor: horse placed from `save.horse ?? HORSE_HOME`, post grounded, `traffic.init(scene, terrain)` |
| `src/core/App.ts:266` | the horse POI — GET ON / WHOA / GET OFF, one prompt, live getters |
| `src/core/App.ts:397` | `keydown` H → `whistle()` |
| `src/core/App.ts:586` | `__inklands`: `horse`, `traffic`, `takeHorse()`, `putHorse(x,z)`, `whistle()` |
| `src/core/App.ts:1126` | `bicycleKey`: one mount at a time |
| `src/core/App.ts:1169` | `bicycleRefuses`: anywhere flat and dry; wet to the hub, planks (pad 2) and fords allowed |
| `src/core/App.ts:1181` | THE HORSE block: `horseKey()`, `horseRefuses()`, `whistle()` — modelled on the bicycle's |
| `src/core/App.ts:1421` | `WALK = {2.3, ×1.9}`, `ROW = {3.6, ×1.3}`, `BIKE = {6.4, ×1.2}` |
| `src/core/App.ts:1434` | `HORSE = {5.6, ×1.8}` |
| `src/core/App.ts:1909` | collision: the horse's own `refuses` closure |
| `src/core/App.ts:1938` | `setGround`: +0.92 up on the saddle |
| `src/core/App.ts:1977` | bicycle on sand: ×0.45 |
| `src/core/App.ts:1988` | THE HORSE tick: aboard it is the walker; called it trots; `hooves` event within 70 u |
| `src/core/App.ts:2078` | `traffic.tick(...)` after `world.tick`, with the camera's x/z |
| `src/core/App.ts:2375` | persist `save.horse` |
| `src/core/App.ts:1035`, `:2068` (no label; one-line edits) | `teachTheRun` and the heavy-carry speed block skip the horse like the other mounts |
| `src/core/Audio.ts:2106` | `case 'hooves'`, `case 'whistle'` — at the END of the switch |
| `src/core/Save.ts:25`, `:104` | `horse?: {x,z} | null`, default `null` |
| `src/world/company.ts:89` | followers clamp to `WORLD`; `inLand` = sheet + `keepOut` |
| `src/world/things.ts:213` | things clamp to `WORLD` |
| `src/world/weather.ts:180`, `:197` | `ahead` forecast; pre-rain gusts in `windK` |
| `src/world/regions/meadow.ts:166`, `:185`, `:751` | goat, dawn dog, bull's charge retuned |
| `src/world/regions/wilds.ts:2695` | Downs dog retuned |

Not touched: the camera block, `App.CAM`, `Input.ts`, `UI.ts`, `style.css`, `layout.ts`.

## 4. Land → movers

Each land was shot at 9:00, 13:00 and 18:00, two frames one game-second apart, standing on a road (`tools/play-sweep.mjs`); the pairs were compared by eye.

| Land | Movers (all in `traffic.ts` unless noted) | Seen moving in frame |
|---|---|---|
| The Common | four pony carts with walking drivers on the king's road (6:48–19:36), the horse grazing at the post (`Horse.ts`), six larks, bats after dark | carts and drivers at all three hours; the horse's head |
| Kingdom of Brim | eight townsfolk milling the square 8:30–17:30 (round the fountain and Marget's counter), the carts pass through, a pigeon flock that lifts every ~40 s and when the walker runs at it, market murmur | crowd and carts, every pair |
| Castle Greyweather | a sentry pacing the gate all day and night, two rooks round the keep, the keep's flag snapping, bats | the sentry, every pair; rooks small |
| Maple Court | four cars on the whole motor road (two of them all night) plus two that only work main street, an occasional horn within 80 u, a dog on main street, two strollers on the pavement 7:00–21:00, garden birds flitting, bats | cars and strollers, every pair |
| Greyline City | the motor-road cars, five pigeons, tower lamps blinking after 18:40 | cars and pigeons |
| The Cubicle Mile | the commuter-road cars, pigeons, garden birds in the shrubs | cars |
| Harrow Downs | eight sheep drifting in their field (trot away from the walker), a shepherd standing about with them 6:30–19:30, larks, mill smoke blown by the wind, bats | sheep and smoke |
| Bleach Flats | two tumbleweeds bowling east on the wind, four kites | tumbleweed |
| Splitrock Canyon | two tumbleweeds up and down the dry bed, a low kite orbiting the cut, a kite crossing the sky gap over the mouth, wrens in the cut | kite; tumbleweed faint against the shadowed floor — **the weakest land** |
| The Penwood | a rambler walking the track, birds flitting between the pines, three crows over the wood | the rambler, every pair |
| Longshore | six gulls along the coast, a dog running the tideline, the sea glints | gulls; the dog was not in the chosen frame |
| The Wide Blue | three sails tacking (one works the deep water west of the bar), two low gulls over the bar, two more out at sea | gulls over the bar; sails in frame from the river mouth, not from the bar |
| Everywhere | a visible rain curtain ahead of the rain with gusts in the fields first | not screenshot in this pass (weather pinned clear for the sweep) |

## 5. frameCost before / after

`__inklands.frameCost(30)` on the same play server rig, 13:00, standing at the same three spots; baseline is `dcd1a6e` built in a worktree. Draw calls are exact; ms is SwiftShader and noisy, quoted only as a sanity check.

| Spot | Before calls | After calls | Δ | tris before → after |
|---|---|---|---|---|
| Greyline City (148, 230) | 318 | 324 | +6 | 214 510 → 214 850 |
| The Common (−45, 75) | 389 | 395 | +6 | 214 686 → 215 026 |
| Brim (−45, −55) | 365 | 369 | +4 | 216 494 → 216 830 |

The +6 is the four traffic fields plus the horse's sprite and the hitching post; +4 where the horse is culled. Traffic is under the 12-call budget with room. No per-frame allocations in `traffic.tick` (one reused `Object3D`, one reused path sample).

## 6. Not finished, bluntly

- **Coast to coast is 2¼ minutes at a run, not 4–5.** See §2. One constant to change if the integrator wants the longer world.
- **The east road runs through the river** for ~20 units east of its bridge, from about (116, 42) to (130, 36): the road polyline and the river polyline share a course there. On foot, on the bicycle and on the horse you have to leave the road on the south side to get past. Pre-existing, in `layout.ts` (a hot spot), not fixed here. `tools/check-roads.mjs` cannot see it because it teleports along the road.
- **The canyon is still nearly still.** Tumbleweed on the bed and a kite over the mouth exist but read faintly at the canyon mouth. It wants a ground-level mover with contrast (a goat on the ledges, rockfall dust).
- **The rain curtain, gusts, mill smoke in wind, horn, hooves and whistle sounds were not verified in this pass.** The sweep pinned the weather clear and the harness has no ears. The code is the first engineer's; I read it and it builds; I did not screenshot rain.
- **The tideline dog and the sail off the bar were never in a frame I looked at.** They run; I could not prove them from the spots I chose.
- **The horse's sprite does not yaw to the camera** (it is a plane like the bicycle's). CAMERA's "standees always face the camera" pass needs to include `Horse.sprite`; the traffic sprites already do it themselves.
- **Portrait rig**: three frames only (Common at 9, Maple Court at 13, Brim at 11); the cart and the crowd read at phone size. Nothing was tuned for it.
- `tools/check-roads.mjs` still walks roads at "4.1 units a second" in its comment and its sampling; it is a tool, untouched.
- No `check-lures` / `check-fields` runs against this branch.

## Region rects and the walker's start (unchanged, for the record)

`WORLD = {−380…380, −280…280}`. `POSTER (−45, 58)` (title), `SPAWN (24, 82)` (set out).

| id | name | rect (minX, maxX, minZ, maxZ) |
|---|---|---|
| ocean | THE WIDE BLUE | −380, −250, −280, 280 |
| beach | LONGSHORE | −250, −150, −280, 280 |
| castle | CASTLE GREYWEATHER | −150, 60, −280, −160 |
| kingdom | THE KINGDOM OF BRIM | −150, 60, −160, −10 |
| meadow | THE COMMON | −150, 60, −10, 120 |
| neighborhood | MAPLE COURT | −150, 60, 120, 280 |
| forest | THE PENWOOD | 60, 230, −280, −100 |
| canyon | SPLITROCK CANYON | 230, 380, −280, −100 |
| downs | THE HARROW DOWNS | 60, 230, −100, 130 |
| desert | THE BLEACH FLATS | 230, 380, −100, 130 |
| city | GREYLINE CITY | 60, 230, 130, 280 |
| office | THE CUBICLE MILE | 230, 380, 130, 280 |

Horse home `(−36, 66)`, hitching post `(−33.6, 66.4)`, bicycle home `(−60, 149)`, boat home per `layout.BOAT_HOME`.
