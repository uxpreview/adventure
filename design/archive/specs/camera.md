# THE BEARING — the Session 9 camera, corrected by Session 12

*Session 9, 2026-08-30. Not a land spec: one cross-cutting system that
changes how all six built lands feel and how the remaining five will be
authored. `QUALITY-BAR.md` governs how it is judged; `WORLD-SYSTEMS.md`
§2 is what asked for it — and §2 is also the thing this session had to
correct.*

***SESSION 12, 2026-08-31: THE OWNER PLAYED IT AND IT MADE THEM SICK,
AND EVERY CHECK IN THIS FILE WAS GREEN WHILE THAT WAS TRUE. §0 below is
what was found and what was done about it, and it changes the shipped
system. Read it before you read anything under it: §1–§8 are Session 9's
reasoning, they are kept whole because a design that gets corrected is
worth more written down than quietly replaced, and §0 says exactly which
sentences in them no longer describe the build.***

---

## 0. THE FEEL GATE, RUN AT LAST, AND WHAT IT COST

`QUALITY-BAR.md` §2 has listed this gate as owed to the owner since
Session 9, which wrote in its own log that it could not perform it:

> *"the bearing can be asserted — the envelope never leaks, the bearing
> is continuous round the whole circle of travel, a stopped walker comes
> home to exactly zero in 2.5 game seconds, the walk south sees three
> times the page it did — and not one of those is the question, which is
> whether it HELPS or whether the world wobbles."*

It wobbles. Verbatim, 2026-08-31, three sessions after it shipped:

> *"the desktop camera movements make it hard to play — makes me kind of
> sick"*

**And `node tools/check-camera.mjs` was green on that build**, on all
six of its claims. That is the clearest evidence this project has
produced that a measured system is not a judged one, and it is worth
more than the fix.

### 0.1 THE NUMBER NOBODY HAD ASKED FOR

Every claim in §5 is about **where the camera ends up**. None of them
asked about the journey between two of those places, and **a rotation
rate is the whole of what vection sickness is made of.**

Sampled every tick — which matters, because the first table anybody drew
of this sampled every third of a second and averaged the peak away,
reporting 20°/s where the frame was doing 35 — driving the circuit a
player actually walks (north, north-east, east, south-east, south, west,
stop):

| | swing | rotation | dolly | page east | page south |
|---|---|---|---|---|---|
| **as shipped** | **51.2°** | **34.7°/s** | 7.9 u @ **5.3 u/s** | +3.2 | +6.0 |
| the astern alone | 0.0° | 0.0°/s | 8.0 u @ 5.3 u/s | +0.0 | +6.0 |
| the yaw alone | 51.2° | 34.7°/s | 2.7 u @ 2.1 u/s | +3.2 | +0.0 |

*"page east" and "page south" are the extra units of ground the
component puts in front of the walker on that heading, over the same rig
with the bearing pinned. The 2.1 u/s left in the yaw-alone row is
`camRise` on the terrain and belongs to Session 4.*

**Fifty-one degrees of swing for one change of mind about which way to
walk, at thirty-five degrees a second, coupled to a dolly that recedes
faster than the walker walks.** Nobody asked for any of it: the player
pressed a direction key.

### 0.2 WHICH OF THE TWO COMPONENTS WAS IT — AND THE ANSWER IS ARITHMETIC

The prompt for this session required an answer in writing, and the two
components separate perfectly, so it is not a judgement call:

- **THE YAW IS A HUNDRED PER CENT OF THE ROTATION AND TWELVE PER CENT OF
  THE GAIN IT WAS BUILT FOR.** It buys 3.2 more units of page walking
  east — on top of **27 units the pinned rig already had** — and charges
  a fifty-one degree swing at thirty-five degrees a second for them. The
  walk east never had a warning deficit. §3 of this file measured the
  walk SOUTH at 3.5 units of warning and called it the defect; walking
  east the same rig showed 27, which is six and a half seconds. **The
  yaw was solving a problem the geometry says was not there.**
- **THE ASTERN IS A HUNDRED PER CENT OF THE WALK SOUTH AND ROTATES
  NOTHING.** Five units of warning to eleven, and it is a retreat and a
  drop, not a turn: the field of view does not rotate at all.

**So the yaw is the sickness and the astern is the gain**, and that is
what shipped.

### 0.3 WHAT CHANGED

**1. THE AUTOMATIC YAW COMES OFF BOTH RIGS.** Not reduced to 8–10°: a
small unrequested rotation is a small dose of the same thing, and at 8°
it would still be buying under a unit of page. Portrait loses it too,
even though the complaint was a desktop one — 12° across portrait's
26.5° frame is **45%** of the frame's width against desktop's 36%, so
in frame-relative terms portrait's automatic turn was the *worse* of the
two.

```ts
yawWant = ((rig.peekYaw * Math.PI) / 180) * this.input.peek;
```

**THE ENVELOPE SURVIVES WHOLE. It is the PEEK'S envelope now**, and
every reason it is 26° and 12° — the standee table in §3, the frame
widths, WORLD-SYSTEMS §8 — is unchanged and still governs. The field
`rig.yaw` is renamed `rig.peekYaw`, because a name that lies costs
sessions.

**The distinction the sickness actually turns on is agency, not
degrees.** A large field rotating because you pressed a *walking* key is
vection. The same rotation, at the same rate, because you are holding
the key that means *look*, is a head turn — you asked for it, you know
you asked, and you let go when you are done. So the peek keeps its full
deflection and its 32°/s, and walking keeps none.

**2. THE ASTERN STAYS, AND ITS EASE IS SLOWED.** `asternEase` 1.4 → 0.85,
which is 5.3 units a second of give to 3.4. At 1.4 the rig gave ground
at 5.3 against a walk of 4.1,
so turning south the page flowed backwards under a walker who was going
forwards — the one part of the astern opening that was a motion nobody
asked for. The new ceiling is **the walk itself**. It costs nothing that
matters: the opening is measured after six seconds of southward travel
and its steady state is untouched, so the walk south still sees the same
page it earned its verdict on.

**3. AND THE LEAD IS UNTOUCHED**, deliberately. Raising it was the
obvious way to buy back the yaw's 3.2 units without a rotation, and it
is refused: at a walk the lead is capped by `leadSec` at 3.7 units, and
buying 3.2 more would sit the walker **70% of the way to the edge of the
frame** in every east–west walk. This session removes a motion. It does
not add one and hope.

### 0.4 WHAT WAS LOST, STATED SO NOBODY HAS TO GUESS

**The lean.** `critique-camera-1` awarded WOWED for two things and this
was one of them: *a frame that answers travel*. Walking east or west the
frame no longer leans into the crossing.

It is worth **3.2 units of page out of 30.2**, and it is still there on
`,` and `.` — the peek reaches the same 26°, from any heading, whenever
a hand asks for it. **What is not lost is the walk south**, which was
the other half of that verdict and the whole of the defect Session 9
existed to close.

And the crossing did not go nowhere. `design/specs/controls.md` §3b:
**the crossing component of travel leans the WALKER now** — the same
term, moved off the field of view and onto the forty pixels of ink in
the middle of it, where it rotates nothing anybody is looking through.

### 0.5 AND THE ASSERTION THAT WOULD HAVE CAUGHT IT

`check-camera.mjs` has a seventh claim, sampled every tick:

| | ceiling | shipped | before |
|---|---|---|---|
| deflection from **travel**, desktop / portrait | — | **0.00° / 0.00°** | 25.99° / 12.00° |
| rotation under **walking input alone** | 1°/s | **0.00°/s** | 34.7°/s |
| rotation under a **held peek** | 45°/s | 32.0°/s | — |
| rotation under a **peek reversed mid-turn** | 80°/s | 64.0°/s | 60.1°/s |
| the rig **giving ground**, desktop / portrait | 4.1 u/s (the walk) | **3.35 / 3.38 u/s** | 5.25 / 5.27 u/s |
| the walk south, page ahead | ≥ 15 u, ×1.45 | 17.4 u, ×1.61 | 17.4 u, ×1.61 |

*Every figure in both columns is `check-camera.mjs` on the same
instrument: the "before" column is this build with the automatic yaw put
back and `asternEase` returned to 1.4, so the two columns differ by the
change and by nothing else. The reversed peek is four degrees a second
FASTER than before, and that is not a regression but the old formula
being replaced: the peek used to enter quadratically (`env · pk²` for a
standing walker) and it is linear now, so it gets going sooner. It is
still a rotation nobody gets without holding a key down.*

1°/s is a way of writing ZERO that an easing term and a float tick can
both live inside. It is not a comfort threshold borrowed from anywhere —
it is the assertion that **walking does not turn the frame in this
game**, and a build that drifts off it fails there rather than in
somebody's stomach three sessions later.

**And §5's continuity claim is superseded rather than kept.** It
asserted that the bearing was continuous round the whole circle of
travel, guarding a coin toss at due south. There is nothing left to be
continuous: a discontinuity cannot exist in a term that is identically
zero. The check asserts the stronger thing — *no direction of travel
turns the frame, thirty-six headings, all exactly zero* — which fails
the moment anybody puts travel back into the yaw.

### 0.6 AND THE COMPOSITIONS DID NOT MOVE

`node tools/diff-sheets.mjs` against `047649f`, 92 framings, bearing
pinned, twelve game seconds of settle:

> **THE PAGE: 92/92 bit-identical, 0 over 0.000%.**

Which is the whole claim. A stopped walker is due north by contract, so
taking a term out of a *moving* camera must not touch a composition —
and it did not touch a pixel.

Seven framings moved in THE WRITING OVER IT and all seven are one
deliberate edit: the arrival hint dropped from five controls to four
(`controls.md` §3a), so it is narrower. All seven are in THE COMMON at
hour 12, which is the only place the hint fires, and the changed box is
the hint element's own rectangle measured in the running game.

---

## 1. THE QUESTION, AND WHY THE ANSWER ON THE BOARD WAS HALF WRONG

> **Can the camera shift, on desktop and on mobile, so the player can
> always see where they are headed?** *(owner, 2026-08-30)*

The complaint is exact. The camera only ever looked north. Walk north
and you walk into the frame; walk east or west and you cross it; **walk
south and you walk backwards out of it**, and the king's road runs
north–south for four hundred and eighty units, so Act III's whole walk
was done facing away from the thing it is about.

§2's standing recommendation — *a bounded yaw of about ±30° that eases
toward travel and springs back to due north* — is right about east and
west and **cannot help south at all.**

The camera trails the walker on the **+Z side**. Yaw the whole rig
twenty-six degrees about the walker and it is still on the +Z side.
Southward travel is travel **at the lens**, and no bounded rotation puts
a lens behind itself; the only rotation that does is a hundred and
eighty degrees, which is a free orbit, which is refused — at 90° a paper
cutout is zero units wide and the world is a set of edges.

So the shipped system is **two components**, and which one you get is
decided by what your travel is doing to the frame:

> **The part of your travel that CROSSES the frame turns the camera.
> The part that comes AT THE LENS opens the ground at your feet.**

In code that is two lines, both read off the walker's own velocity over
their own top speed — so both are zero standing still, and both scale
honestly with the rowboat, which is faster than a walk:

```
yawWant    = envelope × clamp(vel.x / maxSpeed, −1, +1)
asternWant =            clamp(vel.z / maxSpeed,  0, +1)
```

---

## 2. WHY THAT SPLIT, AND NOT A CLAMP — THE WOBBLE IS A DISCONTINUITY

The obvious implementation is: take the travel bearing, ease toward it,
clamp to ±26°. It is wrong, and not by a little.

At due south the travel bearing is ±180°, and the clamp has to choose
**+26° or −26° with nothing to choose on**. A walker weaving a degree
either side of the king's road — which is exactly what walking down a
road looks like — flips a **fifty-two degree pan** back and forth. That
is the wobble, and **no spring constant fixes it**, because it is not a
rate problem. Hysteresis buys a threshold and moves the flip somewhere
else; a deadband at south turns the camera off in the one place the
session exists for.

Splitting travel into its components removes the choice from the system
altogether. `sin` is odd and continuous across ±180°; `cos` is even and
continuous across it. There is no antipode in either term, so there is
nothing to flip. **The proof is a sweep** (`tools/check-camera.mjs`):
thirty-six travel directions round the whole circle, and the worst step
is **4.6° per 10° of travel** — which is the sine curve's own gradient
near north, not a jump.

| travel | yaw (desktop) | astern |
|---|---|---|
| due north | 0.0° | 0.00 |
| north-east | 18.4° | 0.00 |
| **due east** | **26.0°** | 0.00 |
| south-east | 20.1° | 0.50 |
| **due south** | **0.0°** | **1.00** |
| south-west | −20.1° | 0.50 |
| **due west** | **−26.0°** | 0.00 |

---

## 3. THE ENVELOPE IS A NUMBER WITH ITS REASON BESIDE IT

**Standees are not billboards.** `makeStandee` builds a plane with a
fixed `rotation.y` and nothing in this engine turns to face the camera;
at the shipped bearing every cutout is square to the lens, and that is
the entire reason the paper metaphor reads. Turn the camera and a cutout
narrows by its cosine:

| yaw | apparent width | verdict |
|---|---|---|
| 0° | 100% | the shipped page |
| 12° | 98% | **portrait's envelope** |
| 20° | 94% | free |
| 26° | 90% | **desktop's envelope** |
| 30° | 87% | survivable |
| 35° | 82% | the wall — past here the metaphor does not degrade, it fails |
| 45° | 71% | visibly card |
| 90° | 0% | the world is edges |

**Portrait's envelope is half of desktop's for a completely different
reason**, and it is one this project had never written down. The two
viewports do not have the same frame to spend a turn in:

| | vertical fov | aspect | **frame width, across** |
|---|---|---|---|
| desktop 1280×720 | 42° | 1.78 | **68.6°** |
| portrait 390×844 | 54° | 0.46 | **26.5°** |

A yaw of φ slides a distant thing across the page by
`tan φ / tan(½ hfov)`:

| | 26° | 12° |
|---|---|---|
| desktop | 36% of the frame's width | 16% |
| portrait | the whole of it, and out the side | 45% |

And WORLD-SYSTEMS §8's rule closes it: *the joystick must never sit
under the thing the player is steering toward* — and neither may the
turn carry that thing off the page.

---

## 4. THE ASTERN OPENING, IN UNITS OF PAGE

The thing you can actually see ahead of you walking south is the strip
of page between the walker and the bottom edge of the frame. With the
camera 6 up and 13 back aiming at 3.4, that edge meets the ground **9.5
units in front of the lens** — three and a half in front of the walker.
**Eight tenths of a second of warning.** That is the defect, stated as a
number, and it is why `back` and `look` are the two terms that move.

| | shipped | live |
|---|---|---|
| desktop | 3.5 units | **17.5 units** |
| portrait | 5.7 units | **17.3 units** |

Measured, not derived: `check-camera.mjs` unprojects NDC (0, −1) — the
bottom of the frame, dead centre — and marches the ray until it meets
`terrain.heightAt`. The ground is not a plane and the arithmetic that
produced the numbers is not allowed to be the thing that checks them.

It is `riseBack`'s own trick pointed the other way. Session 4:
*rising ground must reveal more, and the way to reveal more is DISTANCE,
not pitch — pitching up to catch a keep throws the walker out of the
bottom of the frame.* Here: travel at the lens must reveal more, and the
way to reveal it is distance and a lowered aim, which puts the walker
**high** in the frame with the road they are entering laid out below
them.

---

## 5. WHAT IT MUST NOT BREAK, AND WHAT PROVES IT

| the contract | how it is kept | how it is proved |
|---|---|---|
| a stopped walker is in the shipped composition | both terms are velocity over top speed, and under a sixth of a degree of ASK the bearing is set to exactly zero | `check-camera`: home from full deflection to exact zero in **2.5 game seconds** |
| nothing ever exceeds the envelope | the peek TAKES OVER the yaw rather than adding to it | `check-camera`: 72 readings per viewport, worst **25.99°** and **12.00°** |
| every protected framing re-shoots unchanged | `setBearing(false)`, set by `shoot-lib` for every sheet that does not opt in | `diff-sheets`: the page, pixel for pixel |
| the title poster has no bearing | the poster rigs carry `yaw: 0`, and nobody is walking | `check-camera` |

**The snap tests the ASK, not the asking being nothing.** A walker who
lets go of the keys decelerates exponentially, so their velocity never
becomes exactly zero either, and a snap waiting for it would never fire.

---

## 6. THE SECOND-ORDER EFFECTS, EACH CHECKED

- **`riseAhead`** now probes up the **lens's** bearing, not the −Z axis.
  This is the first session in which "ahead" and "north" are different
  questions, and the probes belong to the frame: the rise term exists to
  get a landform INTO the frame. Probe up the walker's travel instead
  and somebody crossing a valley sideways retreats from a hill that is
  off-camera.
- **The fog** is radial and reads `camGround`. A bearing does not touch
  it.
- **The standee wind and the player-bend** are computed in WORLD space
  in the vertex stage (`StandeeField`), off the instance's own origin
  and the walker's position. Neither has ever known where the camera is.
- **The footprints** are stamped at the walker's heading, in world
  space. Same.
- **`clearance`** already read the terrain under wherever the camera
  ended up, so it followed the rig round for free.
- **The POI labels and the prompt** are the one thing that genuinely
  moves, and they are §7.
- **The input frame stays WORLD-LOCKED.** W is north, not
  camera-forward. Two reasons, and the second is the real one: a camera
  that follows travel plus an input that follows the camera is a
  feedback loop, and a walker holding one key would spiral; and this is
  a world you navigate off a MAP, where north is a fact about the page.

---

## 7. THE OLDEST VISIBLE DEFECT, CLOSED HERE BECAUSE HERE IS CHEAPEST

**"THE CROSSROADS" printed across the middle of the signpost it names**,
and had since Session 1: a label was written at a flat 3.4 units over
the GROUND, and the signpost is 4.7 tall. Nothing anywhere looked to see
whether two names landed on each other, or on the HUD.

A turning camera moves every label relative to the thing it labels — so
either it got fixed in the session that was already perturbing that
relationship, or the session shipped a bearing that made it worse.

**THE SKYLINE.** Every standee records its top into a four-unit grid as
it is built. `ctx.standee` is the single choke point every one-off
stand-up in this game goes through — 163 call sites, all of them in
`src/world/regions/` — so this costs one Map write per prop at build
time and one read per visible label per frame, and it fixes every label
in the world at once, **including the ones five unbuilt lands have not
authored yet.** A name is written above the tallest thing under it.

Then a screen-space pass, and the ORDER of its rules is the design:

1. **A label clears what it names** (the skyline, above).
2. **A label never lands on another, on the prompt, or on the chrome.**
   When two collide the FARTHER one goes **up, never sideways** — a
   caption slid sideways is a caption on a different place, which is a
   worse bug than the one being fixed. The prompt is placed first and
   holds its ground, because it is a CONTROL and a thumb is reaching for
   it.
3. **A name that will not fit is not written.** Nowhere left to go
   means sideways (wrong place), down (under the thing) or off the top
   (not writing at all). Labels are already a proximity fade, so it goes
   the way it always goes and comes back when there is room.

**And the prompt moved**: beside the thing, past its edge as the skyline
reports it, on whichever side the walker is not — **not** toward the
lens, because the thing between the lens and a place you are interacting
with is usually the walker.

---

## 8. THE HARNESS CLOCK, WHICH IS THE MOST REUSABLE THING HERE

Not a camera feature, and probably worth more than the camera.

Every contact sheet in this project had been shot by waiting a number of
milliseconds and pressing the shutter, and this sandbox renders at about
three and a half frames a second with `dt` clamped at 0.05 — so **a
900 ms settle is four frames, which is a sixth of a second of game
time**, against an ink-in cascade that takes eight seconds to cross a
land. Every framing shot before this session was shot on a page that was
still drawing itself.

And **five clocks** move between two shutter presses, each of them in
every pixel of the frame:

| clock | what it does to the picture |
|---|---|
| `PaperPass.uTime` | the grain, and a hand-drawn wobble that **resamples every ink edge by up to a pixel**, re-seeded three times a second |
| `StandeeField` `uTime` | the wind, in the vertex stage of every field in the world |
| `World.tick`'s `t` | the ink-in cascade, travelling 34 units a second from wherever the walker first stood in a land |
| `Character.idleT` | **the walker's quiet breath** — eight parts in a thousand of its height, a third of a pixel, and exactly enough to redraw an outline |
| `Terrain` `uTime` | **the water**, the one animation in the sheet's own shader |

**Neither of the last two would ever have been found by looking.** The
fourth turned up in the first diff this project ever ran — fifty-three
differing pixels in a fourteen-by-thirty-seven box in the middle of an
otherwise identical frame, and the box was the walker. The fifth turned
up in the second: eighty-three of ninety-two framings came back
bit-identical and the nine that did not were **all four coast framings,
at both hours** — the only ones in the set with animated water in them.
Neither is visible, and both make a pixel comparison meaningless.

`__inklands.setTime(t)` pins all five; `__inklands.step(dt, n)` runs `n`
fixed ticks and renders only the last; the animation loop then
re-presents that frame until the clock is handed back. **Twelve game
seconds of settle costs 130–400 ms instead of seventy seconds of wall
clock**, and two runs of one framing come back bit-identical.

Which is what makes `tools/diff-sheets.mjs` a gate instead of an
opinion, and what let this session drive the walker four hundred and
eighty units down the king's road and photograph it.
