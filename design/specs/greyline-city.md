# GREYLINE CITY — the land spec

*Session 13. `city`, rect x 60..230, z 130..280. Built to
`design/LAND-SPEC-TEMPLATE.md`, under `design/QUALITY-BAR.md` §4,
`design/THE-WAITS.md` §11 (THE MAN AT THE JUNCTION) and
`design/THE-STRANGERS.md` S3, whose second beat is here.*

**What this land argues** (`WORLD-SYSTEMS` §10 rule 4): *that waiting is
for people who have not made it.* Everybody is going somewhere and
nobody arrives, and the one man who is not going anywhere has been
standing still long enough to become geography.

---

## 1. THE SHOT

**The junction, from twelve units south of him, looking north.**

| layer | what |
|---|---|
| **stands** | (142, 213), on the pavement, on mill lane |
| **foreground** | **the pavement itself** — the stone worn pale in two long curves, and between them a clean lens where the jointing has never come away |
| **subject** | **the man**, standing in the clean part, coat, hands at his sides, no face and no name |
| **mid** | four light masts over the crossing and every one of them green |
| **far** | **the bench, twenty units beyond him**, that nobody has ever used; then the street wall going away, and the towers cropping out of the top of the frame |
| **accent** | four green lamps, which are the only saturated marks in the land |
| **moving** | commuters crossing the frame, pigeons, a revolving door turning behind you, steam off a grating down in the hollow |

**And the same standpoint, later, is the other half of the wait.** Stand
still near him for four seconds and he goes and sits on the bench. The
frame does not change: the wear is exactly where it was, curving round a
place where nobody is standing any more, and he is twenty units further
off, sitting down, in a land where sitting down is a statement.

One camera position, two states, and the whole fable.

---

## 2. PLACES

| place | centre | r | why it is worth the walk |
|---|---|---|---|
| **THE JUNCTION** *(kept, with its note)* | 148, 203 | 9 | four traffic lights, all green: a city that has never once had to stop |
| **THE PAVEMENT** | 137, 196 | 8 | the wear. *"a patch the size of a person where it is not worn at all."* The label is west of the man on purpose — **he has no name and nothing in this game will ever give him one**, but the stone is a place |
| **MAIN STREET** *(kept)* | 120, 204 | 9 | awnings out over the glass. The same road this has been since the castle gate, called something else |
| **THE HOLLOW** | 88, 214 | 9 | the page's crease, three units under the city, walled and turned away from: bins, a fire escape, and warm air off a grating all year |
| **THE NORTH END** | 158, 162 | 8 | a hoarding round a lot nothing is being built on, and then the Downs |

```
   z=130 ┌───────────────────────────────────────────────┐
         │        ▓  hoarding   ▓                        │   THE HARROW
   z=150 │   ▓         ██  north end                     │     DOWNS
         │  ░░  ▓            ▓        ▓                  │
   z=180 │  ░░       ▓   ▐bench▌   ▓                     │
         │  ░hollow  ▓    · man     ▓        ▓           │
   z=205 │══░░═══════▓══[shops]═╪═══▓════════════════════│ ← main street
         │  ░░   ▓        [shops]   ▓   ▓                │   the spur →
   z=235 │  ░░       ▓              ▓          ▓         │
         │   ░           ▓      ▓                        │
   z=280 └───────────────────────────────────────────────┘
                          ↑ mill lane, north–south, and the junction

   ▓ tower  ░ the crease (three units under everything)  · the man
   ▐bench▌ twenty units north of him   ══ main street   ╪ the junction
```

**The seams.** West is MAPLE COURT across the border at x = 60, and main
street crosses it — **June stands at a fence forty-odd units from him,
on the other side of a line neither of them can cross, and nothing in
this game ever says so.** North is THE HARROW DOWNS and the grid simply
runs out. East is the commuter spur to THE CUBICLE MILE, which is
Session 14's.

---

## 3. COMPOSITION PLAN

**What was cut:** the whole draft. Towers on a twenty-one-unit `for`
loop down two fixed offsets, shopfronts at `76 + i * 15`, lamps at
`78 + i * 30`, ten planters and fourteen people on a Poisson scatter.

**What replaces it: a street wall with holes in it, and the holes are
where the light gets in.** Nothing here is placed in the open. Every
drawing belongs to one of four registers:

| register | rule |
|---|---|
| **the street wall** | twenty-one towers, authored one line each, shoulder to shoulder along mill lane and main street. Near ones crop; far ones stand whole |
| **the hollow** | the crease, and it has the BACKS of things in it |
| **the junction** | the crossing, the wear, the man, the bench |
| **the north end** | where the grid gives up: a hoarding, one lot, and then farmland |

**Six tower drawings carry twenty-one buildings** — three kinds (brick
block, curtain-wall slab, stepped setback) at two heights each — and the
variation in the street comes from WIDTH, rotation and placement, which
is what makes two towers off one canvas different buildings. Nothing in
the land shares a silhouette with its neighbour.

**AND THE FRAME-TOP CEILING IS THE SUBJECT HERE.** Session 3 wrote down
that the camera shows about ten world units of height at thirty-three
units out, and every land since has designed around it — *height
contests are won by spread, not by scale.* A downtown is the one place
in this world where a building going out of the top of the frame is the
correct picture. Near towers crop, far towers stand complete, and the
difference between the two is what separates a city from a village with
taller huts.

---

## 4. INK TECHNIQUE

> **GREYLINE CITY: EVERY MARK LEAVES.**

Towers are cut off by the top of the frame. Window rules run off both
sides of the buildings they are drawn on. Downpipes and fire escapes
arrive from above the drawing and leave below it. The hatching runs past
the edge of what it is shading, and **not one silhouette in the land is
closed.**

MAPLE COURT next door is drawn under the opposite rule — every mark
comes back to itself — and the pair is drawn at right angles the way
SPLITROCK and THE BLEACH FLATS are. It is also the fable: *everybody is
going somewhere and nobody arrives.*

| texture | canvas | variants | notes |
|---|---|---|---|
| `greylineTowerTexture` | 192×(72+34f) | 3 kinds × 2 heights | canvas grows with the floor count, so a twelve-floor slab is not a five-floor one stretched |
| `greylineTowerLitTexture` | same | 6 | warm panes only, ~30% of them, faded up at dusk |
| `farSkylineTexture` | 512×192 | 1 | pencil, no windows, the gaps doing the work — **and it takes the fog like everything else** |
| `shopRowTexture` | 384×160 | 2 | glass, scalloped awnings, and a blank fascia: no shop in this game has a name over it |
| `wornPathsDecal` | 512×512 | 1 | see below |
| `pavingDecal` | 256×256 | 2 | the ordinary stone, everywhere the wear is not |
| `hardBenchTexture` | 192×112 | 1 | slats, and an arm in the MIDDLE of it |
| `junctionManTexture` | 88×152 | 2 (standing / sitting) | no face, no name |
| `commuterTexture` | 88×148 | 3 | every one mid-stride |
| `lightMastTexture` | 160×256 | 1 (+mirror) | a mast, an arm, three lamps, and the bottom one is green |
| `fireEscapeTexture` | 160×320 | 1 | a zigzag that arrives above the drawing and leaves below it |
| `hollowWallTexture` | 256×128 | 2 | brick courses, a coping, and one weep pipe with a stain under it |
| `hoardingTexture` | 320×128 | 1 | torn posters, and not one word on any of them |
| `revolvingDoorTexture` | 160×192 | 2 phases | |
| `grateDecal` / `grateSteamTexture` | 128×128 / 128×192 | 1 / 2 | |
| `cityBinsTexture` | 192×128 | 1 | |

### THE WORN PATHS, which are the land

`THE-WAITS` §11: *everybody walks round him, and the paths they take to
do it have been trodden into the stone.* The prompt for this session put
it plainly — **if the wear does not read, the land has no wait** — so it
is worth writing down exactly how the drawing works, and what two rounds
of the gate corrected in it:

- it is **one decal**, and it contains the stone as well as the wear. An
  earlier version drew only the wear and laid it over a separate paving
  decal; two of the crossing's four corner slabs overlapped it, decals
  draw in the order they were made, and the entire wait was covered by
  ordinary pavement in the contact sheet.
- the walks are **drawn by taking the stone away** (`destination-out`):
  sixty-two of them, each entering at the bottom, committing to one side
  of the island by about ten paces out, and leaving at the top. Where
  they crowd, the jointing is gone; at the edges it comes back. The
  lanes are what is LEFT OVER rather than what was drawn, which is what
  a desire line actually looks like from above.
- **the island is never touched.** Every slab line in it is redrawn at
  full strength inside a clip. That hole is the composition.
- **the wear is DARK, and that is a correction.** The drawing's first
  argument was that wear is pale, because stone that a million shoes
  have been over loses its ink — true, and invisible: a pale mark on a
  page the colour of paper is nothing at all. What a hundred years of
  shoes actually leaves is a polish, and a polish is darker than the
  stone round it.
- **and the slabs are slab-sized.** At sixty-two pixels on a thirty-unit
  decal a paving slab was three and a half metres across, so the missing
  lines read as two gaps in a very coarse grid. At twenty-four they are
  about a metre and a half, and the lanes read as what they are.

---

## 5. MOTION & LIFE

- **the revolving door**, two phases, turning whether or not anybody is
  going through it — the land's joke, unlabelled, in the land where
  nobody arrives;
- **the grating**, breathing, two drawings, deliberately never in step
  with the door;
- **the lit windows**, about thirty per cent of the panes on six of the
  towers, up at dusk;
- **the flow**: fourteen commuters, every one mid-stride, placed along
  the pavements in ones and twos rather than scattered;
- **player-responsive, and it is the wait itself:** you stop walking.
  Stand within nine units of him, not moving, for four seconds and he
  goes and sits on the bench — permanently, in every later save, and
  forty units away in another land a woman is at a fence.

**The stand-still test measures MOVEMENT, not input** (`buildCity`'s
update keeps the walker's last position): a player being carried by the
road, or drifting on a stick, is not standing still, and the count
resets the moment they move. `THE-WAITS` §11 is explicit that the cost
of asking is the whole reason nobody in this city has ever paid it.

---

## 6. SOUND

Voice and bed unchanged (`Audio.ts`: air at register 0.75 — *warm air
off a grating under the whole street: the same voice as the sea, made by
a machine*; bed *the hum: one note the whole street is standing on, and
it never once moves*). Step zone `stone`.

| event | trigger | synthesis |
|---|---|---|
| `crossing-tick` | every 6.5–11.5 s within 34 units of the junction, **and once when he sits down** | five dead-even ticks at 1750 Hz. No jitter anywhere in it — the only sound in this game with no humanity in its timing, ticking for people waiting to cross a road that has never had a red light |
| `heels` | every 9–21 s anywhere in the land | six steps, each quieter than the last, and no seventh. **The only land in the game where you hear a footstep that is not yours, and it is always going away** |

---

## 7. POIS & NOTES

| label | at | prompt | note |
|---|---|---|---|
| THE JUNCTION | 148, 203 | WAIT FOR THE LIGHT | kept verbatim from Session 1 |
| THE PAVEMENT | 137, 196 | LOOK DOWN | *"the stone is worn pale in two long curves, and between them there is a patch the size of a person where it is not worn at all. it takes a very long time to do this to a paving slab."* |
| MAIN STREET | 120, 204 | — | *"…it is called something else here. everything is called something else here."* |
| THE HOLLOW | 88, 214 | GO DOWN | *"the ground folds here and the city built up to the edge of it and then turned round."* |
| THE NORTH END | 158, 162 | — | label only |

**THE PAVEMENT's note is the only place the wear is ever mentioned, and
it does not mention him.** Nothing in this game names him, describes
him, or says he is waiting; the map will never mark him; and the note
that stands nearest to him is about a paving slab.

---

## 8. PERFORMANCE BUDGET

Twenty-one towers × (1 + lit for six of them) + three shop rows, four
light masts, two doors, two steam phases, the bench, the man's two
postures, twelve hollow walls, two hoardings and five skyline panels =
about **sixty unique standees**. Fields: commuters (3 draws), lamps,
planters, pigeons — six instanced draws. Decals: the wear, three paving
squares, four hollow paving squares, one grating.

Six tower canvases at up to 192×480 are the land's texture cost, and
they carry twenty-one buildings between them. The lit variants are the
same canvas size again and only six exist.

Stream-in is one frame; the update writes visibilities and opacities and
one distance test.

**Measured** (`node tools/shoot-fps.mjs`): the junction is **189 draw
calls at 5.2 ms/frame** and the hollow 166 at 4.2 — comfortably under
THE COMMON and under MAPLE COURT next door, because a street wall
occludes most of its own land.

---

## 9. NEW ENGINE NEEDS

None. The wait needed a stand-still test and that is six lines in the
region's own update; the wear needed a drawing, not a system; and the
permanent change rides on `knowledge` exactly as SPLITROCK's boat does.

**One thing this land did need and it belonged to its neighbour:**
`tools/check-sightline.mjs` (see `maple-court.md` §9), because
GREYLINE's west edge and MAPLE COURT's east edge are the same border and
the protected corridor runs down the other side of it.
