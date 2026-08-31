# SPLITROCK CANYON — land spec

*Session 11. A hole in the page, and the first land in this world whose
middle is empty and whose edges are the event. `THE-WAITS.md` §4 is
binding: **the marks are a list, in the order things would float, and
the game never says whether Holt is mad or ready.***

Rect: x 230 → 380, z −280 → −100. Wash `WASH.canyon`. Step `stone`.
Voice: struck metal, low register, with the longest tail on the sheet —
*a canyon is a room and it answers you* (`Audio.ts`, `LAND_VOICE`,
`ROOMS`).

**And the ground moved before a single prop was placed, twice.**

Session 4 cut the tear at x = 338, forty units from the world's curled
east margin: the land's whole event happened in a strip against the edge
of the sheet, and the canyon trail ran at x = 255..305 and never went
near it. `elevation.tearX` now runs down the middle of its own rect —
the axis wanders 290..311.

**And it is a POLYLINE now, which is the change that mattered more.**
Session 4 wrote the line as two sines plus eight units of value noise at
a nine-unit wavelength — a comment that said *paper tears along its
fibres* over code that did the opposite. From the rim at forty units a
wobble is a wobble; from the channel floor at four units it is
**herringbone**, which is the exact failure `WORLD-SYSTEMS` §1 and
`HOLD_PLAN` were written about. `TEAR_LINE` is nine straight runs with
eight corners between them. Every face is planar, every face has one
fall line, and the corners are why you cannot see the whole canyon from
anywhere inside it.

**The cut itself is Session 4's and is untouched in everything that
matters**: thirteen units of fall, six of floor, ten of wall, a proud
lip nineteen units off the axis, and a floor that measures −10.8,
because `THE-STRANGERS.md` S5 quotes that number. The depth TERM is 13.3
rather than 13 so that it still measures −10.8 over different paper —
which is a change made to keep a number, not to change one.

**And the tear now has two ends.** THE HEAD ramps in from the north over
thirty-four units (a gradient of four sevenths, and the walk limit is
seventy-two hundredths); THE MOUTH ramps in from the south over
thirty-six. Ten units of unclimbable wall everywhere else.
`check-terrain.mjs` proves it: the floor is reachable, it is reachable
with either end sealed, and with both sealed it is not reachable at
all.

---

## 1. THE SHOT

**Stand on the channel floor at (305, −196) and look north.** You are
ten and a half units under the world, on the only flat walk in the land,
in a corridor six units wide with the page standing over you on both
hands.

| layer | what |
|---|---|
| **foreground** | a fallen slab at the frame's left edge, cropped, drawn at full ballpoint pressure — the only thing in the frame with weight, and the only thing near enough to have any |
| **near** | the dry bed: stone SORTED, coarse against the walls and fine down the middle, which is the shape water leaves when it goes and not the shape it leaves when it is there |
| **subject** | **the two walls closing**, hatched down their fall lines in parallel strokes, and the strip of white paper between them. The composition is a corridor, so the recession is the ground and the walls do it, and no prop is asked to |
| **middle** | thirty units up-channel, small: **THE BOAT**, upside down on trestles, with the trestles' legs showing under her, and a man beside her; and on the right hand THE MARKS |
| **far** | THE HEAD, where the page is bent and not parted — and on the skyline above it, small and pale, **HOLT'S SHED AND HOUSE**. The boat, the ladder of chalk and the doorstep the fourth mark is level with are all in this one frame |
| **accent** | the boat's hull. It is oiled, so it is the one warm thing in a land drawn entirely in grey and bleach, and it is forty units from anything wet |
| **moving** | a kite turning in the strip of sky; dust letting go off one wall; Holt working the length of the hull with a rag, out and back |

**After you have rowed the river, salt to source,** the same frame has
one difference. The boat is on the ground, right way up, on dry stone.
**The trestles are still there and they are empty.** Nothing in this
game will ever say whether that is madness or readiness, and the empty
trestles are the half that makes it a question.

---

## 2. PLACES

| place | centre | r | what it is, and why walk to it |
|---|---|---|---|
| **THE MOUTH** | 296, −116 | 12 | where the rip runs out and the river starts. The walls come down to nothing over thirty-six units, which is walkable, so this is the way in — and it is the exact point `RIVER[0]` rises. You begin where the water begins and walk up the bed the water is not in |
| **THE DRY CHANNEL** | 292, −150 | 14 | the floor: ninety units of flat, at a gradient of four hundredths. The only level walk in the land, and it is a riverbed |
| **THE NEEDLE** | 291, −178 | 8 | *built; has a note.* The arch, moved onto the new geometry — a hole worn through a standing fin at the west wall's foot, and you can walk under it |
| **THE MARKS** | 311, −213 | 9 | a slab that came away from the east wall and stands where it fell, thirteen and a half units of it, its top a unit BELOW the rim so it never breaks the skyline. Chalk, level, all the way up. **Two low and close together, then thirteen units of blank rock, then three at the very top.** The gap is the whole thing and nothing points at it |
| **THE TRESTLES** | 310, −226 | 10 | **HOLT's.** The boat, the trestles, the oil-rag, the man. The top of the dry channel |
| **THE HEAD** | 303, −248 | 12 | where the tear begins: the page dips, then leans, then parts, and two walls come up on either hand while you keep walking. The other way in, and Holt's own — his place stands on its shoulder at (300, −252) |
| **THE LIP** | 320, −158 | 11 | the east edge, where the ground stops being ground: the cut falls away at your feet and runs north, getting deeper the whole way. *(It was THE EAST RIM at (358, −190) for one round of the gate and it was an empty beige frame — from out there the canyon is due WEST and this camera looks north. The place was right and the standing point was ninety degrees wrong.)* |

```
   z −280 ══ the north margin, curling ═══════════════════════════
   z −252   [ HOLT'S — shed, doorstep, house ] on THE HEAD's shoulder
   z −248                 [ THE HEAD ]  page bent, not parted
                              ╲   ╱      ← the way in from the north
   z −226                 [ THE TRESTLES ]  ● the boat
   z −216                  ║ [ THE MARKS ] ← a fallen slab, chalked
                           ║       ║
   z −168   [ THE NEEDLE ] ║  [ THE LIP ]  ← the east edge
   z −150     [ THE DRY CHANNEL ]  ║               ▲ the curl
   z −116          [ THE MOUTH ] ~~~ river rises ~~~
   z −100 ─────────────── THE BLEACH FLATS ──────────────────────
        230      270     290 300 310      344        380
        west bench          the cut        east bench   rim
        (split rock)                       (a pavement, empty)
```

**THE LAND IS A CORRIDOR AND ITS MIDDLE IS THE VOID.** Every other land
in this game puts its density in the middle and lets the edges decay.
This one inverts it: the floor is bare, the walls are the event, and the
two benches either side are wide and quiet on purpose — the west one
thinning into mesa country toward the Downs, the east one a bare
pavement so that the rim walk is a walk across nothing to a view.

---

## 3. COMPOSITION PLAN

**Cut from the draft:** the six mesas ranked along the north edge at
twenty-four-unit spacing; the four mesas at `rect.maxX − 12` (which
stand in the protected `curl-rim` framing's far field and should never
have been there); the forty-six-boulder Poisson scatter; the
fourteen-cactus scatter, because a cactus is the Flats' drawing and a
canyon full of them is a postcard. **All of it.**

**The rule that replaces it:** *nothing in this land is scattered, and
nothing is placed at random — the page tore, and everything here is
either a piece that came off the edge or a thing one man carried down.*

- **THE FINS.** Standing rock on the west bench, in three authored
  groups, each one a run of blades on ONE bearing — because paper tears
  along its fibres and rock splits along its bedding, so a group of fins
  is parallel or it is wrong. The three groups are on three different
  bearings and the voids between them are as authored as the groups.
- **THE FALLEN.** Slabs on the channel floor, and they get BIGGER
  toward the walls and toward the head, because that is where they came
  from. Nothing lies in the middle of the bed except gravel.
- **THE SORTING.** The bed's own decals are graded across the channel:
  coarse at the feet of the walls, fine down the centreline. It is the
  only thing in the land that says water was ever here, and it says it
  without a drop.
- **THE DRIFTWOOD.** Three pieces, on the east bench at the lip's
  height, thirteen units above the floor. Nobody mentions them.
- **Density gradient:** heaviest at the two ends (the mouth's confusion
  of fallen stone, the head's clutter of one man's work), lightest in
  the middle of the corridor, which is where THE SHOT stands.

---

## 4. INK TECHNIQUE

**THE CANYON IS DRAWN IN VERTICALS AND THE FLATS ARE DRAWN IN
HORIZONTALS**, and they are the same prop box (`textures-dry.ts`) so
that the difference is a decision and not an accident.

The land's signature mark: **rock is a stack of horizontal beds with
vertical fracture lines cut through them, and the fractures are drawn
LAST and go all the way through.** A bed that stops at a fracture is a
brick; a fracture that runs through six beds is a rock that split. Every
fin, slab and wall panel in this file is built that way, and it is why
the land is called Splitrock.

Line weight: the canyon is the only land in the game where the pen gets
HEAVIER as it goes down. The rim is drawn light because it is bleached;
the floor is drawn dark because ten units of page is standing over it.

| texture | canvas | variants | primitives |
|---|---|---|---|
| `splitFin` | 256×384 | 3 (shared across ~26 instances) | `stroke` beds, `line` fractures, `stain` body |
| `fallenSlab` | 320×160 | 2 | `poly`, `hatch` on the underside only |
| `wallPanel` | 256×448 | 2 | beds + fractures, faded on ALL FOUR sides, and laid as a DECAL along the cliff's own surface normal rather than stood at its foot — which is the difference between a mark on a wall and a sheet of glass leaning against one |
| `markWall` | 224×448 | 1 | a SLAB, not a panel: tapered, stepped, broken across the top, drawn at the middle register so it is not the blackest thing in the frame — plus chalk: five level marks at 3 passes and no jitter, each with a shadow under it, because CHALK is two shades off PAPER and a pale mark on a pale wall is nothing at all |
| `needleArch` | 384×288 | 1 | one closed `stroke` with the hole scribbled out and re-outlined |
| `boatOver` / `boatUp` | 256×128 | 1 each | strakes as parallel `line`s; the oiled hull is the only `stain` in the land that is warm |
| `trestle` | 128×96 | 1 | four `line`s and a top rail; drawn EMPTY so it reads either way |
| `holtWork` / `holtStand` | 96×160 | 1 each | posture only. No face |
| `holtPlace` | 384×192 | 1 | the shed, the doorstep and the house, on the rim, drawn as one small run so the top three marks have something to be level with |
| `bedGravel` | 256×256 | 3 (coarse / mid / fine) | `stain` + short `line`s, all horizontal |
| `driftwood` | 160×64 | 2 | two `stroke`s and a shadow |
| `kite` | 64×48 | 1 | four strokes |

Every ground colour goes through `stain()` — a radial gradient, no
edge. **`fillBlob` is a sixteen-sided polygon and on a tiled decal you
can count all sixteen from a hundred units** (Session 10).

---

## 5. MOTION & LIFE

- **The kite.** One bird, high, turning in the strip of sky between the
  walls, on a slow ellipse it never leaves. Per-frame.
- **The dust.** A thin field of motes letting go off the west wall and
  drifting down, on the shader's wind term with a downward bias.
- **Holt.** Out and back along the hull with a rag, slowly, all day, in
  one of two drawings. After the boat comes down he does the same thing
  to a boat that is the right way up.
- **THE PLAYER-RESPONSIVE ONE: the walls let go.** Come within fourteen
  units of a wall's foot on the channel floor and a few stones come off
  above you and skitter down — and it fires `stone-fall`, which the
  canyon's own room repeats a beat later. **It is the only land besides
  the Penwood that answers you, and this is the one where you can see it
  as well as hear it.**

---

## 6. SOUND

Mood `canyon` (open low fifths a long way apart, gap 12s) is unchanged.
Bed: `lowpass 95` — the quietest room in the game. `ROOMS.canyon`
already carries the longest delay on the sheet (0.42 / 0.46 / 0.55) and
every event below is authored to be worth repeating.

| event | trigger | synthesis |
|---|---|---|
| `stone-fall` | proximity to a wall foot on the floor, and at long idle gaps anywhere in the land | three `knock`s at falling pitch, accelerating, then a scatter of four quiet ones — a stone finding the bottom, and the room says it again |
| `hull-tap` | idle, and only when the walker is more than twenty-five units from Holt — up close you can see him doing it and a sound would be a caption | two `knock`s a fifth apart with a short woody `tone` under them. It does not stop after the boat comes down |
| `kite-cry` | rare idle | one thin descending `glide`, high, with almost no body |

Step zone: `stone` throughout, which is already the region's.

---

## 7. POIS & NOTES

| label | position | prompt | on the road? |
|---|---|---|---|
| THE RIVERHEAD | 301, −104 | — | at the trail's foot |
| THE NEEDLE ARCH | 285, −168 | STAND UNDER IT | off, six units west |
| THE MARKS | 307, −204 | — | off, at the wall |
| THE BOAT | 305, −232 | — | on the trail |
| THE HEAD | 303, −252 | — | at the trail's end |
| THE EAST RIM | 348, −190 | — | off entirely |

Note ids and bodies live in `regions/wilds.ts` in the established wry
lowercase voice. **THE MARKS' note states two measurements and draws no
conclusion**, and THE BOAT's states where the nearest water is and which
way it is going, and neither of them says anything else. `THE-WAITS` §4
lists what this land never says: where the river went, that it is not
coming, that anybody else has one. Nothing in these notes says any of
the three.

---

## 8. PERFORMANCE BUDGET

| thing | draws | canvases |
|---|---|---|
| fins (3 groups, ~26 instances) | 3 fields | 3 × 256×384 |
| fallen slabs (~14) | 2 fields | 2 × 320×160 |
| bed gravel (~34 decals) | 3 fields | 3 × 256×256 |
| wall panels (~10) | 2 fields | 2 × 256×448 |
| driftwood (3) | 1 field | 2 |
| the marks, the arch, the boat ×2, the trestles, Holt ×2, his place, the kite | 9 standees | 9 |
| **total** | **≈ 20 draws** | **≈ 21 canvases, ~7 MB** |

**MEASURED** (`tools/shoot-fps.mjs`, portrait, the rig that matters):
the canyon's worst framing is **THE MOUTH at 170 draws / 2.1 ms**, and
THE SHOT is 164 / 1.2 — against THE COMMON's 261 and Brim Square's 259.
It is the second-cheapest built land in the game, and the cheapest is
the one it ships beside.

**Share drawings, instance placements** — Session 10's round 4 was a
performance round and it was fair.

---

## 9. NEW ENGINE NEEDS

None. `StandeeField`'s `wind`, `wave` and `hide`, `ctx.decal`'s surface
tilt and the skyline are all that this land uses.

**One engine LIMIT it runs into, and the answer is placement:** the
skyline lifts a name above what is standing UNDER it and cannot know
what is standing BEHIND it (Session 10). In a corridor with ten-unit
walls either side, every label has a wall behind it from somewhere. The
answer is the ford's answer — **angle, not height**: THE MARKS' label
sits a stride west of the wall so it is clear of the head's clutter from
every viewpoint on the channel, and THE BOAT's sits down-channel of the
trestles rather than over them.
