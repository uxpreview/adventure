# INKLANDS — CODE MAP

Repo `/home/user/adventure` (or your worktree). `src/` ≈ 43.6k lines TS. Vite + Three.js r170 + gsap. Entry `index.html` → `src/main.ts`. **Do not read `design/`** (archived doctrine). Prose comments in source are long and doctrinal; the mechanism is described here instead.

---

## 1. BOOT AND LOOP

`src/main.ts:1-3` — three lines: `new App()`.

### `src/core/App.ts` (2378 lines) — the only orchestrator

**`constructor()` — `App.ts:126-736`.** Order matters; sections in sequence:
- `129-138` renderer, camera (`PerspectiveCamera(App.CAM.desktop.fov, 1, 0.1, 320)`), `THREE.Fog(PAPER_HEX, fogNear, fogFar)`.
- `140-155` terrain mesh, `new World(scene, terrain)`, `Footprints`, `Character`; `char.onStep` → `audio.step(0.42 + 0.58*effort)`.
- `157-169` boat / bicycle / train added to scene, positioned from save or `BOAT_HOME` / `BICYCLE_HOME`.
- `171-185` `PaperFX`, `Input`, `POIManager`; POI callbacks wired: `poi.groundAt = terrain.heightAt`, `poi.skylineAt = world.nearTopAt`, `poi.reserved = ui.chrome`.
- `188-202` **every POI in the game registered up front** from `ALL_POIS` (`App.ts:47-51`, twelve `*_POIS` arrays). `def.onInteract = () => this.act(def)`; a `sit` POI gets its prompt wrapped to say `STAND UP` when seated.
- `207-271` four synthetic POIs with live getters (never spread — see `POI.ts:57-64`): **the hand** (weak, throw/put-down), **the oars**, **the bicycle**, **the train seat**.
- `273-290` `input.onInteract` dispatch order: note → map → choice (swallowed) → seat (stand) → `activePoi.onInteract`.
- `292-319` UI callbacks: `onToggleSound`, `onWear`, `onOpenMap` → `renderMap({discovered, here, walked, width})`, `onBegin`/`onContinue` → `start()`.
- `321-355` clock/day from save, then `?hour= ?day= ?weather=` query overrides; `knowledge.load`, `things.load`, `worn.load`.
- `361-367` walker placed at `save.pos ?? POSTER`; `world.ensure` + `inkImmediate` + `snapCamera()`.
- `372-387` two window events: `inklands:event` → `audio.event(detail)`; `inklands:run-now` → the one-time run hint.
- `389-391` `resize()`, `renderer.setAnimationLoop(() => this.tick())`.
- `393-733` **the `?debug` block** (below).
- `735` `bootLoader()`.

**`bootLoader()` — `App.ts:738-752`.** gsap tween 0→1 over 1.9 s driving `ui.setProgress`; on complete `ui.hideLoader()` then 0.75 s later `ui.showTitle(hasSave)`.

**`start(fresh: boolean, blink = true)` — `App.ts:754-811`.** Hides title; on `fresh` teleports to `SPAWN` behind `ui.blink()` (harness passes `blink=false`); sets `started`, `audio.setMood(region)` **before** `audio.init()` (order is load-bearing, `783-790`); `save.discover`, `knowledge.learn('name:'+id)`, `ui.showRegionCard`; on fresh-or-new-land prints the four-item hint (`804-809`).

**`tick()` — `App.ts:1703-2377`.** Fixed order:
1. `1704-1715` dt: `clock.getDelta()` capped 0.05, or `forceDt`; **held+no forceDt → re-render last frame and return**.
2. `1722-1746` `dayClock.advance(dt * (seat ? SIT_TIME(6) : 1))`; `events.tick`; `weather.tick`; `fx.setDay/setWeather`; `weatherVoices(dt)`; sky/clear colour written only on change.
3. `1748-1791` `input.update(dt)`; `char.frozen` from open cards; seat step-off; swing `sit.follow`; `char.carry = roadCarryAt(...)`; grade probe 2.2 units ahead; `char.update(dt, input.move)`; `teachTheRun(dt)`.
4. `1814-1833` **collision**: `refuses` closure differs per mount (boat = `!rowableAt`; bicycle = `bicycleRefuses`; foot = `terrain.blockedAt || barriers.blocks`); axis-separated pushback against `prevPos`.
5. `1842-1853` `char.setGround(...)` with mount offsets; `save.walked += moved`.
6. `1861-1914` boat / bicycle / train updates, oar cadence every 4.2 units, door hiss.
7. `1920-1960` `things.tick`, landing resolution (skim / plop / land / caught / stranded), `dress()` on `worn.dirty`, hand texture swap, `heavy` speed penalty.
8. `1962-1965` `prints.update`, `terrain.update`, `world.tick(dt, elapsed, px, pz, regionId, windK, camX, camZ)`.
9. `1972-2001` rooms blend + card; region crossing (`crossInto`); district crossing (small card).
10. `2002` `surfaceTick()` — step zone + `char.stamping` + `char.damp`.
11. `2006-2220` **land ambience** — one long per-region `if/else` chain firing `audio.event` on an `ambientAcc` countdown. Largest editable block in the file.
12. `2221-2234` mixer: twice a second, `setMoodIntensity(0.45 + 0.9*effort)` and `setHour`.
13. `2236-2264` POI update (`activePoi`), `knowledge.travel`, persist every 4 s or on dirty.
14. `2266-2374` **the camera** (section 2).
15. `2376` `fx.render(dt)` unless `noRender`.

**`resize()` — `App.ts:1278-1288`.** dpr capped at 2; `renderer.setSize`, `fx.setSize(w,h,dpr)`, `camera.aspect`, `camera.fov = camRig().fov`.

### `window.__inklands` — `?debug` only (`App.ts:393-733`)

Objects: `char, cam, input, audio, save, terrain, scene, world, renderer, boat, bicycle, train, knowledge, things, events, weather, worn, WORN, rooms, barriers, common, company, layout, clock`.

| Hook | Meaning |
|---|---|
| `region()` | current region id |
| `setHour(h, run=false)` | pin the day clock and tell Audio |
| `setDay(d)` / `setWeather(k|null)` | day index; pin/unpin a weather preset |
| `runTheLine()` | start the 8:15 from the castle gate |
| `warpTrain(stop, carrying)` | park it dwelling at a stop with N passengers |
| `rideTheLine()` | board/alight (= `toggleTrain`) |
| `hideTrain()` / `parkTrain()` | un-spend the reveal / park it ended at the line's end |
| `onPlatform(land)` | who/what the 8:15 would find on that land's platform |
| `qualified()` | whether the walker has decided enough waits |
| `learn(id)` / `waitAnswers` | write knowledge directly; the twelve answers table |
| `takeOars()` / `putBoat(x,z)` | boat mount / relocate |
| `takeBicycle()` / `putBicycle(x,z)` / `bicycleRefuses(x,z)` | bicycle equivalents |
| `stepOff()` | dismount anywhere (bypasses mid-river refusal) |
| `carryAt(x,z)` / `rowableAt(x,z)` / `earshot(x,z,hour)` | road carry / rowable water / placed voices in reach |
| `effort()` | `char.effort` 0..1 |
| `drive(mx, mz, run)` / `release()` | set/clear `Input.hold` — a held direction at a held pace |
| `peek(v|null)` | set/clear `Input.holdPeek` |
| `goto(x,z)` | stand up, teleport, re-ground, `snapCamera()` |
| `frameCost(frames=30)` | ms/frame + draw calls + triangles, `gl.finish()`-bounded |
| `begin()` | `start(...)` with no blink |
| `setTime(t)` | pin `elapsed` + fx + char + terrain shader clocks |
| **`step(dt, n)`** | advance `n` fixed ticks rendering only the last; sets `held` |
| **`resume()`** | give the clock back to rAF |
| `setBearing(on)` | pin `camYaw`/`camAstern` to zero (every regression sheet) |
| `bearing()` | `{yaw°, astern, peek, back}` — `back` is the rig's commanded dolly |
| `quiet()` | sweep transient chrome (`UI.quiet`) |
| `press()` | fire the interact key exactly as a player |
| `promptText()` | resolve `activePoi.def.prompt` |
| `seated()` / `standUp()` | seat state |
| `choose(i)` / `choiceOpen()` / `closeChoice()` / `openChoice(t,b,opts)` | choice card |
| `holding()` | `things.held` |
| `roomK()` | how far into a room the camera thinks the walker is |
| `wearing()` / `wearLabel()` / `pressWear()` | worn item, button label, button press |
| `life` | `{drawn: () => reports, routines, routineAt}` for `check-fields` |
| `moatRed`, `districtAt`, `regionAt` | land predicates for `check-verbs` |

### Save — `src/core/Save.ts` (144 lines)

`SaveData` (`Save.ts:3-89`), key `'inklands-save-v1'` (`91`), `DEFAULTS` (`93-108`). Saved: `pos`, `discovered[]`, `readNotes[]`, `skin`, `muted`, `walked`, `boat`, `bicycle?`, `hour`, `day?`, `known[]` (all knowledge ids), `passed[]` (route posts), `taughtRun`, `things{id → {x,z}|null}`, `worn?`. Methods: `persist()` (`123`), `discover(id): boolean` (`131`), `readNote(id)` (`138`). Written in `App.tick` at `2248-2263`.

---

## 2. CAMERA

**Movement is WORLD-AXIS, not camera-relative.** `App.ts:1790` passes `this.input.move` straight to `Character.update`, which maps `move.x → world +x`, `move.y → world +z` (`Character.ts:381-383`). `camYaw` never touches input. W always walks −Z regardless of peek.

### Fields (`App.ts:95-124`)
`camTarget` (95, the aim point), `camGround` (107, damped ground under the aim), `camRise` (109, damped ground-ahead rise), `camBack` (111, commanded trail distance, exposed to the harness), `camYaw` (117, radians east of north), `camAstern` (118, 0..1 of travel at the lens), `bearingOn` (119, harness pin).

### `App.CAM` — `App.ts:1346-1593`
- Rigs (`1354-1359`): `desktop {back 13.0, up 6.0, look 3.4, fov 42, peekYaw 26, lead 4.2}`, `portrait {14.4, 6.9, 4.0, 54, 12, 2.0}`, `posterDesktop`/`posterPortrait` (peekYaw 0, lead 0).
- Rise probes (`1361-1372`): `aheadNear 34 / aheadMid 60 / aheadFar 88`, `riseCap 14`, `riseBack .90 / riseUp .52 / riseLook .38`, `clearance 2.8`.
- Fog (`1376-1378`): `fogNear 50, fogFar 175, fogPerUnit 3.6`.
- Bearing (`1534-1555`): `yawEase 2.2`, `yawSnap 0.0026`, `leadSec 0.9`, `asternBack 5.5`, `asternLook −1.6`, `asternEase 0.85`.
- Room rig (`1587-1592`): `desktop {back 4.0, up 1.4, look 0.8}`, `portrait {2.0, 1.3, 0.8}`, `rate 3.4` units of dolly per second.

Mount speeds nearby: `WALK {max 4.1, run 1.5}` (`1336`), `ROW {5.4, 1.3}` (`1337`), `BIKE {7.4, 1.2}` (`1344`).

### Functions
- `camRig(): rig` — `App.ts:1595-1600`. Portrait iff `camera.aspect < 0.8`; poster rig until `started`.
- `snapCamera()` — `App.ts:1602-1623`. Zeroes yaw/astern, copies `camTarget` from the walker, resamples ground and rise, positions and `lookAt`s instantly, `applyFog()`. Called from `constructor`, `start`, `goto`, and every mount/dismount.
- `riseAhead(x, z, here, yaw): number` — `App.ts:1639-1650`. Three `smoothHeightAt` probes **up the lens bearing** (not travel); returns `clamp(0, riseCap, max − here)`.
- `applyFog()` — `App.ts:1656-1674`. `lift = camGround * fogPerUnit`; multiplied by `dayClock.state.fogScale` and a weather `close` factor; also `terrain.setFogCap` and `camera.far = max(320, fog.far*1.7)`.
- **Camera block of `tick()`** — `App.ts:2266-2374`:
  - `2287-2297` `yawWant = (rig.peekYaw°→rad) * input.peek` (**the peek is the only source of yaw**); `asternWant = clamp01(char.vel.z / maxSpeed)`.
  - `2298-2310` exponential eases + hard snap to exact zero.
  - `2322-2328` aim point: lead `min(leadSec, rig.lead / speed)`, damped at `k = 1 − e^(−dt·3.2)`.
  - `2330-2339` ground damped at 2.0, rise damped at 1.1, rise scaled by `(1 − rooms.camK)` — **a room is flat**.
  - `2344-2367` `dBack = rig.back + camRise*riseBack + camAstern*asternBack − inK*roomRig.back` → `camBack`; orbit about the aim point by `camYaw`; `camY` floored at `terrain.heightAt(camX,camZ) + clearance`.
  - `2368-2374` `lookAt` with `look + camRise*riseLook + camAstern*asternLook − inK*roomRig.look`; `applyFog()`.

### The peek / lean — `src/core/Input.ts`
`peek` field `Input.ts:71`; keyboard `Comma`/`Period` and two-finger drag; `PEEK_PX = 90` (`47`); `peekTick(dt)` (`265-274`) ramps at rate 6 and snaps to 0 under 0.002. Two pointers down cancels the walk stick outright (`132-138`). `holdPeek` (`83`) is the harness hand.

### Orientation of drawings — **nothing billboards**
- `makeStandee` (`src/engine/props.ts:14-30`) builds a `PlaneGeometry` with `rotation.y` fixed by the caller's `rotY` (default 0, i.e. facing −Z). Nothing in the engine calls `lookAt` on a prop.
- `StandeeField.set(i,x,z,scale,rotY,flip)` (`src/engine/StandeeField.ts:194-201`) writes a fixed `rotation.set(0, rotY, 0)`.
- `Character`: sprite is a fixed plane (`Character.ts:139-146`), oriented by **mirroring** `sprite.scale.x = vel.x < -0.15 ? -1 : 1` (`Character.ts:423`), plus `rotation.z` lean (`Character.ts:473`, `LEAN = 0.19 rad`). No yaw.
- This is why `peekYaw` is capped at 26°/12° — the cosine-narrowing table is in `App.ts:1400-1410`.

### NPC / cast drawing
- `src/world/life.ts:58-134` `Figure` — a routine + one standee, texture swapped by pose, faded in/out; `src/world/life.ts:136-189` `Creature` — a standee with N pose maps and `set(pose,x,z,face,lift,opacity)`; `face` mirrors via scale.
- `src/world/life.ts:53` `drawn[]` registry — everything alive reports to `check-fields`.
- `src/world/textures-cast.ts` (777 lines) — the owner's four sketches plus the office/city prop box: `dachshundTexture`, `bowtieDogTexture`, `squareSheepTexture`, `alienTexture`, `baristaTexture`, `designerTexture`, `officeChairTexture`, etc. All go through `makeTexture(w,h,seed,draw)`.
- `src/world/textures-life.ts` — the generic folk: `folkTexture(kind 0-2, pose 0-6)` (`85`), plus animals.
- `src/world/company.ts:60-179` `Follower` — the goat/dog that walk beside you and stop at a rect edge.

---

## 3. INPUT — `src/core/Input.ts` (275 lines)

Public: `move: Vector2` (49), `run: 0..1` (51), `peek: −1..1` (71), `enabled` (72), `hold` (81), `holdPeek` (83), `onInteract(cb)` (215), `fireInteract()` (218), `update(dt)` (222).

**Keys read in `Input`:** WASD / arrows (`237-240`); `ShiftLeft/Right` → run target 1 (`256`), ramped up at 3.0 / down at 5.0 (`258-259`); `Comma`/`Period` → peek (`269`); `KeyE` / `Space` / `Enter` → `fireInteract()` (`101-103`).

**Keys read in `UI`** (`src/ui/UI.ts:195-210`): `KeyM` toggles map; `Escape` closes map+note, or (with a choice open) walks away; `Digit1/2/3` pick a choice option. **There is no `N` key anywhere** — `grep e.code` returns only these.

**Touch joystick** (`Input.ts:108-196`): `pointerdown` returns immediately for `pointerType === 'mouse'` (`124`) — the stick is a thumb control only. Portrait (`aspect < 0.8`) reserves the top `WALK_BAND_TOP = 0.38` of the page (`41`, `140-141`). Full walk at `JOY_WALK = 48` px, full run at `JOY_RUN = 88` px (`43-44`, `176`). Nub travels a little past the ring (`180-181`); `.running` class over 0.45.

**Harness hands:** `hold = {x, y, run}` drives `move`/`run` with the same ramp (`224-229`); `holdPeek` overrides the peek (`267`). Both are null in the shipping game.

**Prompt line / hints:** the prompt element is `ui.promptEl` (`UI.ts:91`), written by `POIManager` from `def.prompt`; harness reads it via `__inklands.promptText()` (`App.ts:674`). The control hint string `'wasd to walk — E to look — , . to lean — M for the map'` is in `App.ts:804-809`; the run hint `'hold shift to run'` in two places: `App.ts:386` (bull's charge) and `App.ts:1019-1022` (six seconds of unbroken walking). Rendering: `UI.showHint(text, holdMs = 4200)` at `UI.ts:306-316`.

---

## 4. UI / CHROME

### `src/ui/UI.ts` (481 lines)
Public state: `noteOpen` (23), `static chrome = {open}` (28, read by lands so a card pauses a timer), `mapOpen` (29), `choiceOpen` (31), `blinking` (280), `chrome: HTMLElement[]` (85, boxes POI labels must avoid), `root/labelRoot/promptEl/joyEl` (18-21).
Callbacks: `onBegin, onContinue, onToggleSound, onWear, onOpenMap(width) → canvas, onPromptClick` (33-40).

DOM built in `constructor` (`87-193`): labels, prompt, joystick+nub, hud (3 buttons: map / sound / wear — wear hidden until earned), region card (kicker/name/district), blink sheet, hint, note veil+card, choice veil+card, map veil+slot, title veil, loader. Every word goes through `letterEl(el, text, S.*)`.

Key methods:
- `setProgress(t)` `213`, `hideLoader()` `217`, `showTitle(hasSave)` `227` (guarded by `begun`), `hideTitle()` `234`.
- `showRegionCard(kicker, name, {sub?, small?})` — `257-275`. `small` = a district or a room: 17 px instead of 24 px, 2600 ms instead of 3400 ms.
- `blink(cut)` — `281-291`. 240 ms in, `cut()`, 160 ms out.
- `quiet()` — `297-304`. The harness's broom: clears card, hint, blink timers.
- `showHint(text, holdMs)` — `306-316`.
- `openNote(title, body)` / `closeNote()` — `382-396`. `noteWidth()` (`348-357`) reads the card's computed `max-width` and padding — the wrap width is a measurement, not a constant. `letterNote()` (`359-380`) sizes type from that width.
- `openChoice(title, body, options, pick)` / `letterChoice()` / `pick(i)` / `closeChoice()` — `408-459`. Max 3 options; each is a `.choice-btn` button.
- `openMap()` / `closeMap()` — `461-480`. Computes delivered width `min(92vw, 78vh*1.2368, 940)` and hands it to `onOpenMap`.

### `src/ui/lettering.ts` (242 lines) — how to hand-letter anything
- `letterCanvas(text, style: LetterStyle): HTMLCanvasElement` — `69-121`. Wraps via `wrapLines` (`42-63`) against `measureLine` from `engine/script`, sizes the canvas from the widest line and `boxOf(hand)`, then `writeLine` per line with a seed hashed from the string (so re-renders never shimmer).
- **`letterEl(el, text, style)`** — `129-137`. The workhorse: caches by content key, clears the element, sets `aria-label` to the real text, adds class `lettered`, appends the canvas. `.lettered canvas { mix-blend-mode: multiply }` (`style.css:39`) is what makes it receive the paper.
- `letterDocCanvas(text, pxSize, opts)` — `145-172`. In-fiction typeset documents via `legibleCaps` (16-segment machine), monospaced enough for dot leaders.
- `panelPageURL(seed)` — `180-224`. A full paper page as a data URL.
- **`S` house styles — `229-242`**: `display(px)` (caps, centred, α .9), `button(px=11)` (α .86), `quiet(px=9.5)` (α .82), `voice(px=12)` (α .85), `pencil(px=10)` (PENCIL colour, weightScale .85).
- `LetterStyle` (`20-34`): `hand, color, alpha, px (x-height in CSS px), maxWidth, align, tracking, weightScale, leading, seed`. Default hand `NATE_ADULT` (`src/engine/script.ts:286`).

### `src/ui/map.ts` (312 lines)
`renderMap({discovered, here, walked, width}): HTMLCanvasElement` — `41-312`. Fixed 940×760 canvas, `pad 56`; `X()/Z()` project `WORLD` into it (`78-81`). Draw order: paper + grain (`84-91`) → world frame (`94-97`) → region borders in pencil (`100-109`) → coastline sampled every 6 units + sandbar dots + wave dashes (`115-141`) → river + ponds (`144-149`) → **roads dashed, except `road.line` inked as one continuous stroke once `knowledge.has('route:the-line')`** (`155-175`) → bridges (`176-179`) → **land names in three registers** (`186-229`: `unknown` = `?` + hatch, `heard` = PENCIL + underline, `seen` = INK, heavier) → district dashed rects + names, suppressed under 560 px delivered width and collision-tested against `placed[]` (`244-277`) → **"you are here"** scribble circle + dot + the word `you` (`280-291`) → the boast line (`294-309`).
**There are no pins.** The only marker is the you-are-here circle. `ink` scale factor (`70`) enlarges lettering up to 2.2× on small maps.

### `src/style.css` (444 lines)
Classes, in file order: `:root` vars (`5`), `#app` (`28`), `#app > canvas` (`33`), `.lettered canvas` (`39`), `.loader`/`.loader-track`/`.loader-bar` (`44-73`), `.title-veil`/`.title-box`/`.game-title`/`.game-sub`/`.title-btn` (`75-133`), `.hud`/`.hud-btn` (`135-160`), `.region-card` + `.district` (`162-198`), `.blink` (`200-213`), `.hint` (`215-228`), `.labels`/`.poi-label` (`230-245`), `#prompt` (`247-261`), `#joy`/`.nub`/`.active`/`.running` (`263-307`), `.note-veil`/`.note-card`/`.note-close` (`309-349`), `.choice-card`/`.choice-options`/`.choice-btn` (`351-378`), `.map-veil`/`.map-slot`/`.map-canvas` (`380-423`), portrait media query `@media (max-aspect-ratio: 4/5)` (`425-444`).

---

## 5. WORLD

### `src/world/layout.ts` (1053) — the authored geography, no rendering
- `WORLD: Rect = {minX −380, maxX 380, minZ −280, maxZ 280}` — `23`. 760 × 560 units.
- `REGION_SPECS: RegionSpec[]` — `42-72`. Twelve `{id, name, kicker, rect, wash, step}` on a 4×3-ish grid. `SPEC_BY_ID` `74`; `regionAt(x,z)` `77-85` (linear scan, off-sheet → ocean).
- `POSTER {x −45, z 58}` `106`, `SPAWN {x 24, z 82}` `112` — deliberately different places.
- `DISTRICTS: District[]` — `143-307`, ~40 sub-rects; `districtAt(x,z)` `308`.
- `coastX(z)` `347`, `SANDBAR` `373`, `barDist` `379`, `seaAt` `402`.
- `Road` type `423-464` (`pts, width, carry, line?`); **`ROADS`** `466-617` — 9 roads; three carry `line: true` (king's road / main street / commuter spur) and `carry: 1`. `roadCarryAt(x,z): RoadCarry` `637-674` — what the road does to your heading. `ROAD_BAND_MAX` `675`.
- Water: `RIVER` `700`, `RIVER_WIDTH 9` `705`, `BRIDGES` `708`, `PLANKS` `721`, `FORDS`/`fordAt` `764-777`, `PONDS` `779`, `riverAt`/`pondAt`/`waterFieldAt` `811-878`, `ROW_MIN_WATER .42` `879`, `ROW_REACH 34` `881`, `rowableAt(x,z)` `894`, `BOAT_HOME` `917`.
- The 8:15's track: `THE_LINE` `940`, `LINE_ARC` `956`, `LINE_LENGTH` `967`, `lineAt(s)` `970`, `nearestOnLine` `986`, `LINE_STOPS` `1033`, `LINE_STOP_S` `1049`.

### `src/world/elevation.ts` (996) — the single authority on where the ground is
Constants `61-80`: `H_STEP 4`, `H_MIN_X −700 / H_MAX_X 700 / H_MIN_Z −600 / H_MAX_Z 600`, derived `H_NX / H_NZ`, `NEXT_SHEET_Y −2.2`, `DESK_Y −4.4`, `SHEET_PAD 14`, `MAX_WALK_SLOPE 0.72` (the only traversal gate on foot).
Feature functions: `foldX(z)` `198`, `tearX(z)` `240`, `tearFloorK` `262`, `duneX(z)` `303`, `HOLD_PLAN` `340`, `holdfastK` `381`, `CUT_PATH` `394`, `castleGateK` `503`, `landHeight(x,z)` `585`, **`pageHeight(x,z)`** `848`, `class HeightField` `925`. No `Math.random` anywhere in the file — the sheet folds identically on every machine.

### `src/world/terrain.ts` (787)
`class Terrain` `63`. Paint field is `TEX_W 768 × TEX_H 576` (`47-48`) mapped over `WORLD`'s span; rgb = land wash, a = waterness; the same pixels answer CPU queries (`water`, `road` `Uint8Array`s). Mesh is one `PlaneGeometry` subdivided at exactly `H_STEP` so vertices land on field nodes (`98-101`). Query API: `heightAt` `523`, `smoothHeightAt(x,z,r?)` `529`, `normalAt` `535`, `waterAt` `549`, `roadAt` `553`, `onPlanks(x,z,pad)` `564`, `blockedAt` `578`, `slopeAt`, `setFogCap` `512`, `setTime`, `update(dt)`.

**Scaling the world 2×** — the change set, in dependency order:
1. `layout.ts:23` `WORLD` bounds, then every rect in `REGION_SPECS` (`42-72`) and `DISTRICTS` (`143-307`), every road `pts`, `RIVER`, `PONDS`, `BRIDGES`, `PLANKS`, `FORDS`, `SANDBAR`, `THE_LINE`, `POSTER`, `SPAWN`, `BOAT_HOME`, `BICYCLE_HOME`.
2. `elevation.ts:63-66` `H_MIN/H_MAX` must still enclose `WORLD + SHEET_PAD + desk margin`; every authored feature function reads world coordinates directly. `H_STEP 4` fixed ⇒ vertex count grows 4×; halving `H_STEP` is not needed, raising it is the cheap lever.
3. `terrain.ts:47-48` `TEX_W/TEX_H` — currently ≈ 1 texel/unit; keep the ratio or the wash queries coarsen.
4. `regions/index.ts:167-168` `BUILD_REACH 185` / `SHOW_REACH 165` and `SKY_CELL 4` (`195`) — reach is in world units, so a 2× world halves how much is built at once unless raised.
5. `App.CAM` fog (`1376-1378`) and `camera.far` (`App.ts:133` near/far `0.1/320`), plus `world/earshot.ts` radii and `things.BORDER` (`things.ts:216`).
6. `ui/map.ts:60-81` — `W/H` are fixed pixels; only `sx/sz` change, so the map survives automatically, but label collision spacing (`245-246`) will want a look.

### `src/world/regions/index.ts` (588) — streaming + the builder contract
- **`BuildCtx`** — `37-69`: `group, terrain, r (seeded rng), rect`, and five factories:
  - `field(tex, capacity, opts) → StandeeField` (`43`, impl `306-315`) — instanced, born ghosted at 0.16.
  - `standee(tex, w, h, x, z, opts?) → Mesh` (`55`, impl `316-365`) — vertical cutout on `heightAt`; `opts.solid` (`true | number | {hw, gap, keep}`) walks the footprint in half-unit steps and registers only the runs **off** the road web as barriers (`330-362`); every standee also records its top into the skyline and its exact foot line into `feet[]`.
  - `decal(tex, w, h, x, z, rotY?, opacity?)` (`58`, impl `366-372`) — lies along the surface normal via `lieOnGround` (`207-215`).
  - `groundY(x,z)` / `hang(m, h)` (`60-62`).
  - `scatter(n, {pad, minDist, rect, allowWater, allowRoad, allowSteep, avoid})` (`64-68`, impl `373-392`) — seeded, refuses water/road/slope > 0.5 by default.
- **`RegionBuilder = (ctx) => update?`** (`71-72`); a builder optionally returns `(dt, t, px, pz) => void`, called every frame while visible.
- **Registering a region**: add the id to `RegionId` (`layout.ts:25`), a spec to `REGION_SPECS`, and the builder to `BUILDERS` (`index.ts:145-158`). Nothing else.
- **`WorldPOI`** — `75-143`: `POIDef` plus `note {title, body|(), learns[]}`, `touch(px,pz)`, `sit {x, z, learns, lift, follow(t), onSit}`, `choice {title?, body, options[{label, door, sits?}], learns[]}`, `weak`.
- `class World` `242`: `ensure(id)` `286`, `build(spec)` `292`, `tick(...)` `405-431` (builds **at most one region per frame** within `BUILD_REACH 185`, culls at `SHOW_REACH 165`, runs the ink cascade at 34 u/s on first entry), `nearFade(camX,camZ)` `450-481` (anything within 4.5 units of the lens drops to a quarter), `skylineAt` `509`, `nearTopAt` `529`, `skylineWithin` `552`, `inkImmediate` `569`.
- Builders: `meadow.ts` (1335), `wilds.ts` (3383 — forest/canyon/desert/downs), `coast.ts` (1620 — ocean/beach), `civic.ts` (4371 — kingdom/castle/neighborhood/city/office), `room.ts` (143 — `buildRoom(ctx, def, kind, floorTex, wallTex, wallH, seed)`, the shared interior).

### The other world modules
| File | What it owns |
|---|---|
| `barriers.ts` (122) | `Barrier {id, x0,z0,x1,z1, half, gaps[]}`, `Gap {id,x,z,r,open}`. `barriers.register(b)` `58`, `gap(id)` `69`, **`blocks(x,z)`** `78-116`. Every barrier is a drawing; there are no invisible walls. `insetRect` `120`. |
| `things.ts` (525) | `ThingKind = 'pushable' | 'carriable'`. `ThingDef` `45-95` (`shove, refuse, glide, hand, handSize, skims, rolls, heavy`). Registry: `register` `153`, `addCatcher` `165`, `load` `185`, `saved(px,pz)` `201`, **border clamps `clampX/clampZ` with `BORDER = 2.0`** `213-217`, `push` `229`, `roll` `266`, `pickUp` `282`, `place` `298`, `consume` `314`, `throw_` `331`, `skip`, `tick(dt)`, `morning()`. `landed[]` and `splashes[]` are drained by `App.tick:1921-1943`. 16 things registered across the lands. |
| `earshot.ts` (183) | `VOICES: Voice[]` `66-130` — 33 placed sounds `{land, id, x, z, r, from?, to?, silence?}`; `SURF_REACH 46` `131`, `EVENT_REACH 45` `139`; `voice(land, id)` `149` (throws if missing); **`earshotAt(x, z, hour): Heard[]`** `162-182` — placed + moving + in-progress events. `App.hears()` (`1028-1031`) reads the same table the road tool walks. |
| `events.ts` (317) | `ScheduledEvent {id, land, at, hours, place?, onStart, onEnd}` `53-70`; `happening.ids` `81`; `events.register` `88`, `progress(id, hour)` `103`, **`tick(px,pz)`** `121-148` (fires `onStart`/`onEnd` on hour crossings), `between(a,b)` `150`, `resync` `168`. Also the routine layer: `Stop` `194`, `RoutineDef {id, land, stops, pace, walkPose, onLeg}` `208`, `RoutineState` `223`, **`routineAt(def, hour)`** `242-278`, `routines[]` `279`, `registerRoutine` `285`. 48 events registered. |
| `knowledge.ts` (472) | `Kind = 'name'|'fact'|'route'|'reason'|'door'` `69`. `ROUTES` `109-206`; **`WAIT_ANSWERS`** `207-278` (the twelve, land → the id that answers); **`WAIT_DOORS`** `289-323` (both doors per land); `WAITS_FOR_THE_LINE = 7` `326`. Class: `load` `336`, `has` `347`, `learn` `361`, **`register(regionId, discovered): 'seen'|'heard'|'unknown'`** `375` (what the map draws), **`travel(x,z)`** `388-407` (marks route posts underfoot), `answeredWaits` `428`, `decided(land)` `443`, `decidedWaits` `453`. |
| `daylight.ts` (337) | **`SECONDS_PER_HOUR = 100`** `267` ⇒ a 40-minute day; `DAY_START = 9.0` `273`. `DAY` keyframe table + `sample(h)` interpolation `160-240`; `DayPhase` `137`; `class Clock` `284-333` (`hour`, `day`, `running`, `advance(dt)`, `set(hour)`, `state`, `lamp`, `phase`, `clockText`); `clock` singleton `334`; `LAMP_POOL`/`LAMP_EDGE` `80-81`. Read directly by everything; only App advances it. |
| `weather.ts` (197) | `WeatherKind = 'clear'|'wind'|'rain'|'fog'|'storm'` `49`; `planFor(day)` `107` (authored days then hashed); **`weatherAt(day, hour): WeatherState`** `120-164` — a pure function of day+hour; `PRESETS` `166`; `weather.tick()` `180`, `weather.pin(kind|null)` `184`, `weather.windK`. |
| `life.ts` (194) | `Figure` `58-134`, `Creature` `136-189`, `drawn[]` registry `53`, `stops(rows)` helper `192`. A routine is a `RoutineDef` with `stops` = rows of `[hour, x, z, pose, face?, hold?]`. ~66 `stops([...])` call sites: 36 in `civic.ts`, 15 in `coast.ts`, 11 in `wilds.ts`, 4 in `meadow.ts`. |
| `company.ts` (184) | `FollowerDef {id, rect, home, gap, notice, walk, trot, margin?, keepOut?}` `35-56`; `class Follower` `60-183` — `tick(dt, px, pz, blocked)` `110-176`, `inLand` `98`, `reset` `177`. **Three followers**: the Common's goat (`meadow.ts:164`), the dawn dog (`meadow.ts:183`), the Downs dog (`wilds.ts:2693`, exported as `downsDog`). They stop dead at their rect's edge — the rule shown, never said. |
| `rooks.ts` (48) | `ROOK_ROOST` / `ROOK_PERCH` `19-20`; `rookAt(i, hour): RookState` `29` — pure function of the hour, castle ↔ downs. |
| `worn.ts` (131) | `WornDef {id, name, land, slot, w, h, dy}`; **`WORN`** `60-65` — four items (crown/castle, hat/beach, lanyard/office, helm/ocean); `wearId(id)` `67`; class: `def` `80`, `has` `84`, `owned` `89`, `take` `98`, `put` `107`, `next()` `115`, `load` `123`. Drawings made once in `App.drawWorn` (`App.ts:907-914`). |
| `rooms.ts` (120) | `RoomDef {id, land, name, rect, door {x, r}}` `43-54`; `rooms.register` `65`, `at(x,z)` `82`, `blend(id)` `92`, **`tick(dt, x, z, rate)`** `103-118` sets per-room `k` and `camK` (the deepest). Built by `regions/room.ts:63` `buildRoom`. |

---

## 6. NPC / CAST

**The twelve waits** are keyed by land in `knowledge.ts:207-278` (`WAIT_ANSWERS`) with the person named in the comment on each entry:

| Land | Person | Answer id |
|---|---|---|
| meadow | **NELL** | `door:the-cart-turned-north` |
| kingdom | MARGET | `reason:brim` |
| castle | WICK | `reason:the-fifth-banner` |
| beach | PYE | `door:the-eighth-pot` |
| ocean | WREN | `door:the-second-mark` |
| forest | BRACK | `fact:the-tarn` |
| canyon | HOLT | `door:the-boat-righted` |
| desert | **AMOS** | `door:the-lid-off` |
| downs | **JOAN HARROW** | `fact:the-place-kept` (never on a platform) |
| neighborhood | VAL | `door:the-gap-cut` |
| city | THE MAN AT THE JUNCTION | `fact:the-man-at-the-junction` |
| office | DENNIS | `fact:the-timetable` |

Positions/routines are authored near named constants in the land files: `MARGET_HOUSE/_ROOM` `civic.ts:248-249`; `WICK_DOOR/_REST/_POLE_W/_POLE_E/_POOL` `civic.ts:1058-1062` + `WICK_MORNING/WICK_EVENING` figures at `civic.ts:1447-1448`; `VAL` `civic.ts:1829`, `VAL_ROOM` `1838`; `JUNCTION` `civic.ts:2660`; `DENNIS` `civic.ts:3394`; `PYE_SHORE/_POTS/_ROWS/PYE_DAY` `coast.ts:210-219`; `WREN_BOAT/_SHORE/_AT_MARK/WREN_DAY/WREN_AFTERNOON` `coast.ts:1051-1238`; `AMOS_NIGHT` `wilds.ts:1776-1786`; `NELL_CARD` `meadow.ts:1169`.

**Second doors** are `WAIT_DOORS` (`knowledge.ts:289-323`) — the only place doors are written against lands. Two readers: `knowledge.decided()` (`443`) and `Eight15.ts:145-155` (`PLATFORM`, which door empties or changes a platform).

**Choice cards** are declared on POIs as `WorldPOI.choice` (`regions/index.ts:127-138`). Twelve card option pairs, at: `meadow.ts:1172-1173`, `civic.ts:931-933` (three options — Brim's belfry), `civic.ts:1683-1684`, `2590-2591`, `3256-3257`, `4320-4321`, `coast.ts:942-943`, `1591-1592`, `wilds.ts:1015-1016`, `1703-1704`, `2484-2485`, `3321-3322` (JOAN's, with `sits: true`).

**What the card does — `App.act(def)` `App.ts:830-876`:** if `def.choice` and no option's `door` is already known, `ui.openChoice(...)` with a callback that (1) `knowledge.learn(option.door)`, (2) learns `choice.learns[]`, (3) `save.readNote(label)`, (4) `sitDown(def)` if `option.sits`. Then falls through the dispatch order **choice → note → touch → sit**. **The consequence lands nowhere but `knowledge`** — one readable id, permanent, re-read by the land's own `update` every frame and by `Eight15`. No announcement, no chime, no tally (`knowledge.ts` deliberately never computes a count).

**The bull opening.** Lives in `src/world/regions/meadow.ts`, not in `script.ts` or `App.start()`.
- Doctrine + geometry `meadow.ts:90-155`: `FIELD {minX −10, maxX 46, minZ 65.6, maxZ 112}`, `FENCE_Z 64.5`, `HEDGE_X −12`, `GATE {x −12, z 82}`, `STILE {12.6, 63.8}`, `BULL_HOME {33, 70}`, `BULL_SHOULDER 2.4`.
- Barriers registered at module load: `the-long-fence` with gap `the-stile`, `the-hedge-return` with gap `the-field-gate` (`meadow.ts:150-158`).
- The goat `Follower` `164-171` (with `keepOut` = the bull's field), the dawn dog `183-186`.
- **`common` state object** `212-231` — `{bull {x,z,state,t,face,stride,balks}, gate {shut}, nell {pose,t,straightFor}, goat, reset()}`. Exported and handed to the harness as `__inklands.common` (`App.ts:559`).
- **The bull state machine** `meadow.ts:719-825`: `graze → watch → charge → balk/fence → home`, plus `lying` at night. Charge speed 8.4 u/s, never steps inside 2.3 units of the walker, aims at the shoulder the camera can see. On entering `charge` it fires `window.dispatchEvent(new CustomEvent('inklands:run-now'))` (`meadow.ts:748`) — caught in `App.ts:382-387`, which prints the run hint once ever.
- **Nell and the gate slam** `meadow.ts:826-870`: closes `barriers.gap('the-field-gate')` once the walker is through and the bull is coming, never with anybody in the gap.

---

## 7. MOUNTS AND VEHICLES

Universal rule: a mount is a **place-feeling, never a menu** — one prompt on the world's own POI, coordinates read live via getters.

| Mount | File | Entered/exited | Refusal |
|---|---|---|---|
| **Rowboat** | `src/engine/Boat.ts` (131): `rowboat` module state `46`, `class Boat` `48`, `setAt` `83`, `update(dt, y, heading, speed, afloat)` `92` | POI `App.ts:228-238` prompt `TAKE THE OARS` → `toggleBoat()` `App.ts:1042-1080`. Mounting shoves off via `launchNear` (`1229-1239`) if beached; dismount finds `landingNear` (`1212-1226`) or shows `'nowhere to step out — row for a bank'` | `!rowableAt(x,z)` (`layout.ts:894`) — everything that is not its own water |
| **Bicycle** | `src/engine/Bicycle.ts` (127): `BICYCLE_HOME {−60, 149}` `45`, `bell {at,x,z}` module state `49`, `class Bicycle` `51` | POI `App.ts:246-253`, one prompt with three meanings → `bicycleKey()` `App.ts:1092-1125`: parked → GET ON; moving (>0.8 u/s) → RING THE BELL (`audio.event('bicycle-bell')` + `bicycle.ring` + `char.recoil()`); stopped → GET OFF onto `stepOffNear` | **`bicycleRefuses(x,z)` `App.ts:1135-1144`** — outside `neighborhood`, sand, blocked/barrier, water off planks, or `App.STAIRS` (`1146`, Val's porch, one rect) |
| **The 8:15** | `src/engine/Eight15.ts` (680): `PLATFORM` table `145-155`, `onPlatform(land)` `161`, `leftAt` `174`, `platform {land}` `204`, `class Eight15` `206` (`s`, `phase: away|running|dwelling|ended`, `stop`, `carrying`, `justOpened`), `static qualified()` `399` | POI `App.ts:261-271` at `train.boardingPos`, prompt `TAKE A SEAT` → `toggleTrain()` `App.ts:1161-1191`. Alight only when `canAlight()` (doors open at a stop) else `'the doors are shut'`; board only when `canBoard(x,z)` | **Structural** — it runs a polyline (`THE_LINE`) and cannot leave it; aboard, `input.move` is zeroed (`App.ts:1789`) |
| **Goat / dogs** | `src/world/company.ts` `Follower` | Not ridden — they attach at `notice` distance and hold `gap`; `keepOut` rects exclude the bull's field | `inLand()` `company.ts:98-108` — they stop dead at their rect's edge and at `keepOut` |
| **Carts / pushables** | `src/world/things.ts` | `touch` verb → `things.push(id, fromX, fromZ)` `229-262`; office chair uses `roll(id, heading, dist)` `266` | Refused by land border (`clampX/clampZ`, `BORDER = 2.0`) or `def.refuse` — a refusal returns `'refused'` so the land can rock rather than roll it |

Shared dismount helpers, all "look south first because the camera looks north": `stepOffNear` `App.ts:1194-1208`, `landingNear` `App.ts:1212-1226`, `launchNear` `App.ts:1229-1239`.

---

## 8. POI / VERBS

`src/engine/POI.ts` (436).
- Tunables `8-20`: `LABEL_CLEAR_R 3.0`, `LABEL_CLEAR 0.9`, `LABEL_MAX_RISE 9`, `LABEL_GAP 6`, `PROMPT_SIDE 2.2`, `PROMPT_SIDE_MAX 4.6`.
- **`POIDef`** `22-50`: `x, z, radius, label?, labelHeight? (default 3.4), prompt?: string | (() => string), onInteract?, onEnter?, onExit?, enabled?, weak?`.
- `class POI` `52-76` — **never spreads the def** (`57-64`), so live getters keep working.
- `class POIManager` `82`: `add(def)` `105` (creates a `.poi-label` div lettered with `S.quiet(10.5)`), `clear` `119`, `setAllEnabled` `130`, `suppressed` `152`, **`update(charPos): POI | null`** `155-…`. Nearest non-weak enabled POI inside `radius` wins; a `weak` POI (the hand) only wins when nothing else does (`196-202`). Labels are placed clear of the skyline and of each other — the farther one goes **up**, never sideways; the prompt is placed first and holds its ground.
- Where a POI **registers a prompt and an action**: it does not — `App.ts:188-202` walks `ALL_POIS` and installs `onInteract = () => this.act(def)` for anything with `choice || note || touch || sit`. A land only authors data.

`src/core/App.ts` verbs:
- **`act(def)`** `830-876` — dispatch order **choice (untaken) → note → touch → sit**. Note path: `audio.note()`, `save.readNote`, `note.learns` → knowledge, `ui.openNote(title, body())`. Touch path: `char.recoil()` then `def.touch(px, pz)`.
- **`sitDown(def)`** `923-933` — teleports to `sit.x/z`, re-grounds, `char.setSitting(true)`, records `seat`, learns `sit.learns`, fires `sit.onSit(px, pz, heading)`. The camera does **not** move; `SIT_TIME = 6` (`922`) runs the day six times faster. `standUp()` `935-939`; any step over 0.3 stands you up (`1752-1754`).
- **`throwHeld()`** `948-958` — distance `1.6 + 4.6 * min(1, speed/(maxSpeed*runMult))`, so a stationary press is a set-down and a run is a throw; `things.throw_` clamps the landing into the thing's own land.
- **`dress()`** `895-906` / **`static drawWorn(d)`** `907-914` / `wearLabel()` `916-920` — one texture per worn id, cached in `wornTex`; label `wearing: <name>` or hidden until something is earned.

---

## 9. RENDER / PEN

- **`src/engine/ink.ts` (1082) — the stroke library.** `rng(seed)` `21`, `Ctx2D` `29`, **`stroke(ctx, pts, r, {width, alpha, color, passes, jitter})`** `254`, `line` `337`, `scribbleCircle` `364`, `hatch` `388`, `scribbleFill` `419`, `makeCanvas(w,h)` `438`, `toTexture(canvas)` `445`, **`makeTexture(w, h, seed, draw(ctx, r, w, h)) → CanvasTexture`** `454-463` — *this is how every drawing in the game becomes a texture*. Also `lettering` `535`, `letteringWidth` `582`, `letteringFit` `591`, `footprintTexture` `614`, `characterSheet` `634`, `blobShadowTexture` `756`, `legibleCaps` `957`, `halftoneBlock` `1059`.
- **Texture → standee:** `makeTexture(...)` → `ctx.standee(tex, w, h, x, z, opts)` (`regions/index.ts:316`) → `makeStandee` (`props.ts:14-30`, `PlaneGeometry` translated so its origin is its feet, `MeshBasicMaterial {transparent, alphaTest 0.08, DoubleSide}`). Ground marks use `ctx.decal` → `makeDecal` (`props.ts:32-53`, rotated flat, `polygonOffset −4/−8`, `renderOrder −6`).
- **`src/engine/props.ts` (120)**: `makeStandee` `14`, `makeDecal` `32`, `disposeGroup` `56`, `makeRibbon` `73`.
- **`src/engine/StandeeField.ts` (365)**: instanced cutouts. `StandeeFieldOpts` `3`; `set(i,x,z,scale,rotY,flip)` `194`, `hide(i)` `~242` (parks at y −4000 so the cascade skips it), `birthAll(t)` `256`, **`cascadeFrom(x, z, speed, now, jitter, reach)`** `266` — the radial re-ink wave (34 u/s from where you crossed the border), `update(time, windK)` `351`, `setPlayer(x,z)` `357` (vertex-stage bend away from the walker).
- **`src/engine/paper.ts` (438)**: `paperGrainTexture(seed)` `68`, `PaperSpec` `174`, `paperSheetTexture(spec)` `195`, `deskGrainTexture(seed)` `367`, `CHAPTER_PAPER` `424`, `paperSpec(chapter)` `437`.
- **`src/postfx/PaperPass.ts` (288)**: `class PaperFX(renderer, scene, camera)` `10`. One fullscreen fragment pass; uniforms `uTime, uVignette, uDim, uSeed, uLamp, uGrainK, uDayTint, uDayValue, uDayLamp, uPoolWarm, uPoolCool, uRain, uFlash, uPixel` (`82-96`). Setters: `setDim` `223`, `setDay(tint, value, lamp, poolWarm, poolCool)` `232`, `setWeather(rain, flash)` `244`, `setVignette` `249`, `setPaperSeed(chapter)` `257`, `setSize(w,h,dpr)` `268`, `setTime`, `render(dt)`.
- **`src/engine/palette.ts` (131)**: `PAPER/#f5f2ea`, `INK/#232633`, `PAPER_HEX`, `INK_HEX`, `BLUE`, `PENCIL`, `SMUDGE_GREY`, `BLOT`, `WHITE_INK`, **`WASH`** `59` (one stain per land), `WASH_HEX` `77`, `LIGHT` `103`.
- **`src/engine/Footprints.ts` (280)**: `FootprintOpts {color, fade, capacity (default 700), size, map}` `4-11`; `class Footprints` `53`; instanced mesh with `aBirth`/`aPress` attributes and a fragment that discards under 0.01 alpha (`120-156`); `stamp(...)` `206`, `layTrail(points, spacing)` `252`, `setColor/setFade/setOpacity/setFreshBoost`, `update(dt)` `196`. Second instance for the barista's dog: `civic.ts:3028` (`capacity 260, fade 900, map: pawTexture()`).
- **`src/engine/script.ts` (491)** — the handwriting synthesizer behind `lettering.ts`: `Hand` `219`, `NATE_HAND` `251`, `BEA_HAND` `262`, `MOM_HAND` `272`, `KID_HAND` `279`, `NATE_ADULT` `286`, `lerpHand` `293`, `measureLine(text, hand, tracking)` `334`, **`writeLine(ctx, text, box, hand, rng, opts)`** `353`, `writeGuides` `461`.

**fps / perf / degrade paths.** There is no automatic degrade ladder — no `degrade` symbol exists in `src/`. What exists:
- `App.resize():1281` caps dpr at 2 for the renderer and `PaperFX`; `lettering.ts:36` caps it at 2 for every lettered canvas.
- `regions/index.ts:405-431` — **one region built per frame**, `SHOW_REACH 165` visibility culling, plus `nearFade` (`448-481`).
- `Footprints` `capacity` (`Footprints.ts:67`) and `StandeeField` per-field `capacity` (`regions/index.ts:43`) are the only hard budgets.
- `__inklands.frameCost(frames)` (`App.ts:541-555`) is the measurement: renders n frames back-to-back with `gl.finish()` and reports `{ms, calls, tris}`.
- `vite.config.ts` splits `three` and `gsap` into their own chunks.

---

## 10. AUDIO — `src/core/Audio.ts` (2554)

Everything is synthesized; no audio assets. Every voice is a **function of the context it is built in**, which is what lets `OfflineAudioContext` render the score deterministically for the gates.

- **`MOODS: Record<RegionId, Mood>`** `19-44` — per land: `{scale: number[], gap, level}`.
- **Voices**: `VoiceOpts` `69`, `Voice` type `82`, `VoiceId = 'box'|'string'|'bowed'|'bell'|'air'` `86`, **`VOICES: Record<VoiceId, Voice>`** `337-360` — a voice is `(ctx, dest, freq, t0, opts) => void`; that signature is the whole extension point for a new instrument. Karplus-Strong line cache `169-210`, noise buffer cache `102-127`.
- **`LAND_VOICE: Record<RegionId, LandVoice>`** `382-406` — `{voice, reg, gain, dur?, damp?, reason}`; the `reason` string is authored per land.
- **`BEDS: Record<RegionId, Bed>`** `443-…` — filtered-noise ambience `{type, freq, q, peak?, peakQ?, peakGain?, level, swell, swellDepth, reason}`.
- **`class Audio`** `903`. Public API:
  - `init()` `938` — build the context and wire the buses (must follow `setMood`).
  - `setMuted(m)` `959`, `setAmbientLevel(v)` `996`, `holdTacet(on)` `1005`, `holdSilence(on)` `1022`, `setDetune(t)` `1032`, `setEcho(t)` `1037`.
  - `setHour(h)` `1057` — the score's own day cycle.
  - `setMoodIntensity(k)` `1070` — ramped over 1.5 s, so App rate-limits to 2 Hz (`App.ts:2221-2233`).
  - **`event(name: string, data?: number)`** `1091-2124` — one big switch, ~90 one-shots: `lark, well-plink, brim-bell, market-murmur, pigeon-flap, banner-snap, rook-caw, surf-break, gull-cry, bell-buoy, oar, oar-ship, halyard, mill-creak, sheep, field-work, axe-far, tarn-drip, pine-tick, stone-fall, slot-wind, hull-rag, grit-run, palm-rattle, sprinkler, far-dog, screen-door, crossing-tick, heels, plant-shift, door-hiss, cup-turn, car-door, well-shout, well-answer, cart-wheels, cart-stuck, stone-land, stone-plop, stone-skip, bull-snort, bull-hooves, gate-slam, goat-bleat, can-knock, thunder, wind-gust, dog-bark, cow-low, heron-croak, seal-bark, fox-bark, owl-hoot, branch-crack, cat-mew, shutter, deep-surface, car-start, crab-scuttle, bicycle-bell, viking-roar, latch, paper-land, …`. **Adding a sound = one `case` here + one `audio.event('name')` call site.** Region builders reach it without plumbing by `window.dispatchEvent(new CustomEvent('inklands:event', {detail: 'name'}))` (bridged at `App.ts:372-374`).
  - `setWeather(rain, wind)` `2125`, `pencilScratch(on, level)` `2252`, **`setMood(region)`** `2314` (crossfade), **`setStepZone(id: StepZone)`** `2420`, **`step(speed = 1)`** `2447`, `note()` `2529`, `solve()` `2535`.

**`tools/render-wavs.mjs`** — renders the score's exported functions through `OfflineAudioContext` (via `tools/audio-lib.mjs`) and writes `.wav` files so the owner can actually *listen*.

---

## 11. TOOLS (`tools/`, all Node + Playwright, none in npm scripts)

**Shared:** `pw.mjs` — exports `CHROMIUM` (`pw.mjs:22`), the browser path resolved per machine; every tool imports it. `shoot-lib.mjs` — exports `VIEWPORTS` (`28`, desktop 1280×720 + portrait 390×844) and **`shoot({out, framings, url, map, hour, extra, bearing})`** (`81`), the shared contact-sheet driver that pins the harness clock and (unless `bearing: true`) calls `setBearing(false)`. `audio-lib.mjs` — offline audio render harness. **`play-server.mjs` + `play.mjs`** — the cold player's hands (see SHARED-BRIEF).

**Gates (`check-*`, run manually):**
| Tool | Asserts |
|---|---|
| `check-audio.mjs` | the score rendered offline: levels, spectra, no clipping |
| `check-camera.mjs` | the bearing's arithmetic — yaw envelope, dolly rate ≤ walk speed, stopped walker is due north (OBSOLETE once the camera is free) |
| `check-fields.mjs` | every instance in the current land is inked in, and every routine that changes a drawing changes it |
| `check-lures.mjs` | the four lures (castle, mill smoke, sea glint, city towers) are in frame from the crossroads on both rigs |
| `check-roads.mjs` | the fifteen-second rule — nothing empty for 15 s on any road, both rigs, per hour |
| `check-sightline.mjs` | the 200-unit sightline up the king's road is unobstructed |
| `check-terrain.mjs` | the height field off-screen: no road climbs a wall, no land is an island, amplitude in range |
| `check-verbs.mjs` | touch / carry / sit / throw and the opening's mechanics |

**Verifiers:** `verify-live.mjs`, `verify-score.mjs`, `verify-story.mjs`. **Shoot scripts:** `shoot.mjs` plus ~22 `shoot-*.mjs`. **Utilities:** `diff-sheets.mjs`, `montage.mjs`, `qa-play-local*.mjs`.

**npm scripts:** `dev` = `vite`; **`build` = `tsc --noEmit && vite build`**; `preview` = `vite preview` (tools expect `:4173`).

---

## HOT SPOTS — files several engineers will touch at once

Make **small, labelled insertions** at these points rather than restructuring.

1. **`src/core/App.ts`** — the contention point. By line range:
   - `47-51` `ALL_POIS` — one line per new land's POI array.
   - `126-390` constructor wiring — POI registration (`188-271`), UI callbacks (`292-319`), load order (`321-355`).
   - `393-733` the `?debug` hook object — **append new hooks at the end, near `730`**.
   - `830-958` the verbs (`act`, `dress`, `sitDown`, `standUp`, `throwHeld`).
   - `1042-1191` the mounts (`toggleBoat`, `bicycleKey`, `bicycleRefuses`, `toggleTrain`).
   - `1346-1593` `App.CAM` — camera constants (CAMERA pillar owns).
   - `1703-1965` the tick's simulation half.
   - **`2006-2220` the land-ambience chain** — each land owns one `else if`.
   - `2266-2374` the camera block (CAMERA pillar owns).
2. **`src/core/Input.ts`** — `237-259` (the key table and run ramp) and `265-274` (the peek). Any new key goes at `237-240` for a held key or `101-103` for a one-shot.
3. **`src/ui/UI.ts`** — `87-193` (DOM construction; new chrome elements go here and must be added to `this.chrome` at `129` if a POI label must avoid them) and `195-210` (the global keydown block — `M`, `Escape`, `Digit1-3` live here, not in `Input.ts`).
4. **`src/style.css`** — flat and unscoped; the portrait media query at `425-444` is where two people will collide. New classes go at the end of their section, above the media query.
5. **`src/world/knowledge.ts`** — `207-278` `WAIT_ANSWERS` and `289-323` `WAIT_DOORS`.
6. **`src/world/regions/civic.ts` (4371 lines)** — five lands in one file (kingdom `892`, castle `1636`, neighborhood `2506`, city `3227`, office `4209`).
7. **`src/world/layout.ts`** — `42-72` `REGION_SPECS`, `143-307` `DISTRICTS`, `466-617` `ROADS`.
8. **`src/core/Audio.ts:1091-2124`** — the `event()` switch. Append new `case`s at the end of the switch; never reorder.
