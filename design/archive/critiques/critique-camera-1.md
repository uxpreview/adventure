# Critique — THE BEARING

*Session 9, 2026-08-30. The art-director gate per `QUALITY-BAR.md` §2,
run on real screenshots from the running game, **desktop (1280×720) and
portrait (390×844)**, at two hours of the day — plus two machine gates,
which are new, and one gate that is the owner's, because no tool in this
repository can perform it.*

**Under review:** the camera's bearing — a yaw that answers travel
crossing the frame, an astern opening that answers travel at the lens,
the peek, and the lead — and, because a turning camera moves every label
relative to the thing it labels, the POI labels and the interact prompt.
Plus the six lands holding a WOWED, judged for regression **by a diff
rather than by an eye**, which is the first time in this project that
sentence has been true.

**Standing brief:** *rejects anything that looks procedural,
placeholder, or like a tech demo wearing a style. Blind against Gris,
Sable, and margins itself. The bar: they cannot tell which world had an
art budget.* A WOWED land that the bearing regresses is this session's
problem to fix, not to note.

**And a sheet built differently.** Every framing this project owns is a
stand-still, and a camera that answers TRAVEL cannot be judged in one.
So `tools/shoot-bearing.mjs` is built out of WALKS, and every walk is
shot **twice from the same start** — once with the bearing PINNED, which
is the page exactly as it shipped, and once LIVE. The pairs sit next to
each other in the listing on purpose: the question is never "is this a
good frame", it is "is it better than the one under it".

---

## Round 1 — NOT YET

> "The walk south is real, and I did not expect to be able to say that.
>
> Take the pair at Brim Square. In the shipped frame the walker is four
> fifths down the page with their own back to me, a house filling the
> left third of the frame at the size of a wall, and NOTHING under them
> — they are walking into the bottom edge. In the live one the house has
> let go and reads as a house, the walker is halfway up, and the square
> they are walking into is laid out below them with their own prints in
> it. That is not a camera tweak, that is a shot where there was not one
> before.
>
> **And the pair walking east off the crossroads is the best thing in
> the sheet.** The shipped frame is a man walking out of the side of the
> picture. The live one turns the whole page so he is walking INTO it,
> with Brim's gate swung round to the left where he came from and open
> meadow ahead of him. What I care about most: at twenty-six degrees the
> signpost, the town wall and the gate are all still PAPER. I went
> looking for the stack-of-card failure and it is not there.
>
> Three things stop it.
>
> **You have lettered a control off the edge of the frame.** Walk east
> of the signpost and the prompt reads 'D THE SIGNPOST'. Whatever you
> did to push the words away from the post you did after the thing that
> keeps them on the page.
>
> **And you have signed the coast like a watermark.** THE CUT is
> lettered into the bottom-right corner of the beach frame — not near
> the cut, not over the cut, in the corner, because the place is behind
> the camera and something clamped it. A name in a corner is a caption
> on nothing.
>
> **The proclamation is still printed across the barbican.** I know it
> was printed across the barbican before. You have gone and fixed every
> name in the world so it clears what it names, and then left the
> biggest gate in the game with its own prompt written down the wall."

**Mandatory:**
1. A control may not be lettered off the page.
2. A name that is not really in the picture is not written at all.
3. The prompt clears wide things too, or says why it cannot.

## Round 2 — NOT YET

> "All three fixed, and the third one honestly. The prompt steps out
> past the edge of a thing as far as the skyline says it needs, and on a
> gate eighteen units wide it stops at five and a half and stays inside
> the frame, which is the right call — it is a big grey wall and the
> lettering is legible on it. I would rather have that than a caption
> sliding across the page hunting for grass.
>
> But the regression diff is the thing I want to talk about, because it
> caught something I could not have.
>
> **Nine framings out of ninety-two would not reproduce, and every one
> of them was a coast frame.** The tool said so, in numbers, on the
> second run — and the reason is that the sheet's own shader animates
> the water off a clock nothing resets. Nobody was ever going to see
> that. Two frames of the same beach a week apart are two different
> pictures and always have been, and every 'unregressed' this project
> has ever claimed about LONGSHORE was a person looking at two of them.
>
> That is what a gate is FOR, and it is why I am not signing this off
> until the number is clean."

**Mandatory:**
1. The water is a clock. Pin it, and re-run.
2. And the flock: one `Math.random` in the drawn world is one too many.

## Round 3 — **WOWED**

> "Yes. And I want to be precise about what I am saying yes to, because
> two of the four things in this session are not pictures.
>
> **The bearing helps and the world does not wobble** — as far as a
> photograph can tell, which I will come back to. Walking east or west
> you are now walking into the frame instead of across it. Walking south
> you have a page in front of your feet where there used to be an edge:
> at Brim, on the Common, and at the road head, which is a land nobody
> has authored yet and where the emptiness underneath the walker is
> Maple Court's fault and not the camera's. And standing still you are
> in the shipped composition, which I checked the only way worth
> checking it — the tool re-shoots every framing this project has ever
> protected and counts the pixels.
>
> **The envelope is the decision of the session.** Twenty-six degrees on
> a wide screen, twelve on a tall one, and the reason for each is
> written beside it — one off the cosine of a paper cutout, one off the
> fact that a phone's frame is a third the width of a monitor's and
> nobody in this project had ever written that number down. The peek
> takes the yaw over rather than adding to it, so there is no
> combination of gesture and travel that gets past the number. That is
> the difference between a constraint and a preference.
>
> **The labels are the quiet win.** THE CROSSROADS has been printed
> across the middle of its own signpost since the first session of this
> project, and the fix is not thirty numbers, it is that the world now
> knows how tall it is at a point and a name is written above whatever
> is standing there. Every land you have not built yet gets that for
> free. And the two rules under it are the right rules in the right
> order: the far label moves and never the near one, it moves UP and
> never sideways, and a name with nowhere legible to go is not written.
> A game that would rather say nothing than say it badly is a game with
> a voice.
>
> **What I am NOT saying yes to**, and neither should anybody reading
> this: whether it FEELS right. A camera is a thing you live inside for
> minutes at a time and I have looked at a hundred and two photographs.
> The sheet can tell you the walk south is better framed. It cannot tell
> you whether the swing toward travel is a relief or a distraction after
> twenty minutes, and no tool in this repository can either. That gate
> is the owner's and the session has said so in its log rather than
> quietly counting the machine gates as the whole verdict.
>
> WOWED. Go and build the farm and the forest — and lay them
> north–south, because nothing here changed that."

**Also noted, not blocking, for whoever takes them:**
- **The prompt on a very wide subject is still ON the subject.** READ
  THE PROCLAMATION is legible on the barbican's wall and it is not
  lettered over anything with detail in it, but it is a compromise and
  it is written down as one.
- **Portrait's twelve degrees is subtle**, and correctly so; the astern
  opening is doing most of the work in that viewport (5.7 units of page
  ahead becomes 11.6). If a later session ever wants more turn on a
  phone it needs a wider lens first, not a bigger envelope.
- **A region card raised by a harness teleport is not a card a player
  sees.** `__inklands.quiet()` exists for sheets that photograph a walk;
  the older sheets do not use it and their cards are genuine.
- **THE RIVER MOUTH is still a lot of sand.** Third gate to pass it
  without praising it.

---

## The machine gates

### `tools/check-camera.mjs` — the bearing, asserted

| | desktop | portrait |
|---|---|---|
| envelope, worst of 72 readings (travel and peek together) | **25.99°** of 26 | **12.00°** of 12 |
| continuity: worst step per 10° of travel | **4.60°** | **2.12°** |
| due south | **0.00°**, fully astern | **0.00°**, fully astern |
| home from full deflection to EXACTLY zero | **2.50 game s** | **2.25 game s** |
| page ahead of the walker, walking south | 10.8 → **17.5 units** | 11.0 → **17.3 units** |
| `setBearing(false)` through travel and a held peek | pinned | pinned |
| the title poster | due north | due north |

*The walk-south figure is measured, not derived: the frame's own bottom
edge is unprojected and marched at the terrain until it lands. The
"before" column is the same build with the bearing pinned — which still
has the lead — so the ratio is the astern terms' own contribution and
nothing else's. Against the SHIPPED rig, with its half-second lead, the
figure it replaces is 3.5 units, or eight tenths of a second of warning.*

### `tools/diff-sheets.mjs` — the regression, in pixels

*Twenty-three framings that carry the six WOWED verdicts, at two hours,
in both viewports: 92 comparisons, each of them twice — THE PAGE, with
the world's own writing hidden, which may not move at all; and THE PAGE
AND ITS WRITING, which is what a player sees and which moves wherever a
name was deliberately re-placed.*

**And against a CONTROL BUILD**, which is the only honest baseline: a
commit off `2ed1147` carrying the shipped camera and the shipped labels
with every clock pinned. The pins are part of this session's own change,
so a base without them could never have proved the four coast framings
unchanged — the difference between the two builds has to be the thing
under review and nothing else.

### THE PAGE — **92 of 92 bit-identical.**

Not "within a threshold": **zero pixels moved** in twenty-three
compositions across six lands, at noon and at dusk, on a monitor and on
a phone. Every WOWED verdict this project holds is still a verdict about
the frame the game actually draws.

### THE PAGE AND ITS WRITING — 42 of 92 bit-identical, 38 over threshold

Every one of the fifty is a name or a control that moved on purpose, and
they fall into three groups:

| what moved | where it shows |
|---|---|
| **a name lifted clear of the thing it names** | `crossroads` (THE CROSSROADS off its own signpost), `well`, `square-mid`, `curtain-wall`, `belfry-yard` — the largest single change in the sheet |
| **a prompt moved beside the thing** | `crossroads`, `well`, `gate-detail` |
| **the hint line** | `common-wide`, `common-THE-SHOT` — a 26-pixel strip at the bottom of the frame, which is the control list gaining `, . to lean` |

The worst frame in the set is `portrait/curtain-wall@12` at 2.2% of
pixels, and it is CASTLE GREYWEATHER's name moving out of the middle of
the gatehouse it was printed across.

**How to rebuild the control**, since it is a local commit rather than a
branch anybody else has:

```sh
git checkout -b control 2ed1147     # the harness clock, shipped camera
#   + Terrain.setTime, its call in __inklands.setTime, and the gull seed
git commit -am "control"
node tools/diff-sheets.mjs --base control
```

**And from Session 10 this is unnecessary**, because `origin/main` will
carry all five pins: `node tools/diff-sheets.mjs` with no arguments is
the tight run from here on, and every session after this one can say
"unregressed" and mean a number.

### `check-terrain` and `check-audio`

Both pass, both unchanged, and both were supposed to be boring: this
session touched neither the ground nor the score.

---

## The gate this session could not run

**A camera is not a picture.** Everything above can be asserted and not
one of those numbers is the question, which is whether the bearing
*helps* or whether the world *wobbles* — a thing a person feels over
minutes of walking and no tool in this repository can perform.

So it goes over the way the ear gate went over in Session 8, and
`QUALITY-BAR` §2 now carries the rule for both: **a system whose product
is not a picture ships with its evidence handed over, and the session
states plainly that it could not run the gate.**

The evidence is `shots-s9/` — the walk south from Greyweather's gate to
the end of the survey, every station shot twice, the shipped page and
then this one, in both viewports and at two hours. It is a comparison
rather than a cold judgement on purpose.

**Three questions worth putting to it:**

1. Walking south, does the ground under your feet read as *where you are
   going*, or as an empty foreground?
2. Does the swing toward travel settle, or does it feel like it is
   hunting? The camera is home in two and a half game seconds and that
   number was chosen off a graph, not off a feeling.
3. On a phone, is twelve degrees worth having at all?
