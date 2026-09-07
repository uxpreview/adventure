# CASTLE GREYWEATHER — land spec

*Session 3. Rect `{-150..60, -280..-160}` (210×120), wash `WASH.castle`,
step `stone`, mood `castle` (low, held, ceremonial). The keep approach —
north gate of Brim → banner avenue → gatehouse → bailey → keep — is the
game's flagship walk. The land's whole fiction: the tallest drawing on
the sheet, banners mid-snap in a wind nothing else on the page can
feel, and nobody home.*

## 1. THE SHOT

Standing on the king's road at ≈ (−45, −178), two-thirds of the way
from the north gate to the castle gate, facing north:

- **Foreground:** the last worn stretch of road, one fallen merlon
  stone at the verge, the first pair of tall red banners framing the
  frame's flanks.
- **Subject:** the gatehouse of Greyweather square across the road —
  twin towers, machicolations, the raised portcullis over the dark of
  the arch — with the banner avenue converging into it.
- **Far silhouette:** the keep over the gatehouse's shoulder, half
  worn away by fog, its two cone-capped towers and its own banners
  just legible; behind it, the palest scratch of ridge pines.
- **Accent color:** the avenue banners and the keep banners — this
  land holds the game's largest single dose of the red, and nothing
  else here has any color at all.
- **Moving:** every banner takes the wind (the only wind in the land —
  the grass here does NOT sway); rooks circle the keep; nothing else.

The reveal is staged: from Brim the keep is pure fog; it resolves as
the walker crosses the north wall — the vista promise (the meadow's
pencil ghost) kept at full pressure.

## 2. PLACES

Five places on a land that is mostly held breath:

| place | center | r | purpose |
|---|---|---|---|
| THE BANNER AVENUE | −45, −178 | 12 | the approach: paired banners tighten toward the gate; THE SHOT lives here |
| THE GATEHOUSE | −45, −198 | 9 | the threshold: arch, portcullis, wall running away along the ridge both sides |
| THE BAILEY | −45, −222 | 12 | inside: worn muster ground, a toppled statue nobody reset, rook parliament |
| THE KEEP | −45, −246 | 14 | the destination: the tallest drawing on the sheet, door shut, banners snapping |
| THE MOAT POOL | −100, −215 | 9 | the aside: the one satisfying pool, reeds, a gnarled hawthorn, stillness |

```
z=-280 ·· pale ridge pines ··  (fog)
         ┌────[ KEEP ]────┐         rook loops
         │     BAILEY     │  ✕ toppled statue
 ═══════╪══[ GATEHOUSE ]══╪══════ ridge wall + crag stones z≈-198
   MOAT  ▐  banner ▌▐ banner ▐
   POOL  ▐  AVENUE (road)   ▐
  (reeds,▐   ▌▐   ▌▐   ▌▐   ▐
  hawthorn)
z=-160 ══╦═[BRIM N GATE]═╦═══════ (kingdom side)
```

Deliberate voids: (a) everything east of x −20 and west of x −80
outside the moat pool — open windswept ground, crag stones only,
thinning to nothing; (b) the bailey floor itself — wear, the statue,
and rooks, nothing else. The emptiness IS the land.

## 3. COMPOSITION PLAN

- **One axis.** Every authored thing serves the north walk up the
  road; the moat pool is the single permitted digression, hung west
  off the wall like a locket.
- **The avenue tightens.** Banner pairs at z −166/−174/−182/−189/−195,
  x offsets narrowing 9 → 6.5 units, so perspective is drawn as well
  as projected. No banner stands anywhere else at ground level.
- **Occlusion stack.** Near: fallen stones + banner pair. Mid:
  gatehouse (or, inside, the statue). Far: keep; beyond it the pale
  pines band. Every framing on the axis inherits this for free.
- **The ridge is drawn, not modeled.** The wall rides a scarp band of
  crag outcrops and hatched scree decals along z ≈ −196..−204, so the
  "high seat" reads even though the sheet is flat.
- **CUT from the draft:** the even 5×2 banner grid, the even 16-unit
  wall loop, the generic keep/gatehouse stamps, the uniform boulder +
  grass scatter (grass returns sparse, drawn STILL — this land's
  grass does not lean; the Common's wind dies at the wall).

## 4. INK TECHNIQUE

Signature: **weight against emptiness** — the heaviest line work in
the game (keep/gatehouse strokes at width 3+, double masonry courses,
deep hatch in every opening) surrounded by the sheet's barest ground.
Where Brim is busy timber over warm wash, Greyweather is cold grey
wash and black iron line. The keep's silhouette must rhyme with the
meadow's `keepVistaTexture` ghost (central mass, two cone-capped
flanking towers, banners) so the false perspective promise is kept.

| texture | canvas | variants | primitives |
|---|---|---|---|
| greyweatherKeep | 512×448 | 1 | central mass + flanking cone towers, machicolated crown, buttress feet, lancets, shut door, two drawn banners |
| greyweatherGate | 384×384 | 1 | twin square towers, machicolation row, arch + raised portcullis, hatch dark in the passage |
| ridgeWall | 512×176 | 3 seeds | battlements w/ chipped merlons, heavy footing hatch, arrow slits |
| tallBanner | 96×256 | 2 | swallowtail red banner on a dark pole, drawn mid-snap |
| crag | 288×176 | 2 | big outcrop slabs, strata strokes, scree ticks |
| toppledStatue | 224×128 | 1 | plinth + fallen figure (posture only, no face), grass at the break |
| gnarledHawthorn | 224×224 | 1 | leaning trunk, wind-flagged canopy blown one way |
| farPines | 512×128 | 2 | PENCIL-pale pine band, no interior detail |
| rook | 64×48 | 2 | two-stroke black bird, blunt tail (vs the swallow's fork) |
| scree decal | 256×128 | 2 | slope hatch + tumbled stone dots |
| still grass | — | reuse `grassTexture` (unleaning), sparse | |
| reeds | — | reuse `reedsTexture` | |

## 5. MOTION & LIFE

- **Idle 1 — the banners (shader + per-frame):** the avenue banner
  field takes StandeeField wind (higher amp than meadow grass — this
  wind is a character); the keep's drawn banners get a subtle
  scale-x snap in the region update.
- **Idle 2 — the rooks (per-frame):** three rooks loop the keep at
  differing radii/heights, banking like the swallows but slower.
- **Player-responsive — the parliament breaks:** two rooks sit on the
  toppled statue; a walker within ~4 units puts them up to join the
  loop (with a caw), and they do not come back while the walker
  stays.
- **The gate-arch courtesy fade:** the gatehouse standee fades to
  ~15% while the camera passes the arch (|x+45| < 8, z −206..−190).

## 6. SOUND

- Mood: `castle` stays (low pentatonic, gap 9).
- Steps: `stone`; road is `paper` per the global rule.
- Ambient events:
  - `banner-snap` — every 6–14 s in the land: one short filtered
    noise crack, gain scaled by distance to the avenue.
  - `rook-caw` — every 15–30 s near bailey/keep, and fired once by
    the parliament scatter: two low rasping knocks a third apart.
- The castle mood's long gap plus these two events should make the
  border crossing audible blind: melody thins, wind starts snapping.

## 7. POIS & NOTES

| label | pos | prompt | road? |
|---|---|---|---|
| THE KEEP | −45, −234 | CRANE YOUR NECK | on |
| THE MOAT POOL | −100, −215 | (existing note kept) | off |
| THE GATEHOUSE | −45, −192 | READ THE PROCLAMATION | on |
| THE TOPPLED KING | −56, −222 | READ THE PLINTH | off |

Keep + moat notes kept; gatehouse (a proclamation nobody signed) and
statue (a king who fell over and was left) gain wry bodies.

## 8. PERFORMANCE BUDGET

- Unique standees ≈ 30 (keep, gate, 10 wall runs, 2 crags ×3 placed,
  statue, hawthorn, 2 pine bands, moat set); fields: banners (10),
  rooks handled as 3 standees, still grass (50), stones/scree small.
  ≈ 6 field calls + standees — lighter than the Common.
- Texture memory: ~12 new canvases, largest 512×448 ≈ 3 MB.
- Build at stream-in: one pass, under a frame.
- The land deliberately carries the lowest instance count in the game;
  its cost is line weight, which is free at runtime.

## 9. NEW ENGINE NEEDS

None. Reuses StandeeField wind, region update player position, and the
App ambience ticker added for the Common (extended by region id, which
Session 8 will generalize).


---

## Session 4 addendum — the ridge is real (2026-08-28)

This spec was written for a flat sheet, and it says so in every line
that describes the high seat: the keep's height was a wide texture, the
gatehouse was kept low so the keep could clear it, and "the wall riding
the crags" was four crag stand-ups in a row. `design/WORLD-SYSTEMS.md`
§1 named that as the thing holding the world back. Session 4 fixed the
ground under it. What changed, so nobody rebuilds the old version:

- **The land is a scarp with a flat top** — something under the sheet,
  twelve and a half units up, with its south face too steep to walk.
  Authored in `src/world/elevation.ts`, not here.
- **The banner avenue IS the ramp.** It climbs from about three units at
  its foot (z ≈ −166) to the plateau at z ≈ −212, and it is the only
  frontal way up. Off the avenue the face refuses; a walker who crosses
  the entire world's curled northern rim can still come down onto the
  ridge from behind, and that is a reward, not a leak.
- **The gatehouse is a BARBICAN and it sits low on the ramp** (z = −192,
  about seven units up). The curtain wall stands on the brow above it,
  placed by asking the height field where the brow is. The keep is on
  the plateau at z = −250. Three beats, each clearing the one in front,
  at three real heights — which is the composition this spec always
  wanted and could not have on flat ground.
- **The crags are gone.** They were a picture of a ridge standing in
  front of the ridge's own place. What is at its foot now is fallen
  stone and scree lying along the slope.
- **The moat pool is at the ridge's WEST foot**, where a moat belongs,
  and the west approach (x ≈ −120) is a real composition: the pool in
  the near ground and the hatched scarp rising beyond it.
- The bailey is cobbled and keeps the toppled king, the castle well and
  the rook parliament. It is still the emptiest place in the land; it
  wants one authored thing when the story arrives (Session 7).

Verdict: WOWED, `design/critiques/critique-art-3.md`.


---

## Session 15 addendum — the second door (2026-09-02)

`THE-FUN-PASS` §6 gives every wait a second door and names this land's:
**put the fallen king back on his plinth.** Session 15 built it as the
proof of the choice card, with both doors, on ground that holds a verdict.

- **THE TOPPLED KING's prompt is SET YOUR SHOULDER TO HIM** until a
  door is taken. The key opens a choice card — the plinth's own note,
  with one added sentence (*he is heavier than he looks*) and two doors
  under it: PUT HIM BACK ON HIS PLINTH / LEAVE HIM WHERE HE LANDED.
  Reading the card reads the plinth (`fact:the-old-name`, S8), whichever
  door is taken. After a door the prompt is READ THE PLINTH and the note
  reads a little differently, and the card is never offered again.
- **PUT HIM BACK** writes `door:the-king-restored`, and the land reads
  it every frame: `standingKingTexture` stands on the same plinth in
  place of `toppledStatueTexture` (the seam is drawn across the stone —
  a thing put back is not a thing unbroken); every banner in the land
  comes down, the avenue's ten and the keep's two, and a bare pole
  stands under each (`barePoleTexture`, no wind); the avenue goes quiet
  (App stops firing `banner-snap`; the rooks are the only voice left);
  and the moat pool clears. **The moat pool was never red before this
  session** — `dyeStainDecal`, this week's banner red gone thin in the
  water, was added so there was something to clear (U5, and `THE-WAITS`
  §1's dye vat). It is at the ridge's west foot and in no protected
  framing. The perched rooks lose their perch and join the loop for
  good.
- **LEAVE HIM** writes `door:the-king-left` and nothing changes, which
  is also a choice.
- **Nothing says which was right.** Wick is not drawn (his wait is
  Session 19's); when he is, *relieved of duty* is what he is if the
  king is up, and the 8:15's platform at GREYWEATHER stays empty for a
  different reason (§6). `WAIT_ANSWERS` has no castle entry and this
  session did not add one.

**What moved, measured.** Nothing on a fresh page: both doors are
knowledge, a fresh page has neither, and every drawing this session
added to the bailey and the avenue is invisible until one is taken. The
dye stain is the only thing visible from the first minute, and it lies
in the moat pool, which is in none of the four Greyweather framings
`diff-sheets` protects. The one deliberate change in the WRITING pass
is the plinth's prompt, which says SET YOUR SHOULDER TO HIM where it
said READ THE PLINTH.

**Shot:** `tools/shoot-session15.mjs` frames 10–19, both doors, both
viewports, the restored avenue at dusk.

## Session 19 addendum — Wick, the stone, the portcullis and the red (2026-09-04)

The land was flat cards on empty ground until this session, and the
QA pass said so. What changed, and where it lives (`civic.ts`, castle
half; `textures-oldworld.ts`):

- **THE STONE.** `greyweatherKeepTexture` has courses, quoins, a plinth
  course and a damp stain at the foot. The bailey has a yard drawn on
  it (`baileyYardDecal` ×3, wear and scree at the keep's foot) and
  furniture that refuses a foot: a trough, a timber stack, two crates.
  Every wall, tower, gate and the keep is `solid` (Session 19's
  barrier pass, `regions/index.ts`), with the gate arch left as a gap.
- **WICK** (`THE-WAITS` §1), drawn at last (`wickTexture`, five poses:
  standing, carrying a rolled banner, resting with it across his
  knees, reaching at a pole, bent at the pool). His morning is
  `WICK_MORNING` on `events.ts`: out of his door in the outer bailey
  at 5.3 with the week's banner rolled, **resting on the avenue's
  verge at 5.55** (C12, the encounter Session 18 deferred), at the
  bottom pole by a quarter past six, down to the moat pool with the
  old cloth by ten to seven, home by half past eight. `WICK_EVENING`
  is the same walk the other way at half past five. Both are pure
  functions of the hour.
- **THE WAIT, with two doors.** Wick's wait is *has anybody a colour
  that is not the king's*. Read the square in Brim (the near stall's
  red cloth is `fact:brim-red` now) and come within eighteen of the
  avenue's bend with it: `reason:the-fifth-banner` is learned, and
  **a fifth banner in Brim's red stands on a pole of its own at
  (−68.5, −200)**, west of the gate where the avenue's last bend looks
  straight at it. It is the first time two lands are in one frame and
  neither crossed anything. If the king is put back
  (`door:the-king-restored`, Session 15) the fifth pole stands bare
  with the rest, and Wick's routine is `WICK_RELIEVED_AM/PM`: the
  same doors, no banner, no pole, no pool — a man with nothing to
  carry, which is what *relieved* draws.
- **THE PORTCULLIS** is the castle's toy (`portcullisTexture`, a
  standee in the gate arch). RATTLE THE PORTCULLIS drops it over
  three tenths of a second, holds it down, and it goes back up on its
  own by five seconds; the braziers gutter while it is down. No score.
- **THE MOAT IS RED TWO DAYS IN NINE** (`moatRed(day)`: days 1 and 2
  of every nine off `clock.day`), the `dyeStain` pool at the ridge's
  west foot. After dark on a red day, within twenty-six of the pool,
  something moves in the water (`moat-slop`, every eleven to eighteen
  seconds) and the reeds shiver. The note reads the day. **Nothing
  says why**, and nothing ever will (`THE-FUN-PASS` §2).
- **Sound**: `portcullis`, `moat-slop` in `Audio.ts`; the moat's is an
  `earshot.ts` row by law. The avenue's `banner-snap` still stops when
  the banners come down.
