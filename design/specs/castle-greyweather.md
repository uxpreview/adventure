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
