# SESSIONS — the handoff log

## Session 20 — 2026-09-05 — the new cast, east and south

*`THE-FUN-PASS` §14's last cast session — the aliens in the Pale, the
barista at the junction, the design studio in the atrium, the office
chair, the bin, the ball, second doors on cards for the three
present-day lands — **and four drawings from the owner's own
notebook**, handed over with the brief and put in the game as drawn.
The art gate on the four re-opened lands
(`design/critiques/critique-art-14.md`). **The play gate was handed
over and not run** (`design/play-sheets/session-20.md`). Sessions 16
to 19's sheets had not come back when this session started.*

### THE ONE THING TO KNOW

**The owner's four sketches are in the game line for line, and they
are the one place the no-faces law bends.** On 2026-09-05 the owner
sent four photographs from a notebook — a dachshund in a neckerchief,
six square sheep in a watercolour field, a one-eyed thing shaped like
a pine tree with a grin and two boots, a spotted dog sitting in a bow
tie beside a paw print — and said *add these animals and elements into
the game somewhere*. They are `src/world/textures-cast.ts`, drawn
from the photographs in the house pen: the same lines, the same
proportions, the same joke in each. **Where the sketch has an eye,
the drawing has an eye**, because that is the owner's pen and not
this session's decision; the law that only the walker has a face is
recorded as bent there, on the owner's hand, and nowhere else. Each
was given the place that already wanted it: the dachshund is THE LOW
DOG on Maple Court's green, with a ball; the square sheep are THE
SQUARE FLOCK, one to a bay in the Cubicle Mile's overflow, which is
the joke the painting was already telling; the one-eyed thing is THE
VISITORS — the aliens the brief asked for — three of them in a ruled
scorch in the Pale; the bow-tie dog is THE BARISTA'S DOG, sat beside
the cart all day, and the paw print is what it leaves on the pavement.
**If the owner says one of them is not their drawing, that drawing
changes and nothing else about it does.**

**And a seat can move now.** The office chair is a pushable that is
also a seat: `sit.x`/`sit.z` are getters on the thing, `sit.onSit`
fires once with the walker's heading, `things.roll` sends the chair
that way, and `App` follows a seat with a `follow` in both axes — so
the walker rides. Any later mount that is a thing you sit on (a cart,
a trolley, a sledge) is this pattern and nothing new.

### WHAT SHIPPED

- **THE OWNER'S FOUR** (`textures-cast.ts`): `dachshundTexture` ×4
  postures, `bowtieDogTexture` ×3 and `pawTexture` (white, for the
  footprint shader), `squareSheepTexture` ×3 kinds (a sheep, the ram
  with curled horns, the long-horned face in the middle of the
  square) ×2 postures, `alienTexture` ×3 (grinning, blinking, mouth
  shut) and `eyeGlowTexture`. Plus the session's own: the scorch
  pattern, the coffee cart, the cup row (twelve states, names
  lettered), the barista, the wheelie bin, your lane, the designers,
  the persona board, the journey map, the sticky glass (seven levels)
  and a peeled sticky, the office chair, the ball, the lifted corner,
  a lettered sprint sign.
- **THE ALIENS IN THE PALE** (`wilds.ts`). `scorchDecal` at (270, 52),
  thirty-six units, ruled: three squares inside each other, eight
  rules with ticks, a scorch under the middle. `VISITORS` ×3 at three
  heights; by day they shuffle in the pattern, turn to a walker within
  twenty-two, and POKE IT (a POI on the big one, day only) blinks it
  and hops the small two (`alien-blink`). After dark
  (`the-lights-over-the-pan`, 20.5 to 5.2) the bodies are hidden and
  three eye glows hang at five to eight units, drift on slow sines,
  lean toward a walker within forty-five, and are **clamped never
  inside twelve of the walker and never off the pale**
  (`LIGHT_KEEP`); `pale-hum` every eight to thirteen seconds within
  forty, and a row in `earshot.ts`. THE PALE's note reads the hour and
  explains nothing. Nothing of theirs has a position outside the Flats
  by any path.
- **THE BARISTA AT THE JUNCTION** (`civic.ts`, Greyline). The cart at
  (142, 216), solid; `BARISTA` on a routine in by mill lane and across
  the junction at 6.7, behind the cart from seven, and on every hour
  from seven to six the drawing with a hand up for six minutes
  (`the-order-0..11`, `order-call` within thirty-four) and a cup set
  down with a name on it — WICK, MARGET, VAL, HOLT, AMOS, PYE, BRACK,
  WREN, NELL, JOAN, one with nothing on it, DENNIS — the row a pure
  function of the hour (`cupsAt`), gone at 18.6, and THE CART's note
  lists them. **THE DOG** (`BARISTA_DOG`, a routine drawn by a
  `Creature`) sits beside the cart from seven to six and walks in and
  out with the barista, stamping the owner's paw every half unit on a
  second `Footprints` (`map` option, fade 900) — the only prints in
  Greyline that are not the walker's. **THE BIN** (`the-bin`, E19): on
  its side at the junction's north-east corner until RIGHT THE BIN
  (`fact:the-bin-righted`), then a pushable (shove 7, refuses
  buildings and water); rolling within seven of the junction the
  pigeons go up and the box ticks (`bin-roll`, `bin-knock`).
- **THE DESIGN STUDIO IN THE ATRIUM** (`civic.ts`, the office). A
  persona on an easel (DENNIS, COMMUTER 58, GOALS / FRUSTRATIONS /
  NEEDS, *'IT SAYS 8:15.'*), a journey map (twelve stages, four rows,
  a red line that goes down at the fourth and stays down), a table
  with a laptop, SPRINT 2 - WEEK 2 lettered under it, all solid.
  Three on routines (`LEAD`, `RESEARCHER`, `MAKER`, `designerTexture`
  with a lanyard): out of the atrium at 8.3, the researcher at the
  stop from 7.98 with a clipboard beside Dennis while he reads the
  board (**the intercept**), then at the shelter's glass at 8.5; the
  maker out with a foam board at 8.5; all in at twelve, out at one,
  in at five. **The stickies**: `stickiesAt(h)` — none first thing,
  the wall of twenty-four by five, up until the morning — drawn on a
  transparent sheet the shelter's size standing on its glass; PEEL
  ONE OFF (a POI at the glass) takes one off and lays it on the apron
  (eight decals, reused), and the morning puts the wall back. THE
  SPRINT's note is accurate and says nothing about what it means.
- **THE SQUARE FLOCK** in the overflow: six `Creature`s at
  `FLOCK_BAYS`, one to a bay across both bay runs; within eight a
  sheep moves square off the walker up to six units, inside the
  overflow's rect, and re-parks slowly; within fourteen its head is
  up; **the long-horned one never moves**; `sheep` on a scatter and
  every twelve to twenty-two seconds within twenty-two, and a row in
  `earshot.ts`. THE OVERFLOW's note has them.
- **THE OFFICE CHAIR** (`office-chair`, L8): a pushable on the spur
  road's verge at (291, 208.6) that is a seat (reach 3.6, lift 0.5,
  `follow` with a castor wobble, `onSit` → `things.roll(…, heading,
  36)`), refusing buildings, the atrium's doors, the shelter, and the
  mile's edges; `chair-roll` while it moves. It stays where it stops.
- **THE LOW DOG AND THE BALL** (`civic.ts`, Maple Court). `the-ball`
  is a carriable with `rolls: 7` (a throw at a run lands and rolls
  on; `ball-kick` on the throw); refuses buildings, the steep and
  water. THE LOW DOG is out seven to eight at night (`the-low-dog`),
  its land THE GREEN's district rect: it notices a walker on the grass
  within twelve (`yap`), follows at a stride and a half, goes for the
  ball when the ball is loose on the green and not at your feet, noses
  it back toward you (`things.roll` toward the walker) and keeps
  doing that, and when you leave the green it goes on toward you as
  far as the edge and sits there looking after you. A companion at
  the size of a lawn, written by hand rather than on `Follower`
  because it has two targets.
- **THREE SECOND DOORS, ON CARDS** (`THE-FUN-PASS` §6): **VAL** — at
  the three chairs with `name:castle`, CUT THE GAP
  (`door:the-gap-cut`, now `WAIT_ANSWERS.neighborhood`) or TURN HER
  LIGHT OFF (`door:the-light-off`: the porch dark at once, and the
  lit houses go dark one a day off `fact:the-light-went-off-on-day-N`,
  written once by the land and read back with `knowledge.first`).
  **THE MAN AT THE JUNCTION** — read the pavement (`fact:the-pavement`)
  and it is a card: STAND WITH HIM (`door:the-stood-with`; the four
  seconds resolve it) or WALK ROUND, LIKE EVERYONE
  (`door:the-walked-round`: the four seconds stop counting, and the
  third pass — in past seven, out past thirteen — writes
  `fact:your-lane` and lays `yourLaneDecal`, nearer him than the
  city's two). The four seconds do not count while a note or a card
  is up (`UI.chrome.open`). **DENNIS** — the board close up with
  `route:the-line` is a card: WIPE THE BOARD (`door:the-board-wiped`:
  a clean timetable, `timetableTexture(…, clean)`, and Dennis skips
  his eight o'clock) or PRESS THE CORNER BACK
  (`door:the-corner-pressed`: the lifted corner, E20, stays down).
  The pavement's POI moved two units east so it wins the nearest test
  from the man's spot.
- **Engine**: `Footprints` takes a `map`; `ThingDef.rolls` and
  `things.roll(id, heading, dist)`, and `tick` rolls any grounded
  thing with velocity; `sit.onSit` and a seat that moves in both
  axes; `knowledge.first(prefix)`; `UI.chrome`; the harness's
  `closeChoice`. Nine voices in `Audio.ts` (`yap`, `ball-kick`,
  `order-call`, `bin-roll`, `bin-knock`, `chair-roll`, `sticky-peel`,
  `alien-blink`, `pale-hum`); six rows in `earshot.ts`. `render-wavs`
  carries them under `the-new-cast-east`.
- **Tools**: `check-verbs` §11 on a fresh page (the visitors by day
  inside the pale and no lights; the poke; the bodies gone and the
  lights up at night; the lights sampled for twelve seconds never
  inside twelve and never off the pale; the routines and the twelve
  orders registered; the barista and the dog at noon, the dog walking
  in at 6.86; the bin righted, rolled to the junction, the pigeons up;
  the pavement a note then a card, the second door and three passes
  and the lane with him still standing; the intercept at 8.1; PEEL
  ONE OFF twice; six sheep in the overflow, one scattered and the
  long-horned one not, re-parked; the chair sat on and rolled with
  the walker on it, short of the atrium; the board's card and the
  wipe; the low dog to a walker, to the ball, and sat at the green's
  edge with the walker past it; Val's card, the light-off door and its
  day written, not an answer, and the gap answering);
  `shoot-session20` (30 framings, both rigs, a DO table that pokes,
  pushes the bin, opens cards, peels, walks at the flock, rides the
  chair, kicks the ball and leaves the green; waits for the loader to
  let go before the title); `shoot-now` and `shoot-8-15` learn
  `door:the-gap-cut` where they learned `name:castle`.

### THE GATES, AND WHAT MOVED

{{GATES}}

### DECLINED, IN WRITING

- **A face for the aliens beyond the owner's eye.** The drawing is
  the owner's; the eye is the light over the pan; nothing was added.
- **A word about what the visitors are.** THE PALE's note says what
  is there at each hour and stops. The lights are lights.
- **The barista calling a name in words.** Every voice is synthesis;
  `order-call` is the shape of two syllables, and the cup carries the
  name.
- **The square flock on the Downs.** The Downs is the one land in its
  category that is not a joke; the overflow is a car park set out for
  people who were coming, and sheep parked in it is the Cubicle Mile's
  absurdity, played straight.
- **Making the stand-still door depend on the card.** Four seconds by
  the man without reading the stone still answers his wait, the way
  Session 13 built it. The card is the way to see both doors; forcing
  it would put a gate on a wait that never had one. Recorded in
  `PROMPT.md` for the owner.
- **Paw prints that last for ever.** The dog's `Footprints` fade in
  fifteen minutes; a pavement that kept them wants them as a decal on
  the routine's line, and that is a line in `PROMPT.md`.

### Gotchas (new; everything from Sessions 1–19 still applies)

- **A ROUTINE'S STRAIGHT LINE GOES THROUGH DRAWINGS.** The barista's
  first route from the north end's door to the cart ran behind the
  shop row and the walk-in was a dog seen through a shopfront. A
  routine that crosses a land goes by the road with a stop at the
  turn.
- **A SEAT THAT MOVES OUTRUNS THE CAMERA.** The rig walks twelve
  behind and lerps; a thirty-unit ride needs four seconds of settle
  before a frame, or the frame is of where the walker was.
- **A FRAME'S SETTLE IS FOUR SECONDS OF STANDING STILL.** Within nine
  of the man that is his wait answered before the card is offered.
  Stand the frame off him, and — for the player — the four seconds do
  not count while a card is up.
- **THE LOADER OUTLASTS A TWENTY-FIVE SECOND WAIT IN THE SANDBOX.**
  Eleven of twenty-nine frames on the first sheet were the loader.
  Wait for `.loader.gone` before the title veil.
- **A CHAIR'S REACH IS WHERE A WALKER STOPS.** Two and six tenths is
  inside the chair; a walker stops about two and three quarters out.
  And the poke's point was a stride off the visitor's foot: a touch's
  point is the drawing's foot, and its reach is measured from there.
- **A NOTE A TEST LEAVES OPEN EATS THE NEXT PRESS.** §11's first run
  opened THE PALE's note where it meant to poke, and the bin's first
  press closed the note instead of righting the bin. Close what you
  opened before the next assertion.
- **A PROMPT'S NEAREST TEST IS DECIDED BY THE POI'S POINT, NOT ITS
  LABEL.** The pavement's point at (137, 196) lost to the junction's
  from the man's own spot; it is at (139, 199.5).
- **A DOOR THAT NEEDS A DAY WRITES THE DAY.** The knowledge is a set;
  the land writes `fact:…-on-day-N` once and reads it back by prefix.

## Session 19 — 2026-09-04 — the new cast, west and north

*The first local QA pass came first, all five of its jobs, before a
Viking was drawn: the gate trap, collision for every building in the
world, the writing put next to what it names, the tooling that waited
fifteen silent seconds, and the small ones. Then `THE-FUN-PASS` §14:
the Vikings on the Holdfast, the surfers at the Cut, the three
monsters, WICK, PYE and WREN drawn and on routines with waits that
are cards with two doors, three toys, Greyweather re-drawn, and an art
gate on the re-opened lands (`design/critiques/critique-art-13.md`).
**The play gate was handed over and not run**
(`design/play-sheets/session-19.md`). Sessions 16, 17 and 18's sheets
had not come back when this session started.*

### THE ONE THING TO KNOW

**Every building in the world has a footprint now, and it cost the
roads nothing — but only because the footprints are clipped off the
road centrelines and one of them is exempt.** The QA pass found that
nothing but three fences and a gull had collision, and the fix is one
option on `ctx.standee`: `solid: true | number | { hw, gap, keep }`
writes a `barriers.ts` segment the width of the drawing's foot (or the
number, or a foot with a gap in it for a gate arch), and
`World.nearFade` dims to a fifth anything the lens gets within four and
a half of. One hundred and forty-seven footprints, a hundred and fifty barriers with the fences and the gull. The first run of the
tool that sweeps them found four across roads — a fountain, a terrace,
the mill, a tower — because the roads were laid through the lands after
the buildings were placed and nobody ever had to walk round anything.
So `onRoadLine()` clips every footprint into the runs of it that are
off a road's band (`width × 0.5 + 0.9`), and a footprint that would be
clipped to nothing can say `keep: true`, which the king's-road fountain
does: it stands in the road on purpose (Session 3 put it there to be
walked round) and it is the one barrier the sweep exempts, by id. **If
a later session lays a road through a house, the house loses the strip
under the road and the sweep stays green**, which is the right failure
but a quiet one. `check-verbs` §2 counts the solids and sweeps every
road at a walk.

**And section 10 of `check-verbs` runs on a fresh page, because
sections 1–9 learn everything.** The cast's assertions are about doors
not yet taken and waits not yet answered; by section 9 the page had
been handed every fact in the game. `page.reload()` before the cast
is the cheapest fix and the only one that tests what a player sees.

### WHAT SHIPPED

- **The QA pass** (`design/critiques/qa-local-1.md`, in its order).
  **B1**: `SPAWN` is (24, 82), the gate's own row, and the bull's home
  is (33, 70); the bull charges at the walker's SHOULDER on the frame's
  side (`BULL_SHOULDER`), so on both rigs the frame sees the charge and
  a due-west run at the hint's word reaches the gate before it shuts.
  `check-verbs` §1 runs that run, with the camera's projection, and
  asserts the bull in frame. **B2**: `solid` on every standee that is a
  building, wall, tower, gate, keep, house, hut, well, mill, cistern,
  van, trough or stack; `nearFade`. **B3**: `POI.ts` writes the label
  a line-height over the skyline top of its thing
  (`LABEL_CLEAR_R` 3, `LABEL_MAX_RISE` 9) and anchors the prompt beside
  the walker when the thing is out of frame and beside the thing when
  it is in; the region card has a paper halo (`style.css`); the map
  places district names in boxes and drops them on a phone or on a
  collision. **Tooling**: `shoot-lib` waits on `.title-veil:not(.gone)`
  (twenty-two waits, across every shoot script); README leads the run
  section with `npx playwright install chromium` and `PW_CHROMIUM`.
  **B4**: no run hint on a mount, the rider sits on the saddle
  (ground −0.26), the wake card falls back, the tarn's skin decals are
  draped on its bowl (`drape()` in `wilds.ts`).
- **GREYWEATHER RE-DRAWN** before a Viking: the keep has courses,
  quoins, a plinth course and a damp stain; the bailey has a yard
  decal, wear at the keep's foot, a trough, a timber stack and two
  crates, all solid. The stone, the ground and the furniture, in that
  order, as the brief said.
- **THE VIKINGS** (`coast.ts`, ocean half). `longshipTexture` ×3,
  `shipAt(h)` pure: in from the offing six to seven, beached at the
  berth (−264, −46), out at a quarter to twelve, **round the mark with
  the fleet noon to half past one**, back by a quarter to two.
  Registered `the-longship-in/-out`. Beached, with the walker on the
  sand, seven till eight at night, they roar every nine to fifteen
  seconds; **nobody lands** — eastmost x under −252, asserted through
  the day. **THE HORN** on the point (a drawing on a stone beside the
  cairn): BLOW THE HORN, and a beat and a half later they answer from
  wherever they are and the gulls lift. A toy.
- **THE SURFERS** (`coast.ts`, beach half): a van (solid), a rack, a
  wetsuit on a line on the shelf under the point; two people out of
  the van at 6.05 and 17.55 to the water's edge, a look at the sea,
  back to the step. Never in. The van's window lights at 19.2, the
  jetty lamp at seven. **THE ERRAND**: `the-board` on the wrack by the
  boardwalk, a carriable; within six and two tenths of the rack it is
  racked (`fact:the-board-racked`, `board-knock`). The van's note is
  the sticker, reach five.
- **THE MONSTERS.** The moat is red two days in nine (`moatRed(day)`,
  days 1 and 2), and after dark within twenty-six something moves in
  it and the reeds shiver. The-deep surfaces every third dusk and
  **the seals do not haul out the morning after**. In the deep pines
  after dark, stand still nine seconds and a shape is drawn at the
  frame's edge thirteen units off, for nine tenths of a second, never
  within eleven and a half, never twice in seventy seconds, with a
  branch cracking. Not one of them has a note that says what it was.
- **WICK, PYE, WREN** drawn (`wickTexture` ×5, `pyeTexture` ×3,
  `wrenTexture` ×3, two boats) and on routines (`WICK_MORNING/EVENING`,
  `PYE_DAY`, `WREN_DAY/AFTERNOON`, `Figure` takes a `maps` table per
  pose). **C12 built**: Wick resting on the verge at 5.55 with the
  banner across his knees. **Three waits, each a card with two doors**
  on Nell's pattern (getters on the POI): the fifth banner in Brim's
  red, learned from the square's cloth (`fact:brim-red`,
  `reason:the-fifth-banner`), a bare pole when the king is back and
  Wick `RELIEVED`; the eighth pot or the pots hauled
  (`door:the-eighth-pot` / `door:the-pots-hauled`, on `name:the-mark`);
  the second mark or the fleet finished (`door:the-second-mark` /
  `door:the-fleet-finished`, on `route:the-bar`). `WAIT_ANSWERS` has
  the castle, the beach and the ocean; `WAITS_FOR_THE_LINE` is seven.
- **TOYS**: RATTLE THE PORTCULLIS (drops, holds, back up by itself,
  braziers gutter); `bar-stone` on the crest that skips three times
  off the bar (`things.skip`, `Splash` rings, `stone-skip`) and is
  back by morning; the rowboat in the fleet (`rowboat` in `Boat.ts`,
  the nearest racer bears away, its halyard rattles).
- **Sound**: `viking-roar`, `horn`, `portcullis`, `board-knock`,
  `moat-slop`, `stone-skip` in `Audio.ts`; `earshot.ts` rows for the
  roar (Holdfast, r 46, 7–20) and the two oars. `render-wavs` carries
  them under `the-new-cast`.
- **Tools**: `check-verbs` §1 (the due-west run), §2 (the solids and
  the road sweep), §10 (the cast, on a fresh page: the longship's
  eastmost x, the roar sampled per frame, the horn answered within
  four seconds, the surfer out at 6.25, the board's errand, Pye's
  card and a door answering the wait, Wren's card and a door that is
  not an answer, no row after the fleet finished, the fifth banner and
  the castle answered, Wick's resting pose at 5.85, the portcullis's
  drop, the moat's days, the deep's and the seals' days, the shape
  shown and gone, a stone skipping, `answeredWaits() === 3`);
  `shoot-session19` (34 framings, both rigs, a DO table that roars,
  blows, racks, opens cards, rattles, waits for the shape, skims and
  rows into the fleet); `qa-play-local-2` and `shoot-session16` moved
  to the new spawn; `diff-sheets` lists every failing row; `check-
  verbs`' fresh page waits on `load` and the title, not `networkidle`
  (a begun page never goes idle inside thirty seconds).

### THE GATES, AND WHAT MOVED

- **Build green.** `check-terrain`, `check-fields` (90 figures driven
  through their hours), `check-roads` (both rigs, noon), `check-audio`,
  `check-sightline`, `check-lures`, `check-camera` (both rigs),
  `check-verbs` (every section, §10 on a fresh page). All pass on the
  pushed head.
- **Art gate**: `critique-art-13`, two rounds. Round one's six
  (the board racked into the van's note, a horn that was a prompt over
  nothing, the fifth banner behind the tower, Wren's punt afloat, the
  keep a wash, the roar never in a frame) fixed and re-shot; round two
  passes with **Greyweather, Longshore and the Wide Blue re-earned**
  and Brim held. The standing note is the named figures at the dusk
  grade on a phone, which is the camera's and Session 20's.

- **What moved, by `diff-sheets` against `origin/main` (c259f94), 92
  framings, bearing pinned, twelve game seconds of settle.** 42 of 92
  bit-identical; 46 moved at all; **37 over the 0.15% threshold**,
  which is the most any session has moved and is what re-drawing a
  land and giving every building a footprint costs. Every frame that
  moved has this session in it. The reporter now lists every failing
  row, not the first twelve, and `SAVE=1` kept both sides and a mask
  of every one:
  - **`street-shot@12` and `@19.6` on the phone, 96.2% and 89.4%** —
    the biggest move in the project's history and **it is the QA pass
    working.** On the portrait rig the camera at the street shot's
    spot stands inside Brim's south gate drawing, and the protected
    frame was photographed through it: a brown wash over the whole
    picture, which is B2's *the camera goes inside them* exactly. The
    gate now fades to a fifth when the lens is within four and a half
    of its foot, and the frame is the street. The desktop rig stands
    further from the gate and its frame moved by eight pixels.
  - **`bailey`, `curtain-wall`, `barbican` at both hours, both rigs —
    15.4% to 0.7%** (bailey 15.4/11.3 portrait, 11.1/8.0 desktop;
    curtain-wall 10.2/8.1 portrait, 6.1/4.8 desktop; barbican 2.6/1.7
    portrait, 1.1/0.7 desktop). The keep's masonry, the yard, the
    trough, the stack, the crates, the well, the portcullis in the
    arch and the fifth banner's pole on the ridge. Greyweather was the
    scope and the critique re-earns it.
  - **`tide-line` 1.3/1.2 portrait, 0.7/1.0 desktop** — the van, the
    rack and the wetsuit on the shelf, and the board on the wrack in
    the foreground. **`boardwalk` 0.17–0.38** — the same shelf from
    the south, and at dusk the jetty lamp lit.
  - **`sandbar@12` 0.8 desktop** — Wren in her punt beside the bell at
    noon; **`@19.6` 0.5** — the longship beached on the Holdfast at
    the frame's right edge.
  - **`avenue-foot` 0.66/0.44 portrait, 0.31/0.22 desktop** — the
    portcullis in the far gate's arch and the yard's furniture on the
    ridge. **`square-mid` and `square-wide`** moved by a few dozen
    pixels at the road's vanishing point for the same reason, under
    the threshold.
  - **`the-point` 0.41/0.39 desktop, 0.25/0.22 portrait; `THE-SHOT-cut`
    0.37/0.32 desktop** — the horn on its stone beside the cairn.
  - **`crossroads` and `well`, 0.25 and 0.24 at both hours, desktop,
    writing only** — the page is bit-identical; the label moved up a
    line-height (B3), which is what the frame was told to do.
  - Every other framing — the Common's five but those two, the
    Penwood's, the Downs', the Flats', the canyon's, Greyline's, the
    court's — is bit-identical, page and writing.

### DECLINED, IN WRITING

- **A face for any monster.** `THE-FUN-PASS` §2: never seen whole,
  never explained. The shape in the pines is a trunk-shaped thing for
  under a second; the moat is a sound and a shiver; the-deep is a day
  the seals stay away.
- **A Viking on the sand.** The berth is the Wide Blue's and the sand
  is Longshore's; the whole joke is that they cannot land, and the
  ending depends on it. The longship's x is clamped and asserted.
- **A score for the horn, the stone or the portcullis.** Toys. The
  stone counts its own skips in sound and nowhere else.
- **Brim's belfry.** The brief opened it only if the bell was touched;
  it was not. The square's note gained a sentence about the red cloth
  because Wick's wait needed a colour to be learned somewhere.
- **A tint or a wash for the red days.** The moat is red; the sky is
  not. Two days in nine on `clock.day` and the note reads the day.

### Gotchas (new; everything from Sessions 1–18 still applies)

- **A LAND'S ASSERTIONS ABOUT DOORS NEED A PAGE THAT HAS NOT LEARNED
  THEM.** `check-verbs` §10 reloads. Any later section that asserts an
  unanswered wait does the same.
- **A FOOTPRINT ACROSS A ROAD IS CLIPPED, NOT REFUSED.** `onRoadLine`
  takes the strip under the road out of the footprint silently. A
  building that should stand in the road says `keep: true` and is
  exempted from the sweep by id.
- **THE FOOTPRINT RUN LOOP MUST CLOSE ITS LAST RUN.** The first pass
  registered fifty-three of a hundred and forty-seven because the loop
  never pushed the run it was in when the foot ended.
- **A PROMPT'S REACH MAY NOT COVER ANOTHER THING'S GOAL** — the well
  (15), the plane (18), and now the rack: the van's reach of eight
  covered it, and carrying the board there opened the sticker.
- **A STANDEE ON WATER IS A THING AFLOAT.** Wren's punt at the bar's
  shoulder was under the sea. Read the height field before placing a
  thing that is meant to be drawn up.
- **A ROUTINE'S STOP LIST MAY NOT BE EMPTIED.** `routineAt` on an
  empty list throws; a routine that never leaves has one stop at an
  hour that never comes (`WREN_NEVER`, 24.5).
- **A SOUND SHORTER THAN THE SHUTTER IS SAMPLED PER FRAME.** The roar
  and the horn's answer are asserted by polling `life.drawn` each
  frame for twenty-two seconds, not by one read after a wait.
- **`diff-sheets` REBUILDS `dist` AND OWNS 4191/4192.** Run it alone:
  a check tool started on 4173 mid-run tests two builds.

## 2026-09-04 — the first local QA pass, after Session 18 merged (no code)

*The shipped build played on the owner's Mac for the first time: headed
Chromium, real time, real keys, both rigs. Every check tool passes on
this machine (once `PW_CHROMIUM` points at an installed Chrome);
55–61 fps in every land; zero console errors. The play found three
system faults no tool had seen: **the first minute traps a player who
runs due west from the bull** (the gate shuts with them still in the
field), **nothing in the world has collision but three fences and a
gull** (the walker walks through every cottage, wall, keep and
fountain and the camera goes inside them), and **labels, prompts and
cards are placed far from what they name**. Plus a tooling fault
older than every verdict: `shoot-lib` has waited fifteen silent seconds
per viewport for title text that is lettered on canvas, since Session
2. The report, ranked and with a session plan, is
`design/critiques/qa-local-1.md`; the evidence is `shots/qa-local-1/`;
the scripts are `tools/qa-play-local.mjs` and `-2.mjs`. `PROMPT.md`
now opens with the fixes, in order, before Session 19's own scope.*

## Session 18 — 2026-09-04 — the roads

*The walks between the lands, which the owner called a chore. Three
fixes, and they stack (`THE-FUN-PASS` §8): the twenty-eight encounters
of `THE-STRANGERS` Part Three built where they did not exist, as
routines with a turn; districts in all twelve lands; and **the
fifteen-second rule measured** — a tool that walks every road at a
walk on both rigs and fails on fifteen seconds with nothing in frame
or in earshot. Then the mounts as fun: the bicycle and its bell, the
paper plane off the tear's lip, and the 8:15 every morning after the
ending. **The play gate was handed over and not run**
(`design/play-sheets/session-18.md`). Sessions 16 and 17's sheets had
not come back when this session started; the opening and the life are
untouched.*

### THE ONE THING TO KNOW

**The tool found the world more alive than the owner felt, and the
sheet asks which of them is wrong.** `tools/check-roads.mjs` walks
every road in `layout.ROADS` at 4.1 units a second with the clock
running, on a desktop and on a phone, and at every two seconds asks
two questions of the running page: is anything IN FRAME (the skyline
grid projected through the shipping camera — every one-off standee
records its top as it is built — the life registry, the things, the
bridges, water beside the road; never an instanced field, because a
road through a wood with nothing on it but trees is the road the owner
meant), and is anything IN EARSHOT (`src/world/earshot.ts`: the
placed voices as data, a silence that is itself a place, a scheduled
event with a place; never the land-wide lark, because a rule a lark
satisfied could not fail). On eleven roads, from noon, it found **two
silences**: the canyon trail's run from the Downs' edge across the pan
to the riverhead (22 s on the desktop, 24 s on a phone — the longest
silence on any road) and Brack's round's south-west arc on a phone
(20 s). Both got a midpoint and the sweep is clean on both rigs. But
the owner said *chore* about the king's road, and the king's road
never once went fifteen seconds without something in frame. So either
what the tool counts as *in frame* is too lenient — a mailbox at forty
units is company by the rule and not by the feel — or the chore is the
walk itself and not the emptiness, which is the walk speed and the
bicycle. **§0 of the play sheet puts exactly that question to the
owner**, with the two silences to walk, and Session 19 changes the
tool's definition before it opens a land if the answer is the first.

**And a paper plane cannot land on the far rim.** Session 11's brief
said the plane launches from the tear's east lip or the curled rim,
and the note at THE OVERLOOK says *the other rim is forty units away
and about an hour*, so the session built a glide that crossed the cut
and expected it to come down over there. The height field said no: the
far rim is as high as the near one (3.5 against 3.9 at the overlook),
and a thing that falls one unit for every five and a half across
cannot arrive at its own height. It meets the far wall thirteen units
up, and `things.ts` now says what a plane that meets a wall does: it
drops to the wall's foot, the last flat ground under the line — the
east side of the floor — and the only way to it is round the mouth and
along the bed, which is the geography lesson the land teaches and the
one thing Session 11 said the plane must not shorten. It does not.

### WHAT SHIPPED

- **`tools/check-roads.mjs`** — the fifteen-second rule, measured.
  `HOUR=`, `ROAD=`, `RIG=`, `STEP=`, `VERBOSE=1`, `JSON=`. Its
  output is every silence of fifteen seconds or more on every road on
  both rigs, longest first, with where it starts and ends and what was
  nearest on either side; and it exits non-zero on any. At noon: two
  silences before, none after. At seven in the evening (`HOUR=19`):
  the same eleven roads on both
  rigs, from seven in the evening, are clean too — at dusk the
  lamplighter, the dusk walker, the fire, the combers going in and the
  lit windows do the work the standees do by day. Twenty-two road
  walks in all, none silent.
- **`src/world/earshot.ts`** — the placed voices as data (`VOICES`,
  `earshotAt(x, z, hour)`, `voice(land, id)`), the moving ones (the
  surf as you come down to it, the slot's wind) as distance functions,
  and the two silences that are places (Brack's twenty, the deep pines
  after dark) plus one new one. **`App.ts` reads its ambient distances
  from it** (`hears(land, id)`), so the number the tool walks against
  is the number the game plays: the well's eight, the square's sixteen,
  the mill's forty-two, the drove's thirty-four, the tarn's thirty, the
  hull's thirty-four, the palms' twenty-six, the track's, the sea's
  forty-six. Nine numbers that were literals in a two-hundred-line
  `Math.random()` table are one table.
- **`World.skylineWithin(x, z, r)`** (`regions/index.ts`) — the skyline
  grid's cells and tops, for the tool to project. `I.layout`,
  `I.earshot`, `I.bicycle`, `I.takeBicycle`, `I.putBicycle`,
  `I.bicycleRefuses`, `I.waitAnswers` on the harness.
- **FIFTEEN ENCOUNTERS built, twelve already there, one deferred.**
  Every one a routine with a turn, on the clock, with the aftermath
  authored for whoever comes at the wrong hour. **BRIM** — C1 *a cart
  with a broken wheel and nobody near it*: on the king's road south of
  the square all morning, canted on its axle with the wheel off beside
  it; at one THE WHEELWRIGHT comes down from the back streets, bends
  over it, and at a quarter past three pushes it home whole (the cart
  becomes his `prop` on the leg he leaves; at four the road is empty;
  tomorrow it is broken again). C2 *somebody walking the other way who
  does not look up*: down the king's road from the square to the gate
  at dusk and back to a door in the back streets. **THE COMMON** — C3
  *a dog falls in beside you for half a land and then does not*: a
  `Follower` at dawn (`the-dawn-dog`, 5.4 for two hours) whose land is
  the Common's WEST HALF, so it stops dead at a line that is not a
  border, just past the crossroads, and sits, and nobody says why. C4
  *two people carrying a long ladder round a bend*: from the oaks round
  the well to the fair ground at half past nine and back after four,
  the front one carrying the drawing, the back one twelve hundredths of
  an hour behind; between the trips it leans at the fair ground.
  **LONGSHORE** — C5 *a hat, going the other way, faster than you*:
  three runs a day east along the coast road at seven units a second
  that stop at the Common's border like everybody else and lie there.
  C6 *a line of people combing the tideline, spread out, silent*: three
  at low water, first light and before dark, a dozen units apart on the
  wrack in the bight, bent, never any nearer each other. C7 *a fire
  lit, and nobody at it yet*: on the south sand at seven, two come down
  the promenade and sit at it at twenty past eight, and all the next
  day it is cold ash. **THE WIDE BLUE** — C8 *a light out on the water
  that is not the mark*: in Shelter Cove from nine, thirty-five units
  off the sand, drifting, and it does not ring. C9 *a gull that will
  not move off the crest, so you go round*: on the bar's spine where it
  bends west, and it is a `barriers.ts` barrier two units wide — the
  drawing standing in it — that turns to you and opens its beak at
  arm's length and does not move; the crest is nineteen wide. **THE
  PENWOOD** — C14 *a felled pine across the road, and the saw left in
  it*: across the track's last diagonal from first light, two lengths
  at the verge and the saw gone by three. C15 *something moves in the
  water and you do not see what*: rings on the tarn at dusk for half an
  hour, one every ten seconds, never where you are looking, a plop if
  you are near. **THE DOWNS** — C17 *a funeral you should not
  interrupt*: four in file, slow, up the mill lane from the farm to the
  ford at three and back before four, and inside forty units of the
  lane while they are on it the land's ambient stops (`the-funeral-
  silence` in `earshot.ts`, and the one silence in a land that is all
  machines). C18 *a flock parts around you and closes behind*: seven on
  the east road at half past four walking west as a scheduled event,
  each stepping off the road south as you reach it — the river is the
  other side — and back on when you have gone. **THE FLATS** — C22
  *the oasis, from the wrong direction, and it is not there*: a stand
  of palms on the pan north-east of the real one, in the middle of the
  day, that you can see from sixty units and not from twenty-five.
  **MAPLE COURT** — C24 *a car with its engine off and its lights on*:
  one of the drives on main street, six until nine. **ALREADY THERE**
  (Sessions 10–17): C10 the delivery, C11 the lamplighter, C13 the
  braziers, C16 the field working, C19 the rockfall, C20 the boots,
  C21 Amos, C23 the sprinkler (a sound with nothing drawn, by the
  land's own spec: *you never do find the lawn*), C25 the man in the
  rush, C26 the four green lights, C27 Dennis at the board at eight,
  C28 the car park's cars. **DEFERRED, in writing:** C12 *Wick,
  halfway up the avenue, resting, at dawn* — Wick has no drawing at
  all, and his wait is Session 19's; the encounter is his first
  routine and it is in `PROMPT.md` as that.
- **Five new drawings** in `textures-life.ts` (a ladder, a hat, a fire
  lit and cold, a saw, a ripple ring, a wheel) and two elsewhere (a
  bicycle in `textures-now.ts`, a paper plane in `textures-canyon.ts`).
  The dust devil is a `Creature` now, so the registry — and the tool —
  knows where it is.
- **DISTRICTS in all twelve lands** — forty-five, from `THE-FUN-PASS`
  §7's first cut, sized off the places that already stand in them,
  none overlapping (asserted), none tiling their land. The card and
  the map read them since 16. THE YARDS in Greyline is the one new
  piece of ground named; THE HOLDFAST is drawn as a district of THE
  WIDE BLUE for the longship Session 19 beaches on it.
- **THE BICYCLE** (`src/engine/Bicycle.ts`, on `Boat.ts`'s pattern).
  Found on its side at the mouth of the court (`BICYCLE_HOME`), saved
  where it is left. One prompt: GET ON parked; riding, RING THE BELL
  on the move and GET OFF stopped — the hand's own speed test. 7.4
  units a second on the flat (the run is 6.15) and the grade paid back
  downhill up to half again. It refuses **sand, stairs** (Val's porch
  steps, a rect on a drawing), water off the planks, the steep, and
  **its own land's border with the walker still on it** — `App.
  bicycleRefuses` — so at the Common's edge it stops dead and you get
  off and walk on and it is there when you come back. **The bell is
  answered**: `Bicycle.bell` is read by the neighbourhood — the cat on
  Val's fence sits up for it, the children on the green stop where
  they are and look at you for two seconds — and the walker recoils on
  the press, because a phone is on silent. `bicycle-bell` in
  `Audio.ts`.
- **THE PAPER PLANE** (`things.ts` `glide`, `wilds.ts`). A carriable
  with a glide ratio: thrown, it goes down the air in a line from the
  hand, five and a half across for one down, until the ground comes up
  to meet it; set down by a standing walker it is set down at the
  feet (`throw_`'s `thrown` argument). Its rock is eleven units from
  THE OVERLOOK's own marker toward the lip, so that holding it the key
  is the throw and not the note (the well's lesson from 15, applied
  before it cost a round). Drawn on the rock, in the air with its nose
  down, in the hand; `paper-land` is the quietest voice in the game.
- **THE 8:15 AS DAILY TRANSIT** (`Eight15.ts`). Registered as
  `the-8-15` on `events.ts` at 8.25 for the run's hour and three
  quarters. `ending` is true for the first run — somebody on every
  platform whose wait was answered — and the run writes
  `fact:the-8-15-ran` into knowledge, in the save; every morning after
  it `ending` is false and `waiting()` is false at every stop: a train
  that stops twelve times for thirteen seconds each and takes nobody,
  and you can get on. The ending is not re-run; it is remembered. (It
  had, in fact, been re-running: the crossing fired every day once the
  walker qualified, and put people on the platforms every day.)
- **Tools**: `check-verbs` section 9 (the bicycle at its border with
  the walker on it, the key's three answers, the cat, the speed, the
  plane's glide and its set-down, the 8:15's event and its two kinds of
  run, the dawn dog's line, the hat's border, forty-five districts,
  earshot pure, every encounter registered); `check-roads`;
  `shoot-session18` (36 framings, both rigs, with a DO table that
  rides, rings, throws, and warps the train on the day after).
  `render-wavs` carries the two new voices under `the-roads`.

### THE GATES, AND WHAT MOVED

- **Build green.** `check-terrain` (every stop on ground a walker can
  stand on; the line ends in a car park), `check-camera` (both rigs;
  the rig never gives ground faster than the walker walks, 3.35 / 3.38
  u/s; walking turns the frame 0.00°/s; home from 25.9° to exactly
  zero in 2.75 s), `check-sightline` (clear), `check-audio` (−22 dB
  below full scale with the two new voices in), `check-lures` (the
  fog closes all four), `check-fields` (81 figures driven through
  their hours — sixty-three from 17 and eighteen new — all drawn
  right), `check-verbs` (every section; section 9's nineteen
  assertions, the bicycle at z 120.01 against a border at 120 with the
  walker on it, the plane from x 278.5 to the far side of the floor on
  ground a foot can stand on, the dawn dog at x −30 against its line
  at −28 with the walker at −2, the hat at −152.2 against −150),
  `check-roads` (noon and dusk, both rigs, no silence), `shoot-mobile`
  (the chrome on four widths and a mouse, every card on the page).
  All pass on the pushed head.
- **The bicycle is faster than the camera was tuned for**: 11.66
  units a second on main street driven east at the run (7.4 × 1.2,
  plus the grade paid back). `check-camera` passes on foot; it has
  never been run on a bicycle, and there is no assertion for one. It
  is the first item on the feel gate.

- **What moved, by `diff-sheets` against `origin/main` (d9889fe), 92
  framings, bearing pinned, twelve game seconds of settle.** 74 of 92
  bit-identical; 18 moved at all; 3 over the 0.15% threshold. Every
  frame that moved has an encounter, a mount or a midpoint standing in
  it at the protected hour, which is the one move `QUALITY-BAR` §3
  allows when the land is the scope — and the scope was the roads,
  which run through every one of them:
  - **`street-shot@12`, 0.38% desktop, 0.62% portrait** — Brim's
    street shot stands at the foot of the king's road and looks up it,
    and **C1 stands on it**: the cart with the broken wheel, eight
    units ahead, all morning. It is the largest move of the session
    and it is the encounter the brief lists first. At 19.6 the road is
    empty (the wright pushed it home at a quarter past three) and the
    frame is bit-identical, which is the aftermath measured. If the
    owner wants the noon street shot back to the pixel, the cart moves
    twelve units north or the wright comes earlier, and this is the
    line that changes. The same cart, small and far, is **`gate-
    detail@12`** (0.04% / 0.09%), **`gate-fields@12`** (0.015% /
    0.035%), **`well@12`** (0.017% / 0.036%) and **`oaks@12`**
    (0.015%): every frame on the Common that looks north up the road
    sees it.
  - **`curl-rim@12`, 0.18% desktop** — the Flats' curled rim looks
    north-west across the pan and **C22 is in its left edge**: the
    stand of palms that is not there, on from eleven until three.
    Portrait's narrower frame does not hold it.
  - **`tide-line@19.6`, 0.13%; `boardwalk@19.6`, 0.03%** — the three
    tideline combers going in at twenty to eight (C6), and the fire
    lit on the south sand (C7) in the tide-line's far corner.
  - **Everything else — the title framing, the Common's seven at 19.6,
    Brim's other three, Greyweather's four, the coast's other three at
    both hours, the sandbar — is bit-identical.** Nothing moved for
    the districts, the earshot table or the 8:15.
  `SAVE=1 FRAMING=street-shot,curl-rim,tide-line node tools/diff-
  sheets.mjs` writes both sides and the mask into `.diff/frames/`.

- **The proofs sheet** (`tools/shoot-session18.mjs`, 36 framings, both
  viewports), reviewed in `critique-art-12.md`: NOT YET at round one
  (five framings on the wrong side of their subject, the mirage where
  no road looks, the cove light out of its cove's frame, the rings ink
  on ink, the district card gone before the shutter, the flock on the
  river's paint), PASSED at round two with three passed-not-praised:
  the cove light faint, the rings mid-fade, the airborne plane a
  contact sheet's wrong instrument. On the phone the mirage is off the
  trail's frame; a peek finds it.
- **The ear gate handed over: eighty WAVs in `out/sound/`**, two of
  them new. Unheard.
- **The feel gate handed over**, with the bicycle on it.
- **THE PLAY GATE HANDED OVER AND NOT RUN.**
  `design/play-sheets/session-18.md`: §0 is the tool's two silences
  and the question of whether the tool measures what the owner meant;
  then the broken cart at three hours, the dawn dog, the bicycle and
  its bell and its border, the plane off the lip, dusk on the coast,
  and the 8:15 the day after.

### DECLINED, IN WRITING

- **A wash tint per district**, a third time. A district is a name for
  ground and not a wash, by the layer's own definition in `layout.ts`,
  and a tint would move every protected framing in every land at once
  for a thing the card and the map already say. If the owner wants
  the seams to read in colour it is one line per district and a
  `diff-sheets` run, and it is their call.
- **Wick at dawn (C12).** His first drawing decides his wait, and his
  wait is Session 19's. Building him as a routine now would be
  building him twice.
- **A drawn sprinkler (C23).** The land's spec says you never find the
  lawn it is on. The encounter is the sound, and it was already there.
- **Counting instanced fields as *in frame*.** Trees and grass would
  make every road pass; the tool would then be a rule nothing could
  fail. If the owner says a wood is not empty, the rule changes in one
  place at the top of the tool.
- **Making the 8:15 a pure function of the hour.** A train you can be
  inside is a position, and the harness's `runTheLine`/`warpTrain`
  drive it as one; registering it as an event gives `happening` the
  fact, which is all the registration was for.

### Gotchas (new; everything from Sessions 1–17 still applies)

- **A THING'S HOME MAY NOT BE INSIDE ANOTHER PROMPT'S REACH.** The
  plane's first rock was three units from THE OVERLOOK's marker
  (reach ten): holding the plane, the key opened the note. The well
  taught this in 15 and it was learned again. Eleven units.
- **THE STEEP STOPS THE WALKER SHORT OF THE LIP.** Two units before
  the tear's edge `blockedAt` is true, so a walker who runs at the lip
  is standing still by the time they reach it, and a throw from a
  standing walker is a set-down. The throw is pressed on the move,
  before the edge. The play sheet says so.
- **A GLIDE CANNOT LAND HIGHER THAN IT STARTED.** Read the height
  field before promising a landing place. `things.glideLanding` drops a
  plane that meets a wall to the wall's foot.
- **A CHECK STARTED BEFORE A REBUILD TESTS TWO BUILDS.** `check-
  fields` reads the routine list from the page it loaded and drives
  the page the server is serving now; a rebuild between the two hands
  it half of each. Wait, or kill it and start again — and `pkill`
  from the same shell as the wait ends the shell.
- **THE TOOL'S TWO NUMBERS ARE THE RULE.** `REACH` (78 units) and the
  ratio a thing must subtend (0.05: a four-unit thing at eighty is a
  mark on the horizon, not company) decide what *in frame* means, and
  they are at the top of `check-roads.mjs` on purpose.
- **A ROUTINE LEG WITH A PROP** shows the prop whenever the figure is
  out; a prop that is only carried on one leg is hidden by the land
  off `state.leg` and `state.moving` (the wheelwright).
- **A FOLLOWER MAY HAVE ANY RECT.** `company.ts` never assumed a land;
  the dawn dog's rect is half of one, and the rule holds at its edge.

## Session 17 — 2026-09-04 — life

*Every land opened at once, and none of them re-drawn. The four
multipliers of `THE-FUN-PASS` §9 — unnamed inhabitants with routines,
the animals, the weather, the night — are systems that raise all twelve
lands together, and that is how they were built: three files
(`events.ts` grown, `life.ts`, `weather.ts`) and then a page or two in
each land's builder saying who is where at what hour. **The play gate
was handed over and not run** (`design/play-sheets/session-17.md`).
Session 16's sheet had not come back when this session started; the
opening is untouched.*

### THE ONE THING TO KNOW

**Everything that happens now is a pure function of the clock, and the
clock has a day counter.** A routine is a list of stops in hour order
(`events.registerRoutine`), and where its figure is at any hour is
arithmetic on that list — so a land that was not built when the
lamplighter set out draws him four lamps along when the walker arrives,
and `tools/check-fields.mjs` can drive every hour a drawing changes at
and assert it changed. The weather is the same law one level up: a pure
function of `clock.day` and `clock.hour`, with the first two days
written by hand and the rest hashed, so a shower that has been falling
for ten minutes when you arrive has been falling for ten minutes, and
**day zero is the shipped page** — calm at noon and at 19.6, wind at
exactly the fields' own sway, one shower in the middle of the
afternoon. That is what let this session open every land and still
report the protected framings as a number.

**And the second co-walker was standing in a river for most of the
session.** `company.ts` is general and the dog was four lines; its
first home was the drove's mouth, which is across the water from every
road out of the Downs, and a follower cannot find a bridge. It noticed,
changed posture, and never moved, and the contact sheet showed a
walker at a border with no dog. The rule for the next companion is in
`PROMPT.md`: a companion's home is somewhere every road out of its land
is reachable without crossing water, and the bank is probed rather than
assumed.

### WHAT SHIPPED

- **Routines on `events.ts`** — `registerRoutine(def)`, `routineAt(def,
  hour)`, `routine(id)`, `events.between(a, b)`. A `Stop` is `at, x, z,
  pose, face?, hold?`; the figure leaves each stop as late as it can
  and arrives at the next on the hour; before the first and after the
  last it is indoors and not drawn, which is why a routine's first stop
  is a doorway. Every leg is a registered event (`the-lamplighter/2`),
  so `happening.ids` knows who is on the move. Over midnight by giving
  a stop an hour past twenty-four.
- **`src/world/life.ts`** — `Figure` (one standee, the drawing swapped
  by posture, faded in over two seconds out of its door), `Creature`
  (an animal with postures), `stops(rows)`, and the registry `drawn`
  that every one of them reports to for the harness. One-off standees
  on purpose: a standee has no birth to get wrong.
- **`src/world/textures-life.ts`** — three kinds of folk (a coat, a
  dress, a jacket) in seven postures (stand, two strides, bend, sit,
  carry, a pole), **cached and shared**: sixty-three figures off
  twenty-one canvases. A child, a handcart, a rod, a lantern's glow.
  And the animals: dog (four), cow (two), cat (two), fox (two), heron
  (two), seal (two), magpie (two), bat, crab, rat, lizard, kite, snake,
  a pigeon in the air, the shut shutters, and the back of the thing
  under the Wide Blue. The bull gained a fourth drawing, lying.
- **THE UNNAMED, sixty-three of them, none named, all on the clock.**
  THE COMMON: the three arguing under the oaks at ten and at four
  (`QUESTS` §8 L5 — whoever has the floor is a stride nearer the swing,
  and it changes hands; sit and watch), the fisher at the bend before
  seven, the well woman at nine, the carter down from Brim's gate with
  a handcart at a quarter to eight, two children running the fair
  ground's ring after three. BRIM: **the lamplighter** — out of the
  belfry yard at five past seven with a pole, the four lamps in order,
  each one lit as he reaches it and not before, and the same round to
  put them out at twenty to six; **the shutters**, row by row at nine
  and at first light, with a clack if you are in the street; a
  delivery that finds the stall shut; the sweeper before six; the
  warden counting the orchard twice; children round the fountain. And
  the crowd goes in out of the rain. GREYWEATHER: a sentry along the
  wall's own feet at dusk and before dawn (registered in the builder,
  because the brow is where the page put it), a groom with a bucket at
  seven, a washerwoman at the moat pool through the morning, pilgrims
  up the avenue twice. MAPLE COURT: the jogger round the court at half
  past six, the post box to box at ten, children on the green, an
  evening walker, somebody watering at seven, and **the first car**,
  which backs out at ten past eight, drives to the end of the survey —
  there is nowhere else a car in this world can go — and comes back at
  ten to six. THE PENWOOD: two cutters who work the failing edge and
  never go inside the forty, a picker in the thicket, somebody walking
  the round at noon and out the way they came, a child on the wood road
  at four. THE DOWNS: the miller in and out of his door and once to the
  granary with a sack, a carter over the ford, the shepherd at the back
  of the flock at dawn and at dusk and at the field's edge between.
  LONGSHORE: the beachcomber on the wrack at first light, the hut owner
  who opens the third hut at nine and sits outside it, two bathers who
  never go in, the jetty fisher in the evening, the promenade walked
  twice. THE WIDE BLUE: two on the moored boats in the morning.
  GREYLINE: **the rush** at eight and at half past five (three more
  fields, dimmed on a bump), the sweeper, the delivery at the shutter,
  the window cleaner, the busker at the junction. THE CUBICLE MILE: the
  nine o'clock from three cars to one door and the five o'clock back,
  the half-past-eight car in past the barrier and round to the yard at
  half past five, the smoker three times, the courier who finds nobody
  in the hut, the cleaner at seven, the guard with a lantern at half
  past ten. **SPLITROCK has three and THE FLATS two, under the brief's
  five, on purpose:** both lands' thesis is that nobody comes; hikers
  to the arch, somebody at the overlook, a figure on the far rim you
  cannot reach; and a walker who comes as far as THE HANDS, reads a
  post that points at everywhere but here, and turns back, twice a day.
- **The hand-rolled routines moved onto `events.ts`**, owed from 15:
  Brim's lamps (off the lamplighter's stops), the shelter's light
  (`the-mile-lights`/`the-mile-dark`, read with `events.between`),
  Amos's night walk (`amos-night`, six round trips as twelve legs with
  the wait at the water while the cans fill — he is drawn by his own
  three postures off the routine's state), Joan's working day
  (`joan-out`, `joan-at-table`, `joan-in`).
- **THE ANIMALS, one that reacts in every land** (`THE-FUN-PASS` §3
  item 1). **THE DOG** (`company.ts`, four drawings) at the field gate
  on the Downs' east road: notices at fourteen, follows at two and a
  half, trots at 9.2, **stops dead at the Downs' edge on both roads
  out** and sits looking after you; barks when it falls in and when
  the border takes you. The herd of six in the headland, heads up
  first, then parting square off the lane, slowly, and lying down at
  night. The heron at the tarn, up and gone at fourteen units, back in
  a minute. Seals on the bar through the middle of the day that slip
  in at nine. Seven pigeons in Greyline that lift AS ONE. Crabs on the
  wrack that go sideways at four. Two cats — Brim's south wall by the
  gate, Val's fence — that sit up for a RUNNER and for nobody else.
  Three rooks on the scarecrow that lift off its arms. Lizards on a
  warm stone in the slot and on the pale that are gone before you are
  sure. A magpie on the muster sign. A kite over the pale at noon. The
  rat in the hollow after dark. And **the rooks cross** (`rooks.ts`):
  three that roost on the keep, fly to the Downs' scarecrow at twenty
  to seven and home at twenty to seven, over Brim and the Common in
  eighteen seconds, drawn by whichever land they are nearer — birds
  cross borders and nobody looks up, §9's one free layer, recorded so
  nobody removes it as a bug.
- **THE WEATHER** (`src/world/weather.ts`). `weather.state` is `rain
  wind fog storm flash flashId kind`, from `weatherAt(day, hour)`;
  `planFor(day)` is authored for days zero and one and hashed after.
  Rain is **the smudge pass running the drawing** (`PaperPass`: every
  pixel takes the darker of itself and the ink a little way up the
  page, and thin slanted streaks fall on a phase per column); wind is
  `weather.windK`, exactly one at the half and a multiplier over every
  field's own sway (`StandeeField.update(t, windK)`), and it turns the
  mill (two minutes a revolution in a gale against ten), fills the
  regatta's sails, and lays the mill's smoke over; fog closes the haze
  to a third of its reach and lifts the terrain's fog cap, **and the
  four lures and the keep go with it** (`meadow.ts`, the same number);
  a storm is rain and wind at one with lightning cut into five-second
  slots by a hash and one thunder per strike, a second or two after,
  on a crossing (`App.weatherVoices`). Two beds in `Audio.ts`, the
  patter and the wind, ramped from the same state; `thunder` and
  `wind-gust` in `event`. Day zero: calm, a shower at 14.2 for 1.4
  hours. Day one: fog at first light, a shower before noon, the first
  storm at 22.6. `clock.day` increments on the wrap and is saved.
- **NIGHT AS A DIFFERENT GAME.** `the-bull-lies-down` at 20.0 for 9.6
  hours — the one register call — and a seventh bull state, `lying`,
  which gets up for a walker inside twelve units and at dawn. The
  deep pines after dark: inside thirty-four units of the stand the
  ambient stops entirely, the way it stops near Brack, and once in a
  long while `branch-crack` a long way off; the rest of the wood gets
  an owl. Holt's window is a `lampGlowTexture` hung at the house from
  dusk to dawn — the debt since Session 11 — and the only lit thing in
  the east half of the world. Foxes on the Common's round and across
  the Mile's car park after midnight, bats over the well, the moat
  pool, the slot and the deep pines, the rat, and **`the-deep`** at
  19.35 for six minutes' worth of one ten-second surfacing fifty units
  north of the bar's end.
- **Scheduled events in every land**: the routines' own, plus
  `the-regatta` at noon for an hour and a half (three times the speed,
  heeled with the wind, the bell and the halyards on the start if you
  are within ninety), `the-seals-haul-out`, `the-deep`, `the-rooks-
  cross-out`/`-home`, `the-shutters-open`/`-shut`, `the-rush-morning`/
  `-evening`, `the-mile-lights`/`-dark`, `the-cows-lie-down`, `the-
  bull-lies-down`, `the-fair-children`, `the-square-children`, `the-
  green-children`, `the-common-fox`, `the-mile-fox`, the four bats,
  `the-pale-kite`, `the-snake-crosses`, `the-hollow-rat`, `the-wood-
  road-child`, `joan-*`.
- **Fifteen voices** in `Audio.ts`: `thunder`, `wind-gust`, `dog-bark`,
  `cow-low`, `heron-croak`, `seal-bark`, `fox-bark`, `owl-hoot`,
  `branch-crack`, `cat-mew`, `shutter`, `deep-surface`, `car-start`,
  `crab-scuttle`, `pigeons-lift`; in the ear pack under three new
  groups.
- **`?hour=`, `?day=`, `?weather=`** on the address bar, read before
  the title, because the play sheet is ten minutes at three hours of
  the day and a day is forty minutes.
- **Tools**: `check-fields` drives every routine (63 figures) through
  every hour it changes at and asserts drawn-when-out, hidden-when-in,
  walking-posture-when-walking; `check-verbs` section 8 — the calm
  page at both protected hours, the shower, day one's fog and storm,
  the bull down and up, the lamplighter's hours, the dog falling in and
  stopping at BOTH borders, the counts per land, Joan and the mile on
  `between`, the regatta, Amos; `check-lures` — the fog closes all four
  and they come back; `shoot-session17` (59 framings, both rigs, with
  `hour`, `day`, `weather` per framing and a DO table that walks at the
  animals). `render-wavs` carries the fifteen.

### THE GATES, AND WHAT MOVED

- **Build green.** `check-terrain`, `check-camera` (the rig never gives
  ground faster than the walker walks, 3.38 u/s), `check-sightline`
  (clear — the first car's parking place had been in THE LINE's corridor
  at (−45, 262) and it parks on the empty plot at (−57, 256) now),
  `check-audio` (−22 dB below full scale with the fifteen new voices
  in), `check-lures` (in fog the four lures' opacities 0.04, 0.035,
  0.035, 0.028 against 0.8, 0.7, 0.7, 0.55 clear, and back after),
  `check-fields` (63 figures driven through their hours, all drawn
  right), `check-verbs` (every section, Session 17's included: the dog
  at 62.04 against the west border at 60 and 227.99 against the east at
  230, sat looking after you both times), `shoot-mobile` (the chrome on
  four widths, every card on the page). All pass on the pushed head.
- **The dog on the harness.** The east-border test first tried to walk
  the dog over the bridge behind a teleported walker and found the
  east end of the deck runs along the water for a few units: a follower
  slides per axis and was held mid-land, and when the walker left the
  Downs it took the hold for a border. That is a path-finding gap in a
  thing built not to path-find, so the test does what the goat's does:
  the dog is `__inklands.company.dog`, put on the road past the bridge,
  and the walker driven out. The rule is tested at the border.

- **What moved, by `diff-sheets` against `origin/main` (19bb05d), 92
  framings, bearing pinned, twelve game seconds of settle.** 45 of 92
  bit-identical; 47 moved at all; 5 over the 0.15% threshold. Every
  frame that moved is a protected frame with a routine, an animal or an
  event standing in it at the protected hour, which is the one move
  `QUALITY-BAR` §3 allows when the land is the scope — and all twelve
  were:
  - **`sandbar@12`, 1.5–2.9% on the desktop** — THE REGATTA. It starts
    at noon (`THE-FUN-PASS` §9 names the hour), so at the protected
    noon the fleet is racing at three and a half times its drift and
    the two boats that sat beside the buoy are one boat, further on,
    heeled. This is the largest move of the session and it is the
    brief's own beat; the number varies run to run because a racing
    fleet's position after twelve seconds is more sensitive to the
    frame clock than a drifting one. **`sandbar@19.6`, 1.5–2.9%** —
    the same fleet, further round the course than a page that never
    raced would have it: a boat's place on the course was always a
    function of elapsed time, and the race adds an hour and a half of
    it. If the owner wants the noon sandbar back to the pixel, the race
    starts at half past twelve and this line is the one that changes.
  - **`tide-line@12`, 0.13% desktop, 0.22% portrait** — the crabs on
    the wrack and the hut owner sat outside the third hut.
    **`tide-line@19.6`, 0.09% / 0.21%** — the crabs and the jetty
    fisher. **`boardwalk@12` 0.10%, `@19.6` 0.07%** — the same beach
    from the promenade.
  - **`well@19.6`, 0.10% desktop, 0.19% portrait** — the bats over
    the well, out from twenty to eight. `well@12` moved 0.014%: nine
    pixels by seven, a distant figure on the road.
  - **`bailey@19.6`, 0.07%** — the sentry on the curtain wall at dusk.
  - **`square-wide@19.6`, 0.05%** — the lamplighter walking home from
    the fourth lamp; all four lamps are lit, as the framing had them.
  - **Everything else — the title framing, the Common's seven at both
    hours (the well aside), Brim's other three, Greyweather's other
    three, the coast's other two — is bit-identical**, which is what
    day zero's calm at noon and at 19.6 was for.
  `SAVE=1 FRAMING=sandbar,tide-line,well node tools/diff-sheets.mjs`
  writes both sides and the mask into `.diff/frames/` for any of it.

- **The proofs sheet** (`tools/shoot-session17.mjs`, 59 framings, both
  viewports), reviewed in `critique-art-11.md`: NOT YET at round one
  (the dog standing in the river; the cat in the air, twice; the dog
  the size of a calf; the lying bull with legs), PASSED at round two
  with four passed-not-praised: the lamplighter a dim figure at dusk,
  the figures small by the house's own law, shutters and lit panes on
  one row, and the fog frame the strongest on the sheet and the one the
  opening cannot have.
- **The ear gate handed over: seventy-eight WAVs in `out/sound/`**,
  fifteen of them new. Unheard.
- **The feel gate handed over**, unchanged from 16.
- **THE PLAY GATE HANDED OVER AND NOT RUN.**
  `design/play-sheets/session-17.md`: noon on the Downs (the dog, the
  herd), noon in the Penwood (the heron, the round), dusk in Brim (the
  lamplighter, the shutters, the bull lying down), the thing under the
  Wide Blue at twenty past seven, the storm on the second night and
  the silence in the deep pines, the fog on the second dawn. Ten
  minutes, with the address-bar hours, and the questions the session
  could not answer — the first of which is whether rain on a phone is
  rain or mud.

### DECLINED, IN WRITING

- **Five unnamed in Splitrock and the Flats.** Three and two. Both
  specs say the land's subject is that nobody comes, and a crowd at the
  overlook would unsay it. If Session 18's fifteen-second tool finds
  them too empty, that is the tool's finding.
- **Moving the lamplighter's round later**, where the lamps' own glow
  would show his work: his last lamp is at 19.45 so that every
  protected 19.6 framing keeps all four lit and bit-identical. The
  owner's call.
- **Weather on the footprints, the water and the washes.** The rain
  touches the frame in the post-pass and nothing else; wet paper
  refusing prints in the rain is a Session 18 or 22 idea and it is not
  in the brief.
- **A wash tint per district**, again — districts are 18's.

### Gotchas (new; everything from Sessions 1–16 still applies)

- **A FOLLOWER CANNOT FIND A BRIDGE.** Its home must be somewhere every
  road out of its land is reachable without crossing water, and the
  bank is probed (`terrain.waterAt`, `blockedAt`) and not assumed. The
  dog's first home was in the river.
- **A STANDEE'S TOP IS NOT THE DRAWING'S TOP.** Brim's wall draws its
  parapet at seven tenths of the canvas; a thing seated at the
  standee's height floats. Read the texture before sitting anything on
  it.
- **A FENCE DRAWN EDGE-ON IS NOT A WALL TO SIT ON.** The orchard's
  paddock fence is turned ninety degrees; from a north-looking lens it
  is a line, and a cat on it is a cat in the air.
- **A `fresh` PAGE WAKES BESIDE THE BULL.** Any framing in the field
  after `fresh: true` has a bull that has already charged; `I.common.
  reset()` first, or do not use `fresh` for it.
- **`ONLY=` RUNS A FRAMING WITHOUT ITS PREDECESSORS**, and the state a
  framing inherits from the frames before it (a companion following, a
  bull at home) is part of the frame. A frame that only reads right in
  the full run is a frame whose DO script should set its own state.
- **THE FIGURES HIDE IN THE RAIN**, so a harness that drives routines
  through the day pins the weather calm first (`I.setWeather('clear')`),
  or every routine between 14.2 and 15.6 on day zero "fails".
- **EVERY ROUTINE'S STOPS MUST BE INSIDE ITS LAND'S RECT.** Nothing
  clamps them (a routine is authored, not simulated); the first stop of
  the Common's carter was at z −7, inside by three. Check the rect.
- **THE PREVIEW SERVER SERVES WHATEVER IS IN `dist/`.** Rebuilding while
  a gate chain is running against it hands a check half a build.

## Session 16 — 2026-09-03 — the first hour

*The Common re-opened, hardest. The opening the owner chose on
2026-09-01 (`THE-FUN-PASS` §11: THE BULL + THE FOUR LURES + THE COMMON
AS THE PLATEAU) is built, the co-walker is a rule of the world, the
Common has districts, and NELL's wait is built with two doors. **The
play gate was handed over and not run** (`design/play-sheets/session-16.md`).*

### THE ONE THING TO KNOW

**You wake in long grass with a bull looking at you, and the camera
decided where the field gate is.** The owner's words this answers:
*"the starting point is bland and expected but also confuses users
because they don't know where to go or what to do."* The bull charges,
you run — the one hint the game may print prints at the charge — it
tails you two strides short and never touches you, you get through the
gate, Nell shuts it behind you, and the bull stops at the hedge because
the hedge is a rule. Then the crossroads is forty units away with four
things on the horizon, and a goat has fallen in behind you that will
stop dead at the Common's edge on whichever road you take.

**The chase runs east to west, and that is the session's real
finding.** The first build ran it north through the long fence, exactly
as the brief's sentence reads, and the proofs sheet showed a bull that
was never in the picture: the camera only looks north, so a pursuer is
behind the lens the whole way and its stop at the rails happens at your
back. A chase that CROSSES the frame is seen. So the field gate is in
the field's west hedge (`HEDGE_X = −12`, `GATE = (−12, 82)`), the bull
comes at you from your right and stays there, and at the hedge it is in
frame while Nell reaches for the leaf. The long fence keeps its stile;
its old gate is a drawing of a shut gate.

### WHAT SHIPPED

- **THE BULL** (`meadow.ts`, `common.bull`): the Common's first
  creature, a six-state machine — graze, watch, charge, balk, fence,
  home — bound to `FIELD` and clamped before it moves. 8.4 units a
  second against the run's 6.15; it pulls up at 2.3 every time and
  snorts; three balks and it loses interest; at the hedge it stands,
  looks, and goes home. It grazes all night; §9 item 4 is Session 17's
  one register call. Three drawings, mirrored; the mass is a
  half-strength stain the pen fills, because a black slab with legs
  read as a hole in the page.
- **THE RUN, TAUGHT BY NECESSITY.** `inklands:run-now` at the charge;
  `taughtRun` set; Session 12's six seconds of walking stays for a save
  that wakes elsewhere. Never to the harness, never twice.
- **`src/world/barriers.ts`** — the first thing besides the page to
  refuse a foot. A segment with a half-thickness and gaps; a gap is a
  SLAB through the band, not a disc (the disc pinned a walker who came
  into the gate on a diagonal). App asks it beside `terrain.blockedAt`.
  The long fence (stile open), the hedge return (gate open until Nell).
  **Every barrier is a drawing in the same place.**
- **NELL** (`nellTexture`, three poses): leaning, straight, reaching.
  Straightens for whoever comes to the gate, settles after four
  seconds; slams the gate once you are through and the bull is coming,
  or when the bull is at the hedge and you went another way, never
  with anybody in the gap; stands and faces the cart once it has moved
  (three signals: posture, half a unit off the post, her feet). Hidden
  while the 8:15's doors are open at the Common's stop.
- **HER WAIT, TWO DOORS** (`NELL_CARD`): the `choice` is a getter and
  does not exist until `fact:the-timetable`; the prompt says TELL HER
  THE FOURTH NAME then and LEAN ON THE GATE WITH HER otherwise. Door
  one: `door:the-cart-turned-north` — the cart drawn from behind,
  loaded and roped, pinned home, PUSH THE CART retired;
  `WAIT_ANSWERS.meadow`. Door two: `door:the-cart-pushed` — the cart is
  yours and her platform stays empty. `WAITS_FOR_THE_LINE` is six.
- **`src/world/company.ts`** — `critique-story-2` MANDATORY 1 as a
  rule: a `Follower` has a land, follows inside it, and the clamp is
  before the move. `keepOut` for ground it will not follow you onto
  (the field: the first goat walked in through the open gate and was
  shut in with the bull). **THE GOAT**: the Penwood's four postures as
  standees, home (−22, 72), notices at eighteen, gap three, trots at
  8.6 when left behind, stops two inside the rect and stays.
- **THE FOUR LURES**: the sea's glint (−92, −44) hung seven up, above
  the oaks; the mill's smoke (0, −44) with the mill behind Brim's wall;
  the city's towers (28, −70), faintest, the one lie (the city is
  south-east; the map tells the truth). Same law as the keep, fading a
  little sooner. **Measured** (`tools/check-lures.mjs`): desktop holds
  all four at rest (x −0.09, −0.62, +0.59, +0.77 in NDC); portrait
  holds the keep at rest (−0.25), the sea on a peek left (−0.87), the
  smoke on a peek right (+0.80), and the towers never (+1.25 at best).
- **DISTRICTS** (`layout.DISTRICTS`, `districtAt`): the layer general,
  the Common populated — THE CROSSROADS, THE WELL, THE FAIR GROUND
  (new), THE RIVER BEND. The region card says a district's name under
  its land's; a district crossing inside a land deals a smaller card;
  the map draws them dashed inside a land you have stood in.
- **THE FAIR GROUND**: a ring in the grass, a maypole with hanging
  ribbons, a board that says THE FAIR and NEXT with the dates rubbed
  out, two bales, and a note. The plateau's absurdity, played straight.
- **`POSTER` and `SPAWN`**: the title camera stands at (−45, 58) on a
  fresh page and SET OUT wakes you at (24, 90) through a blink of paper
  (`UI.blink`; the harness's `begin` cuts). A saved walk opens where it
  was left.
- **Four voices** in `Audio.ts`: `bull-snort`, `bull-hooves`,
  `gate-slam`, `goat-bleat`; in the ear pack.
- **Tools**: `check-verbs` +17 assertions; `check-lures`;
  `shoot-session16` (25 framings, `fresh:` for a stateful opening);
  `shoot-mobile` asserts Nell's card, which carries the longest door in
  the game now (KEEP IT, AND PUSH THE CART YOURSELF).

### THE GATES, AND WHAT MOVED

- Build green. `check-terrain` (the spawn moved and every place is
  still reachable from it), `check-camera` (all claims, both rigs),
  `check-fields` (twelve lands), `check-sightline`, `check-audio`,
  `check-verbs` (forty-three assertions, seventeen of them the first
  hour's), `check-lures` (new) all pass. `shoot-mobile`: five rigs, the
  stick assertion, the king's card and Nell's card all on the page at
  320 — KEEP IT, AND PUSH THE CART YOURSELF breaks to two lines and
  holds.
- **`diff-sheets` against `origin/main` (6e35329), the full set, first
  run: 66 of 92 bit-identical, 26 moved, and two of the 26 were not
  the lures.** `well@12` on desktop moved 2.32% with a mask that was
  the poppies — the wake's seedheads had been pushed into the tall-
  grass run and drew their scales from the land's `r`, so every flower
  drift built after them re-placed (Session 15's gotcha, found the
  same way). And `crease-east-road`, a Downs framing, moved 1.06% on
  desktop and 1.10% in portrait: the city's towers stood at the left
  of it, because the lures faded on the walker's z and not on their x.
  Both fixed — the grass is its own field with its own seed, built
  last; the lures let go over twelve units beyond the Common's edges —
  and the Common's seven framings plus the crease re-run: **14 of 32
  bit-identical, the crease bit-identical at both hours, and every
  remaining diff a horizontal band at the top of a frame, which is the
  lures.** At noon on desktop: `crossroads` 1.22%, `common-THE-SHOT`
  1.07%, `well` 0.90%, `common-wide` 0.84%, `gate-fields` 0.13%,
  `oaks` 0.05%. At dusk under 0.06% everywhere — pencil at the horizon
  goes first in the grade. Portrait: `oaks` 0.10% (the sea's horizon
  above the canopy), `well` 0.03%, everything else bit-identical,
  because a phone's frame does not reach the lures at rest. **These
  are the framings that moved, and they moved by the lures, under
  `QUALITY-BAR` §3's permission with the Common in scope; the verdict
  is re-earned in `critique-art-10.md`.**
- **The title re-shot at noon and at 19.6, both viewports**
  (`shots-s2-noon`, `shots-s2-dusk`): the composition is
  critique-art-1's, the walker low on the ring, with the sea's horizon
  and the towers in the pencil register at the desktop frame's edges
  and nothing new in portrait. The spawn is NOT in the poster: the
  poster stands at `POSTER` and the walker wakes at `SPAWN`, and the
  cut between them is a blink.
- **The proofs sheet** (`tools/shoot-session16.mjs`, 25 framings, both
  viewports), reviewed in `critique-art-10.md`: NOT YET at round one
  (the bull never in the picture; a hole in the page; the goat shut in
  with the bull; the wake card saying THE RIVER BEND), PASSED at round
  two with three passed-not-praised: THE FIELD GATE's label in the sky,
  the sea's glint as pencil on a phone, the goat small at a border.
- **The lures, measured** (`tools/check-lures.mjs`): desktop holds all
  four at rest; portrait holds the keep at rest, the sea on a peek
  left, the smoke on a peek right, and never the towers.
- **The ear gate handed over: 63 WAVs in `out/sound/`**, four of them
  new — the snort, the hooves, the gate, the goat. Unheard.
- **The feel gate handed over**, with one new thing: the run taught
  under a bull, with a camera that does not help by turning.
- **THE PLAY GATE HANDED OVER AND NOT RUN.**
  `design/play-sheets/session-16.md`, with the build at
  https://adventure-git-claude-session-16-8idifp-ryankm.vercel.app
  (PR #13): wake, run, the gate, four things, the goat, Nell, the card,
  the districts. Ten minutes, with the questions the session could not
  answer — and one the sheet asks first: whether ten seconds of bull is
  ten seconds on a thumb.

### DECLINED, IN WRITING

- **A stranger's opening beat on the Common.** `THE-STRANGERS.md`:
  *the Common hosts no stranger, on purpose* — a crossroads that sends
  you somewhere is a quest board. The plateau's "one stranger" is Nell.
- **The oaks' argument going by while you sit** (`QUESTS` §8, L5) —
  not built; it is a routine, and Session 17 is routines.
- **A wash tint per district** (`THE-FUN-PASS` §7) — the prompt's
  scope was the layer, the card and the map; the terrain was not
  touched.

### Gotchas (new; everything from Sessions 1–15 still applies)

- **A PURSUER BEHIND A NORTH-LOCKED CAMERA IS NEVER SEEN.** A chase
  has to cross the frame. Anything that comes AT the walker comes from
  the side, or it is a sound.
- **A GAP IN A BARRIER IS A SLAB, NOT A DISC.** A disc about the gap's
  centre leaves the corners of the band blocked and a walker who
  entered on a diagonal stands still forever.
- **A COMPANION FOLLOWS THE WALKER'S POSITION, INCLUDING INTO A FIELD
  WITH A BULL IN IT**, through a gate that is about to be shut.
  `keepOut` exists because of this.
- **A GATE SHUT IN THE WALKER'S FACE IS A WALL.** The slam waits for
  the walker to be through; a bull that is near the fence is also near
  the walker who is nearly through it.
- **`pkill -f` MATCHES THE SHELL THAT RAN IT** when the pattern is in
  that shell's own command line. Kill by pid.
- **THE HARNESS'S NOTE STAYS OPEN.** A `press` that opened a note
  three assertions ago freezes every walk after it; close it first.
- **THE SANDBOX'S BROWSER GATES TAKE LONGER THAN A TOOL CALL.** The
  whole chain is about forty minutes; run it in the background, one
  browser at a time, and read the logs.

## Session 15 — 2026-09-02 — the verbs and the law

*Foundations, and the first session of THE FUN PASS. No land was
opened. Everything built here is a system every later session in the
pass stands on, proved by three things the owner can play.*

### THE ONE THING TO KNOW

**The game was built to be read; this is the first session that
builds it to be played, and it builds the systems and not the fun.**
Touch, carry, sit and throw exist on the one key that already looked;
a choice card exists; a clock that keeps the world's hours exists; a
registry of the things the walker has moved exists. Each is proved by
one thing in the world — the well answers a shout, the cart rolls to
the border and stays there, a stone goes down the well, the swing
takes you, the king goes back on his plinth or does not, the flock
walks the lane at dawn — and **whether any of it is fun is the play
gate, which is the owner's and was handed over, not run**
(`design/play-sheets/session-15.md`).

### THE VERBS, AND THE RULE THAT KEEPS THEM ONE KEY

`design/specs/controls.md` §1 has the table. What a place can declare
(`WorldPOI` in `regions/index.ts`): a `touch` (a one-shot with the
walker's position, so a shove knows which way), a `sit` (a seat point
and what sitting there teaches), a `choice` (two or three doors, each
one `door:` id), and a `prompt` that may be a function. App dispatches
choice → note → touch → sit, and the prompt says the verb.

Three rules keep it one key and all three are asserted
(`tools/check-verbs.mjs`):

1. **A thing in reach beats the thing in the hand.** The stone in hand
   is a POI at distance zero and would win every contest; it is `weak`
   and wins only when nothing else is in reach. So the well's reach
   shrank to its lip (3.4 units from 5) so a stone can be thrown into
   it from the path — the one place the rule costs something.
2. **Throw and put-down are one verb**, continuous like the run: a
   stride and a bit standing still, six units at a run, and the prompt
   says which. No second control, no hold, and it works on a phone
   because a second finger on the prompt is a tap on a button and not a
   peek (the button is a sibling of the canvas, not a child).
3. **Sitting is a stopped walker**, and a stopped walker is due north
   by contract. `check-verbs` reads the bearing seated for five game
   seconds: yaw 0, astern 0, dolly 0.000. The day runs at six times its
   pace while you sit, which is what *time passes and routines go by*
   means at a hundred seconds an hour.

**What it must never become is refused in the file** (`things.ts`):
`held` is one id or null, there is no list, and no path in the file
can give a thing a position outside its own land's rect — the clamp is
in `push` and in `throw_`, before anything flies.

### THE CHOICE CARD

The note card's own system with doors on it (`UI.openChoice`, `.choice-
card`): title, body, two or three hand-lettered buttons, `1` `2` `3`
or a tap, Escape walks away, and the veil does NOT close it because
both doors are meant to be looked at. It is chrome, so it is shot at
every width `shoot-mobile` shoots and **asserted there**: every door's
box inside the viewport with eight points of air, with the longest
door in the game on it (LEAVE HIM WHERE HE LANDED). At 320 points it
breaks to two lines and holds.

### THE SCHEDULED-EVENT CLOCK

`src/world/events.ts`. A land registers `{ id, land, at, hours, place,
onStart, onEnd }` and reads `events.progress(id)` back as −1 or 0..1,
**a pure function of the hour** — which is the property that makes it
fire whether or not the walker is there: a land that was not built when
the event started still draws it right when the walker arrives, and
the harness's `setHour` puts everything exactly where that hour has it.
`happening.ids` is the `platform`-shaped export. A crossing, not a
window: a jump of more than an hour fires nothing, because nobody was
there to hear it. Three events registered: the drove out (05:42) and
home (19:18) in `wilds.ts`, and the Common's morning (05:54) in
`meadow.ts`, which puts back anything the walker lost.

### THE THREE PROOFS

1. **THE COMMON.** SHOUT DOWN THE WELL is a touch: the shout goes down
   (`well-shout`), and three and a half seconds later — too long, on
   purpose — the answer comes back (`well-answer`), and the swallows
   loop faster and higher for two seconds, which is the one answer a
   player with the sound off gets. Repeatable: L1 in the register
   (`QUESTS` §8). **PUSH THE CART**: about five and a half units a
   shove, decaying, refusing the river and the steep, stopping two
   units inside the Common's edge, saved (`save.things`). L2. **And a
   stone** by the field gate — PICK UP, THROW / PUT DOWN, a knock on
   the page, a plop in the river, gone down the well (the well answers
   that too, later still) and back by the gate at first light. The
   swing is a sit. The well's note is retired: it was a description of
   the toy.
2. **GREYWEATHER.** SET YOUR SHOULDER TO HIM opens the card — the
   plinth's note plus *he is heavier than he looks* — with PUT HIM BACK
   ON HIS PLINTH / LEAVE HIM WHERE HE LANDED. Either reads the plinth
   (`fact:the-old-name`). **Put him back** and the castle reads
   `door:the-king-restored` every frame: `standingKingTexture` on the
   same plinth, seam drawn; every banner down and a bare pole under
   each (twelve poles, no wind); `banner-snap` never fires again; the
   moat pool clears — **it was never red before this session**, so
   `dyeStainDecal` (this week's banner red, U5) was added to have
   something to clear; the perched rooks lose their perch for good.
   **Leave him** and nothing changes. The card is never offered again.
   Nothing says which was right. Wick is not drawn (Session 19) and
   `WAIT_ANSWERS` has no castle entry.
3. **THE DOWNS.** Eleven of the thirteen sheep are in the fold at the
   lane's south end at night, walk the lane north at first light — one
   after another, front first, drawn in the moving pose — through the
   mouth gate into the west slope, stand there all day, and come home
   at dusk. Two of them do not move for anybody, including at dawn, and
   THE DROVE's note is still true. If the walker is within seventy
   units when a drove starts they hear it set out. `check-verbs` reads
   the flock off the instanced fields: thirteen at every hour, mean z
   118 at four, strung out along the lane at a quarter past six, mean z
   64 at noon.

### TWO THINGS FOUND ON THE WAY, AND BOTH ARE OLDER THAN THIS SESSION

- **EVERY LIVE-COORDINATE PROMPT IN THE GAME WAS NAILED TO ITS PAGE-
  LOAD POSITION.** `POI`'s constructor spread its definition —
  `{ enabled: true, labelHeight: 3.4, ...def }` — and a spread evaluates
  every getter once and copies the value. The rowboat's `get x()` has
  said *the POI's coordinates are read live, so it follows the boat
  around the page* since Session 6, and it never did: row somewhere,
  step out, walk back, and TAKE THE OARS was still at the river mouth
  until the tab was closed. The 8:15's boarding prompt had the same
  defect under Session 14's fix. Found because the cart's prompt did
  not follow the cart on the first run of `check-verbs`. The
  constructor fills defaults on the definition itself now.
- **JOAN'S WAIT COULD NEVER RESOLVE.** `THE-WAITS` §10 says *you sit
  down* and Session 10's log says the wait shipped end to end; the
  headland's note had no `learns`, and `grep` finds no line in the
  source that ever learned `fact:the-place-kept`. The second setting
  was put away every evening, for every player, forever. SIT DOWN
  sits the walker at the trestle now and teaches the fact by sitting
  and by nothing else. **The prompt said the wait must not regress;
  it had never worked.**

### THE LAW, EXECUTED

`controls.md` §1 (the verbs, the three rules, what they may never
become); `QUESTS` §2 (row 6, THE LOCAL RULES, and the total to ~105),
§3 (the first three ways a quest starts allowed to be loud, in the
owner's words, and a fifth: the prompt says the verb), §8 (the tier as
a tier, with a rule for an entry and a twelve-line register, L1 and L2
shipped); `WORLD-SYSTEMS` §6 (a door as knowledge; the things registry)
and §7 (the scheduled clock); the three land specs' addenda; `README`.
`QUALITY-BAR` §3 already carried the amendments and permission to
regress from 2026-09-01 and was not re-opened.

### THE GATES, AND WHAT MOVED

- Build green. `check-terrain`, `check-camera` (all eleven claims on
  both rigs, twice), `check-fields` (eleven lands, the Downs' case
  moved to where the flock is at noon), `check-sightline`,
  `check-audio`, `check-verbs` (new: twenty-six assertions) all pass.
- **The proofs sheet** (`tools/shoot-session15.mjs`, 25 framings, both
  viewports) reviewed in `design/critiques/critique-verbs-1.md`: NOT
  YET at round one (the stone lived inside the fence's reach; the
  harness pressed the verb and not the key), PASSED at round two, with
  three passed-not-praised: the standing king is a dark column, the
  flock at a quarter past six is hidden by the dawn grade, and the sit
  frame is a squat at a table. A seat may `lift` the walker now (the
  swing's plank is three units up), which was the one game change the
  review made.
- `shoot-mobile`: five rigs, the stick assertion (a thumb raises it,
  a mouse raises nothing) and the new choice-card assertion (two doors,
  all on the page) passing on all five, 320 to 1280.
- `diff-sheets` against `origin/main` (3cde91d): **90 of 92
  bit-identical on THE PAGE.** The first full run said 2.2% on the
  barbican and 80% on the Common's noon frames; the 80% was four
  browsers on one sandbox (the same two frames are bit-identical run
  alone), and the 2.2% was real — see the gotchas. On THE PAGE AND ITS
  WRITING, six over threshold and all six deliberate: the well's
  prompt re-lettered (SHOUT DOWN THE WELL for LOOK DOWN THE WELL) and
  THE ARGUING OAKS' label re-placed six units west.
- **The title re-shot at noon and at 19.6**, both viewports
  (`shots-s2-noon`, `shots-s2-dusk`): the poster is the poster. Nothing
  this session added stands in the spawn framing.
- **THE OWNER TAPPED SHOUT DOWN THE WELL ON A PHONE AND NOTHING
  HAPPENED** (2026-09-02, before this merged). The tap fired; the
  answer was a sound mixed like a lark on a phone that was on silent,
  and the one visible cue was three and a half seconds away. Fixed
  three ways, and the third is the real one: every touch rocks the
  walker back at the press (`Character.recoil`, arriving at exactly
  zero); the shout is twice as loud as any ambient voice; and **the
  well's bucket is its own drawing on its own rope** — it drops into
  the shaft at the shout and winds back up, swinging, when the well
  answers. The three strokes it replaced are still drawn at zero alpha
  so the well's seeded stream, and its trough, are unchanged.
  **That moves the `well` framing**: 0.69% in portrait and 0.28% on
  desktop at both hours, a rope and a bucket redrawn as two standees
  where one drawing had them — the Common in scope, measured, and
  re-shot (`02b`, `02c` on the proofs sheet). The rule it writes into
  `THE-FUN-PASS` §5's table: **a touch's answer is seen as well as
  heard**, because a phone is on silent more often than not.
- **AND THE OWNER MADE IT A RULE: "a visual cue, not just audio."**
  Written into `THE-FUN-PASS` §5 and `controls.md` rule 3, and every
  interaction audited against it. Four failed and are fixed: a shove
  the cart cannot take (the border, the river) rocks the cart on its
  axle and the wheels stay silent — `things.push` reports `refused`
  and `check-verbs` asserts the rock and the return to exactly rest; a
  stone thrown down the well jiggles the bucket when the plink comes;
  a stone into the river rings the water with the crossroads' own
  ring drawing, spreading and fading; and the seated walker rides the
  swing's plank (`sit.follow`, the same pendulum the plank is on)
  instead of sitting rigid beside its arc. One is left open on
  purpose: sitting runs the day six times faster and the page is
  neutral from eight to four, so a player who sits at ten sees no
  light change for two minutes — a clock face or a shadow would answer
  it and both are refused; the play gate decides whether sitting reads
  as waiting or as nothing. The bucket's rope also shows at the left
  of the `crossroads` framing on desktop (0.03%), the same change as
  the well's, reported with it.
- **The framing that moved, and by how much:** `avenue-foot` on
  desktop, at both hours — 0.027% at noon and 0.017% at dusk, a 57 × 8
  pixel band at the frame's left edge. It is the moat pool's dye stain:
  the pool is at the edge of that frame and the stain is in the pool.
  Moved twice westward (from −101 to −108) and it is still there,
  because the pool is; reported rather than chased further, under
  `QUALITY-BAR` §3's permission, with Greyweather the land in scope. No
  Common framing moved. The prompt expected the cart to be in the spawn
  framing; it is not, at rest — sixty-five units east of THE SHOT and
  behind it — and only enters a frame if the player pushes it there.
- **The ear gate handed over: 58 WAVs in `out/sound/`**, five of them
  new — the shout, the answer, the wheels, the stone on the page and in
  the water. Unheard.
- **The feel gate handed over**, with one new state: sitting.
- **THE PLAY GATE HANDED OVER AND NOT RUN.**
  `design/play-sheets/session-15.md`, with the build at
  https://adventure-git-claude-session-15-frx4ov-ryankm.vercel.app (PR #12): wake, shout down the well, throw
  the stone, push the cart to the border, sit in the swing, choose at
  the king, be in the Downs at dawn. Ten minutes, with the questions
  the session could not answer.

### What this session did NOT do, in writing

- **The opening** (the bull, the four lures, the plateau) — Session
  16's, and `PROMPT.md` is its brief. This session made the cart
  pushable; 16 makes it get away.
- **Nell.** Her wait, her card, her straightening: 16.
- **Districts.** No layer was added to `layout.ts`; the clock was
  enough new plumbing.
- **Errands.** All twenty are buildable now (carry and touch exist);
  none is built.
- **Wick.** Not drawn. Relieved of duty is what he is when he arrives.
- **The hand-rolled routines** (Brim's lamps, the shelter, Amos, Joan)
  are not moved onto `events.ts`. Session 17's.
- **A sound for sitting, picking up, and the flock arriving.** Only
  the setting-out is voiced.

### Gotchas (new; everything from Sessions 1–14 still applies)

- **A SPREAD FREEZES A GETTER.** `{ ...def }` copies the value a getter
  returns at that instant. Anything meant to be read live goes through
  as itself.
- **THE HARNESS FINDS A PROMPT ON A FRAME.** `goto` then `press` with
  no `step` between presses whatever was active where the walker WAS;
  the first cart test moved the cart three times in fifteen.
- **A THING THAT EASES TOWARD A MOVING TARGET ARRIVES LATE.** The first
  drove eased each sheep toward a target that was itself walking, and
  `setHour(12)` found the flock half a lane short of the field. The
  walk on the clock is taken directly; only the parting eases.
- **A LAND'S RANDOM STREAM IS SHARED BY EVERYTHING BUILT AFTER YOU.**
  The bare-pole fields drew ten numbers from Greyweather's seeded `r`
  and every boulder in the bailey moved and the right-hand banners
  re-sized: 2.2% on four protected framings. Anything added to a land
  that holds a verdict takes its scales from what is already there or
  from its own seed, never from `r`. `diff-sheets` keeps its evidence
  now (`SAVE=1`), because a two-per-cent regression with no picture is
  a diff you have to run twice.
- **A CARRIABLE MUST NOT LIVE INSIDE ANYBODY'S REACH.** The stone's
  first home was five units from THE LONG FENCE's POI (reach six), so
  the first press with a stone in hand opened the fence's note. The
  rule that a thing in reach beats the hand is right; the placement
  broke it.
- **A SHADOWED `const` IN A LONG UPDATE LOOP.** `along` already existed
  in the Downs' update (Joan's morning); the lane function of the same
  name shadowed it and `tsc` said *Number has no call signatures*.
- **FOUR BROWSERS ON THIS SANDBOX IS THREE TOO MANY.** `check-camera`,
  `check-verbs`, `diff-sheets` and a contact sheet at once put a
  screenshot past Playwright's thirty-second timeout. One at a time.


## 2026-09-01 — owner direction, after Session 14 merged (no code)

**THE OWNER PLAYED THE WHOLE WORLD AND THE VERDICT WAS: BEAUTIFUL, AND
NOT FUN.** Everything below is written up in full in
`design/THE-FUN-PASS.md`, which is binding; this entry is the handoff.

The owner's words, close to verbatim: *"a few areas are good (the
forest place) but others fall flat"*; *"the parts between sections feel
empty"*; *"it almost feels like a chore going from one place to
another"*; *"I read things but that's not fun. I wish I had choices
like Fallout, and those choices did things"*; *"the starting point is
bland and expected but also confuses users because they don't know
where to go or what to do"*; *"there needs to be more regions and
activity to fill the gap"*; *"think of aliens, Vikings, UX designers,
surfers, baristas, monsters, other types of animals"*; *"more
interaction and motion"*; *"the story is ambiguous and light but I
don't think we focus on the right now"*; and the lens for all of it:
*"the inspiration games are a mix of types all in the same game —
serious, emotional, funny, frightening. Think of Saints Row or Goat
Simulator too."*

### THE ONE THING TO KNOW

**The game was built to be read. It has to be built to be played.** The
Penwood works because it has tension: a frightened man, ground that
obeys his fear, a goat that runs, a silence, a black pool. Most other
lands are exquisite arrangements that do nothing until you bring the
right fact back. Three laws were producing that — *nothing is urgent*,
*the verb is looking*, *one responsive motion per land* — and all three
overreached the way the count law did.

### WHAT WAS DECIDED

- **Five laws amended, owner confirmed** (`QUALITY-BAR` §3,
  `THE-FUN-PASS` §2): the verbs (touch, carry, sit, throw); the choice
  card; threat without a villain; districts inside the twelve rects;
  and the world being allowed to tell you where to go. **Not amended:**
  the medium rule, the border rule, the ending, zero assets, no faces.
- **A second bar for a land** (`THE-FUN-PASS` §3): a creature, an
  absurdity, a toy, a choice with two doors, five idle and three
  responsive motions, two to four districts, nothing empty for fifteen
  seconds.
- **The four categories each own a tone** (§4): Memory is emotional,
  Weather is awe, the Unseen is frightening, Work is funny.
- **Every wait gets a second door with a cost** (§6), and the 8:15
  reads the doors back.
- **The seventh tier is ratified** (`QUESTS` §8).
- **The cast is wider and all of it is kept** (§10): Vikings, aliens,
  surfers, a barista, a design studio, monsters, animals.
- **The opening is redesigned from how leading games start** (§11) and
  **the owner chose it**: THE BULL, THE FOUR LURES, THE COMMON AS THE
  PLATEAU, with the cart as the first toy and the goat as the second
  co-walker. It is Session 16's and is not re-opened without them.
- **The story rewrite waits until the world is fun** (Session 22).
- **A third owner's gate, THE PLAY GATE**, and every session ships a
  play sheet.
- **Permission to regress a protected framing when the land inside it
  is the scope**, written into `QUALITY-BAR` §3.
- **The ladder is re-cut from 15 to 24** (`PLAN.md`). Session 15 is
  THE VERBS AND THE LAW and `PROMPT.md` is its brief.

### State

- No code changed. Build unchanged. Every gate that passed at Session
  14 still passes.
- Files touched: `design/THE-FUN-PASS.md` (new), `QUALITY-BAR.md`,
  `QUESTS.md`, `STORY.md`, `INSPIRATION.md`, `WORLD-SYSTEMS.md`,
  `PLAN.md`, `PROMPT.md`, `DIRECTION.md`, `README.md`, this file.
- **The ear gate and the feel gate are still owed** and still handed
  over. The play gate joins them.

## Session 14 — 2026-09-01 — the 8:15

*One land, one wait, one man, one mount — and the mount is the ending of
the game. THE CUBICLE MILE was the last scatter draft in the world and
there are none left. `THE-LINE.md` §4 is built.*

### THE ONE THING TO KNOW: THE THIRD RULE

Session 13 drew the two present-day lands at right angles to each other
— **in MAPLE COURT every mark closes**, **in GREYLINE CITY every mark
leaves the frame** — and the Cubicle Mile is the third land whose
subject is the present day and may be neither. So it takes the third
thing a line can do:

> **EVERY MARK IS RULED, AND EVERY MARK STOPS SHORT OF THE ONE IT WAS
> GOING TO MEET.**

A line can come back to itself, it can run off the page, or it can stop
just before it arrives. **The third is what a promise looks like drawn**
— and `THE-WAITS` §12 says this land believes *a timetable is a promise,
and a promise is enough.* Bay paint stops short of the kerb, the hatch
stops short of the wall, the mullions stop short of the head, and the
road stops short of the edge of the world, which it has done since
Session 1. Nobody will ever name it and everybody will feel it.

**And it is the opposite of Greyline in the one measurement the camera
cares about.** Greyline crops its near towers on the top of the frame;
**nothing in the Cubicle Mile touches the top of the frame at all** —
every roofline in the land is at the same height, so the land has a
second horizon three units above the real one, dead level, running the
whole width of the frame, with exactly one thing breaking it (the
atrium, which was phase two). That is the straightedge said in
silhouette.

### AND IT IS THE ONLY LAND IN THE WORLD THAT AUTHORS NO GROUND

Every land session since 10 has authored a landform first, because it
gives the camera something to recede along. This one authored the
ABSENCE of one, on purpose: `elevation.ts` has given the office park a
cockle weight of 0.18 since Session 4 and no landform on the sheet comes
near it, so the whole site varies by **0.45 units across 110 × 116** —
against 15.8 in Splitrock, which is the most anywhere else. The flattest
ground in the world is the correct ground under the only corner of it
anybody ever laid out with a straightedge.

`check-terrain` prints both numbers now, and asserts that **no other
land is as flat**, so a later session that wants to sprinkle a hill on
it has to come and change the assertion on purpose (Session 11's rule
about a number somebody else's content stands on, generalised).

What recedes instead is **paint**: the car park's ruled bays, which a
decal draws in perfect perspective for nothing. THE OVERFLOW — bays
running north into haze, weeds in four joints, one car, and then the
tarmac stops and the Bleach Flats begin with no marker of any kind — is
the best composition in the land and has no subject in it at all.

### THE 8:15, AND THE DECISION THAT MADE IT BUILDABLE

`THE-LINE.md` §5 is settled and says **it stops twelve times.** The line
runs through six of the twelve rects, and rule 1 of `STORY.md` §8 —
nobody crosses a border but the walker — forbids the obvious repair of
walking the other six lands' people to a platform. That is the hole this
session had to solve before it could build anything.

**The twelve are what a survey's twelve entries actually are: the twelve
places on the line where the surveyors were due, each noted against the
land it was to serve.** A survey names the place it is going to reach,
not the place it goes through. Six stand in the lands they are named
for; the other six stand on the line at the chainage the survey gave
that land. The board in the case at THE 8:15 STOP is that list, in that
order, and **the last entry on it is this stop.**

**And there is exactly one shelter in the world.** The other eleven
stops are places on a road where there is nothing at all, and at eleven
of them, once, somebody is standing. Nothing was added to any other
land: the platform figures belong to the 8:15's own group and exist only
while its doors are open.

The rest of it, as built:

- **`layout.THE_LINE`** is assembled from the three roads that already
  carry `line: true`, never authored a second time, so the thing that
  comes cannot drift from the road the player walked. 794 units, gate to
  car park.
- **It starts on knowledge and nothing else**: `route:the-line`, plus
  the answers to enough of the twelve waits. §4.1 proposed seven against
  twelve; **eight of the twelve exist in the source**, so the constant is
  **five** and the reasoning is in `knowledge.ts` — IV.3 is only an
  ending because the platforms DIFFER, and seven against eight would put
  somebody on almost every one. It goes back to seven when the other four
  waits are built. **Nothing anywhere shows it.**
- **The dwell is thirteen seconds**, not "about half a minute": twelve
  stops at half a minute is six minutes of standing with the ride on top
  of it. Written down rather than quietly rounded.
- **Joan Harrow's platform is always empty.** Her harvest came in.
- **It arrives already carrying the lands above you** — one figure in a
  window per stop north of here that had somebody on it. That is
  `critique-story-2`'s second mandatory finding and the exact fix it
  asked for: no new content, no change to the ending, and the default
  witness now sees a train that has been somewhere.
- **Two aspects, both facing the camera**: front-on down the king's road
  (a thing coming at you along a road you are looking along) and
  broadside at every stop and whenever you are in it. *A train you are
  watching is going somewhere; a train you are in is a room.*
- **It is not in the world until it has run.** Round 1 parked it in the
  car park from the first minute of a fresh page.
- **It ends its run in the car park and stands there**, with everybody
  still aboard, and nobody ever sees it go back up.

### THE BUG THE PICTURE FOUND, AND NO TOOL HERE COULD HAVE

**Every platform figure in the game was three hundred units off the
sheet.** The 8:15 draws whoever is waiting as a child of its own group —
already translated to the train's position — and the update wrote that
child's position in WORLD coordinates, so at the Cubicle Mile's stop the
person waiting stood at (504, 412).

`check-fields` reads instanced fields and this is a one-off.
`check-sightline` reads the skyline and a thing off the sheet is not in
a corridor. **And a contact sheet of an empty platform is pixel-for-pixel
a contact sheet of a platform whose figure is elsewhere.** IV.3 *is* the
ending and it had been shipping as *nobody ever gets on anywhere*. The
only thing that caught it was looking at the picture and asking where
the person was.

### DENNIS, AND S8 AT BOTH ENDS

- **The timetable is a survey schedule** (`THE-WAITS` §12): twelve names
  and twelve times, in the order the surveyors were due, and 8:15 is when
  they were due here. It is the only document in the world that names all
  twelve lands in order, **and there is no note anywhere in this land
  that explains it.** Dennis does not know what the road is, because
  knowing would require crossing (`THE-LINE` §3.4).
- **The desk plate says D. HALL**, screwed to the back panel of a bus
  shelter, legible from the road, and nothing in this game mentions it.
- **The change**: come to the stop holding `route:the-line` and the
  shelter's light comes on at dusk, and at every dusk afterwards, in
  every save. Session 6's lamp code with a different condition, copied
  exactly as `THE-WAITS` §12 says to copy it. **Two lighting columns
  flank the stop** so the frame before says *the one dark thing in a lit
  car park* — and there is a third dark column out in the overflow that
  was put up with the kerbs and never connected.
- **`THE-STRANGERS` S8 is built at both ends**, and it cost one clause
  and one knowledge id and no geometry: Greyweather's plinth says the
  king was beloved **of graweder**, which is that place with the old
  spelling still on it, and once you have read it exactly one line on the
  board in the Cubicle Mile has been wiped clean of a century of grime.
  Nobody there notices, because nobody has ever listened to the whole
  list.

### AND THE LAW WAS AMENDED, WHICH IS WHAT THE OWNER ASKED FOR

Session 13 put the count on the map to the owner and they challenged the
rule instead of picking an option: *"I don't understand why that law
exists. Progression, collection, and advancements are part of what makes
games fun."* `PLAN.md` said the one thing not to do was split the
difference quietly. **The law is amended, in `QUALITY-BAR.md` §3 and
`QUESTS.md` §7.1, with the owner's words written into both:**

> **A NUMBER MAY RECORD WHERE THE PLAYER HAS BEEN. A NUMBER MAY NEVER
> GRADE WHAT THEY DID.**

The law came out of a SIZING argument — *a collection caps at about two
hours* — which is an argument against collections, not against numbers,
and this game already keeps a record of where you have been and makes
Act III's whole beat out of it. So the map's line keeps its numbers. A
completion percentage, a checklist, a count of the twelve waits, a
score, a grade, or any number that pops up to say you did a thing: still
refused. **And the ending is out of scope and stays absolute** — nothing
counts the platforms, and no amendment to a UI law reaches
`THE-LINE.md` §4.2.

### THE EAR GATE — HANDED OVER, AND IT IS THIRTY-FOUR FILES BIGGER

`render-wavs.mjs` has written nineteen files since Session 8 and its own
note said, in as many words, that **the one-shot voices of each land are
not in them** — they are bound to the live audio context, so the offline
render could not reach them. That was thirty voices nobody had ever
heard, and this session was about to add a fifth un-heard one.

The booth renders `Audio.event` now: an Audio instance whose context and
master are the offline ones, then the same call the game makes, with
nothing re-implemented. **53 WAVs**, and thirty-four of them are the
lark, the belfry, the surf, the oar, the mill, the drip, the stone, the
two water cans, the sprinkler, the crossing box and the plant on the
roof — every one of them for the first time. `WHAT-TO-LISTEN-FOR.txt`
says what to ask of them.

**THE GATE ITSELF IS STILL THE OWNER'S AND IT HAS STILL NOT BEEN RUN.**
A session that claims a sound is good is lying. This one hands over
evidence and says plainly that it could not perform the gate.

**AND SO IS THE FEEL GATE**, owed again since Session 12 closed the
camera. Nothing in this session could run it either.

### AND THE REGRESSION GATE FOUND THE SESSION'S OTHER DEFECT

`diff-sheets` against `origin/main`: **92 of 92 bit-identical on THE
PAGE**, first run, in a session that added a mount crossing six lands.
Nothing in the world moved by a pixel.

**Four frames moved in THE WRITING** — the same 102 × 22 band in
Greyweather's bailey, at both hours, in both viewports, in a land this
session never opened. It is the interact prompt:

> **THE 8:15's BOARDING PROMPT WAS SHOWING AT THE CASTLE.** The POI that
> says TAKE A SEAT reads the train's live coordinates the way the
> rowboat's has since Session 6 — and before the 8:15 has ever run,
> those coordinates are the head of the line, **which is Greyweather's
> gate.** On a fresh page, standing in the bailey of a castle in the
> oldest land in the world, the game offered you a seat on a train that
> does not exist yet.

No contact sheet of the Cubicle Mile could have contained it and no
check in this repository asks where a prompt is. The POI reads
`boardingPos` now, which is off the sheet unless a door is open in front
of you. **A live-coordinate POI is a POI that is somewhere before it is
anywhere**, and that is the general lesson.

### State

- Build green. `check-terrain` (with two new proofs), `check-audio`,
  `check-fields`, `check-camera`, `check-sightline` and `shoot-mobile`
  (five rigs, joystick assertion holding on all of them) all pass.
- New spec: `design/specs/the-cubicle-mile.md`. Gate logged in
  `design/critiques/critique-art-9.md` — **WOWED at round six**, with
  three noted-not-blocking.
- **`diff-sheets`: 92 of 92 bit-identical on THE PAGE, and 92 of 92 on
  THE PAGE AND ITS WRITING**, against `origin/main` (77720cc). A land
  rebuilt from nothing, a mount that crosses six of them, a knowledge
  table and an amended law, and not one protected framing moved by a
  pixel — after the prompt at the castle was closed.
- **The ear gate handed over: 53 WAVs in `out/sound/`**, thirty-four of
  them land voices nobody had ever heard.
- **ELEVEN LANDS HOLD A VERDICT AND THERE ARE NO SCATTER DRAFTS LEFT IN
  THIS WORLD.**

### What this session did NOT do, in writing

- **THE PAPER PLANE is deferred a third time**, and this is the third
  written deferral (`PLAN.md` row 15, Session 11's brief unchanged).
  This session was one land, one wait, one named inhabitant, a MOUNT
  that is also the ending of the game, a law amendment and a rebuilt ear
  gate. A mount is a traversal system with a launch, a flight model, a
  refusal rule and a camera — the rowboat was half of Session 6 — and
  the bar is explicit that a session that cannot meet it ships less
  scope, never a lower bar. It goes to Session 16 (Motion & life) or to
  a session of its own.
- **The departure is not permanent.** While the 8:15's doors are open at
  a land's stop, that land does not draw its own person — they are on the
  platform, which is where the game has just put them — and when the
  doors shut they are back where they stand. Making it permanent is one
  clause per land (`Eight15.ts` already exports `platform` and every
  routine is already gated on the hour and on knowledge), but it re-opens
  the authored routine of **seven lands that hold verdicts**, and
  `THE-LINE` §5 does not require it. **It is the one thing the ending
  does not yet do** and it is the owner's call.
- **The four unbuilt waits** — WICK, PYE, WREN and NELL — stand entirely
  on ground that is already WOWED (`THE-WAITS` §14) and their platforms
  are always empty, which is exactly what an unanswered wait looks like.
  Building them is what moves `WAITS_FOR_THE_LINE` back to seven.
  **And this session is what made NELL buildable**: her wait resolves on
  the fourth name off the signpost, which is the timetable, which did
  not exist until now.
- **`critique-story-2`'s RECOMMENDED 2 is left open, knowingly, on the
  thing this session built.** The gate said *the list should mean
  nothing until some of the names on it do* — a player who walks east in
  their first ten minutes should get a list of words, and a player who
  has stood in nine lands should get the order of the world. The Cubicle
  Mile's `fact:the-timetable` resolves on READING the board, full stop.
  The fix is in-fiction and cheap (require several `name:` knowledges,
  which the map already tracks in three registers) and it belongs beside
  MANDATORY 1 in the session that closes the story gate, because that is
  the critic who should judge it. It is in `PROMPT.md` as a named job.

### Gotchas (new; everything from Sessions 1–13 still applies)

- **A MESH PARENTED TO A MOVING GROUP TAKES A LOCAL OFFSET.** Cost this
  session the whole of IV.3 for three rounds. See above.
- **THE CAMERA LOOKS NORTH, WHICH IS −Z, SO YOU STAND SOUTH OF WHAT YOU
  WANT TO SEE.** Round 1's shoot list had four framings of an empty road
  with the train behind the walker's head.
- **A DRAWING HAS TO BE THE SHAPE OF THE THING.** The barrier was drawn
  on a 256×144 canvas, so the boom — the only part of a raised barrier
  anybody recognises — was a six-inch sliver in a seven-unit standee. On
  a 128×256 canvas it is a barrier.
- **A LIGHT IS A SOURCE WITH A HALO, NOT A PAINTED PANEL.** The lamps'
  first lit texture was a hard orange rectangle at nine tenths alpha and
  it hung in the air over the mile.
- **WEEDS DO NOT SCATTER — they come up in the JOINTS.** Forty-four
  instances on a Poisson scatter is an even field of identical marks, in
  the one land whose subject is a grid.
- **A PLACE IS COMPOSED FOR THE NARROW FRAME.** Portrait is 26.5° wide;
  the board stood eight units off the shelter because desktop had room,
  and portrait's shot of THE 8:15 STOP had the timetable outside the
  picture.
- **A BACK-OF-HOUSE WALL IS THE DIRTIEST THING IN A CLEAN LAND** and has
  to be drawn like it. At fifteen per cent hatching the bin store could
  not hold its own against nine ruled glass buildings.
- **A TEMPLATE LITERAL HAS NO BACKTICKS IN IT.** `tools/audio-lib.mjs`
  is a page script inside one, and a comment that quoted `Audio.event`
  in code style broke the whole file at parse time.

## Session 13 — 2026-08-31 — the now

*Two lands, two waits, two people, and the first land session judged
through a camera that does not lean. MAPLE COURT and GREYLINE CITY are
the only lands in this world whose subject is the present day, and the
whole session turns on what that costs a ballpoint.*

### THE ONE THING TO KNOW: THE TWO LANDS ARE DRAWN AT RIGHT ANGLES

Every other land in this game is old, weathered or empty, and the pen
flatters all three for free — a cracked pan, a stook, a wall with the
mortar gone. **A suburb and a downtown drawn in the same pen look like a
tech demo the instant the drawing is generic**, because nothing about a
bungalow is inherently interesting to a line.

So the pair got a rule each, and the rules are opposites:

| land | rule | why |
|---|---|---|
| **MAPLE COURT** | **every mark CLOSES** — a hedge is a loop, a lawn is a kerb that comes back to itself, a fence is a rectangle round a garden, and **the street is a dead end with a turning circle on the end of it** | `THE-WAITS` §3: the street believes that leaving is temporary |
| **GREYLINE CITY** | **every mark LEAVES** — towers cropped by the top of the frame, window rules running off both sides of the buildings they are drawn on, fire escapes arriving above the drawing and leaving below it, and **not one closed silhouette anywhere in the land** | `THE-WAITS` §11: everybody is going somewhere and nobody arrives |

It is the SPLITROCK / BLEACH FLATS pairing (verticals against level
dashes) done for the two hardest lands in the world, and it is the whole
answer to "what does a suburb look like in ink".

**AND THE FRAME-TOP CEILING BECAME THE SUBJECT.** Session 3 wrote down
that the camera shows about ten units of height at thirty-three units
out, and every land since has designed around it — *height contests are
won by spread, not by scale.* A downtown is the one place in this world
where a building going out of the top of the frame is the correct
picture, and near-towers-crop / far-towers-stand-whole is most of what
makes GREYLINE read as a city instead of a village with taller huts.

### THE SIGHTLINE IS ASSERTED NOW, AND THE SHIPPED DRAFT BROKE IT TWICE

`THE-LINE.md` §3.2 has said since Session 7, in the file, because *later
is too late*: **nothing tall may stand within about eight units of
x = −45 between z = 120 and z = 278.** Act III is a two-hundred-unit look
north up an empty straight road from the world's south rim.

The draft had a 4.1-unit signpost at (−40, 196) — five units off the
axis — and thirty street trees on a `scatter` whose only bound was the
road's own PAINT, which is five units wide against a corridor that is
sixteen. Neither would have failed a single check in this repository,
and neither is visible in any contact sheet of MAPLE COURT.

**`node tools/check-sightline.mjs`** is the assertion, and the shape of
it is the useful part: it reads every prop in the world — one-off
standees from their own geometry, instanced fields straight off their
instance matrices — and **a drawing is IN the corridor if any part of
the DRAWING is, not its origin.** Nine things had to move to make it
green. The king's road's own bridge is the one structure allowed to
stand in there, and the tool names it rather than skipping it.

### AND THE CASTLE WAS ON THE HORIZON FROM THE END OF THE SURVEY

Shooting the rim FIRST, before placing anything — which the prompt
insisted on and which paid for itself in the first four seconds — found
Greyweather standing at the vanishing point of the king's road, three
hundred and twenty-four units away, at full opacity.

It is the meadow's keep vista: a pencil stand-in with `fog = false`,
authored in Session 2 for the Common's own poster, with a fade that had
a near bound and no far one. So it ramped in as the walker came south
and then never let go. **`THE-LINE` §3.2's whole claim is that you
cannot see where the road ends — you can see that it does not stop** —
and this game had been answering that question since Session 2 in a
frame nobody had ever shot. It now lets go over the first forty units of
Maple Court: full through the Common and over the border, where the
three chairs look north through their hedge at it, and gone by the
river.

### WHAT THE TWO WAITS COST, AND WHAT THEY ARE MADE OF

- **VAL** (`THE-WAITS` §3). Her porch light is on at every hour,
  including the ones nobody is awake for — the only light in this game
  whose dusk fade does not reach zero. Eleven houses round her circle
  and six of the twenty-one in the land light up at dusk; the rest do
  not, which is the turn: **the light is not for the people who left, it
  is for the street.** Come back holding `name:castle` and the gap in
  the hedge at the bottom of the garden is cut back open, and stays cut,
  and through it Greyweather is on the skyline of a back garden.
- **THE MAN AT THE JUNCTION** (`THE-WAITS` §11). **The only permanent
  change in this game with no knowledge gate: you stop walking.** Stand
  within nine units of him without moving for four seconds and he goes
  and sits on the bench twenty units off that nobody has ever used, and
  he is sitting there in every later save. The test measures MOVEMENT
  and not input, so a player being carried by the road is not standing
  still.
- **And the wear is the wait.** The pavement worn into two lanes curving
  round a clean lens the size of a person is `wornPathsDecal`: sixty-two
  walks drawn by TAKING THE STONE AWAY, the island redrawn at full
  strength inside a clip, and the lanes are what is left over rather
  than what was drawn. **The bench is NORTH of him on purpose**, so one
  standpoint holds the wear, the man and the bench in a single frame —
  and holds the same frame after he moves, with the wear exactly where
  it was.
- **S3, THE ELEVEN UNITS, is built at both ends**, which is only
  possible in this session: June's latch plate is worn down to bright
  metal (drawn by taking the ink out with `destination-out`), and once
  you have stopped for him she is at the fence at the end of the road,
  in every later save, and **nothing in this game ever says why.**

### THREE THINGS THIS SESSION GOT WRONG AND HAD TO UNDO

Worth the space, because two of them are general:

1. **A fence at the end of a road runs ACROSS it.** Round 5 laid June's
   border fence north–south, which is where a border fence goes — and
   the camera only ever looks north, so five panels came back as one
   grey streak. *A thing you walk ALONG runs north–south; a thing you
   LOOK AT runs east–west.* Session 5 learned this with a boardwalk and
   it is still true about a fence and about a hedge's returns.
2. **The wear had to become darker to be seen.** The drawing's own
   argument was that wear is pale, because stone loses its ink — true,
   and invisible on a page that is already the colour of paper. What a
   hundred years of shoes leaves is a polish, and a polish is darker
   than the stone round it. (Also: the slabs were three and a half
   metres across, so the missing lines read as gaps in a very coarse
   grid rather than as a worn lane.)
3. **THE HOLLOW's fold could not be drawn from a region builder.** The
   city's crease falls three units over six, which is under the
   terrain's hatching threshold, so the shader shades it and draws
   nothing — an airbrushed hillside, which `QUALITY-BAR` §3 forbids in
   capitals. Round 6 tried forty hatch decals down the fall line and a
   full run of retaining walls: the decals read as CORDUROY (an array,
   in the one quadrant of the world that already has a harrow in it) and
   a five-unit wall on a slope has its feet in the air at both ends. It
   ships with short walls at the toe of the cut where the ground is
   nearly flat, and **the fold itself is still shaded rather than
   drawn.** That is a debt, it is recorded in `PLAN.md`, and it belongs
   to `elevation.ts` rather than to a land.

### AND ONE DECISION WENT TO THE OWNER AND CAME BACK BIGGER

Session 12 found a live contradiction and deliberately left it: the map
prints *"N of 12 lands walked — N strides of ink"* (`src/ui/map.ts:246`)
and the law's short form says **no count, no list, no percentage,
anywhere, for anything.** Session 13 put it to the owner as instructed,
with four options. The owner picked none of them:

> *"I don't understand why that law exists. Progression, collection, and
> advancements are part of what makes games fun."*

**Nothing was changed.** The count is still on the map, the law is still
in every prompt, and the question is no longer about one line of
lettering: it is whether this game has progression the player can SEE.
The argument on both sides is written out in `PLAN.md`'s standing debts
so the next session does not have to reconstruct it, and the one thing
it says not to do is split the difference quietly. Either the law holds
and the line loses its numbers, or the law is amended in
`QUALITY-BAR.md` and `QUESTS.md` §7 with the owner's reasoning written
into it.

### State

- Build green. `check-terrain`, `check-audio`, `check-fields`,
  `check-camera`, `check-sightline` and `shoot-mobile` (five rigs, and
  the joystick assertion holds on all of them) all pass.
- **`diff-sheets`: 92 of 92 bit-identical on THE PAGE, and 92 of 92 on
  THE PAGE AND ITS WRITING.** Two lands rebuilt, a road added, a
  landform's neighbour re-lit, and not one protected framing moved by a
  pixel.
- **And the writing pass had to be fixed to say that.** Its first run
  came back with seven frames moved by 0.02–0.16%, every one of them a
  band 424 pixels wide and 24 tall at the bottom of the screen — which
  is where the six-second control hint lives. It was not a moved label:
  the head build has two more lands' worth of drawings to build at
  stream-in, so it arrives at each framing a few hundred milliseconds
  further into the hint's own fade. The isolated re-shoot of the worst
  frame was byte-identical, twice, and `diff-sheets` now sweeps the
  chrome before the shutter in BOTH passes — the bare pass had hidden
  those transients since Session 9 and the full pass had not. **A gate
  that reports noise teaches people to ignore it.**
- Two new specs: `design/specs/maple-court.md`,
  `design/specs/greyline-city.md`. Gate logged in
  `design/critiques/critique-art-8.md`.
- **Ten lands hold a verdict. THE CUBICLE MILE is the last draft in the
  world**, and it is Session 14's, with the mount and the 8:15.

### Gotchas (new; everything from Sessions 1–12 still applies)

- **A `learn` in a shoot script is for the rest of the page.** Round 4's
  sheet had the man sitting on his bench in the framing that was
  supposed to show him standing, because a framing eleven rows earlier
  had handed the walker `fact:the-man-at-the-junction`. Knowledge
  framings go LAST in a shoot list, or in their own page.
- **A pale standee with `fog = false` is a promise about ONE distance.**
  Both the meadow's keep vista and this session's first far-skyline
  panels turned the fog off, and both then hung in the air over a rise
  in a land they were never meant to be seen from. A skyline is the haze
  layer; it does not get to opt out of the haze.
- **Decals draw in the order they were made and they cover each other.**
  Two ordinary paving squares laid on the corners of the junction went
  over the wear that the whole of GREYLINE CITY's wait is drawn in.
- **`ctx.standee` and the SKYLINE are the same choke point**, which is
  why `check-sightline` can exist at all — but a FIELD does not go
  through it, so any assertion about what is standing where has to read
  instance matrices as well or it will miss exactly the thing that went
  wrong (thirty street trees).
- **People are people-sized.** The walker is about 1.9 units; the first
  pass drew the man and the commuters at 2.6–2.75, which is a land full
  of giants standing over the person the game is about.

## 2026-08-31 — owner direction, after Session 11 merged (no code)

**THE FEEL GATE WAS RUN AND IT RETURNED NOT YET.**

`QUALITY-BAR.md` §2 has listed two gates as the owner's since Sessions 8
and 9, on the grounds that no tool in this repository can perform them.
The owner played the merged build and reported, verbatim:

> *"the desktop camera movements make it hard to play — makes me kind of
> sick — and you can also the mobile controls exists on desktop as well,
> and the keyboard controls lack the ability to run."*

All three were reproduced against `bc174a5` before this entry was
written. They are diagnosed in full in `PROMPT.md` §1; the short form:

| defect | measured |
|---|---|
| **the camera** | driven round a normal circuit from the spawn, the frame swings **43°** for one change of mind about which way to walk, at up to **20°/second**, while the camera dollies **8 units** in and out and its height wanders |
| **the joystick** | a mouse drag at 1280×720 raises the touch stick's ring under the cursor (`joy active running`, 96×96, opacity 1). The only guard in `Input.ts` is an ASPECT-RATIO test, and aspect ratio is not the question — pointer type is |
| **the run** | the wiring is intact. Shift is read, `input.run` climbs, and the walker measurably goes **1.46×** faster. What is broken is that the only place the game says Shift exists is a six-second hint fired once, and the only *visible* run affordance in the game is the phone stick's ring — which on desktop is the defect above |

### AND THE THING WORTH MORE THAN THE FIX

**Every automated check stayed green while all of that was true.**
`check-camera.mjs` still asserts, correctly, that the envelope never
leaks, that the bearing is continuous round the whole circle of travel,
and that a stopped walker comes home to exactly zero in 2.5 game
seconds. Session 9 wrote in its own log that none of those was the
question. It was right, and then the question went unasked for three
sessions.

What no check ever measured is **the RATE** — how fast the frame can
rotate, in degrees a second, under an input a player can produce. That
is the number the owner felt. It is the assertion Session 12 owes.

`QUALITY-BAR.md` §2 now carries the corollary this earned:

> **A system whose gate has not been run is not done. It is SHIPPED AND
> UNJUDGED, and those are two different words.** A green check is
> evidence that the thing does what its author described. It is not
> evidence that what its author described is worth doing.

And the cheaper half of the lesson: this was found in an afternoon of
play by the one person who had never been asked to play, three sessions
after it shipped. **The gates this project cannot run should be handed
over the week they are owed, not carried in a list.** The EAR GATE is
still in that state, and it is now twenty-five WAVs and an authored
silence deep.

### THE LADDER IS RE-CUT, BY THIS PROJECT'S OWN LAW

`PLAN.md`'s ordering rule — *systems that change how a land is authored
must land before the lands are authored* — decides it. The camera is the
most load-bearing example of that rule in the file: every composition in
this game is framed through it, and THE SHOT of all eight built lands
was chosen by looking down it. Three more lands built on a camera that
has to change is three lands re-opened, which is the exact mistake the
rule was written after Session 3 to prevent.

- **12 — THE HANDS AND THE EYE** (was: three lands). Fix all three
  defects, assert the missing rate, prove the resting composition did
  not move.
- **13 — THE NOW**: MAPLE COURT + GREYLINE CITY.
- **14 — THE 8:15**: THE CUBICLE MILE, its wait, and the mount.
- 15 the paper plane, 16 motion & life, 17 the juror.

Session 11 had already recommended splitting 12 on scope grounds; that
split is taken as well.

**One constraint makes Session 12's work checkable and it should be
stated here because it is easy to miss:** a stopped walker is due north
by contract, and **every protected framing is shot standing still with
the bearing pinned.** A correct fix to the MOVING camera should
therefore come back from `diff-sheets.mjs` at **92 of 92 bit-identical.**

## Session 12 — 2026-08-31 — the hands and the eye

*Not a land session. The FEEL GATE — owed to the owner since Session 9
and listed in `QUALITY-BAR.md` §2 as one of the two gates no tool in
this repository can run — was run for the first time, and it returned
NOT YET. Three defects, all reproduced, all fixed. And the reason this
displaced three lands is the ordering rule: every composition in this
game is framed through the camera, and THE SHOT of all eight built lands
was chosen by looking down it.*

### THE ONE THING TO KNOW: SIX GREEN CHECKS AND A SICK PLAYER

`node tools/check-camera.mjs` was **green on all six of its claims** on
the build that made the owner ill. Every one of those claims is about
**where the camera ends up**. Not one asked about the journey between
two of those places — and **a rotation rate is the whole of what vection
sickness is made of.**

Sampled every tick, driving the circuit a player actually walks:

```
  yaw span        -25.4° .. 25.9°  = 51.2° of swing
  WORST ROTATION  34.7°/s
  back span       12.6 .. 20.5     = 7.9 units of dolly at 5.3 u/s
```

The owner's own table sampled every third of a second and reported
20°/s. **The averaging hid nearly half of it.** A rate you can feel
lives inside a frame, not inside a third of a second, and any future
check of a motion in this project should sample at the tick.

### WHICH OF SESSION 9'S TWO COMPONENTS WAS IT — AND IT IS ARITHMETIC

Both were measured alone, by taking the other one to zero and rebuilding:

| | swing | rotation | dolly | page east | page south |
|---|---|---|---|---|---|
| **as shipped** | **51.2°** | **34.7°/s** | 5.3 u/s | +3.2 | +6.0 |
| the astern alone | 0.0° | 0.0°/s | 5.3 u/s | +0.0 | +6.0 |
| the yaw alone | 51.2° | 34.7°/s | 2.1 u/s | +3.2 | +0.0 |

- **THE YAW IS 100% OF THE ROTATION AND 12% OF THE GAIN IT WAS BUILT
  FOR.** It buys 3.2 more units of page walking east — **on top of 27
  the pinned rig already had** — and charges a fifty-one degree swing at
  thirty-five degrees a second for them. `camera.md` §3 measured the
  walk SOUTH at 3.5 units of warning and called it the defect; walking
  east the same rig showed 27, which is six and a half seconds. **The
  yaw was solving a problem the geometry says was not there.**
- **THE ASTERN IS 100% OF THE WALK SOUTH AND ROTATES NOTHING.** Five
  units of warning to eleven. It is a retreat and a drop, not a turn.

**So: the yaw is the sickness and the astern is the gain.**

### WHAT SHIPPED

**1. The automatic yaw comes off both rigs.** Not reduced to 8–10°: a
small unrequested rotation is a small dose of the same thing, and at 8°
it would still buy under a unit of page. Portrait lost it too — 12°
across portrait's 26.5° frame is 45% of its width against desktop's 36%,
so in frame-relative terms portrait's automatic turn was the *worse* of
the two.

**THE ENVELOPE SURVIVES WHOLE AS THE PEEK'S**, and every reason it is
26° and 12° is unchanged. `rig.yaw` is renamed `rig.peekYaw`, because a
name that lies costs sessions. **The distinction the sickness turns on
is agency, not degrees:** a large field rotating because you pressed a
WALKING key is vection; the same rotation, at the same rate, because you
are holding the key that means LOOK, is a head turn.

**2. `asternEase` 1.4 → 0.85.** At 1.4 the rig gave ground at 5.3 units
a second against a walk of 4.1, so turning south the page flowed
backwards under a walker who was going forwards. The ceiling is now the
walk itself. Steady state is untouched, so the walk south still sees
17.4 units — exactly what it earned its verdict on.

**3. The lead is untouched, deliberately.** Buying the yaw's 3.2 units
back with a bigger lead was tried and refused: at a walk the lead is
capped by `leadSec` at 3.7 units, and 3.2 more would sit the walker
**70% of the way to the frame edge** in every east–west walk. **This
session removes a motion; it does not add one and hope.**

**WHAT WAS LOST, so nobody has to guess:** the lean.
`critique-camera-1` awarded WOWED for two things and *a frame that
answers travel* was one of them. It is worth 3.2 units of page out of
30.2, and it is still on `,` and `.`. The walk south — the other half of
that verdict, and the whole of the defect Session 9 existed to close —
is untouched.

**And the crossing did not go nowhere.** It leans the WALKER now
(`Character.LEAN`): the same term, moved off the field of view and onto
the forty pixels of ink in the middle of it, where it rotates nothing
anybody is looking through.

### THE PHONE'S JOYSTICK ON THE DESKTOP, AND WHY THE GUARD LOOKED LIKE ONE

The only guard in `Input.ts` was an **aspect-ratio test**, and it is a
real rule that is still there — but read what it decides: **WHERE on a
tall screen the stick may be grabbed**, protecting the vista band. It
was never asked, and cannot answer, whether the stick should exist on
this device. **A guard that answers a different question than the one
you have is worse than no guard, because it looks like one.**

The fix is `e.pointerType === 'mouse'`, as the **first** line of the
handler so a mouse never enters the live-pointer map either — otherwise
a hybrid laptop with a finger and a mouse down at once reads as *two
fingers* and takes a peek. It beats `matchMedia('(pointer: coarse)')`
because it is per-EVENT: a touchscreen laptop answers `fine` to the
media query and still gets the stick the moment a finger lands.

**And click-drag-to-walk is removed from the desktop, with the argument
written down** (`controls.md` §2): there is no desktop device without a
keyboard, the drag drew phone chrome into desktop frames the art
director has never been shown, and it was **the only visible run
affordance in the game on desktop** — the run's signal was attached to a
control the desktop should not have had.

### THE RUN WAS NEVER BROKEN — DO NOT GO LOOKING FOR A DEAD KEY PATH

Shift is read, `Input.run` ramps, the walker goes 1.46× faster, and it
has worked since Session 6. Two design faults, not a bug:

**You could not FIND it.** The game said Shift existed exactly once: a
six-second toast listing FIVE controls, fired on the frame a player
walks into a new land — the one frame they are certainly looking at the
land and not at a line of type. Fixed by TIMING, not volume: the arrival
hint drops to four items, and the run is taught **once ever**, at the
first moment the player has walked unbroken for six seconds, and **never
to a player who already found it** (holding Shift sets the flag
silently). `save.taughtRun`. Never fires for the harness.

**You could not SEE it, and that is a measured claim.** The prints are
laid BEHIND the walker and the frame's bottom edge is three and a half
units behind them. Shot at the same spot, seven game seconds apiece, a
walk and a run are **the same three dots on the same frame edge**. *The
run's whole affordance was drawn in the strip of page this camera
crops.* So the signal moved to the one place never cropped: the figure,
which is dead centre of every frame in both viewports at every bearing.

### AND THE TOOLS FOUND THE SAME CLASS OF FAULT IN THEMSELVES

- **`shoot-mobile.mjs` drove a TOUCH control with `page.mouse`.** A tool
  that tests a touch control by moving a mouse cannot find a touch
  control responding to a mouse. It dispatches real touch over CDP now,
  and shoots **five rigs including 1280×720 desktop**.
- **Its joystick step was a photograph and never an assertion**, and it
  had been dragging from a point where the `look` prompt sits — so the
  drag was landing on a BUTTON and the frame was filed as
  `07-joystick-running.png` anyway. The stick step now puts the walker
  on empty meadow, searches for a point that is actually the page, and
  **re-checks the hit target at dispatch time** — because Session 9 made
  the prompt re-place itself every frame, so `elementFromPoint` can
  answer "the page" and the touch a moment later land on a control.
- **The gate was proved against the defect**: with the pointer-type
  guard removed, `RIG=1280-desktop` prints
  *"A MOUSE DRAG RAISED THE PHONE'S STICK ("joy active running")"*.
- **All nineteen tools hard-coded `/opt/pw-browsers/chromium`**, so
  every gate in this repository failed at its first line on any machine
  but the build sandbox — **including the owner's, which is where the
  feel gate is run.** `tools/pw.mjs` resolves it now (`$PW_CHROMIUM`,
  then the sandbox path, then Playwright's own). A gate the owner cannot
  run is a gate that does not get run, and this session exists because a
  gate did not get run.

### THE GAUNTLET, AND THE ONE THING THAT MOVED

```
check-terrain    all terrain checks pass  (SPLITROCK's floor still -10.8)
check-audio      the score renders, and every assertion holds
check-fields     nine lands, 2928 instances, none half inked in
check-camera     all camera checks pass, both viewports, three new rates
shoot-mobile     5/5 rigs — a thumb raises the stick, a mouse raises nothing
diff-sheets      THE PAGE: 92/92 BIT-IDENTICAL, 0 over 0.000%
```

**THE PAGE DID NOT MOVE AT ALL**, which is the claim this session had to
make: a stopped walker is due north by contract, and taking a term out
of a moving camera must not touch a single composition. It did not touch
a single pixel.

**Seven framings moved in THE WRITING OVER IT, and all seven are the
same deliberate edit.** Every one is in THE COMMON at hour 12 — the
spawn, where the arrival hint fires — and the changed box is the hint
element itself, confirmed by measuring it:

| | the diff's box | the hint's own rect |
|---|---|---|
| desktop | x 369–908, y 666–691 | x 420–860, y 663–694 |
| portrait | x 21–367, y 762–813 | x 24–366, y 759–818 |

The old line was wider because it listed five controls; it lists four
now, and the run is taught on its own. **Nothing else in the writing
layer moved past label jitter** (`crease-east-road` 0.11%,
`barbican` 0.02%, `street-shot` 0.02%).

**No new art verdict is claimed, and that is deliberate.** This session
authored no land and no prop, so there is nothing for the art director
to judge that they have not already passed. THE SHOT of all nine built
framings was re-shot down the new lens in both viewports
(`tools/shoot-session12.mjs`, montaged) and looked at: the walker is
centred and upright in every one and the compositions are the ones that
earned their verdicts. **The pixel proof is the 92/92, and a session
that awarded itself a WOWED for changing nothing would be inventing
one.**

### FOR THE NEXT SESSION

- **THE LADDER:** Session 13 is THE NOW (Maple Court + Greyline City),
  14 is THE 8:15. `PLAN.md` carries it. **§3.2's rim composition is shot
  FIRST, not last** — and it is now also the first framing to be judged
  through a camera that no longer leans, so shoot it and look at it
  rather than assuming the pin covers it.
- **THE FEEL GATE IS STILL THE OWNER'S AND IT IS OWED AGAIN.** Nothing
  in this repository can say whether the fix feels better, whether 4.1
  is the right walk, whether 1.5× is the right run, or whether an eleven
  degree lean reads at forty pixels on a real screen. **Hand it over the
  week it is owed, not in a list.**
- **THE EAR GATE has still never been run.** Twenty-five WAVs and one
  authored silence, unperformed since Session 8.
  `node tools/render-wavs.mjs`.
- **A LAW VIOLATION FOUND IN PASSING AND DELIBERATELY NOT FIXED:**
  `src/ui/map.ts:246` letters `"N of 11 lands walked — M strides of
  ink"` onto the map. That is a count and a total, which
  `QUALITY-BAR`'s short form forbids outright ("no count, no list, no
  percentage, anywhere, for anything") and which `Save.ts`'s own comment
  claims does not exist ("there is no count kept anywhere and nothing
  reads `.length`" — `state.discovered.length` is read on the line
  above). It is left alone because the map earned a WOWED in
  `critique-story-1` and un-writing a judged composition needs its own
  gate, not a drive-by. **Somebody has to decide which of the two rules
  is real.**
- The standing debts are unchanged and are in `PLAN.md`: the rowboat's
  first meeting at THE RIVER MOUTH (now passed and not praised by five
  gates, and it is the front door of Holt's wait), the Downs' stooked
  field, the Penwood's east arc, THE BLEACH FLATS' `WHERE THE ROAD
  STOPS`, Holt's lit window, and THE PAPER PLANE.

## Session 11 — 2026-08-31 — the dry lands

*Two lands, two waits, two named inhabitants — and the first session in
this project to MOVE A LANDFORM. The tear was a good cut in the wrong
place, and the land named after it had been built round the fact that it
was somewhere else.*

### THE ONE THING TO KNOW: THE LIST IS A SIGHTLINE

`THE-WAITS.md` §4 gives HOLT a boat, upside down on trestles, oiled, at
the top of a dry channel, and a set of marks up the wall behind it — and
the turn is that **they are not flood records. They are a list, in the
order things would float**, and he has written it where he can check it,
and he keeps the boat oiled at the bottom of it where it would go first.

A session before Session 10 would have written that in a note. It is a
composition instead. Stand on the channel floor and look north:

| you see | at | which is |
|---|---|---|
| **the boat**, keel up, oiled | 1.2 up | the lowest chalk mark |
| **the trestles** under it | 2.3 up | the second |
| **the shed's ridge**, forty units down the channel | 4.8 up | the third |
| **the lip of the canyon**, which is in the frame | 12.6 up | the fourth |
| **a fifth mark**, chalked on the rock ABOVE the wall | ~16 up | `THE-STRANGERS` U20: *one mark is above the lip, which means it is not a flood mark* |
| **HOLT'S HOUSE**, on the rim behind it | | what the fifth mark is the height of |

**Four heights that line up with four things you can see from where the
marks are read, and a fifth that lines up with a roof.** There is no
note on the marks, no number, no scale and no label anywhere in the
land. The art director assembled the list before reading a word, and
there is not a word to read.

And the ink technique is what makes it legible: **everything in
SPLITROCK is drawn in strokes down the page** — the terrain hatches a
cliff down its fall line and a torn edge has fibres rather than strata —
so the five chalk strokes are the only marks in a hundred and fifty
units of canyon that go ACROSS anything. In a land of verticals, a
horizontal reads as writing. **THE BLEACH FLATS next door are drawn
entirely in level broken dashes**, for the same reason from the other
end: the pair is a hole in the page against the flattest ground in the
world and they are drawn at right angles to each other.

### THE DECISION THIS SESSION TOOK FIRST, BEFORE A SINGLE PROP

**THE TEAR WAS REAL AND IT WAS IN THE WRONG PLACE**, and the prompt was
right that doing neither of the two available things is what the draft
already did.

Session 4 cut it at `tearX(z) ≈ 338`. The world's curled east margin
starts lifting at x = 344, so the rip ran six units from the foot of the
rim; the tear only existed between z ≈ −272 and −132; and the canyon
trail — the only way into that land — ran at x = 255..305 and never came
within thirty units of it. **The land called SPLITROCK had its split
jammed into its own east gutter.**

It is at **x = 300** now, the middle of its own rect, and every
consequence was audited rather than assumed:

- **the mouth is a sixty-two-unit RAMP and the head is a fourteen-unit
  WALL.** A tear starts shallow and deepens, so there is **no stair to
  author anywhere in this land** — you walk in at the shallow end, the
  walls rise either side of you, and the walk ends in front of you at a
  face of rock. That is the metaphor paying for a traversal design, and
  it is the third time the sheet's vocabulary has paid this project back
  and the first time it has paid in traversal.
- **the floor went from twelve units wide to eighteen**, which is the
  narrowest a slot can be and still hold a boat, a shed, a man and a
  walker without any of them standing on a cliff.
- **the amplitude went from −13.0 to −13.75**, and the third decimal is
  load-bearing: `check-terrain` measures the floor at the axis and the
  accumulated `smax` bias and the local cockle differ at x = 300. **It
  still prints −10.8.** `THE-STRANGERS` S5 is an errand about that
  number — *ten point eight units from lip to floor, taken twice, with a
  line* — and it was not this session's to spend.
- **`RIVER[0]` moved from (318, −108) to (296, −116)**, so the water
  still rises at the canyon's MOUTH, six units south of where the rip
  begins. That relationship is `THE-WAITS` §4 already true in the height
  field and it was never a bug. It cost eighty-eight pixels on a
  protected framing — see the regression section, which measures it.
- **`tearFloorK` → `terrain.ts`**, the twin of Session 5's `holdfastK`:
  the channel floor is painted as a dry bed rather than as canyon, so a
  walker on the west lip can see that the channel is a channel.

**What did not change: the depth, the vocabulary, the bearing.** `tearX`
is a function of z, so the canyon runs north–south and the camera's law
is obeyed by the ground itself. That is most of why the landform was
worth moving rather than re-cutting.

### THE ONLY ROAD IN SPLITROCK IS A RIVERBED

The Penwood said its fable in `layout.ROADS` and this land says its own
in the same place. The canyon trail comes up out of the Flats, **rounds
the head of the river** — there is no bridge on this water and a river
with no bridge is a wall, so going round the top of it six units from
where it comes out of the ground is the only way into this land on foot
— drops down the mouth, and then **every point from z = −136 north is
`tearX(z)` sampled at eight-unit intervals.** It is not following a
route; it is lying in the bottom of a channel, and paper does not tear
straight. It ends, dead, at a wall.

And the geography teaches one thing by making you walk it: **the east
bench is thirty units away across the channel and the only way onto it
is all the way back to the mouth and round.**

### WHAT SHIPPED

**SPLITROCK CANYON** — `design/specs/splitrock-canyon.md`. Six places:
THE RIVERHEAD, THE TOP OF THE CLIMB (somebody's boots, side by side —
`THE-STRANGERS` C20), THE MOUTH, THE OVERLOOK, THE NEEDLE ARCH, THE
TRESTLES. Three placement registers and every drawing knows which it is
in: the wall's toe, the skyline, the floor.

**THE BLEACH FLATS** — `design/specs/the-bleach-flats.md`. Six places:
THE HANDS (a signpost with four arms and **every one of them points out
of this land**), THE PALE, THE OASIS, THE TRACK, THE CATCH, WHERE THE
ROAD STOPS.

**THE GROUND, authored not sprinkled** (`elevation.ts`): the tear moved
and reshaped (above), and **THE PAN** — the Flats' one shape, a dish
ninety units across and a unit and three quarters deep, bounded hard on
all four sides at x = 332. The oasis sits at the bottom of it and
**Amos's cistern sits on its rim**, which is what makes the forty units
he carries every night forty units UPHILL, both ways. Nobody will ever
measure that and it is true anyway.

**THE TWO WAITS, END TO END.**
- **HOLT** (`THE-WAITS` §4) is at the boat from six to eight, oiling,
  with a stretch in the middle of the day at the foot of the wall with
  his head back; at night he is not there and there is a light on up on
  the rim. **He straightens when you come inside fifteen units**, which
  is the land's one player-responsive motion and is a man stopping work
  because somebody is walking up his channel, which out here has not
  happened in a while. Hold `route:the-river` — rowed salt to source,
  under all three bridges, which nothing else in this world has done —
  and the boat is off the trestles and right way up on the dry floor,
  bow north, in every later save. The game never says whether that is
  madness or readiness and neither does the drawing.
- **AMOS** (`THE-WAITS` §5) is on the track from half past eight in the
  evening to half past four, the whole time: down empty, back with two
  full cans, and again. `THE-STRANGERS` C21 is a player meeting him
  going the other way and **the only way to make that happen is for it
  to be true.** In the day he maintains a machine that has never worked:
  the gutter runs downhill FROM the cistern (U23), so it could not have
  delivered a drop, and the board beside it is ruled into columns with
  nothing in any of them (U22). Hold `fact:the-fold` and the lid comes
  off and stays off.

**`fact:the-fold`, AND IT DID NOT EXIST.** `THE-WAITS` §0 has said since
Session 7 that THE BLEACH FLATS turn on it, *earned by walking the
crease, both faces* — and there was no such id anywhere in the source
and nothing that taught it. **Amos's wait had a dependency nobody had
built.** It is a two-post route in `knowledge.ts` now, on the crease's
two shoulders at the place the east road dives through it, reach eleven.
The kind is a FACT and the mechanism is a ROUTE, which is the one id in
that file whose prefix does not match its mechanism and it is on
purpose: a fold has two sides and the whole of the fact is that you have
been on both of them, which a proximity test cannot say. **It adds no
geometry to THE COMMON and none to THE HARROW DOWNS**, which is
deliberate twice over — both hold verdicts, and `crease-east-road`
stands sixteen units from the southern post.

**SIX VOICES** (`Audio.event`, App's ambient scheduler), and between
them they say the one thing the beds cannot: **the canyon is a ROOM and
the Flats are not.** `slot-wind` (a slot is a pipe with one end open, so
the wind has a NOTE rather than a hiss), `hull-rag` (the only made sound
in SPLITROCK, and the only evidence at forty units that anybody is doing
anything), `stone-fall` (C19 — *a rockfall you hear and do not see*, and
it is never drawn); `palm-rattle` (the only sound in the Flats made by
something alive, and **you hear the oasis before you can see the
water**), `can-knock`, `grit-run` (which arrives from one side and
leaves by the other and does not come back).

**AND ONE PLACEMENT RULE THAT IS THE WHOLE OF C22.** The oasis's palms
are massed on the NORTH shore, so a player who walks off the east road
and comes at it from the north finds a stand of trees with nothing under
them and no water anywhere. `THE-STRANGERS` C22 is *the oasis, from the
wrong direction, and it is not there*, and it costs nothing but a
decision about which side the trees are on. **The land teaches you that
you came at it from the wrong side**, which is the belief of the place
said without a note.

### THE GATE

- `check-terrain.mjs` ✓ · `check-audio.mjs` ✓ · `check-camera.mjs` ✓
- `check-fields.mjs` ✓ — **and it gained both new lands**, because both
  carry a field whose instances are re-set from an update loop every
  frame (the grit, the tumbleweeds), which is the exact shape of the bug
  that file was written for.
- `diff-sheets.mjs` — see below, and read it before you assume anything.
- **critique-art-7: WOWED at round 6.**

### THE REGRESSION NUMBER, AND WHAT IT ACTUALLY SAYS

`node tools/diff-sheets.mjs`, ninety-two framings against `origin/main`
(c853988), bearing pinned, twelve game seconds of settle:

```
THE PAGE (the world, writing hidden):
  80/92 bit-identical, 12 over 0.000%
   72.0117%  max 235  desktop/tear-lip@12           at 0,0,1280,720
   66.1272%  max 197  desktop/tear-lip@19.6         at 0,0,1280,720
   53.5029%  max 232  portrait/tear-lip@12          at 0,161,390,683
   46.8414%  max 187  portrait/tear-lip@19.6        at 0,161,390,683
    4.1897%  max 105  desktop/curl-rim@19.6         at 0,126,1255,456
    3.5014%  max 129  desktop/curl-rim@12           at 0,126,1280,519
    3.1438%  max 104  portrait/curl-rim@19.6        at 0,221,383,264
    2.5948%  max 116  portrait/curl-rim@12          at 0,221,390,300
    0.0095%  max  39  desktop/crease-east-road@19.6 at 632,190,648,347
    0.0093%  max  30  desktop/crease-east-road@12   at 631,190,649,347
    0.0052%  max  33  portrait/crease-east-road@12  at 184,529,18,27
    0.0046%  max  27  portrait/crease-east-road@19.6 at 186,311,16,245
```

**Nineteen of the twenty-three protected framings did not move by a
single pixel, at either hour, in either viewport.** Three moved and each
one is named, measured and accounted for:

- **`tear-lip` (312, −140): 72%, the whole frame, and there is no honest
  way to make that a small number.** The framing stands INSIDE
  SPLITROCK, and this session moved the thing it is named after. Its
  verdict is `critique-art-3`'s — the sheet's ELEVATION, awarded on the
  tear reading as a torn page with proud lips and a floor. Shot side by
  side: the base stands beside a mesa cutout with the old tear mostly
  out of frame; the head stands on the **east lip** of the new one with
  the cut falling away on the left, its floor visible the whole length,
  the arch spanning it forty units north. **It is still a lip, it is the
  same landform in the same vocabulary at the same depth, and the
  framing's own name is finally true.**
- **`curl-rim` (370, 16): 4.19%, and its own ground is untouched.**
  Nothing in `elevation.ts` reaches it — THE PAN is bounded hard at
  x = 332, thirty-eight units short of the walker's footing, and the
  curl terms are not touched. What moved is what is drawn ON it and
  BEYOND it, and both are THE BLEACH FLATS: the draft's sixty dune
  decals and forty-two cacti deleted and the land's ground script laid
  in their place, and the old canyon's mesas off the horizon replaced by
  the new one's stacks a hundred and forty units north.
- **`crease-east-road` (62, 62): eighty-eight pixels, and the cause is
  provable.** It is the ONLY change in this session that reaches west of
  x = 230, because every prop either land authored is east of x = 236.
  It is the river: moving `RIVER[0]` shortened the polyline from **753.0
  units to 750.0**, which re-parameterises `riverBed(t)` along its whole
  length by **sixteen thousandths of a unit at its worst** (the east
  road bridge), falling to four at the sea, still monotonic. What that
  framing can see of it is the channel forty-eight units away at the
  right edge of frame. **The verdict was awarded on the FOLD**, and the
  fold is at x = 85 under the walker's feet and is pixel-for-pixel what
  it was.

Four more moved only in THE WRITING (`portrait/tide-line@19.6`,
`portrait/curtain-wall` at both hours, `portrait/common-THE-SHOT@19.6`),
which is the DOM card mid-fade — the one clock the harness does not own,
and the same four-frame class Session 10 reported.

### THE PAPER PLANE IS DEFERRED, IN WRITING, AND HERE IS THE WRITING

`WORLD-SYSTEMS` §4 gives the wilds the paper plane and `PLAN.md` says
mounts arrive with their quadrant's land session. Session 10 built the
wilds' northern half and did not take it; **this session built the
wilds' eastern half, which contains the two best launch heights in the
world, and did not take it either.** That is two sessions, and the
prompt was right that a third silent slip is not acceptable.

**Why:** the scope was two lands, two waits, two named inhabitants, a
MOVED LANDFORM (a layout-wide audit across elevation, the road web, the
river, the reachability proof, two protected framings and the map), and
one piece of missing content-system plumbing the design had been
assuming for four sessions. A mount is a traversal system with a launch,
a flight model, a refusal rule and a camera; the rowboat was half of
Session 6. **The bar says a session that cannot meet it ships less
scope, never a lower bar**, so this is less scope, said out loud.

**The brief it is handed with**, so nobody re-derives it: it launches
from the east lip of the tear or from the curled rim above it (both are
authored ground now and both hold about eight units of drop into open
air); it refuses being steered *mostly*, which means one input and it is
not a rudder; it is found in the world and left in the world; and **the
one thing it must not do is trivialise the walk back round the canyon's
mouth**, which is the geography lesson SPLITROCK teaches by making you
walk it.

**It goes to Session 12b or Session 13, not to Session 12** — see the
next section.

### AND SESSION 12 IS THREE LANDS, WHICH SOMEBODY HAD TO SAY

`PLAN.md`'s own rule is that *the session that notices should say so
rather than the one that runs out of room.* Session 10 and Session 11
were two lands and two waits each, and both spent a full third of their
budget on the gate rather than on the building — this one ran six rounds
and threw away an entire placement plan in the middle of them. Session
12 as written is three lands, three waits, three named inhabitants,
THE LINE's riskiest un-shot framing, and **the 8:15 drawn into
existence**, which is a mount and the payoff of the whole story.

`PLAN.md` now carries a proposed split (12: MAPLE COURT + GREYLINE CITY;
12b: THE CUBICLE MILE and the 8:15) with the reason for the cut.

### For the next land session — read this part

- **THE TEXTURE SHEET FIRST, THE WORLD SECOND, AND IT IS NOT CLOSE.**
  Round 1 of this gate never rendered the world at all and found six
  classes of fault in four seconds. Round 2 found six more. The world
  sheet then cost seven minutes a round.
- **`stroke()` ROUNDS EVERY CORNER YOU GIVE IT.** It draws quadratics
  through the midpoints of its points — right for a hedge, a hull and a
  tree, and it turns any polygon of straight runs into a lozenge. The
  first texture sheet was a canyon full of domes, a shed like a haystack
  and a cistern like an egg. Both new texture files carry a `hardPoly()`
  that draws an edge as an edge. **Paper does not tear along a curve is
  a rule about the DRAWING as much as about the height field.**
- **NOTHING STANDS ON A SCARP, INCLUDING THE THING THE SCARP IS MADE
  OF.** Round 3 stood wall panels up both faces of the canyon at half
  their height and built a tunnel with the ends bricked up. The terrain
  hatches a cliff down its own fall line and does it better than a
  cutout can; what the floor needs from the prop box is the near layer
  the ground cannot give it.
- **THE CAMERA IS FOURTEEN UNITS BEHIND THE WALKER, SO EVERYTHING
  BEHIND THE WALKER IS IN FRONT OF THE CAMERA.** The Bleach Flats' rain
  catch stood on the track's line eight units north of the cistern and
  THE SHOT came back as a close-up of a boarded deck.
- **A FADE DRAWN AFTER A MARK ERASES THE MARK.** The doorstep — the
  highest of the four chalk marks and the one the whole fable turns on —
  disappeared into the crown gradient that softens the slab's top edge,
  and it is the one fault on this sheet that would have SHIPPED, because
  it is a thing that is missing rather than a thing that is ugly.
- **A PERSON CROUCHING READS AS AN ANIMAL AT FORTY UNITS** if their head
  goes below their hips. And a figure in this world is CLOTH FIRST: a
  filled coat, a real head, limbs with pen in them. Two stick figures
  went into round 1 and neither survived it.
- **A RADIAL STAIN ON A TILE THAT REPEATS ALONG ITS OWN LENGTH DRAWS A
  ROW OF DISCS.** Session 10's `stain()` rule has a second half: a
  worn path is a strip, so its colour is a linear gradient across it and
  uniform along it.
- **CHECK WHICH WAY YOU ARE FACING BEFORE YOU BOOK THE FRAMING.** North
  is −Z. Two framings on the first sheet photographed the back of the
  walker's head.
- **AND SOME CONTENT CANNOT BE PHOTOGRAPHED STANDING STILL.**
  `THE-STRANGERS` C22 is a thing that happens while you walk AWAY from
  something with the camera looking the way it always looks. It is a
  DRIVEN framing or it is nothing.

### Standing debts, carried

- **WHERE THE ROAD STOPS** (THE BLEACH FLATS) passed and was not
  praised: two posts and some cracked ground at the end of the longest
  road in the world. It is the sixth place in a land that had five.
- **The stooked field** and **the Penwood's east arc** (Session 10).
- **The rowboat's first meeting at THE RIVER MOUTH** — **five** gates
  have now passed it without praising it. *(It matters more than it did:
  `route:the-river` is what resolves Holt, so that boat is now the front
  door of a wait.)*
- **Brim Square is full.**
- **READ THE PROCLAMATION** on Greyweather's barbican is a compromise.
- **Holt's lit window** is one warm pixel at forty units; it is the only
  lit window in the east half of the world and it deserves a glow.
- **THE EAR GATE and THE FEEL GATE are still the owner's**, and this
  session added six more sounds nobody has heard to the first of them.

## Session 10 — 2026-08-30 — farm & forest

*The first of five land sessions in a row with nothing structural left
to interrupt them, and the first session in this project that could
build a land against a page it could prove had not moved. Two lands,
two waits, two named inhabitants, and one geometry that says the whole
of one of them without a word.*

### THE ONE THING TO KNOW: THE PENWOOD HAS ONE ROAD AND IT IS A CIRCLE

`THE-WAITS.md` §7 gives BRACK a fear and a fact about it: he will not go
within forty units of the tarn, he has walked its circumference for
forty years, and *the forest track is his path — worn by one man's
caution, hardened into a road, then used by everybody after him, none of
whom were afraid of anything.* The turn is that **the geography of a
whole land is one person's superstition that outlived being a
superstition and became the way things are done.**

Sessions before this one would have written that in a note. It is in
`layout.ROADS` instead:

- the track from Brim's Wood Gate runs in and **stops** at the ring's
  south-west corner;
- **BRACK'S ROUND** is a closed polyline at forty-two units' radius
  around the tarn (forty-two, because the chords sag: the road's
  centreline is at forty and a half at its nearest, which
  `check-terrain.mjs` now asserts);
- and there is no other road in the Penwood at all.

Everybody who has ever crossed this wood has walked part of a circle
round a pond and gone back the way they came, and not one of them has
ever thought that strange. **The map draws roads. The map says it.**
Nothing else does — not a note, not a label, not a line of prose. The
art director's round 5 read the shape off the map unprompted and called
it the best thing in the project.

Four more facts carry it and none of them is written down either:
**the wear on the track is heavier on the water side** (U18, implemented
as an asymmetric decal turned to face the tarn); **the pines lean away
from the tarn, all of them, everywhere in the land** (U17, implemented
as a placement rule — a pine's flip is decided by its bearing from the
water, so the lean is perfectly radial round one pond and perfectly
consistent across a hundred and seventy units of wood); **the biggest
trees in the wood are the ones inside the forty**, because nobody has
ever dared cut them; and **inside twenty units of Brack the ambient
stops**, which is the only silence in the game.

### What shipped

**THE HARROW DOWNS** — `design/specs/harrow-downs.md`. Six places: THE
MILL (rebuilt as a tower mill with its sails on their own quad so they
can turn), THE HEADLAND (Joan's table, laid for two), THE HOME FIELD,
THE FORD, THE DROVE, THE SCARECROW. Eleven authored FIELDS as polygons,
each carrying exactly one state — standing corn, stooked, stubble,
ploughed, fallow, grazed — with no two neighbours matching, hedged along
the harrow's grain.

**THE PENWOOD** — `design/specs/the-penwood.md`. Five places: THE WOOD
ROAD, THE OARS (Hallows, and the game will never say eleven), THE ROUND,
THE TARN, THE DEEP PINES. Four authored stands of different ages with
the voids between them doing as much work as the trees.

**THE GROUND, authored not sprinkled** (`elevation.ts`):
- **THE HARROW** — the land is named for a thing that rakes a field into
  parallel lines, and until this session that was a word on a signpost.
  It is now the ground: five or six low ridges forty-six units apart
  running north–south with a wander in them. It gives the land a GRAIN
  that runs the way the camera looks, it lets the field plan be laid one
  field per fold, and you crest one every forty paces. **It starts east
  of the crease**, which makes the fold the Downs' west wall and keeps
  every unit of it clear of the protected `crease-east-road` framing's
  own ground.
- **THE MILL RISE** — a windmill stands on the highest ground it can
  find, because that is what a windmill is for, and this one stood on a
  swell whose crest was forty units west of it.
- **THE TARN'S BOWL** — three and a half units of fall from the ring
  road down to the water over twenty-six units. Without it the tarn was
  invisible from anywhere but its own rim, which is fatal for a land
  whose one composition is a look at it from forty units away.

**THE FORD** (`layout.FORDS`, `Terrain.blockedAt`) — the mill lane
crosses the river. Deliberately **not** a fourth bridge: a ford changes
the BED (raised, so the water shallows and pales over it) and what the
page REFUSES, and **not the waterness** — because `rowableAt` reads that
number and `route:the-river` is salt to source under every crossing.
Reduce the water at a ford and the rowboat runs aground in the middle of
the Downs. You can see exactly where it is: it is where the river goes
light.

**THE TWO WAITS, END TO END.**
- **JOAN HARROW** (`THE-WAITS` §10) works her field from six to eight,
  stands at the headland over the middle of the day with her hands at
  the small of her back, and the second setting is **put away every
  evening and laid out again every morning**. Sit down once
  (`fact:the-place-kept`) and it is laid at every hour, in every save,
  forever. The register is the point and it is the only one in the game
  that is not wry: there is no joke anywhere in that land, and the
  drawings obey it as well as the notes do.
- **BRACK** (`THE-WAITS` §7) paces about twenty units of the ring's south
  arc facing the water the whole way, in one of two drawings. Go to the
  tarn — inside twenty units of it, which is inside his forty, which is
  the one line in this world nobody but the walker crosses — and he
  turns a quarter. One figure, one quarter turn, permanent.

**SIX VOICES AND ONE SILENCE** (`Audio.event`, `App`'s ambient
scheduler): `mill-creak` (louder the nearer the mill, the way the sea is
on the coast), `sheep`, `field-work` (**no voices anywhere in the Downs
— nobody in that land is talking**), `axe-far` (and the wood ANSWERS it,
at a tenth the level, 340 ms behind: the Penwood is the only land
besides the canyon that repeats you), `tarn-drip`, `pine-tick`.

**ONE ENGINE ADDITION, and it is four lines:** `StandeeField`'s `wave` —
one gust crossing a whole field, west to east, one-sided so it arrives
and passes rather than oscillating. The existing `wind` term is
per-instance noise on a spatial hash, which is what grass does; corn
does the opposite and moves in one piece.

### Three tools this session built for itself, and two of them are keepers

- **`tools/shoot-textures.mjs`** — every drawing in a prop box, at
  actual size, on paper, with no camera and no land in the way. Four
  seconds. **This is the single most useful thing in this handoff.**
  Round 1 of the gate had four separate faults in it and it took three
  world re-shoots to work out which drawing was causing which; the
  texture sheet answered all four in one look. Any session that authors
  new art should shoot this FIRST and the world second.
- **`tools/montage.mjs`** — a land on one sheet instead of one frame at
  a time. A fault invisible in one frame (every hedge the same height,
  three brown things in a row, a drove that fords a river) is obvious
  across ten.
- `tools/shoot-farm-forest.mjs` — this session's own sheet, including
  **both states of both waits**, which the harness hands over with
  `learn` rather than making the sheet play the game to get them.

### The gate

- `check-terrain.mjs` ✓ (and it grew two proofs: **THE FORD** — a walker
  crosses, an oar still passes, and it is the only dry-shod crossing for
  forty units either way; and **BRACK'S ROUND** — nearest the water 40.6
  units, it closes, and the bowl is walkable from every side)
- `check-audio.mjs` ✓ · `check-camera.mjs` ✓ · `check-fields.mjs` ✓ (new —
  see the owner's bug below)
- `diff-sheets.mjs` — see below, and read it before you assume anything
- **critique-art-6: WOWED at round 5.**

### THE REGRESSION NUMBER, AND WHAT IT ACTUALLY SAYS

`node tools/diff-sheets.mjs`, ninety-two framings against `origin/main`,
bearing pinned, twelve game seconds of settle:

```
THE PAGE (the world, writing hidden):
  73/92 bit-identical, 19 over 0.000%
    3.2518%  desktop/crease-east-road@12    at 2,139,1278,398
    2.4360%  desktop/crease-east-road@19.6  at 159,149,1121,388
    1.6041%  portrait/crease-east-road@12   at 3,239,387,355
    0.7704%  portrait/crease-east-road@19.6 at 71,239,319,353
    0.1173%  desktop/gate-detail@12         at 1156,159,124,46
    0.0807%  desktop/tear-lip@12            at 0,138,37,74
    0.0171%  desktop/gate-detail@19.6       at 1228,168,52,24
    0.0158%  desktop/common-THE-SHOT@19.6   at 1046,194,149,5
    0.0120%  desktop/common-THE-SHOT@12     at 1055,195,140,4
    0.0095%  desktop/crossroads@19.6        at 1069,196,149,4
    0.0092%  desktop/common-wide@19.6       at 1045,192,112,4
    0.0072%  desktop/crossroads@12          at 1069,196,149,4
```

**Read the bounding boxes, because they are the whole answer.** Every
one of the small ones is four or five pixels TALL: they are strips of
horizon. THE COMMON's protected framings can see to about x = 74 at the
fog limit, and x = 74 is inside the Penwood's south-east corner, so the
Penwood's own edge trees now show on their skyline as a four-pixel band.
`tear-lip` is the same thing from the other side — its left edge reaches
x ≈ 193, which is inside the Penwood. `gate-detail` is a forty-six-pixel
block in the top-right corner, which is the same horizon lower in frame.

**And the big one, `crease-east-road`, was always going to move.** That
framing stands at (62, 62) and looks north, and the right half of what
it sees at distance **is the Harrow Downs**. Its own ground is untouched
by construction: the harrow term starts at x = 96, and Session 4's
`downsA` swell was deliberately KEPT for exactly this reason. Shot
side by side, the fold, both shoulders, the walker's ground, Brim's wall
and the grass at the crease's foot are pixel-for-pixel what they were.
What changed is beyond the crease: **eleven identical cartoon oaks and a
red barn have become the Penwood's edge and a hedged patchwork.**

**Two more moved only in the WRITING pass and not on the page**
(`common-wide@12`, `portrait/common-THE-SHOT@12`), which is the DOM card
mid-fade — the one clock in this game the harness does not own.

**THE RULE IS UNCHANGED, AND THIS IS NOT A LICENCE.** A protected
framing may not move for a session's convenience. When it moves because
the land inside it was the session's scope, the session says which
framing, by how much, where in the frame, and what the verdict was
actually awarded on. Two things were cut from this session to keep that
list honest and short: the harrow's missing east bound (below), and the
Downs' western pasture, which put four-hundred-pixel slivers of new
grass on four of THE COMMON's framings and has been pulled back east of
x = 96 — where the spec said the Downs' west third was a composed void
in the first place.

### AND THE TOOL EARNED ITS KEEP THE FIRST TIME A LAND SESSION RAN IT

The first run came back with **eight per cent of `curl-rim` moved** —
the world's east margin, in THE BLEACH FLATS, a land this session never
opened. The cause: `harrowK = smoothstep(96, 130, x)` and no east bound,
which is **1 at x = 370**. A corrugation authored for one land ran clean
across two others and out onto the curled rim of the page.

Nothing in this session's own contact sheet could have shown that, and
no person comparing two contact sheets a week apart would ever have
found it. **Bound every term in `elevation.ts` on all four sides**, and
run the tool BEFORE you think you are finished, not after.

### AND ONE BUG THE OWNER FOUND THAT NINE SESSIONS OF CONTACT SHEETS COULD NOT

> *"The animals in other locations disappear when you approach them.
> The only ones that seem to be working are in Brim."*

Correct, and it had been true since Session 5.

**Every creature with more than one posture is drawn as one instanced
field per pose with a single instance showing at a time**, and the way
the world hid the other poses was `set(i, x, -4000, 0.001)` — park it
four thousand units away at a thousandth of its size. But `set` RECORDS
the position, `positions` is the field's answer to *where is instance
i*, and `cascadeFrom` reads it to decide when the ink wave gets there.
Four thousand units at the wave's thirty-four a second is a birth
**ninety-seven seconds in the future**, and until its birth the shader
draws an instance at `uGhost` — sixteen per cent — which against paper
is nothing at all.

So every animal in the game went invisible the moment it changed
posture, for the first hundred seconds in each land, which is all the
time anybody spends near one. **Brim's pigeons, Brim's swallows and
Greyweather's rooks were immune only because they are one-off
`ctx.standee` meshes with no birth attribute to get wrong** — which is
exactly the shape of the report.

Nothing in this project could have caught it. A contact sheet
photographs a walker standing still; the bug only fires when a creature
changes pose, and a creature changes pose because you walked at it. It
was found by asking the running page what its births actually were.

**The fix is `StandeeField.hide(i, x, z)`** — drop the instance straight
down under its own feet at zero scale and keep telling the truth about
where it is. Five call sites: the gulls (Longshore), the sheep, the
goat, the field hands and the fallen pines. Plus two things that made
the invariant exact rather than nearly true: unused field capacity is
parked at zero scale instead of merely a thousand units down, and
`cascadeFrom` births the seats nobody sits in.

**And it ships with an assertion, because a bug that survives nine
sessions gets a check and not a comment:** `tools/check-fields.mjs`
drives the walker AT the animals in seven lands and asserts that **no
field is half inked in** — a field is cascaded all at once, so after
thirteen game seconds one with some instances born and some stranded is
the bug itself, wherever it is. Verified both ways: green on the fix,
red at ninety-five seconds on the old idiom.

### For the next land session — read this part

- **AUTHOR THE GROUND FIRST AND THE PROPS SECOND.** THE HARROW took
  twenty minutes and it is why both of these lands compose: it gives the
  camera something to recede along before a single drawing is placed.
- **A DECAL IS A FLAT QUAD AT ONE HEIGHT.** Lay a nineteen-unit floor
  tile on ground that falls five units over twenty-six and one side of
  it buries itself, and the intersection draws a hard straight edge
  across your land. Eleven or twelve units is the ceiling on curved
  ground. Round 4's sheet had the Penwood's foreground faceted with
  them and it took two rounds to work out what they were.
- **NEVER USE A FILLED POLYGON AS A COLOUR.** `fillBlob` is sixteen
  sides and on a decal that TILES you can count all sixteen from a
  hundred units. Both texture files now carry a `stain()` — a radial
  gradient — and every ground colour in both lands goes through it.
- **SHARE DRAWINGS. INSTANCE PLACEMENTS.** Round 4 of the gate was a
  performance round and it was fair: a hundred and forty hedge panels
  each with their own 512×160 canvas is thirty-two megabytes of texture
  for the hedges of one land. Variety comes from the plan and from
  placement. After the fix, the Downs' worst framing is **272 draws /
  3.4 ms** on desktop against **THE COMMON's 350 / 6.4 ms** — the new
  lands are LIGHTER than the oldest one.
- **FULL BALLPOINT PRESSURE BELONGS TO THE FOREGROUND LAYER AND
  NOTHING ELSE.** A twenty-one-unit tree at register 0 that ends up ten
  units from the lens is a hundred individual scratches across a third
  of the frame. The three registers exist so a stand can be built from
  all three at once; the near register is for the eight trunks you
  authored by hand.
- **A CUTOUT RUN NEEDS ITS ENDS ERASED.** A hedge panel is a rectangle
  and a run of them is a row of cards until you fade forty pixels off
  each end with `destination-out`. The same trick fixed the near trunk,
  which was reading as a dark board with a straight top.
- **A HIDDEN INSTANCE MUST STILL SAY WHERE IT IS.** Use
  `StandeeField.hide(i, x, z)`, never `set(i, x, -4000, …)`. And place
  every instance of a field at least once — an instance that has never
  been placed has no position, and anything that reasons about position
  (the cascade, `wakeNear`, `awakeCount`) skips it.
- **AND THE CAMERA'S LAW IS STILL THE LAW.** Every framing that failed
  in this session failed it: a hedge five units in front of the lens, a
  drove laid across a river, a label at a ford printed on a mill forty
  units behind it. That last one is worth remembering — **Session 9's
  skyline lifts a name above what is standing UNDER it, and cannot know
  what is standing BEHIND it.** Height does not solve that. Angle does:
  the ford's POI moved a stride west, to the end of the stones you
  actually step on, and is now twelve to nineteen degrees clear of the
  mill from every viewpoint on the lane.

### Standing debts, carried

- **The stooked field** is the weakest composition in either land, and
  **the Penwood's east arc** is a road through a wood. Both passed,
  neither praised.
- **The rowboat's first meeting at THE RIVER MOUTH** — **four** gates
  have now passed it without praising it.
- **Brim Square is full.**
- **READ THE PROCLAMATION** on Greyweather's barbican is a compromise.
- **THE EAR GATE and THE FEEL GATE are still the owner's**, and this
  session added six sounds nobody has heard to the first of them.

## Session 9 — 2026-08-30 — the bearing

*The last foundations item on the board, taken before the five remaining
lands because building them on a camera you are going to change
afterwards is the elevation mistake a second time. It shipped a camera
that answers travel — and it spent its other half building the thing
`WORLD-SYSTEMS` §2 asked for two sessions ago and nobody had built: a
way to know, by a number, that a protected framing has not moved.*

### The owner's question, and the answer that is not the one on the board

> **Can the camera shift, on desktop and on mobile, so the player can
> always see where they are headed?**

`WORLD-SYSTEMS` §2's standing recommendation was a **bounded yaw easing
toward travel**. It is right about east and west and **wrong about
south, which is the case it was written for**, and the geometry is not
close: the camera trails the walker on the +Z side, and yawing the rig
twenty-six degrees about the walker leaves it on the +Z side. Southward
travel is travel **at the lens**, and no bounded rotation puts a lens
behind itself. Only a free orbit does, and a free orbit is refused
because a paper cutout seen forty-five degrees off-axis is 71% of its
width and this world stops being paper.

So the shipped answer is two components, split by what the walker's
travel is doing to the frame:

> **The part of your travel that CROSSES the frame turns the camera.
> The part that comes AT THE LENS opens the ground at your feet.**

And the split is not tidiness — **it is what removes the wobble.** Point
a camera at the travel bearing and clamp it and due south is a coin toss
between +26° and −26°: a walker weaving either side of the king's road
flips a fifty-two-degree pan back and forth, and no spring constant
fixes a discontinuity. Both components here are continuous everywhere on
the circle, and both are exactly zero for a walker standing still —
which is the clause six WOWED verdicts hang on.

### Shipped

- **THE YAW, and its envelope, which is a number with a reason beside
  it.** 26° desktop, 12° portrait, in `App.CAM` with the standee table
  written above it: a cutout narrows by its cosine, 26° is 90%, 30° is
  survivable, and past about 35° the paper metaphor does not degrade, it
  FAILS, and it fails looking exactly like a bug. **Portrait's is half
  for a different reason** — its frame is **26.5° wide across** against
  desktop's **68.6°**, so the same yaw slides the page nearly three
  times as far. That figure is now written into §8, because every
  portrait rule in this project is a consequence of it and none of them
  had ever stated it.
- **THE ASTERN OPENING, which is what actually answers the walk south.**
  Travel toward the lens makes the camera **give ground**: 5.5 units
  further back and 1.6 lower on the aim, which pitches the page up and
  lays the road the walker is entering out below them. It is
  `riseBack`'s own trick — reveal by DISTANCE, never by pitching the
  subject out of frame — pointed the other way. **The defect in units of
  page:** the bottom edge of the shipped frame meets the ground three
  and a half units in front of the walker, which is eight tenths of a
  second of warning. Live it is **17.5 units**, or three and a half
  seconds.
- **THE PEEK** — `,` and `.` held (the only pair on a keyboard already
  engraved as left and right, and clear of the walking hand, so E stays
  interact), two fingers dragged on a phone, springing back on release.
  **It takes the yaw over rather than adding to it**, so nothing in this
  game — travel, gesture, a road that carries, all at once — can put the
  camera past its rig's envelope. A second finger on the glass cancels
  the walk outright: two fingers are a look, one is a walk, and nothing
  on screen has to say so.
- **THE LEAD**, capped in UNITS per rig rather than held at a number of
  seconds, because portrait's frame is three and a half units wide where
  the walker stands and a lead written in seconds walks them off the
  side of it at a run.
- **`riseAhead` now probes up the LENS's bearing**, which is the first
  session in which "ahead" and "north" are different questions. Probe up
  the walker's travel instead and somebody crossing a valley sideways
  retreats from a hill that is off-camera.
- **AND THE OLDEST VISIBLE DEFECT IN THE GAME IS CLOSED.** It landed
  here because a turning camera moves every label relative to the thing
  it labels: fix it anywhere else and you are fixing it against a
  relationship that is about to change.
  - **THE SKYLINE.** Every standee records its top into a four-unit grid
    as it is built — `ctx.standee` is the single choke point all 163
    one-off stand-ups in this game go through — so a name is written
    above the tallest thing under it instead of at a flat 3.4 units over
    the dirt. "THE CROSSROADS" had been printing across the middle of
    its own 4.7-unit signpost since Session 1. **It is a system and not
    thirty authored numbers**, so it fixes the labels five unbuilt lands
    have not authored yet.
  - **And a screen-space pass.** Labels never land on each other, on the
    prompt, or on the chrome (the HUD buttons and the region card, which
    the world's writing had never heard of — in portrait THE MARKET
    CROSS was lettered straight through `map` and `sound: on`). When two
    collide the FARTHER one goes **up, never sideways**: a caption slid
    sideways is a caption on a different place. And **a name with
    nowhere legible to go is not written at all**, which is the right
    answer and also the honest one.
  - **The prompt moved too** — beside the thing, past its edge as the
    skyline reports it, on whichever side the walker is not. Not toward
    the lens: the thing between the lens and a place you are interacting
    with is usually the walker, and the first version of the fix
    lettered LOOK DOWN THE WELL across their chest.

### And the proof, which was the other half of the session

- **`tools/diff-sheets.mjs` — A REGRESSION IS A DIFF AND NOT AN
  OPINION.** §2 has asked for this since 2026-08-30 and it is a tooling
  requirement nobody had built. It builds a base git ref and the working
  tree, serves both, shoots the twenty-three framings that carry the six
  WOWED verdicts at two hours in both viewports through an identical
  protocol, and counts the pixels that moved — **separating THE PAGE,
  which may not move at all, from THE WRITING OVER IT**, which moves
  whenever a label is deliberately re-placed. One run says both "nothing
  in the world moved" and "these names moved, on purpose, and here they
  are".
- **THE HARNESS OWNS THE CLOCK, and that is the part that makes it
  work.** Two shots of one framing in this project were never the same
  picture, and the reason is not the renderer. FOUR clocks move between
  two shutter presses and every one of them is in every pixel: the paper
  pass's grain and its hand-drawn wobble (hashed off `uTime`, re-seeded
  three times a second — **a one-pixel random resample of every ink edge
  in the frame**), the standee wind, and the ink-in cascade at 34 units a
  second.
  **And then the diff found the two nobody would have guessed.** The
  first run came back with fifty-three differing pixels in a
  fourteen-by-thirty-seven box in the middle of an otherwise identical
  frame, and the box was **the walker's own quiet breath** — eight parts
  in a thousand of its height, a third of a pixel, exactly enough to
  redraw an outline. The second came back with eighty-three of
  ninety-two framings bit-identical and the nine that were not were **all
  four coast framings at both hours**: the sheet's own shader animates
  **the water** off a clock that accumulates from page load and is reset
  by nothing. Neither is visible. Both make a pixel comparison
  meaningless. All five are pinned by `__inklands.setTime`, and
  `__inklands.step` runs a stated number of fixed ticks and renders only
  the last.
  **The settle is now stated in GAME SECONDS and costs one frame**:
  twelve game seconds takes 130–400 ms instead of seventy seconds of
  wall clock, and two runs of a framing come back **bit-identical**.
  That single change is worth more to this project than the camera is:
  every sheet from here can settle past the ink-in cascade, drive the
  walker hundreds of units, and still be repeatable.
- **`tools/check-camera.mjs`** asserts what a photograph cannot: the
  envelope never leaks (72 readings per viewport, travel and peek
  together); the bearing is continuous round the whole circle of travel;
  due south picks no side; a stopped walker reaches **exactly** zero in
  2.5 game seconds; the walk south is measured **in units of page**, by
  firing the frame's own bottom edge at the terrain; and
  `setBearing(false)` pins everything, which is what keeps every
  protected sheet reproducible.
- **`tools/shoot-bearing.mjs`** — the first contact sheet in this
  project that is not a set of stand-stills. Every walk is shot TWICE
  from the same start: PINNED, which is the page as it shipped, then
  LIVE. The pairs sit next to each other in the listing on purpose.

### State
- Build green. `check-terrain` passes, unchanged. `check-audio` passes,
  unchanged. `check-camera` passes (new). `diff-sheets` — see the
  numbers in `critique-camera-1.md`.
- **No geometry, no layout, no elevation, no texture, no region file was
  touched**, except `regions/index.ts` gaining the skyline recorder.
- `shoot-lib.mjs` now **pins the bearing by default**; a sheet opts in
  with `shoot({ bearing: true })`.
- **Gate: WOWED** after 3 rounds (`design/critiques/critique-camera-1.md`,
  verbatim), plus the two machine gates.
- **AND THE NUMBER THE WHOLE SESSION IS FOR: `diff-sheets` returns
  92 OF 92 FRAMINGS BIT-IDENTICAL ON THE PAGE.** Not within a threshold
  — zero pixels moved, in the twenty-three compositions that carry six
  WOWED verdicts, across six lands, at noon and at dusk, on a monitor
  and on a phone. Fifty of the ninety-two differ once the world's own
  writing is put back, and every one of those is a name or a control
  that moved on purpose.
  **The baseline is a CONTROL BUILD** — a local commit off `2ed1147`
  with the shipped camera, the shipped labels and every clock pinned —
  because the pins are part of this session's own change and a base
  without them could never have proved the four coast framings anything.
  The recipe is in the critique. **From Session 10 it is unnecessary:**
  `origin/main` will carry all five pins, so `node tools/diff-sheets.mjs`
  with no arguments is the tight run from here on.
- **AND ONE GATE IS THE OWNER'S, and this session could not run it.**
  A camera is not a picture. Every number above can be asserted and not
  one of them is the question, which is **whether it helps or whether
  the world wobbles** — a thing a person feels over minutes of walking.
  The walk-south capture is the evidence, every station shot twice so it
  is a comparison rather than a cold judgement. QUALITY-BAR §2 now
  carries this as a standing rule beside the ear gate.

### And what the sheet and the diff sent back

Three findings came off the first bearing sheet and the first regression
run, and all three are logged in `critique-camera-1.md` with the fixes:
**the water clock** (above); **the prompt could be lettered off the edge
of the frame** — "READ THE SIGNPOST" read "D THE SIGNPOST", because the
screen-space nudge was applied after the viewport clamp; and **the clamp
is a nudge and not a parking space** — it had been taking places BEHIND
the camera and lettering their names into the corner of the frame, so
THE CUT sat across the bottom-right of the coast sheet like a watermark.
A label that is not really in the picture is no longer written, which is
the rule the collision pass already followed.

**And the last unseeded randomness in the drawn world went with them:**
one `Math.random` deciding how far down the beach LONGSHORE's gull flock
settles. Every flight still carries them a different distance; it is now
the same different distance every time you walk it.

### Gotchas (new; Sessions 1–8 all still apply)
- **THE GRAIN IS A CLOCK.** `PaperPass`'s `uTime` drives a per-pixel
  hash that resamples the frame by up to a pixel and re-seeds three
  times a second. Any pixel comparison between two frames is meaningless
  until it is pinned. It is the single largest source of noise in this
  renderer and nothing had ever noticed, because nothing had ever
  compared two frames.
- **AND SO IS THE WALKER.** `Character.idleT` accumulates from page
  load, not from anything the harness controls. Anything that has to be
  reproducible resets it (`Character.setClock`).
- **A SETTLE IN MILLISECONDS IS A LIE IN THIS SANDBOX.** Three and a
  half frames a second with `dt` clamped at 0.05 means a 900 ms settle
  is four frames — a sixth of a second of game time, against an ink-in
  cascade that takes eight seconds to cross a land. Every framing shot
  before Session 9 was shot on a page that was still drawing itself.
- **`check-terrain.mjs` DELETES `.tmp/` WHEN IT FINISHES.** Anything
  else keeping scratch files there loses them mid-session. (The
  `.tmp/`-can-vanish note in Session 8 was this, and now it has a
  cause.)
- **A CAMERA THAT EASES TOWARD A BEARING HAS A DISCONTINUITY AT THE
  ANTIPODE**, and it is not a tuning problem. If a later session ever
  reopens this: the fix is not a spring, a deadband or hysteresis, it is
  not asking the question that way.
- **AN EXPONENTIAL EASE NEVER ARRIVES**, and neither does a
  decelerating walker: the snap-to-zero has to test what the camera is
  being ASKED for, not whether the ask is exactly nothing, or it never
  fires and a stopped walker is never quite in the shipped composition.
- **A PINNED CONTROL MUST NOT BE NUDGED.** The interact prompt is
  floated on a wide screen and PINNED centre-bottom on a tall one; the
  first version of the prompt-placement fix applied its screen-space
  offset to both, and moved a thumb target.
- **`getComputedStyle(el).opacity` is how you ask whether a faded-out
  overlay is really there.** A hidden HUD still has a bounding box.
- **AND A CSS SELECTOR IN A HARNESS IS UNTESTED CODE.** The first
  regression run hid `#labels` — which is a CLASS, not an id — so it
  matched nothing, and every deliberately re-placed label was silently
  scored as a regression of the world. A hiding selector that matches
  nothing looks exactly like a hiding selector that works.
- **THE ONLY HONEST BASELINE IS A CONTROL BUILD.** The regression diff's
  base has to differ from the head in ONE thing. `2ed1147` could not pin
  the water clock, because that pin is part of this session's own change,
  so the four coast framings could never have been proved unchanged
  against it. The final run is against a local commit off `2ed1147`
  carrying the clock pins and nothing else — the shipped camera and the
  shipped labels, fully pinned.

## Session 8 — 2026-08-30 — the score

*A systems session, and the first one whose product cannot be
photographed. `WORLD-SYSTEMS.md` §9 was the architecture and this
session did not re-open it: it built the two missing voices, gave
twelve lands an instrument and a room, made the border a crossfade —
and then spent its second half on the part nobody had ever done in this
project, which is WORKING OUT HOW ANYBODY KNOWS.*

### Shipped

- **THE INSTRUMENT BOX IS FIVE VOICES AND THEY ARE FUNCTIONS.** The
  enabling refactor, taken first exactly as the brief advised: a voice
  is `(ctx, dest, freq, t0, opts)` and never touches `this.ctx`,
  `currentTime` or a timer. That is what makes an offline render
  possible at all, and it is half an hour done in that order.
  - **THE PLUCKED STRING** — Karplus–Strong, and it is **rendered into
    a buffer rather than wired as a delay fed back on itself**, for one
    hard reason: *a feedback cycle in Web Audio is floored at one render
    quantum (128 samples), so a wired version cannot play a note above
    about 340 Hz* — and half this world's scales live above that. It is
    also cheaper: half-rate, one buffer per pitch, seeded FROM the pitch,
    so every string is its own string and it is the same string every
    time you pluck it. Variation comes from the hand: a few cents of
    playback rate and a different body.
  - **THE BOWED VOICE** — a saw through a resonant lowpass, and the
    ATTACK is the whole instrument. Everything else in this box starts
    at its loudest; this one arrives.
  - **And §9's own arithmetic was off by one** — two voices left, not
    three. Fixed in §9 while passing.
- **TWELVE LANDS, FIVE INSTRUMENTS, FIVE FAMILIES** (`LAND_VOICE`,
  authored as a table beside `MOODS` with instrument, register, trim and
  **the reason in one line each**). What you wake to is the music box
  (THE COMMON and MAPLE COURT, an octave apart); what grows is the
  plucked string (THE PENWOOD damped and dark, THE HARROW DOWNS the same
  wood out in the light); what was cast and hung up is struck metal
  (BRIM'S belfry, the buoy on the mark, and struck stone in SPLITROCK);
  what stands still is the bowed voice (GREYWEATHER, and THE CUBICLE
  MILE, which is the same held voice **on hold**); and what moves
  without being touched is air (the sea at LONGSHORE, warm air off a
  grating in GREYLINE CITY, and the top of the page in THE BLEACH
  FLATS). **The world plays it** — §9's decided source — so every one of
  those is a thing that is actually there.
- **A BED PER LAND** (`BEDS`): the room, with what it is made of, whether
  it breathes, and how much of it there is. The canyon is **14 dB below
  the sea** and every bed measures under the land it is the room of,
  which is what "the quietest thing in the mix" has to mean to mean
  anything. Plus `TAILS` — one shared delay, mixed per land: **the cut
  answers you back and a field does not.**
- **A BORDER IS A CROSSFADE**, equal power, three and a half seconds, on
  the room AND on the instrument: for those seconds the phrase is played
  on both lands' instruments at the fade's own weights. **A crossfade of
  instruments, not of tunes** — two tunes at once is a mistake, one tune
  changing what it is played on is a border. The card, the footstep and
  the mood fire exactly as they did.
- **THE MIX IS A PURE FUNCTION** (`mixLevels`), so the two seams Session
  6 left open have somewhere to arrive: how hard the player is going and
  what time it is, in one place, and the class ramps toward it. **The
  day cycle was not re-opened**; eight in the morning to four in the
  afternoon is still bit-for-bit the shipped page and `check-audio`
  asserts that it is.
- **AND THE PROOF, WHICH WAS THE HARD HALF AND THE INTERESTING ONE:**
  - **`tools/check-audio.mjs`** renders every land through an
    `OfflineAudioContext` in headless Chromium and asserts what a
    listener would notice. **It found four real defects** (§1 of the
    critique), and one of them is the reason the tool was worth
    building: **every border in the game had a 3 dB swell in the middle
    of it**, because two beds built from the same noise buffer at the
    same offset are not two rooms, they are one signal played twice, and
    an equal-power fade between two identical signals peaks at √2.
    Inaudible as a fault, obvious as a wrongness, and nothing but a
    meter was ever going to find it.
  - **`tools/verify-score.mjs`** does the half a renderer cannot: the
    class's own wiring, live, with a real context — fifteen crossings,
    then **five crossings inside one three-and-a-half-second fade**,
    which is the case that puts an AudioParam into a state Web Audio
    throws on.
  - **`tools/shoot-sound.mjs`** — **SHOOT THE SOUND.** Every land's
    waveform and spectrum drawn with `src/engine/ink.ts`, the room in
    pencil under the land in ink (the map's own two registers), on ONE
    shared decibel window so a quiet land looks quiet. Twelve lands are
    visibly twelve sounds, and a second sheet plots three borders
    against the curve the fade is supposed to follow.
  - **`tools/render-wavs.mjs`** — nineteen files, one uniform gain,
    never a per-file normalisation, plus `WHAT-TO-LISTEN-FOR.txt`.
- **AND THE GATE THIS SESSION COULD NOT RUN.** The score has been
  rendered, measured, plotted and asserted. **IT HAS NOT BEEN HEARD, by
  anybody.** A spectrum is not a listen and a plot is not a judgement.
  The ear gate is the owner's, the evidence is in `out/sound/`, and this
  is now written into QUALITY-BAR §2 as the standing rule for any system
  whose product is not a picture.

### State
- Build green. `node tools/check-terrain.mjs` passes, unchanged.
  `node tools/check-audio.mjs` passes (new). `node tools/verify-score.mjs`
  passes (new, needs `vite preview`).
- **No geometry, no layout, no elevation, no texture, no region file was
  touched.** The diff is `src/core/Audio.ts` plus four new tools and the
  documents. Six protected lands re-shot at **two hours** (`HOUR=12`,
  `HOUR=19.6`) in both viewports and unregressed — and this session's
  regression pass is supposed to be boring, because the world did not
  change and nothing ambient draws.
- Two dead private helpers went with the rewrite (`thump`, `burst` —
  inherited from margins, never called by anything INKLANDS ships).
- **Gate: WOWED** after 3 rounds on the sound sheet
  (`design/critiques/critique-score-1.md`, verbatim), plus the machine
  gate, and the ear gate **handed to the owner unperformed**.
- **AND THE STORY GATE RAN, beside this session, because there was room
  at the end and it needs no build** (`critique-story-2.md`). It
  returned **NOT YET** with two mandatory findings, and both are about
  delivery rather than about the story: **Act I's second and third facts
  have one teacher between them and it is optional and directional**
  (everything downstream of *nobody can leave* and *you can* hangs on
  Nell stopping at the Brim border, which only happens to a player who
  walks north having met her — the co-walker wants to be a rule of the
  world on any road, not a scripted beat on one); and **the ending's
  default witness sees exactly one of the twelve stops**, with nothing
  guaranteeing it is a land they answered, so the likeliest single
  ending in the game is a train stopping at an empty platform. The
  8:15 stops in ORDER from the north, so it can arrive already carrying
  the lands above you, visible through the windows — no new content, no
  clause of `THE-LINE.md` §5 touched. Three more findings are
  recommended rather than mandatory, including that **§3.2's rim
  composition is the riskiest un-shot frame in the game and Session 11
  should shoot it FIRST, not last.** The critic is a proposal until the
  owner rules, like the STORY EDITOR before it.

### And one thing the owner found, which was not this session's
- **BRIM'S PIGEONS HAVE BEEN FLYING UNDER THE SQUARE SINCE SESSION 4.**
  Owner, 2026-08-30: *"the birds in the kingdom of brim are disappearing
  when you move close to them, whereas they used to fly away from you."*
  They were. `civic.ts` keyed the flight arc to **y = 0** — correct in
  Session 3, when the sheet was flat and zero was the flagstones.
  Session 4 gave the page a shape and **Brim Square went up to y = 3.55**
  (measured at all five roost positions: 3.50 to 3.62). The arc peaks at
  2.3. So from the instant a bird was put up it was below the paving for
  the whole of its flight: down three and a half units through the
  square, along underneath it, and back up on landing. One term fixes
  it — the arc is above the GROUND, not above zero — and every other
  flying thing in the game (the swifts, the rooks, the swallows, the
  gulls) was already ground-relative.
  **Photographed both ways**, same framing, same drive: before, nothing
  in the air; after, a bird above the paving.
  **And why five sessions of contact sheets never caught it: every
  framing this project owns is a STAND-STILL, and this bird is only
  wrong while it is moving.** The old-world sheet gains
  `07b-pigeons-put-up`, driven into the roost — worked numbers, not
  guessed ones: east of the market cross, because at x −44 the camera
  ends up inside the fountain, and an eleven-second hold, because a
  1.5-second flight at a sixth of game speed needs nine.

### Gotchas (new; Sessions 1–7 all still apply)
- **AN OFFLINE CONTEXT RENDERS A GRAPH, NOT A SYSTEM.** Anything that
  reads `performance.now()`, schedules off `setTimeout` or waits on
  `currentTime` advancing renders SILENCE. That is why `phrase()` takes
  its start time as an argument and why the class's scheduler is never
  involved in a render.
- **AND A SUSPENDED CONTEXT'S CLOCK DOES NOT ADVANCE.** A live audio
  check in headless Chromium needs
  `--autoplay-policy=no-user-gesture-required`, or every ramp sits at
  its start value and every assertion is a lie that passes.
- **A FEEDBACK CYCLE IN WEB AUDIO IS FLOORED AT 128 SAMPLES.** Any
  DelayNode inside a loop cannot be shorter than one render quantum, so
  wired Karplus–Strong is capped at about 340 Hz. Render it instead.
- **A GLSL COMMENT INSIDE A JS TEMPLATE LITERAL STILL MAY NOT CONTAIN A
  BACKTICK — AND NEITHER MAY A JS ONE.** Sessions 5 and 6 did it in
  shaders; this session did it in the in-page render harness, in a file
  whose header comment warns about it. **Third time.**
- **MEASURE LIKE WITH LIKE, OR THE METER LIES.** Half the first round of
  `check-audio` failures were the test's fault, not the score's: the RMS
  of fifty milliseconds of noise bounces two decibels on its own, so
  comparing a windowed minimum against a long average reads a hole that
  is not there. Every reading in that file is now a half-second average,
  which is also about how long an ear takes to decide something got
  quieter.
- **A ROOM THAT BREATHES MOVES ON ITS OWN.** The sea's bed swells 3.7 dB
  over its own seven-second count, so a crossfade assertion has to
  measure each land's solo wander first and allow it. That much is
  weather; the crossfade does not answer for it.
- **A "LEVEL" IN A TABLE IS A SOURCE GAIN, NOT A LOUDNESS.** A bandpass
  passes a fraction of what you put in it, and the fraction depends on
  the filter — so `air` at the same nominal gain as `box` was 18 dB
  quieter. Every number in `LAND_VOICE` and `BEDS` was MEASURED into
  place, and `check-audio` re-measures them so they cannot drift.
- **`.tmp/` can vanish mid-session.** A background command redirecting
  into it dies instantly; every tool here `mkdir`s it, but a shell
  redirect will not.
- **AN ANIMATION WRITTEN BEFORE THE PAGE HAD A SHAPE IS A BUG NOW.**
  The pigeons are the second time this has bitten (the flat ground was
  the first, and it cost a critique round). Anything positioned with a
  bare number for y was written against a flat sheet: **grep the region
  files for a `position.y` or a `position.set` with no `groundY` or
  `heightAt` term in it before trusting any of them.** Today exactly one
  line was wrong, and it had been wrong for four sessions.
- **EVERY FRAMING THIS PROJECT OWNS IS A STAND-STILL**, and a whole
  class of defect only exists while something is moving. Session 6 had
  to drive the sprint and the oars to photograph them at all; the
  pigeons are the first time a stand-still sheet actively HID one. A
  land with motion in it wants at least one driven framing.
- `Audio.ts` gained ~15 exports (`MOODS`, `VOICES`, `LAND_VOICE`,
  `BEDS`, `TAILS`, `phrase`, `buildBed`, `mixLevels`, `equalPower`,
  `crossfade`, `XFADE`, `srand`, `nightnessAt`, `playedBy`, `toneAt`).
  `setAmbientLevel` changed meaning: it is now a 0..1 multiplier over
  the bed's own level rather than an absolute gain. Nothing calls it
  yet (it is the Blot's, parked).

## Session 7 — 2026-08-30 — the stories

*The story was LOCKED before this session started (`design/STORY.md` —
THE 8:15) and its architecture was WRITTEN (`design/QUESTS.md`, six
tiers). This session did not invent either. It MAPPED the first, BUILT
the one system the second requires, AUTHORED one vertical slice of it,
and FIXED THE VOICE — which turned out to be the biggest job in the
session and the one the whole project had been quietly failing at since
Session 1.*

### Shipped

- **THE LINE, MAPPED BEAT BY BEAT** (`design/THE-LINE.md`). Four acts,
  every beat with where it lives, what the player sees, what fires it,
  and the column that matters — **what it does not say**. Two things in
  it are decisions rather than notes, and both were this session's to
  make:
  - **Where a person stands for Act III**, and the honest version of it.
    The line is 480 units end to end; the camera only ever looks north;
    the highest walkable ground on the line's own axis is the south curl
    at (−45, 278), y 7.3, which opens the haze to 201 units. **So the
    whole line cannot be seen at once, and that is better** — from the
    best seat in the world you get two hundred units of dead straight
    empty road going away into haze. *You cannot see where it ends. You
    can see that it does not stop.* The king's road's last authored
    point is z 262 and the rim's crest is z 284: **the road has stopped
    sixteen units short of the edge of the world since Session 1 and
    nobody ever said why.** Now it has a reason, and nothing in the game
    will ever mention it.
  - **THE ENDING, settled.** `STORY.md` §6 flagged it as a proposal and
    handed it to the session that maps the stories. Three changes, all
    argued in `THE-LINE.md` §4.5: the 8:15 **stops twelve times** rather
    than gathering everyone on one platform (they cannot reach it —
    rule 1 of §8 is the engine of the whole story and an ending that
    broke it would retract the game in its last minute); **there is no
    final choice**, because whether anybody is on each platform is the
    consequence of fifteen hours; and the turn lands **on the train, in
    silence**, which is the only frame in the game that can hold two
    lands at once. Joan Harrow is not on it, exactly as proposed.
- **THE TWELVE WAITS** (`design/THE-WAITS.md`). One per land, each with
  its named person, its two or three places that mean something
  different once you know, **its turn**, and its visible permanent
  change. Four were thrown away and rewritten because the first draft
  was a mood rather than a turn. Four new names — VAL, HOLT, AMOS,
  WREN — in the east-by-south register. And **one mechanism for all
  twelve**: a wait resolves when the player, holding the right
  knowledge, arrives at the right place. Nothing asks them, nothing
  confirms it, the world simply does the thing.
- **THE EIGHT STRANGERS AND THE THREE INVENTORIES**
  (`design/THE-STRANGERS.md`). Cross-land, met in one place and resolved
  in another; the very funny one is **THE STANDING COMPLAINT** (a sealed
  grievance about the belfry clock, carried to Greyweather, received
  with total ceremony and nailed up beside a proclamation already
  weathered past reading — the procedure followed exactly, everybody
  satisfied, nothing whatsoever having happened) and the genuinely
  upsetting one is **THE ELEVEN UNITS**. Then ~20 errands, ~28
  encounters and 31 unmarked, as **one-line inventories**, which is the
  format and not a placeholder.
- **KNOWLEDGE AS THE CONTENT SYSTEM** (`src/world/knowledge.ts`,
  WORLD-SYSTEMS §6). A **NAME**, a **FACT**, a **ROUTE**, a **REASON**,
  every id a phrase a human could read out, and a region asks
  `knowledge.has(...)` in the present tense — *does the walker know
  this* — rather than being told which stage of which quest is done.
  **There is no count anywhere**: the class has no `size`, nothing
  computes a length, and the only reader of the raw set is the save
  file. Saved as `Save.data.known`, the way `boat` and `hour` were added
  last session.
- **ROUTES are the one kind of knowledge nobody in this world could
  tell you**, because nobody crosses a border and the line crosses
  eleven. So they are walked off authored posts — on foot or under oar,
  because rowing the river IS walking it for this purpose — and the
  progress survives closing the tab.
- **THE MAP IS THE RECORD.** Three registers instead of two: a question
  mark for what you have never heard of, the name in **pencil** with a
  rule under it for a place somebody named to you, the name in **ink**
  for a place you stood in. The crossroads signpost names three lands in
  its first sentence and has done since Session 1; it is worth something
  now. **And the line:** walk the king's road, main street and the
  commuter spur end to end and the map stops dashing them and draws one
  continuous stroke from a castle gate to a car park, with the other
  eight roads still dashes around it. **There is no caption.** That is
  Act III's reveal, delivered by cartography.
- **BRIM'S WAIT, END TO END** — the vertical slice. **MARGET** sets the
  stall out at dawn, lays the cloth, does not open, and packs it away at
  dusk, straight off Session 6's clock. The belfry's two hands have
  disagreed for as long as anybody can remember and **now they disagree
  about something specific**: one points at eight, which is the hour
  Brim's lamps actually come on, and one points at eleven. Stand in the
  yard while the lamps are lit and one of them agrees with them. Take
  that to the market cross and the bell rings the hour it actually is:
  **the cloth comes off, the awning goes up, and a board is chalked at
  the cross that stays there at every hour afterwards, forever.**
- **AND BRIM GOES HOME.** `StandeeField.setDim` — one multiply over a
  whole field — takes the square's sixteen folk off the page overnight.
  A square with sixteen people standing in it at three in the morning
  makes one woman packing her stall away look like a bug rather than a
  day. Last session's lamps made the LIGHT change; this makes the PLACE
  change, and it costs six lines.
- **THE VOICE PASS, and the number was worse than anybody had said.**
  `STORY.md` estimated a third of thirty-five. The session brief counted
  17 of 33 with a grep. **Read aloud it is 24 of 34** — the grep looked
  for six phrasings and the offence has more ways to say itself than
  that (`a scribble`, `six lines old`, `the second stroke`, `the
  artist`, `the wash went over this page`). **Anybody auditing this rule
  again should read, not grep.**
- **AND THE SENTENCE THE WHOLE STORY HANGS ON:**

  > the timetable says the 8:15 is coming. **there is no track here, and
  > there is no track anywhere.** everyone waiting knows both of these
  > things and has made their peace.

  Same three beats, same cadence, third sentence verbatim. What changed
  is where the impossibility comes from — *"the 8:15 is drawn nowhere on
  this sheet"* is a claim only the narrator can make and no player can
  check; *"there is no track here"* is an absence at the player's own
  feet, and *"and there is no track anywhere"* is only knowable by
  somebody who has been everywhere, which in this world is exactly one
  person. **The line quietly became about the walker and nobody says
  so.** The full defence is in `design/critiques/critique-story-1.md`.
- **THE SIGNPOST'S FOURTH NAME.** It said HOME. `STORY.md` §4 says the
  Common's crossroads has four names on it and one of them is a TIME,
  and calls it the hinge Act II turns on — so the built game and the
  locked story disagreed and the story is binding. It says **8:15**, on
  the same board, in the same hand, at the same size, with no emphasis
  of any kind, and nothing anywhere refers to it.

### State
- Build green. `node tools/check-terrain.mjs` passes, unchanged.
- **`node tools/verify-story.mjs` — twenty checks, and it PLAYS the
  wait rather than poking it.** The contact sheet reaches both of a
  wait's states with `__inklands.learn(...)`, which is legitimate for
  photography and proves nothing about the game; this walks the chain a
  player walks. A fresh page knows only where it is standing; reading
  the signpost puts three lands into pencil and standing in one puts it
  into ink; the belfry yard at NOON teaches nothing and at DUSK teaches
  the hour; carrying that to the cross calls the market, and exactly one
  of the two stalls is on the page, and the board is chalked, and Marget
  is at her counter; **and all of it survives a reload.** Plus the line,
  walked post by post, because a route is the one kind of knowledge
  nobody can be told.
- **Frame cost unchanged.** Brim Square is 210 draws / 214k triangles
  with four more standees in it than Session 6 left (Session 6 recorded
  217 from a slightly different stand). THE COMMON is still the worst
  frame in the game.
- **No layout change**: no rect, no road geometry, no river, no bridge,
  no mood, no step zone. `Road` gained one authored flag (`line?: true`)
  on the three roads STORY §4 makes one road.
- **No elevation change.** This session added four standees to Brim
  Square and edited two textures.
- Six protected lands re-shot at **two hours** (`HOUR=12`,
  `HOUR=19.6`) in both viewports and unregressed. Session 3's
  square-wide framing now contains Marget's stall and is the better for
  it.
- New: `src/world/knowledge.ts`, `design/THE-LINE.md`,
  `design/THE-WAITS.md`, `design/THE-STRANGERS.md`,
  `design/critiques/critique-story-1.md`, `tools/shoot-story.mjs`,
  `tools/shoot-map.mjs`.
- **Gate: WOWED** after 3 rounds (`design/critiques/critique-story-1.md`,
  verbatim), plus the note read-aloud (PASS) and a **new critic, the
  STORY EDITOR, which is a PROPOSAL for the owner** — it read the twelve
  waits blind and named what each land believes, twelve for twelve,
  without once using the word.

### Gotchas (new; Sessions 1–6 all still apply)
- **KNOWLEDGE IS STICKY WITHIN A PAGE, AND A CONTACT SHEET IS ONE
  PAGE.** The first sheet of this session shot "Marget shut" with the
  awning already up, because the frame before it had learned why. Any
  script that photographs a wait at both states shoots **every** shut
  frame before the first open one.
- **A SILENT SYSTEM STILL HAS TO BE VISIBLE.** The map's pencil and ink
  registers were first separated by transparency alone, and the map is
  drawn at 940 and shown at about 690 — the difference did not survive
  the scale. Three signals, not one: the ink goes heavier, the pencil
  goes lighter AND greyer AND thinner. If a register does not read, the
  system does not exist.
- **A FACT THE PLAYER IS HANDED FOR BEING SOMEWHERE IS A FLAG. A FACT
  THEY CAN LOOK AT IS KNOWLEDGE.** Brim's belfry had two hands pointing
  at roughly one o'clock and roughly twelve, which is a wobble and not a
  disagreement. They point at eight and eleven now, and eight is the
  hour the lamps come on, and the whole of Brim's wait is two lines of
  geometry. **A stopped clock is right twice a day** — which is why
  fixed hands are the correct drawing and moving ones would have been
  wrong.
- **BRIM SQUARE HAS THREE RUNS OF BUNTING AND THE CAMERA TRAILS
  THIRTEEN UNITS.** Every framing that stands within about eight units
  of z −65, −81 or −96 hangs two enormous translucent triangles down the
  middle of the frame. Work out where the camera lands before shooting,
  not after.
- **A PROSE CHANGE CAN FALSIFY A DRAWING.** The crossroads note was
  rewritten to say "one arm pointing south", and the signpost has four
  arms, none of which points south. Either the note or the drawing has
  to move, and it is cheaper to check than to ship a game whose card and
  whose sign disagree.
- **`vite preview` started with `&` inside a compound bash command dies
  with the command.** Use `setsid` and a separate call, or every shoot
  after the first one hits a dead port.
- **ASSERTION VERSUS SIMILE**, and it is the line the medium rule
  actually draws. A note that says the world IS drawn has broken the
  rule; a note that compares a thing in the world to handwriting is a
  figure of speech, and this world has ink and pens in it as ordinary
  objects. Two lines survive on that distinction (riverbend's cursive,
  the tarn's "black as the good ink") and both are flagged to the owner
  in the critique as one-line changes if the ruling goes the other way.
- `layout.ts` gained `Road.line`. `Save` gained `known` and `passed`.
  `StandeeField` gained `setDim`. `POI` note defs gained `learns`.
  `shoot-lib` gained `opts.learn`.

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

### Session 6.1 — mobile QA (same day, after a player's phone screenshot)

*The owner opened a note card on an actual phone and the text ran off
the side of the screen. It had been doing that since Session 1.*

**The gap it exposed is the important part: NO SHOOT SCRIPT HAD EVER
OPENED A NOTE CARD.** Five sessions of contact sheets photograph the
WORLD; the note, the region card, the hint and the interact prompt are
the half of this game the player READS, and they were being judged by
nobody. `tools/shoot-mobile.mjs` is the fix — the chrome, at 320, 360,
390 and 430 points, with the longest note and the longest land name in
the game — and it found six more defects on its first run.

- **The note card's text is wrapped to the CARD, measured.** It was
  lettered to a constant 380 points; `max-width: min(460px, 92vw)` on a
  390-point phone is 359 less padding, so every line but the last ran
  off the screen mid-word. Hand-lettering is drawn to a canvas and a
  canvas does not reflow, so the wrap width is a MEASUREMENT, not a
  style — and it must measure the space available, not the card, which
  is a flex item that shrinks to its contents (measuring the card wrapped
  every note to the width of the words "put it back").
- **And the type is sized so the longest note fits the narrowest phone
  without scrolling.** Wrapping alone just turned the overflow
  vertical: at 320 the same note became eleven lines and ran off the
  bottom. A note is one card you read at a glance; the moment it needs
  a scrollbar it is a document.
- **Nothing from the world draws through an open card.** `POI.suppressed`:
  the interact prompt was being lettered across the walker *underneath*
  the note veil — it is in the owner's screenshot.
- **On a tall screen the interact prompt is PINNED low and centred**,
  not floated over its subject. Session 4 floored it at 42% for thumb
  reach; the other half only shows on a device — the walker sits two
  thirds down a tall frame and a POI you are standing on projects to
  exactly there, so the prompt landed on the walker's head and on the
  POI's own label. Labels still float; a label is a caption, the prompt
  is a control.
- **The region card and the hint wrap to the viewport.** CASTLE
  GREYWEATHER in 24pt display caps is wider than a 320-point phone.
- **The map's lettering is sized for its DELIVERED size.** The map is
  drawn at 940 and CSS-scaled to `min(92vw, …)`; at 320 that is a 3.2×
  reduction and eleven-point land names arrived at three and a half.
  Capped at 2.2× — writing bigger than the geography is a legend, not a
  map — and the boast line is clamped to the sheet it is written on.
- **The title gets a margin**, the note card a `max-height`, and the
  joystick's RUN state now reads on the ring rather than by inking the
  nub, because the nub is under the thumb and the thumb drags up toward
  the walker.
- **`showTitle` no longer fires over a game already begun.** A loader
  tween that finishes late (this sandbox, at 3.5fps) lettered the title
  back over a running game.

### Gotchas (new; Sessions 1–5 all still apply)
- **THE CHROME IS HALF THE GAME AND IT WAS NEVER IN A CONTACT SHEET.**
  Everything the player reads — note, region card, hint, prompt, map —
  lives in the DOM as lettered canvases, and a canvas does not reflow.
  Every one of them needs a width that is MEASURED at the size it will
  be delivered at. Shoot them (`tools/shoot-mobile.mjs`) or they break
  in silence.
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
