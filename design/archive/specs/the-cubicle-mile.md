# THE CUBICLE MILE — land spec

*Session 14. The last scatter draft in the world, and the land Act III
happens in. `design/THE-WAITS.md` §12 (DENNIS), `design/THE-LINE.md` §3
and §4, `design/THE-STRANGERS.md` S8 and `design/WORLD-SYSTEMS.md` §4
and §10 are the sources; this file is what gets built.*

**Rect:** x 230..380, z 130..280. **Wash:** `WASH.office`. **Step:**
`gloss`. **Voice:** bowed, register 2 — *two notes of hold music on a
telephone nobody picks up.* **Bed:** air handling, dead steady.

**What the land argues** (`WORLD-SYSTEMS` §10 rule 4, `THE-WAITS` §12):
**a timetable is a promise, and a promise is enough.**

---

## 0. THE THIRD RULE, AND WHY THIS LAND NEEDED ONE

Session 13's two present-day lands are drawn at right angles to each
other: **in MAPLE COURT every mark closes** and **in GREYLINE CITY every
mark leaves the frame.** THE CUBICLE MILE is the third land whose
subject is the present day and it may be neither, so it takes the third
thing a line can do.

> **EVERY MARK IS RULED, AND EVERY MARK STOPS SHORT OF THE ONE IT WAS
> GOING TO MEET.**

A line can come back to itself, it can run off the page, or it can stop
just before it arrives. The third is what a promise looks like drawn.
So every edge in this land is straight — `hardPoly` and `line`, no
`stroke` on anything architectural — and every corner has a hairline
gap in it: the rules meet at a junction they do not quite reach. Bay
paint stops short of the kerb. The kerb stops short of the grass. The
hatching under a canopy stops short of the wall. The road stops short
of the edge of the world, which it has done since Session 1 and which
`THE-LINE` §3.2 gave a reason last session.

It reads, at a glance, as a technical drawing that was set out and not
finished — which is the office park, and which is the survey, and which
is the whole of what Dennis believes.

**And it is the only land in the world that authors no ground.** The
office park is flat: `elevation.ts` gives it a cockle weight of 0.18
and the rest of the sheet's landforms miss it, so the whole rect inside
the rim varies by about a fifth of a unit. Every other land session
since 10 has authored a landform first. **This one authors the absence
of one**, because the flattest ground in the world is the correct
ground under the only corner of it anybody ever laid out with a
straightedge, and `tools/check-terrain.mjs` prints the number now so no
later session sprinkles a hill on it.

What replaces a landform, for depth, is **paint**: ruled parking bays
running away north, kerb runs, and a bay grid that a decal draws
perfectly in perspective for nothing. A car park is a recession device.

---

## 1. THE SHOT

**THE 8:15 STOP AT DUSK.** The walker stands on the apron at about
(252, 210) and looks due north.

| layer | what |
|---|---|
| **near** | the kerb of the apron and one bollard, bottom left, cropped |
| **subject** | the shelter — a ruled box on four posts with a bench in it that has never been sat on, the timetable board beside it, the desk plate that says **D. HALL**, and **DENNIS**, standing OUT AT THE KERB, facing north up a road nothing is coming down |
| **far** | the mile: nine blocks whose rooflines are all at exactly the same height, a level ruled line running the whole width of the frame, going into haze |
| **accent** | two lighting columns flanking the stop, and the three more behind them over the car park, all of them on. **The shelter between them is the one dark thing in a lit car park** — and there is a third dark one, out in the overflow, which was put up with the kerbs and never connected |
| **moving** | the timetable's loose corner lifting in the draught off the plant; Dennis's weight shifting |

Then it changes once, permanently, and that is the wait: come to the
stop holding `route:the-line` and **the shelter's light comes on at
dusk, and at every dusk afterwards, in every save.**

The composition is chosen so it holds at 26.5° of frame: the shelter,
the board and the man are inside eleven units of each other and the
level roofline behind them is the only thing that needs width.

---

## 2. PLACES

Six, and the walks between them are the site's own roads and its grass.

| place | centre | radius | why it is worth the walk |
|---|---|---|---|
| **THE BARRIER** | (243, 205) | 7 | the seam with GREYLINE CITY. A lifting barrier, up, and a gatehouse with nobody in it and a kettle in the window and a mug beside it. The counterweight has rusted at the bottom of the post; the boom has been up so long the tarmac under it has never once been marked. Beside it, the estate board: a heading somebody paid a signwriter for and six slots for the six tenants the site was drawn for, **and two of them have anything in them at all.** **Where the straightedge world starts** |
| **THE 8:15 STOP** | (252, 200) | 7 | the premise, and THE SHOT. A stop, a timetable, and no track |
| **THE ATRIUM** | (277, 176) | 9 | the front of the one building that is taller than the rest: a glazed face, doors that open for you, three flagpoles and one flag, a bed of shrubs planted in a ruled row — and round the side, the smoking spot: a sand-topped bin twelve units from a fire door, no bench, and a patch of ground worn by people who were not supposed to stop there |
| **THE OVERFLOW** | (301, 152) | 10 | the second car park, ruled out for the people who were coming. Half of it was never painted. Weeds in the joints, and past the last bay the Bleach Flats start |
| **THE CAR PARK** | (322, 200) | 10 | **the end of the line**, and nobody who parks in it has ever thought of it that way. The bay by the door is marked and empty; the one car is at the far end. Behind it the page lifts, and there is nowhere further east |
| **THE MUSTER POINT** | (288, 238) | 8 | a rectangle painted on the tarmac at the back of the site with a sign on a post beside it. It is the only place in the Cubicle Mile where everybody has ever stood together at once, and none of them wanted to be there |

```
                 THE BLEACH FLATS
   z130 ─────────────────────────────────────────────────
        .            ▒▒▒▒ THE OVERFLOW ▒▒▒▒          .
   150  .          ( bays, half unpainted )          .    ╱
        .                                            .   ╱ the
   165        ▢  ▢          ▢                ▢      .   ╱  curl
   175   ▢       ▢     ▓ATRIUM▓      ▢    ▢         .  ╱   lifts
        (— the level roofline, every roof the same —)  ╱   from
   190   ░░░ car park ░░░        ░░░ car park ░░░    ╱     x 344
G  200  ┌─┐ ▪STOP▪                      ▪▪ CAR PARK ▪▪
R  205 ═╪═╪══════════════ the commuter spur ═══════════●  ← the line ends
E  210  └─┘BARRIER                                    ╱
Y  220        (grass — composed rest, nothing on it)  ╱
L  235                    ▭ MUSTER POINT              ╱
I  250   .        the back fence, and the slab       ╱
N  265 ─────────── the page begins to lift ──────────
E  280 ═══════════ the world's south rim ════════════
   x   230       260       290       320       350   380
```

**The border seams.** West (x = 230) is THE BARRIER, and it is a place.
North (z = 130) is where the tarmac gives out into the Flats behind the
overflow's last unpainted bay — no marker, no note, and the desert
simply starts. East and south are the page's own curled margins and
nothing stands on them.

---

## 3. COMPOSITION PLAN

**What is cut.** All of Session 1's draft: twenty-six glass towers on a
`for` loop at 26-unit spacing with a second row 60 units behind it,
thirty hedges at nine-unit spacing in two dead-straight rows, six
benches and twelve planters on a Poisson scatter, and eight doodle-folk
anywhere. That is even spacing, repeated silhouettes and uniform
density — the three-part definition of *reads as an array*.

**The site plan replaces it, and a site plan is not a street wall.**
GREYLINE CITY is a wall of towers with holes in it; the Cubicle Mile is
detached blocks each standing in its own car park behind its own strip
of grass, set back from the road, and **every roofline in the land is at
the same height.** That is the straightedge, said in silhouette: the
land has a second horizon three units above the real one, dead level,
running the whole width of the frame. Exactly one thing breaks it and it
is the ATRIUM, which was phase two.

Where GREYLINE crops its near towers on the top of the frame, **nothing
in the Cubicle Mile touches the top of the frame at all.** The two
lands are opposite in the one measurement the camera cares about, and
that is what stops the third present-day land from reading as more of
the second.

**Clusters, and the gradient.**

- the **west group** (three blocks, phase one, closest together, 11–14
  units apart, all at the same setback because the plan said so);
- a **void** at x 288..296 — the atrium's forecourt, which is the only
  place in the land you can see the whole roofline along;
- the **east group** (three blocks, further apart, one turned two
  degrees off because the plot was);
- the **north pair**, deeper in and hazed, which is what makes the mile
  a mile rather than a row;
- and **the slab**: a poured foundation with the holding-down bolts in
  it and a ruled outline round it and nothing on it, at (330, 158) —
  phase three, which is where the site plan ran out. It rhymes with
  Maple Court's empty plots and does not repeat them: there it was
  kerbs and driveways, here it is a rectangle of concrete.

**Density falls in every direction from the spur.** The frontage is
dense; the north thins through the overflow into the Flats; the south is
grass with one painted rectangle on it and is composed rest — a walker
who goes south of the road is looking back north at the *backs* of the
blocks, which are extract fans, a bin store, a substation and one fire
door, and that is the honest picture of an office park and the reason
the south half is not empty.

**Occlusion, every framing.** Near: a bollard, a kerb, a lamp column's
base, the corner of a bay. Subject: the place. Far: the level roofline,
in haze. There is no framing in this land without all three.

---

## 4. INK TECHNIQUE

**The signature is the ruled corner that does not close.** `hardPoly`
takes a `gap` now: every straight run stops one to three pixels short
of the corner it is heading for. At a distance it reads as a drawing
made with a straightedge; up close it reads as a drawing nobody
finished. The same function draws the buildings, the bays, the kerbs
and the sign posts, so the tell is everywhere and is never remarked on.

Second: **glass is a ruled grid that goes pale before it reaches the
edge of the building it is on.** Greyline's window rules run off both
sides of their towers; here they stop, and the last two courses fade,
which is what a curtain wall does when the sun is on it and is also the
land's rule again.

Third: **the level roofline is the only line in the land drawn at full
weight all the way across.** Everything else is thinner than it.

`src/world/textures-office.ts`, and every canvas is seeded from the
prop's index so two blocks off one drawing are two buildings.

| texture | canvas | variants | primitives |
|---|---|---|---|
| `officeBlockTexture` | 320×160 | 3 kinds × 2 depths | `hardPoly`, `line`, ruled glazing, `fillPoly` |
| `officeBlockLitTexture` | 320×160 | 3 | warm panes, `stain` |
| `atriumTexture` / `atriumLitTexture` | 320×224 | 1 | the one tall building |
| `slidingDoorsTexture` | 128×128 | 2 (shut / open) | the player-responsive motion |
| `shelterTexture` / `shelterLitTexture` | 256×192 | 1 each | the shot's subject; the plate says D. HALL |
| `estateBoardTexture` | 224×192 | 1 | six slots, two filled |
| `timetableTexture` | 192×256 | 2 (grimy / one line wiped) | `legibleCaps` at board scale — twelve names and twelve times |
| `dennisTexture` | 96×160 | 2 poses | posture only, no face |
| `officeFolkTexture` | 96×160 | 3 | all carrying something, all mid-stride |
| `barrierTexture`, `gatehouseTexture` | 256×96, 160×160 | 1 each | the seam |
| `lampStandardTexture` / `lampStandardLitTexture` | 64×256 | 1 each | the only verticals in a level land |
| `bollardTexture`, `litterBinTexture`, `sandBinTexture` | small | 2, 1, 1 | the near layer |
| `flagpolesTexture` | 160×192 | 1 | three poles, one flag |
| `plannedShrubTexture` | 96×96 | 3 | the ruled planting, as a field |
| `officeCarTexture` | 160×96 | 3 | the car park |
| `backOfHouseTexture` | 256×160 | 2 | extract fans, bin store, substation |
| `musterSignTexture` | 96×160 | 1 | a sign on a post |
| `bayRunDecal` | 256×512 | 3 (painted / faded / unpainted) | the recession device |
| `apronDecal`, `slabDecal`, `musterDecal` | 512×512 etc. | 1 each | ground |
| `smokedPatchDecal` | 256×256 | 1 | wear, drawn darker (Session 13's lesson) |
| `railcarSideTexture` | 1024×192 | by passenger count | **the 8:15** |
| `railcarFrontTexture` | 192×224 | 1 | the 8:15, coming |
| `platformFigureTexture` | 96×160 | 6 | who gets on, one per land, by what they carry |

---

## 5. MOTION & LIFE

**Idle (four).** The flag on the middle pole, and the two bare poles
either side of it. The timetable's loose bottom corner lifting in the
draught. A paper cup turning in the eddy at the corner of the east
block, forever, on a closed path. And the commuters — three of them,
always crossing toward a door, never away from one.

**Player-responsive.** **The atrium's doors open as you come near and
shut behind you and nothing happens.** It is the only thing in this
world that reacts to the walker's body rather than to what they know,
and it is a machine being polite. `door-hiss` fires with it, once, on
the opening edge.

**And the permanent one.** The shelter's light, on `route:the-line`, at
dusk, for ever.

Per-frame: the flag, the cup, the doors, the timetable corner, the
lamps' dusk fade, Dennis's posture. Everything else is a static field.

---

## 6. SOUND

`LAND_VOICE.office` and `BEDS.office` are Session 8's and are not
touched. Four ambient events, and all four are the same joke told four
ways — *a building that promises nothing will change*:

| event | trigger | synthesis |
|---|---|---|
| `plant-shift` | anywhere in the land, every 20–40 s | the air handling changes note and comes back: the bed's own band swept up a fifth over 1.2 s, held, and returned. **The one thing that ever changes here, and it changes back** |
| `door-hiss` | the atrium's doors opening | a short filtered breath with a soft knock at the end of it |
| `cup-turn` | near the east block | a dry scrape, a pause, a dry scrape. It never gets anywhere |
| `car-door` | in either car park | one clunk, a long way off, and no engine after it |

Step zone stays `gloss` — the floors are polished and your steps say so,
which has been true since Session 1 and is the one thing about the draft
worth keeping.

---

## 7. POIS & NOTES

| label | at | prompt | note |
|---|---|---|---|
| **THE 8:15 STOP** | (252, 202) | CHECK THE TIMETABLE | *the premise line, unchanged since Session 1.* It is the house voice's home and nothing in this session touches a word of it |
| **THE CUBICLE MILE** | (277, 186) | — | the land's own card; moved onto the atrium so the skyline writes it over the tallest thing in the land |
| **THE BARRIER** | (243, 209) | LOOK AT THE BARRIER | up, and rusted up |
| **THE OVERFLOW** | (301, 154) | — | bays for the people who were coming |
| **THE CAR PARK** | (322, 202) | — | the end of the line |
| **THE MUSTER POINT** | (288, 240) | READ THE SIGN | the only place everybody has stood at once |

**No note anywhere in this land says what the timetable is.** Dennis
does not know, because knowing would require crossing (`THE-LINE`
§3.4). The board is a drawing with twelve names and twelve times on it
and the player is the only thing in the world that can read it and
understand what they are reading.

---

## 8. PERFORMANCE BUDGET

Nine blocks + the atrium + the shelter + the board + the barrier + the
gatehouse + the flagpoles + the back-of-house pair + the muster sign +
four lamp standards ≈ **24 one-off standees**, each its own draw call,
which is the same order as MAPLE COURT (21 houses). Fields: the planted
shrubs (24), the bollards (14), the cars (9), the folk (3), the weeds in
the overflow (40) — five fields, five draw calls. Decals: the aprons and
bay runs (11), the slab, the muster rectangle, the worn patch ≈ 14.

Texture memory: 27 canvases at ≤ 320×256, plus the railcar's 1024×192,
lazily by passenger count and capped at nine. Comparable to
`textures-now.ts`'s thirty-one.

Build-time at stream-in stays one frame: the shared drawings are made
once and stood many times, which is Session 10's costing rule.

---

## 9. NEW ENGINE NEEDS

1. **`hardPoly(…, { gap })`** — a straight run that stops short. Local
   to `textures-office.ts`; if a fourth land wants it, promote it.
2. **`src/engine/Eight15.ts`** — the mount, and the ending's
   instrument. It is the only thing in this spec that is not a land, and
   it is specified in §10 below rather than here because it belongs to
   `THE-LINE` §4 and not to the Cubicle Mile.
3. Nothing else. `ctx.standee`, `ctx.decal`, `ctx.field` and the skyline
   do everything this land needs, which is what nine sessions of engine
   work were for.

---

## 10. THE 8:15 — the mount, and the ending's instrument

*`THE-LINE.md` §4 is settled and this section builds it. It does not
re-open a word of §5.*

**What starts it.** Knowledge and nothing else: `route:the-line` — you
walked it, gate to car park — **and** the answers to enough of the
twelve waits. §4.1 proposed seven against twelve; **eight of the twelve
waits exist in the source today** (Brim, the Penwood, Splitrock, the
Flats, the Downs, Maple Court, Greyline City and, from this session,
the Cubicle Mile), so the constant is **five**, and the reasoning is
written into `src/world/knowledge.ts` where the table lives: the number
has to leave room for IV.3 to be *different*, and a threshold of seven
against eight answerable waits would put somebody on almost every
platform in the game. It moves to seven when the other four are built,
and it is an implementation constant either way. **Nothing anywhere
shows it.**

**Then the next time the world's clock passes 8:15 in the morning, it
comes**, and it comes at every 8:15 after that, because a mount is
found in the world and left in the world. The FIRST one is the ending.

**The route** is the drawn line: the king's road from the castle gate,
main street, the commuter spur, ending at the car park — one polyline,
793 units, assembled in `layout.ts` from the three roads that already
carry `line: true`, so it cannot drift from the road the player walked.

**Twelve stops, in the surveyors' order**, spaced down the line, each
one bearing one of the twelve lands' names off the survey schedule —
which is what the timetable is, and why the timetable has twelve
entries, and why **the last entry on it is this stop.** The train then
runs on to the car park and stands there, because that is where the line
ends, and nobody who parks in it has ever thought of it that way.

**What happens at a stop.** It stops. The doors open. It waits
**thirteen seconds** — §4.2 says *about half a minute*, and half a
minute times twelve stops is six minutes of standing still with the ride
on top of it, which turns the ending into an errand. Thirteen is long
enough to be unmistakably a wait (you can walk the length of the train
and back inside it) and puts the whole run at about two and three
quarter minutes at 34 units a second. The number is written down here
rather than quietly rounded in the prose. **At every land whose wait the player answered,
somebody is on the platform and is gone when it leaves**; at the ones
they did not, the platform is empty and the doors stand open the same
time and it goes on. **THE HARROW DOWNS' platform is always empty**,
because Joan Harrow's harvest came in and she is in the field.

**And it arrives already carrying the lands above you**
(`critique-story-2.md`'s second mandatory finding, and this is the fix
it asked for): the carriage's windows hold one figure for every stop
north of here that had somebody on it. No new content, no change to the
ending, and the default witness — who sees exactly one of its twelve
stops — sees a train that has been somewhere.

**And nobody is ever in two places at once.** Four of the twelve stops
stand within a few units of where that land's own drawing of its person
stands — the man at the junction is eight units from GREYLINE's stop and
Dennis is five from the Cubicle Mile's — so while the doors are open,
the land does not draw its own person: they are on the platform, which
is where the game has just put them (`Eight15.ts` exports `platform`,
module scope, the same shape as the clock and the knowledge set).
**The departure is not permanent, and this spec says so rather than
implying it.** When the doors shut they are back where they stand.
Making it permanent is one clause per land, and it re-opens the authored
routine of seven lands that hold verdicts; `THE-LINE` §5 does not require
it, and it is handed on in `SESSIONS.md` as the one thing the ending
does not yet do.

**Riding it.** `TAKE A SEAT` at an open door, exactly the way the
rowboat says `TAKE THE OARS`. It is fast on its own ground and refuses
every other: you can step off at any stop, and at the far end you step
off into the car park and the world is still there and you can still
walk. **Nothing takes the controls, there is no camera move, and nobody
in the carriage says anything at all.**

**How it is drawn.** Two aspects, both facing the camera, because
nothing on this sheet has ever been anything but a cutout facing you:
**the front** while it is running the north–south leg — which is a
thing coming down a road you are looking along — and **the side** on
the east–west legs, at every stop, and whenever you are in it. *A train
you are watching is going somewhere; a train you are in is a room.*
