# THE BEARING — the Session 9 camera

*Session 9, 2026-08-30. Not a land spec: one cross-cutting system that
changes how all six built lands feel and how the remaining five will be
authored. `QUALITY-BAR.md` governs how it is judged; `WORLD-SYSTEMS.md`
§2 is what asked for it — and §2 is also the thing this session had to
correct.*

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
