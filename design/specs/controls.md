# THE HANDS — what a player's hands can reach, and on which device

*Session 12, 2026-08-31. Not a land spec: the input half of the session
that ran the FEEL GATE for the first time and failed it.
`design/specs/camera.md` is the eye half. `QUALITY-BAR.md` governs how
either is judged; `WORLD-SYSTEMS.md` §0 rule 1 and §8 are the law this
sits under.*

---

## 0. WHY THIS FILE EXISTS AT ALL

Eleven sessions built a camera, a score, a day cycle, a mount, a
knowledge system and nine lands. **Nothing had ever written down what
the player's hands do**, and both halves of the owner's complaint on
2026-08-31 were in that gap:

> *"you can also the mobile controls exists on desktop as well, and the
> keyboard controls lack the ability to run."*

Two defects, and they are not the same kind of thing. One is a control
on the wrong device. The other is a control that works perfectly and
cannot be found. **The second is the more expensive lesson**, and §3 is
about it.

---

## 1. THE SHIPPED CONTROLS, WHICH HAD NEVER BEEN LISTED IN ONE PLACE

| | keyboard & mouse | touch |
|---|---|---|
| **walk** | `WASD` / arrows | drag anywhere (lower band in portrait) |
| **run** | `Shift`, held, ramped | drag further — past the ring |
| **look** | `,` and `.`, held | two fingers dragged |
| **interact** | `E` / `Space` / `Enter`, or the prompt | tap the prompt |
| **map** | `M` | the map button |
| **close** | `Escape` | tap the veil |
| **choose** *(Session 15)* | `1` `2` `3`, or the door on the card; `Escape` walks away | tap the door |

**AND FROM SESSION 15 THE INTERACT KEY DOES FIVE THINGS** (`THE-FUN-PASS`
§5, owner-confirmed 2026-09-01). It is still one key and still the key
that looks; what it does depends on what is in reach, and **the prompt
says which**, hand-lettered, in the house voice:

| verb | the prompt says | what happens |
|---|---|---|
| **look** | READ THE SIGNPOST, CRANE YOUR NECK … | the note, exactly as before |
| **touch** | SHOUT DOWN THE WELL, PUSH THE CART, PICK UP THE STONE | a one-shot on a thing in reach, and the world's answer: a sound, a motion, a change |
| **carry** | *(the thing is in the hand, drawn there; nothing is written)* | walk with it. One thing, never two; there is no inventory anywhere |
| **throw** | THROW THE STONE at a walk, PUT DOWN THE STONE standing still | underarm, a few units along your heading, on an arc, with a landing and a sound. A set-down is a throw at a standing walker: a stride and a bit. At a run, six units. Continuous, like the run, and no second control |
| **sit** | SIT IN THE SWING, SIT DOWN — and STAND UP once you have | the walker is put on the seat (lifted to it, if it hangs) and holds still. **The camera does not move.** Time passes at six times its walking pace while you sit, so a routine goes by while you watch. Any step stands you up |
| **choose** | SET YOUR SHOULDER TO HIM, and then a card with two doors on it | a choice card (`ui/UI.ts`): both doors visible before either is taken, one press takes one, and the world changes because of it. Rare, and never twice at one place |

**Three rules keep it one key:**

1. **A thing in reach beats the thing in the hand.** Standing at the
   well with a stone in your hand, the key shouts; the stone is thrown
   from outside the well's reach, which is the lip. Otherwise a stone in
   hand would swallow every prompt in the world, because it is at
   distance zero.
2. **A place has one verb at a time**, in this order: a choice not yet
   taken, then a note, then a touch, then a sit. The plinth offers the
   card until a door is taken and is a note afterwards.
3. **A player who never touches anything does not notice the game
   changed.** `tools/check-verbs.mjs` asserts the signpost still says
   READ THE SIGNPOST, and every note in the world opens exactly as it
   did in Session 14.

**What it must never become**, and `src/world/things.ts` refuses it by
construction: an inventory (`held` is one id or null and there is no
list), a hotbar, crafting, a weapon, or anything you can hold two of.
**And nobody crosses a border but the walker:** a pushed cart stops at
its land's edge and a thrown stone lands inside it, clamped before it
flies. `check-verbs` shoves the cart at the Common's border fifteen
times and throws the stone at it at a run, and asserts both.

**The feel gate is owed again for one new state.** Sitting is the one
thing the verbs add in which a stopped walker has a posture, and a
stopped walker is due north by contract: `check-verbs` reads the
bearing for five game seconds seated and asserts yaw and astern are
exactly zero and the rig does not dolly. Whether sitting *feels* like
sitting is the owner's.

**The input frame is WORLD-LOCKED and stays that way.** `W` is north,
not camera-forward. Two reasons and the second is the real one: a camera
that follows travel plus an input that follows the camera is a feedback
loop, and a walker holding one key would spiral; and this is a world you
navigate off a MAP, where north is a fact about the page.

---

## 2. THE STICK IS A THUMB'S CONTROL, AND A MOUSE IS NOT A THUMB

### The defect, reproduced

At 1280×720 with a mouse, dragging anywhere on the canvas:

```
  before mousedown   .joy classes: "joy"
  during a drag      .joy classes: "joy active running"
                     on screen at 592,352, 96×96, opacity 1
```

The phone's ring, under the cursor, on the desktop build, since Session
4. `Input.ts` said so in its own header — *"a drag virtual joystick that
serves both touch and mouse"* — and the sentence was accurate, and it
was the bug.

### Why it was there, which is more interesting than that it was there

The only guard in the file was an **aspect-ratio test**:

```ts
const tall = window.innerWidth / window.innerHeight < 0.8;
if (tall && e.clientY < window.innerHeight * WALK_BAND_TOP) return;
```

That is a real rule and it is still there, but read what it decides:
**WHERE on a tall screen the stick may be grabbed** — protecting the
vista band, WORLD-SYSTEMS §8. It was never asked, and cannot answer,
**whether the stick should exist on this device at all.** A guard that
answers a different question than the one you have is worse than no
guard, because it looks like one.

### The fix, and why it is not `matchMedia`

```ts
if (e.pointerType === 'mouse') return;
```

The obvious fix is `matchMedia('(pointer: coarse)')`, and it is worse.
A media query describes the DEVICE; `pointerType` describes THIS EVENT.
A touchscreen laptop answers `fine` to the media query and would never
get the stick, and a tablet with a trackpad attached would get it under
the cursor. Per-event is exact on every machine that exists: **the
finger gets the stick, the mouse never does, on the same hardware, in
the same session, with no capability sniffing.**

It is the **first** line of the handler, before the pointer is even
recorded, so that a mouse never enters the map of live pointers either
— otherwise a hybrid laptop with a finger and a mouse down at once
reads as *two fingers* and takes a peek.

### And the decision that goes with it: is click-drag-to-walk a desktop control?

**No, and it is removed.** The argument for keeping it was a trackpad
user with no interest in `WASD`. That user does not exist: **there is no
desktop device without a keyboard**, and every one of them ships `WASD`
under the left hand. Against it:

- it drew a **ring** — a piece of phone chrome — into desktop frames
  that the art director has never been shown;
- it was the **only visible run affordance in the game** on desktop
  (the ring turning `running`), which is to say the run's only signal
  was attached to a control the desktop should not have had;
- and it fights the camera, because a drag is also how you would expect
  to turn a view, and in this game a drag walked you instead.

**What is lost is nothing a keyboard did not already do.** What is
gained is that a mouse drag on the canvas now does what a mouse drag on
a picture should do: nothing at all.

### It is asserted now, on both rigs, with opposite expectations

`node tools/shoot-mobile.mjs` shot four phone widths and had **never
been pointed at a desktop**, which is precisely the gap this lived in.
It now shoots five rigs, and the joystick step is a gate:

```
  ✓ 390-iphone:   a thumb raises the stick ("joy active running")
  ✓ 1280-desktop: a mouse drag raises nothing ("joy")
```

The touch drag is dispatched over CDP (`Input.dispatchTouchEvent`)
rather than through `page.mouse`, which is how the old version drove
it. **A tool that tested a touch control by moving a mouse could not
have found a touch control responding to a mouse.**

---

## 3. THE RUN WAS NEVER BROKEN, AND THAT IS THE WHOLE PROBLEM

**Do not go looking for a dead key path.** Measured on the harness
clock, five game seconds driven north:

```
  walk  24.18 units   4.84 u/s   effort 0.70
  run   35.37 units   7.07 u/s   effort 1.00      ratio 1.46×
```

Shift is read, `Input.run` ramps to 0.65 within two and a half seconds
of `ShiftLeft` going down, and the walker goes half again as fast. **The
mechanism has worked since Session 6.** The owner still could not run,
and both halves of why are design faults.

### 3a. YOU COULD NOT FIND IT

The game said `Shift` existed **exactly once**: a six-second toast, on
entering a land, carrying **five controls in one line**:

> `wasd to walk — shift to run — E to look — , . to lean — M for the map`

Fired on the frame a player walks into a new land — which is the one
frame they are *certainly* looking at the land and not at a line of
type. A five-item list shown once for six seconds at the worst possible
moment is not teaching; it is a receipt.

**The fix is timing, not volume.** No legend in the corner, no louder
hint, no second toast per land:

- the arrival hint drops the run and keeps **four** things — what you
  need in the first ten seconds of a *place*;
- the run is taught **once ever**, at the moment it becomes worth
  having: the first time this player has walked without stopping for
  **six seconds**. Long enough that this is a journey and not a step off
  a kerb; short enough to land inside the first minute for anybody who
  sets out and keeps going;
- and it is **never printed to a player who already found it** —
  holding Shift at any point sets the flag silently. A game that
  explains a control you are already using is a game that is not
  watching.

It lives in the save (`taughtRun`), not in a session flag, because a
control you are taught twice is a control the game thinks you are stupid
about. And it never fires for the harness (`input.hold !== null`), which
is not a player and would otherwise print chrome into a protected
contact sheet.

**WORLD-SYSTEMS §0 rule 1 is not bent by this.** The rule is *no UI
where the WORLD can say it*. The world can say how fast you are going —
that is §3b — but **no drawing anywhere on this page can name a key.**
That is the entire licence, and it is why a hint exists at all.

### 3b. AND YOU COULD NOT SEE IT — WHICH IS A MEASURED CLAIM

Session 6's answer to "how does a player know they are running" was
**the trail**: ink weight on `Character.effort`, a gamma from 1.03 down
to 0.46 and a stroke weight from 1.14 up to 1.62, and it is good work.
It cannot do this job, and the reason is geometry, not subtlety.

**The prints are laid BEHIND the walker, and the camera trails the
walker.** The bottom edge of a desktop frame meets the ground three and
a half units behind the figure. Walking north — which is the game's
principal axis, because the king's road runs north–south for four
hundred and eighty units — **there are about five prints between the
walker and the edge of the picture, and three of them are on the edge.**
Shot at the same spot, seven game seconds of travel apiece, a walk and a
run are *the same three dots in the same place*. The run's whole
affordance was drawn in the strip of page this camera crops.

**So the signal moves to the one place in the picture that is never
cropped: the figure.** The walker is dead centre of every frame, in
both viewports, at every bearing, in every land.

> **THE CROSSING COMPONENT OF TRAVEL USED TO TURN THE CAMERA. IT LEANS
> THE WALKER NOW.**

```ts
const cross = Math.max(-1, Math.min(1, this.vel.x / this.maxSpeed));
this.sprite.rotation.z = -Character.LEAN * this.effort * cross;
```

Which is the same crossing term the camera used to spend, moved off the
frame and onto the body — and that is not a coincidence, it is the whole
trade. `camera.md` §2 removes an unrequested rotation of the entire
field of view; this puts a requested-looking rotation on forty pixels of
ink in the middle of it. **The frame stops answering travel and the
figure starts.**

- **Continuous**, like every other thing about the run: velocity times
  `effort`, no threshold, no state. There is still no sprint state
  anywhere in this game.
- **Exactly zero standing still**, so every protected framing is
  untouched and `diff-sheets` does not move.
- **Five and a half degrees at a walk across the frame, eleven flat
  out** — a two-to-one ratio, which is what makes it a reading and not
  a decoration.
- **It survives the sprite's mirror.** `sprite.scale.x` flips to −1
  walking west; the mirror is a scale and the rotation is applied after
  it, so a lean to screen-right stays a lean to screen-right.

It answers the **crossing** axis. It cannot answer north–south, and
nothing on a cutout seen from behind can: a forward lean on a flat plane
is a foreshortening, and a foreshortening at this camera reads as the
walker shrinking. **On the north–south axis the run's signal is the page
going by faster** — and that signal was, until this session, competing
with a frame swinging fifty-one degrees at thirty-five degrees a second.
Defect 1a was part of defect 1c.

### 3c. Should the run be a held modifier at all?

**Kept, and here is the argument rather than the assumption.** Nothing
in this world is urgent (WORLD-SYSTEMS §0 rule 2), so the run is a
texture and never a resource — which means the failure mode of a hold is
fatigue over a fifteen-hour game, and the failure mode of a toggle is a
*state*, which Session 6 refused on purpose and which would put a mode
into the one system in this game that is a single continuous scalar.

A toggle also breaks the phone, where the run is *how far past the ring
you dragged* and cannot be latched without inventing a second control.
**One gesture, two devices, no mode** is worth a tired little finger,
and a player who is tired of running lets go and is walking, which is
the game.

---

## 4. WHAT IS NOT SETTLED, AND WHO SETTLES IT

**Everything in §3 is a fix to a gate that only a person can run.** No
tool in this repository can say whether 4.1 units a second is the right
walk, whether 1.5× is the right run, or whether the lean reads at
forty pixels on a real screen at a real distance. `shoot-mobile.mjs`
can now prove the stick is on the right device; nothing can prove the
run *feels* like one.

That is the standing debt this session inherited and hands straight
back, and `QUALITY-BAR.md` §2 has the words for it now:

> **A system whose gate has not been run is not done. It is SHIPPED AND
> UNJUDGED, and those are two different words.**
