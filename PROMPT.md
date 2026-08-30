# PROMPT — Session 9: THE BEARING

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
`design/QUALITY-BAR.md` (binding), **`design/WORLD-SYSTEMS.md` §2
(binding, and the second half of it was written for this session)**,
`design/critiques/critique-art-3.md` (**the camera you are about to
change, and why every number in it is the number it is**), then
`design/THE-LINE.md` §3, `PLAN.md`, `README.md`, `SESSIONS.md`.

**Session 8's handoff especially**, and not for the score: for the
shape of its second half. It shipped a system whose product could not
be screenshotted and spent half itself building the proof instead of
asserting the result, and **that is the shape this session needs too**,
for a completely different reason.

---

## Why this session is not Farm & Forest

The ladder said Session 9 was THE HARROW DOWNS and THE PENWOOD.
**The ordering rule displaces it** — *systems that change how a land is
authored land before the lands are authored* (owner, 2026-08-28) — and
the camera's bearing is the last foundations item on the board.
`PLAN.md` has said since 2026-08-30 that if it is taken, **it is taken
BEFORE the five remaining lands, not after.** Take it. Everything below
Session 9 shifts by one, and after this it is five land sessions in a
row with nothing structural left to interrupt them.

**If the owner would rather have lands**, the alternative is on the
ladder unchanged and this file is wrong; ask, do not assume. But
building five lands on a bearing you are going to change afterwards is
the elevation mistake again, and that one cost a whole critique round.

---

## The question, in the owner's words

> **Can the camera shift, on desktop and on mobile, so the player can
> always see where they are headed?**

The complaint is exact. The camera only ever looks north. Walk north
and you walk into the frame; walk east or west and you cross it; **walk
south and you walk backwards out of it, into ground you cannot see.**
The king's road runs north–south for four hundred and eighty units, so
**Act III's entire walk is done facing away from the thing it is
about.**

---

## What you are inheriting, and what will kill you

- **`App.CAM` is a designed system, not a pile of constants.** Session 4
  built it and `critique-art-3.md` is where its numbers were solved.
  `back`, `up`, `look`, `fov`, the three `rise*` terms, the fog. **All
  three rise terms are zero on flat ground**, and that is the single
  clause that protected Sessions 2 and 3's WOWED compositions through a
  camera rebuild. Whatever you add, add it with the same property: **at
  rest it must be the shipped page, exactly.**
- **STANDEES ARE NOT BILLBOARDS, and this is the whole design
  constraint.** `makeStandee` builds a plane with a fixed `rotation.y`;
  nothing in this engine turns to face the camera. Off-axis, a cutout
  narrows: **20° is 94% and free, 30° is 87% and survivable, 45° is 71%
  and the world reads as a stack of card.** Past about thirty-five
  degrees the paper metaphor does not degrade, it FAILS, and it fails
  looking exactly like a bug.
- **The recommendation is already written** (§2, four candidates, with
  the reasoning): a **bounded yaw of about ±30° that eases toward
  travel and springs back to due north**, plus a **peek gesture** that
  is a gesture and never a state, plus a **lead offset**, which is free,
  helps east–west, and cannot help south at all because south is behind
  the lens. Two and three probably ship together. **A free orbit is
  refused and you do not get to re-open that.**
- **And the law you are standing on:** *the camera only ever looks
  north, and that decides LAYOUT.* Six lands were authored on it.
  **Nothing in this session licenses a land to be laid out east–west**,
  and the very first thing a turning camera will tempt the NEXT session
  into is exactly that. Say so in the docs, in writing, where a land
  session will read it.

---

## The job

### 0. SCOPE FIRST, AND THE PROOF IS NOT THE OPTIONAL PART

The ladder rule is *a session may swap scope up the ladder, never skip
the gate.* If you run out of session, **ship the peek gesture and the
lead offset and no yaw at all** — both are honest, both are small, and
neither can regress a composition. What you may not ship is a bearing
nobody proved.

### 1. THE ENVELOPE, AUTHORED

One number in `App.CAM`, **with the standee table written beside it as
the reason**, the way `riseBack` carries its reason. Not a tuning
constant somebody can nudge later without knowing what it costs.

**Portrait gets its own envelope.** A tall frame has less horizontal
room to spend on a turn, and the joystick must never sit under the
thing the player is steering toward (§8).

### 2. BOUNDED YAW THAT EASES TOWARD TRAVEL

Swings a limited amount toward where the walker is actually going;
**eases back to due north whenever they stop.** A stopped walker is
always in the composition the land was authored for. That is not a nice
property, it is the contract that keeps six WOWED verdicts valid.

Watch the second-order effects, because they are where this gets away
from you: the fog, the rise terms (which read ground AHEAD — ahead of
what, once there is a bearing?), the standee wind and player-bend, the
footprint decals, and the POI labels, which are the next item.

### 3. THE PEEK, AND THE LEAD

A held key on a keyboard and a two-finger drag on a phone, springing
back on release. And the lead offset: aim further along the direction
of travel without changing bearing at all.

### 4. THE OLDEST DEFECT IN THE GAME IS NOW IN YOUR WAY

**POI labels have no collision logic** — "THE CROSSROADS" prints across
the signpost it names, and that signpost carries the story's hinge. It
has been the oldest visible defect for six sessions and it has always
wanted its own slice.

**A turning camera moves every label relative to the thing it labels.**
So either it gets fixed here, where you are already perturbing exactly
that relationship and can see it move, or the session ships a bearing
that makes it worse. **Fix it here.** It is the cheapest it will ever
be and it is the last moment it is free.

### 5. AND THE PROOF, WHICH IS THIS SESSION'S REAL WORK

§2 says *every protected framing must be reproducible exactly: the
shoot harness pins yaw to zero, every existing contact sheet re-shoots
unchanged, and **a regression is a diff and not an opinion.*** That
sentence is a tooling requirement and nobody has built it.

- **`tools/diff-sheets.mjs`.** Shoot every protected framing on the
  current build, keep it, shoot it again after the change with yaw
  pinned to zero, and **diff the pixels**. Report the worst frames by
  difference and fail on anything over a stated threshold. Six lands,
  two hours, two viewports — that is the set that carries five WOWED
  verdicts, and until now "unregressed" has meant a person looking at
  two pictures a week apart.
  **Mind the ink-in cascade:** frames shot at short settle in this
  sandbox catch the world mid-wave, so two shots of the same frame are
  not identical unless both are settled long enough or both are settled
  the same. Solve that before you trust a single number it prints.
- **AND SHOOT THE WALK SOUTH.** The whole reason this session exists is
  a walk the contact sheets have never contained, because every framing
  in this project is a stand-still. Drive the walker **south down the
  king's road** — Greyweather's gate to the Common and on to the road
  head — and shoot it, with the bearing live, in both viewports. If
  that sequence is not obviously better than the same walk today, the
  session has not earned its scope, whatever the numbers say.

---

## The constraints that will bite you

- **This sandbox renders at about 3.5 frames a second**, and App clamps
  `dt` at 0.05, so one second of wall clock is about a sixth of a second
  of game time. **A session about MOTION pays this tax on every frame it
  shoots.** Budget for it: the Session 8 regression pass alone was six
  sheets and the better part of half an hour.
- **A camera that eases has a time constant, and everything above is
  measured in game time.** Do not tune a spring by watching a headless
  browser at 3.5 fps.
- **Brim Square has three runs of bunting and the camera trails
  thirteen units.** Any framing standing within about eight units of
  z −65, −81 or −96 hangs two enormous translucent triangles down the
  middle of the frame. A turning camera changes which framings do that.
- **A backtick inside a JS template literal ends it.** Sessions 5 and 6
  did it in shaders; Session 8 did it in a render harness, in a file
  whose own header warned about it. **Three times.**
- **`.tmp/` can vanish mid-session.** Tools that `mkdir` it are fine; a
  shell redirect into it is not.

---

## The gate

1. **`node tools/check-terrain.mjs` and `node tools/check-audio.mjs`
   both pass**, and both should be boring: this session touches neither
   the ground nor the score, and if either moves, something is wired to
   the camera that should not be.
2. **`node tools/diff-sheets.mjs` — every protected framing at yaw zero
   is unchanged**, to a stated threshold, in both viewports at both
   hours. This is the new gate and it is the one that makes the other
   two cheap forever.
3. **The art director**, on a new sheet: the six protected lands with
   the bearing LIVE and the walker MOVING, both viewports, two hours —
   plus the south walk, which is the composition the session is for.
4. **The owner**, on the feel. A camera is not a picture and this is the
   second gate in two sessions that a tool cannot perform: **does it
   help, or does the world wobble?** Hand over the walk-south capture
   and say plainly that you could not judge it.

Iterate to WOWED on what you can judge. Log the verdicts verbatim in
`design/critiques/critique-camera-1.md`.

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

## Standing debts, carried forward — and one of them is now item 4

They live in `PLAN.md` from Session 8 on, because they had been carried
in this file alone and this file is overwritten every session.

- **POI label collision.** See item 4. This is its session.
- **The rowboat's first-meeting composition at THE RIVER MOUTH** is a
  lot of sand. Two gates have passed it and pointedly not praised it.
- **Brim Square is full.** The next authored thing in that plaza
  displaces something Session 3 earned.

## Not this session's job, and recorded so nobody re-derives them

- **The story gate returned NOT YET** (`critique-story-2.md`), with two
  mandatory findings that belong to the sessions that build Acts I and
  IV: Act I's second and third facts have one optional teacher between
  them, and the ending's default witness sees one of twelve stops. Both
  fixes are cheap. Neither is a camera.
- **§3.2's rim composition is the riskiest un-shot frame in the game**
  and Session 11 shoots it FIRST, not last. **If this session ships a
  bearing, re-read that section before believing its numbers** — 201
  units of haze up a straight road was reasoned on a camera that only
  looked north.
- The twelve WAITS, the eight STRANGERS and the three inventories are
  the authoring queue (`THE-WAITS.md`, `THE-STRANGERS.md`), and from
  Session 10 on **every land session ships its places AND its wait AND
  its named inhabitant.**

## Waiting on the owner, and none of it blocks you

1. **THE EAR GATE on the score.** Nineteen WAVs were handed over
   unperformed (`critique-score-1.md` §4). Nobody has heard the game.
2. **Whether the STORY GATE becomes a standing critic**, and whether its
   NOT YET blocks Acts I and IV or merely annotates them.
3. **The STORY EDITOR**, proposed as a third standing critic and run
   once (`critique-story-1.md` §3).
4. **The premise line's rewrite** and **two surviving similes**, kept on
   an assertion-versus-simile distinction.
5. **A seventh content tier, THE LOCAL RULE** (`QUESTS.md` §8),
   proposed off the RuneScape entry and explicitly not ratified.
