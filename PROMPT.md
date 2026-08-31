# PROMPT — Session 12: THE HANDS AND THE EYE

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
`design/QUALITY-BAR.md` (binding, and §2's paragraph about the gates
this project cannot run is now the whole subject of this session),
`design/specs/camera.md`, `design/specs/traversal.md`,
`design/WORLD-SYSTEMS.md` §2 and §8, then `PLAN.md`, `README.md`,
`SESSIONS.md`.

**Session 11's handoff, and then Session 9's.** Session 9 built the
bearing, asserted it six ways, and wrote in its own log that it could
not judge it. That gate has now been run.

---

## 0. THE THING THAT CHANGED, AND IT IS WHY THIS IS NOT A LAND SESSION

**THE OWNER PLAYED THE GAME AND IT MADE THEM FEEL SICK.**

Verbatim, 2026-08-31:

> *"the desktop camera movements make it hard to play — makes me kind of
> sick — and you can also the mobile controls exists on desktop as well,
> and the keyboard controls lack the ability to run."*

That is **THE FEEL GATE**, which `QUALITY-BAR.md` §2 has listed as owed
to the owner since Session 9, run for the first time. **It returned NOT
YET.** Session 9's own words were: *"the bearing can be asserted — the
envelope never leaks, the bearing is continuous round the whole circle
of travel, a stopped walker comes home to exactly zero in 2.5 game
seconds, the walk south sees three times the page it did — and not one
of those is the question, which is whether it HELPS or whether the world
wobbles."*

**It wobbles.** And every one of those assertions still passes:
`node tools/check-camera.mjs` is green on the shipped build. This is the
clearest evidence this project has ever produced that a measured system
is not a judged one, and it is worth more than the fix.

### Why this displaces the lands

`PLAN.md`'s ordering rule is the project's own law and it decides this:
*systems that change how a land is authored must land before the lands
are authored.* **The camera is the most load-bearing example of that
rule in the file** — every composition in this game is framed through
it, and THE SHOT of all eight built lands was chosen by looking down it.
Building MAPLE COURT, GREYLINE CITY and THE CUBICLE MILE on a camera
that has to change is three lands re-opened.

So the ladder is re-cut and `PLAN.md` carries it: **Session 12 is the
hands and the eye. THE NOW moves to 13, THE 8:15 to 14**, and the two
systems sessions after them shift by two. If the owner would rather have
the lands first, say so and swap them back — but ship the camera fix
before three more lands are judged through it.

---

## 1. THE THREE DEFECTS, DIAGNOSED

All three were reproduced against the merged build (`bc174a5`) before
this prompt was written. Do not re-derive them; verify the fixes against
them.

### 1a. THE CAMERA SWINGS FORTY DEGREES AND DOLLIES EIGHT UNITS

Driven round a normal circuit from the spawn — north, north-east, east,
south-east, south, west, stop — sampling every third of a second. The
bearing is the camera's angle off due north; "back" is how far behind
the walker it sits:

```
  north       bearing      0°   Δ  0.0°/0.33s   back 14.4 → 13.5
  north-east  bearing  -17.6°   Δ -5.0°/0.33s   back 13.2
  east        bearing  -21.2°   Δ -2.2°/0.33s   back 12.5 → 13.1
  south-east  bearing  -18.8°   Δ +0.8°/0.33s   back 13.4 → 18.1
  south       bearing   -0.9°   Δ +5.4°/0.33s   back 18.4 → 20.3
  west        bearing  +21.9°   Δ +6.6°/0.33s   back 20.2 → 15.0
  stop        bearing   +1.1°   Δ -6.1°/0.33s   back 14.6 → 14.2
```

Read the deltas. **Turning from east to west swings the whole frame
forty-three degrees**, at up to **twenty degrees a second**, while the
camera simultaneously dollies in and out over **eight units** and its
height wanders. Nobody asked for any of that: the player pressed a
direction key.

That is a large-field rotation the viewer did not initiate, coupled to a
dolly — which is the standard recipe for vection sickness. The envelope
is 26° each way on desktop, so the worst case is fifty-two degrees of
swing for one change of mind about which way to walk.

**Where it lives:** `App.CAM.desktop.yaw` (26) and `.lead` (4.2), the
astern terms, and the easing that drives them. `design/specs/camera.md`
is the write-up.

**What you may NOT do:** you may not simply set the envelope to zero and
call it fixed without saying what was lost. Session 9 earned a WOWED on
`critique-camera-1` for two real things — a walk south that has ground
in front of it, and a frame that answers travel — and one of those
(**the astern retreat and drop on southward travel**) exists because a
bounded yaw *cannot* help the walk south. Decide, in writing, which of
Session 9's two components is making people sick. The measurements above
suggest it is the YAW and not the astern terms, but the astern dolly is
what makes the yaw worse, and you should test them separately.

**Candidates, and the session picks and justifies one:**

- **Cut the envelope hard** (26° → 8–10°) and slow the easing so it can
  never exceed a few degrees a second. Cheapest, keeps the idea.
- **Make it a snap-back rather than a follow**: the frame leans only
  while the direction is CHANGING and returns to north while you hold a
  steady heading. Travel-derivative rather than travel.
- **Take the yaw off desktop entirely and keep the astern terms**, which
  is the honest reading of the numbers: the walk south is a real gain
  and the yaw is where the sickness is.
- **Make it the player's**, defaulting OFF. This project has no options
  screen and does not want one, so this is the expensive answer, but a
  camera that some people cannot use is worse than a settings toggle.

**And whichever you pick, one constraint makes it checkable:** a stopped
walker is due north by contract, and **every protected framing is shot
standing still with the bearing pinned.** So a correct fix to the moving
camera should come back from `node tools/diff-sheets.mjs` at **92 of 92
bit-identical.** If it does not, you have moved a composition eight
verdicts were awarded on, and you have to say which and why.

### 1b. THE PHONE'S JOYSTICK IS ON THE DESKTOP

Confirmed at 1280×720 with a mouse:

```
  before mousedown   .joy classes: "joy"
  during a drag      .joy classes: "joy active running"
                     on screen at 592,352, 96×96, opacity 1
```

A mouse drag anywhere on the canvas raises the touch stick's ring under
the cursor. `src/core/Input.ts` says so in its own header — *"a drag
virtual joystick that serves both touch and mouse"* — and the only guard
in it is an ASPECT-RATIO test (`window.innerWidth / window.innerHeight <
0.8`) that decides where the stick may be grabbed, not whether it should
exist.

**Aspect ratio is not the question. Pointer type is.** The fix is
almost certainly `matchMedia('(pointer: coarse)')`, plus a decision the
session has to make and write down: **is click-drag-to-walk a desktop
control at all?** There is a real argument for keeping it (a trackpad
user with no interest in WASD), and a real argument against (it fights
the camera, and it is the reason the ring appears). If you keep it, it
must not draw a ring and it must not be the only visible run affordance,
which it currently is.

`node tools/shoot-mobile.mjs` shoots the chrome at four widths. It has
never been pointed at the desktop rig. **The chrome is shot too**
(QUALITY-BAR §3) and this defect proves that rule needs a desktop half.

### 1c. THE RUN IS UNREACHABLE ON A KEYBOARD

**Be careful here, because the wiring is not what is broken, and the
next session should not waste an hour looking for a dead key path.**
Measured on the harness clock, so the sandbox's frame rate is out of it:

```
  five game seconds, driven north
    walk  24.18 units   4.84 u/s   effort 0.70
    run   35.37 units   7.07 u/s   effort 1.00      ratio 1.46×
```

and with real key presses, `input.run` climbs to 0.65 within two and a
half wall-clock seconds of `ShiftLeft` going down. **Shift is read,
`Input.run` responds, and the walker does go one and a half times
faster.** The mechanism works.

What is broken is that **a player cannot find it or feel it**:

- the only place this game ever says Shift exists is a six-second hint
  fired once, on entering a land (`App.ts`, `showHint`);
- the only *visible* run affordance in the whole game is the phone
  stick's ring turning `running` — which on desktop is defect 1b;
- and 1.46× against a frame that is swinging twenty degrees a second is
  a change most people will not see.

So this one is a DESIGN defect wearing a bug's clothes, and the fix is a
design decision, not a patch. Options, and none of them is a HUD:
make the run louder in the world (the trail is already ink weight —
Session 6 built exactly this and it may simply be too subtle), make the
step and the score lean harder, put a persistent one-line control
legend somewhere that is not a six-second toast, or reconsider whether
running should be a held modifier at all on a keyboard.

**Do not add a UI element that reports speed.** WORLD-SYSTEMS §0 rule 1
is still law: no UI where the world can say it, and what says this one
is the trail behind you.

---

## 2. THE JOB

1. **Fix all three, and write down the reasoning for each**, in
   `design/specs/camera.md` (which is the camera's write-up and is
   already the right home) and in a new `design/specs/controls.md` for
   the input half. The camera one has to answer: *which of Session 9's
   two components was making people sick, and how do you know?*
2. **Prove the resting composition did not move**:
   `node tools/diff-sheets.mjs` at 92 of 92, or an explanation per
   framing that moved.
3. **Extend `tools/check-camera.mjs` with the assertion this session
   exists because nobody had written it**: not only *does the bearing
   stay inside its envelope*, but **how fast can the frame rotate, in
   degrees per second, under any input a player can produce?** That is
   the number the owner felt and there is no check for it. Pick a
   ceiling, justify it, and assert it. The table in §1a is the
   before-figure to beat.
4. **Point `tools/shoot-mobile.mjs` at the desktop rig too**, so the
   chrome rule covers both. A mouse cursor is not shot today and the
   joystick bug lived in that gap.
5. **And re-run the whole gauntlet**, because a camera change touches
   every land: `check-terrain`, `check-audio`, `check-camera`,
   `check-fields`, `diff-sheets`, and the art director on a sheet that
   includes at least THE SHOT of all eight built lands.

**Scope discipline:** this is a small session by design. If it finishes
early, the standing debts in `PLAN.md` are the queue — the rowboat's
first meeting at THE RIVER MOUTH has now been passed and not praised by
**five** gates, and it is the front door of Holt's wait.

---

## 3. AND THE FEEL GATE ITSELF IS NOW A STANDING THING

The deepest thing to come out of this is not the camera. It is that
**this project shipped a system with its gate deferred, and the gate,
when it was finally run, failed** — while every automated check stayed
green. `QUALITY-BAR.md` §2 already says a session that claims a sound is
good is lying and a session that hands over the evidence is not. Session
12 should add the corollary it now has evidence for:

> **A system whose gate has not been run is not done. It is SHIPPED AND
> UNJUDGED, and those are different words.**

Two gates are still in that state and both are the owner's:

1. **THE EAR GATE.** Twenty-five WAVs and one authored silence handed
   over unperformed (`critique-score-1.md` §4, plus six voices from
   Session 10 and six more from Session 11). **Nobody has heard the
   game.** `tools/render-wavs.mjs` is how it is handed over.
2. **THE FEEL GATE ON THE WALK ITSELF**, as opposed to the camera: is
   4.1 units a second the right walk, is 1.5× the right run, and does a
   hundred and twelve units of canyon corridor take too long? No
   screenshot can answer any of those either.

---

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets and zero audio assets; every voice is synthesis and
nothing outside `Audio.ts` invents an instrument, exactly as nothing
outside `palette.ts` invents a colour; all marks via `src/engine/ink.ts`;
`elevation.ts` is the only authority on where the ground is; **the
resting bearing is due north and a stopped walker is always in the
shipped composition**; the medium is the style and never the subject;
nobody crosses a border but the walker; 60fps mobile with DPR capped at
2; the chrome is shot too; build green before every push; the walker has
two dots and nobody else has a face; nothing reads as an array; nothing
is generated, ever; no fifth reward; no count, no list, no percentage,
anywhere, for anything; portrait is judged, not checked. End the
session: pushed, `SESSIONS.md` handoff updated, verdicts logged.

---

## What Session 11 left you, and it is mostly tools

- **`node tools/shoot-textures.mjs`** — every drawing in a prop box, at
  actual size, on paper, in four seconds. **Two full rounds of Session
  11's gate never rendered the world at all** and found twelve classes
  of fault between them. Shoot this first, always.
- **`node tools/montage.mjs <dir> <out.png> a.png b.png …`** — a land on
  one sheet. Beware one thing Session 11 learned: it downscales, so a
  prompt reading `look` in a montage may be `LOOK AT THE MARKS` at full
  size. Check the frame before you file the bug.
- **`node tools/check-fields.mjs`** — nine lands now, including both of
  Session 11's, because both carry a field re-set from an update loop.
- **`node tools/diff-sheets.mjs`** — run it BEFORE you think you are
  finished. It takes about half an hour end to end; start it and write
  your docs while it runs.
- **`node tools/check-terrain.mjs`** now asserts SPLITROCK's floor at
  **−10.8** and fails if it drifts a tenth, because `THE-STRANGERS` S5
  is an errand about that number.

## Standing debts, carried forward

They live in `PLAN.md` as well as here, because this file is overwritten
every session.

- **The rowboat's first-meeting composition at THE RIVER MOUTH** is a
  lot of sand. **Five** gates have now passed it and pointedly not
  praised it, and it now matters more than it did: `route:the-river` is
  what resolves HOLT, so that boat is the front door of a wait.
- **THE HARROW DOWNS' stooked field**, **THE PENWOOD's east arc** and
  **THE BLEACH FLATS' `WHERE THE ROAD STOPS`**: all three passed, none
  praised. The last is two posts and some cracked ground at the end of
  the longest road in the world.
- **Holt's lit window** is one warm pixel at forty units. It is the only
  lit window in the east half of the world and it deserves a glow.
- **Brim Square is full.** The next authored thing in that plaza
  displaces something Session 3 earned.
- **READ THE PROCLAMATION** on Greyweather's barbican is a compromise
  (`critique-camera-1.md`, round 3, noted-not-blocking).

## Not this session's job, and recorded so nobody re-derives them

- **§3.2's rim composition is the riskiest un-shot frame in the game**
  and **the session that builds MAPLE COURT shoots it FIRST, not last.**
  Act III is a two-hundred-unit look north up an empty straight road
  from the world's south rim, and nothing tall may stand within about
  eight units of x = −45 between z = 120 and z = 278. **It is also the
  framing most exposed to whatever this session does to the camera**, so
  shoot it before and after, even though its land is not built.
- **THE PAPER PLANE**, deferred in writing by Session 11 with its brief
  and its reason (`PLAN.md`, `WORLD-SYSTEMS` §4). It launches from
  Splitrock's east lip or the curled rim; it refuses being steered
  *mostly*; and it must not trivialise the walk back round the canyon's
  mouth.
- **The story gate returned NOT YET** (`critique-story-2.md`), with two
  mandatory findings belonging to the sessions that build Acts I and IV.
- The remaining WAITS, the eight STRANGERS and the three inventories are
  the authoring queue.
