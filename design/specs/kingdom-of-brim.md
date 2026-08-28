# THE KINGDOM OF BRIM (interior) — land spec

*Session 3. Rect `{-150..60, -160..-10}` (210×150), wash `WASH.kingdom`,
step `stone`, mood `kingdom` (dorian — a fair on a weekday). The south
face (wall, drum towers, gatehouse, pennants) is Session 2 work under a
WOWED verdict and is NOT rebuilt — everything north of it is. The
Session 2 vista layer (pale `rooflineTexture` runs + pale belfry) is a
placeholder this town must replace so seamlessly that the protected
south-approach framings (first-minute 09/10) do not regress.*

## 1. THE SHOT

Standing on the king's road just inside the south gate (≈ −45, −26),
facing north up the high street:

- **Foreground:** the worn cobbles of the street, wheel-ruts fading
  into wear, one hanging shop sign catching the edge of frame.
- **Subject:** two terraces of half-timbered townhouses leaning toward
  each other over the street; bunting strung across the gap; the
  street narrows to the fountain of Brim Square in the middle
  distance, folk standing about it.
- **Far silhouette:** the belfry over the western rooftops; behind
  everything, pale in the fog, the back-street roofs — and past the
  north wall, nothing but haze (Greyweather is saved for its own
  reveal).
- **Accent color:** the bunting's red flags, echoed by the red-striped
  stall awning at the square's near corner.
- **Moving:** the bunting sways, swifts loop the belfry, pigeons walk
  the square and scatter when the walker pushes through.

A second protected composition already exists (the title/09/10 south
approach); this SHOT is its answer from inside the walls.

## 2. PLACES

Six named places; the two gates are seams and places at once.

| place | center | r | purpose |
|---|---|---|---|
| THE SOUTH GATE (inside) | −45, −22 | 8 | arrival: gate rear, guard bench, wall shadow, the street opening north |
| THE HIGH STREET | −45, −52 | 14 | the walk: terraces lean over the road, signs hang, bunting crosses |
| BRIM SQUARE | −45, −82 | 13 | the heart: fountain, market cross, five stalls, pigeons, densest folk |
| THE BELFRY YARD | −64, −44 | 8 | the landmark off the street: bell tower + chapel gable, quiet worn yard |
| THE ORCHARD CLOSE | −100, −70 | 18 | the town's green lung west of the houses: apple rows, paddock fence, goat-high grass |
| THE WOOD GATE | 50, −110 | 9 | east seam: the market lane dies out into the gate that leads to the Penwood |

The NORTH GATE (−45, −158) is the seventh, shared with the castle
approach — a smaller arch in the north wall where the keep first
appears out of the fog. It belongs to the flagship walk (castle spec).

```
z=-160 ═══════╦═[N GATE]═╦═══════════ north wall (fog, then Greyweather)
              ║  king's  ║
   (back      ║   road   ║        (back roofs, pale)
    roofs,    ║ ┌──┐┌──┐ ║ ┌──┐
    pale)     ║ terraces ║ terraces      ═[WOOD GATE]═ z=-110
  ORCHARD     ╠══ BRIM ══╣───── market lane ──────╝
   CLOSE      ║  SQUARE  ║  stalls · cross · fountain
  (apple      ║ ┌──┐┌──┐ ║ ┌──┐
   rows)      ║ terraces ║ terraces
   BELFRY ──▶ ║   HIGH   ║
    YARD      ║  STREET  ║
              ║ ┌──┐┌──┐ ║
z=-10 ════════╩═[S GATE]═╩═══════════ south face (S2, WOWED, untouched)
```

Deliberate voids: (a) the wall-shadow band just inside the south wall
(z −14..−18) — bare, hatched wear only; (b) the orchard's west end
trails into open grass before the rect edge; (c) the street itself —
nothing stands in the road corridor.

## 3. COMPOSITION PLAN

- **Terraces, not cottages.** The scattered one-house stamps are CUT.
  Houses come as terrace-run textures (3–4 houses per drawing, shared
  walls, varied heights and jetties) placed as building-lines along
  the street fronts at x ≈ −58 and x ≈ −33, each run rotated a few
  degrees toward the street, gaps between runs where side-lanes imply.
- **The back streets are pale.** A second rank of `rooflineTexture`
  runs (the Session 2 pale register — kept, reseeded) stands 12–20
  units behind each front terrace. This is what keeps framings 09/10
  intact: from the south approach the stack above the wall is now
  real-roof (mid) + pale-roof (far) + belfry, denser than before.
- **The square is a room.** Cobble-wear plaza decal underfoot, the
  fountain center, market cross off-axis, five stalls in two unequal
  arcs (never a ring), lamp posts at the corners carrying the bunting
  diagonals. Folk cluster at stalls, not evenly.
- **Edges decay east and west.** Market lane: terraces near the
  square, then single cottages, then nothing but the lane and the
  gate. Orchard: rows lose discipline westward, last trees are
  strays.
- **CUT from the draft:** all 14 scattered cottages, the square's
  duplicate well, the even lamppost ring, the even banner grid, the
  draft east wall (rebuilt in south-face register with towers), the
  pale vista layer (replaced by the real town + reseeded back roofs;
  the fade-out machinery goes with it).

## 4. INK TECHNIQUE

Signature: **timber over plaster** — the town is drawn as dark oak
framing laid over pale wash faces; every house leans (drawn lean, a
few degrees each way) so the street reads as handwriting, not typeset.
Full foreground pressure inside the walls; the back-roof rank keeps
Session 2's failing-pressure register so depth stays drawn, not just
fogged.

| texture | canvas | variants | primitives |
|---|---|---|---|
| townRow (terrace) | 512×288 | 6 seeds | fillPoly faces, jettied line work, timber lines, casements, hanging sign, chimneys |
| brimBelfry (real) | 224×448 | 1 | full-pressure tower, bell arch + bell, clock scratch, chapel gable at foot |
| brimStall | 192×176 | 3 (one red-striped) | posts, scalloped awning stripes, goods scribbles, barrel |
| brimFountain | 256×256 | 1 | two tiers, blue water strokes, basin masonry |
| marketCross | 128×224 | 1 | stepped base, column, ringed cross head |
| bunting | 384×64 | 2 | sagging string, red/cream triangle flags |
| appleTree | 192×208 | 3 forms | blob canopy + committed contour, fruit dots, split/lean variants |
| pigeon | 64×48 | 2 | round body, tick head, folded wing |
| woodGate | 288×288 | 1 | single square tower + arch, side elevation quality |
| cobblePlaza decal | 384×384 | 2 | edge cobble arcs, center worn smooth, stipple |
| back roofs | — | reuse `rooflineTexture`, new seeds | (S2 pale register) |
| lane wear | — | reuse `wornGroundDecal`, `wheelRutsDecal` | |
| east wall | — | reuse `brimWallTexture` + `wallTowerTexture`, new seeds | replaces draft `townWallTexture` run |

Repeated silhouettes rule: 6 terrace seeds across ~10 runs, never two
identical adjacent; 3 stall variants; 3 apple forms.

## 5. MOTION & LIFE

- **Idle 1 — bunting (per-frame):** each string's scale-y breathes and
  its flags sway (small rotation.z wobble, per-string phase).
- **Idle 2 — swifts (per-frame):** two swifts loop crossing ellipses
  around the belfry (the meadow swallow logic, tighter radius).
- **Idle 3 — pennants (kept):** the S2 gate pennants keep their wind.
- **Player-responsive — the pigeons:** 5 pigeons walk the square; a
  walker within ~2.5 units puts them up (rise, drift away, settle
  elsewhere after a few seconds), with a flap sound.
- **The gate-arch courtesy fade (S2 debt):** the south gate standee
  (and its pennants) fade to ~15% while the camera passes through the
  arch (|x+45| < 8 and z in −22..4), restoring after.

## 6. SOUND

- Mood: `kingdom` stays (dorian, gap 5.5).
- Steps: `stone` (region), `paper` on the painted road (existing rule).
- Ambient events (App region ambience):
  - `brim-bell` — every 26–48 s inside the walls: two slow bell tones
    a fourth apart, low gain, belfry-flavored.
  - `market-murmur` — every 10–20 s within 16 units of the square: a
    soft woodblock knock-pair + one mid tone (a trader, a barrel).
  - `pigeon-flap` — fired by the scatter, not the timer: three fast
    noise-knocks stepping up.

## 7. POIS & NOTES

| label | pos | prompt | road? |
|---|---|---|---|
| BRIM SQUARE | −45, −82 | LISTEN TO THE FOUNTAIN | on |
| THE SOUTH GATE | −45, −14 | (existing note kept) | on |
| THE BELFRY | −64, −44 | WAIT FOR THE BELL | off |
| THE ORCHARD CLOSE | −100, −70 | SCRUMP AN APPLE | off |
| THE WOOD GATE | 50, −110 | — | on |

Square note kept; belfry and orchard gain bodies in the wry voice.

## 8. PERFORMANCE BUDGET

- Unique standees ≈ 45 (terraces 10, back roofs 8, walls/towers ~14,
  square set 9, gates 2, belfry 1); fields: folk (14), pigeons (5),
  bunting strings as standees (4), orchard trees (12 via 3 fields),
  banners (kept 8). ≈ 12 field draw calls + standees — under the
  Common's budget; the cut cottage scatter pays for the terraces.
- Texture memory: ~16 new canvases ≤ 512×288 ≈ 4 MB. Draft cottage/
  stall/fountain textures no longer referenced here.
- Build at stream-in: canvas drawing one pass, same order as S2 —
  measured under one frame on desktop.
- Dispose: unchanged paths (disposeGroup + field.dispose).

## 9. NEW ENGINE NEEDS

None. One **layout web addition** (not a rect move): the market lane
road `[−40,−86] → [55,−110]` (width 3.4) joins the king's road to the
Wood Gate so the east walk is painted, mapped, and sounds like road.
Terrain repaints and the map pick it up automatically; no border,
river, bridge, mood or step-zone rect changes — audited: no other
system reads ROADS.
