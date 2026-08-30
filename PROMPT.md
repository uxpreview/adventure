# PROMPT — Session 8: THE SCORE

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
`design/QUALITY-BAR.md` (binding), **`design/WORLD-SYSTEMS.md` §9
(binding, and this session is the one it was written for)**,
`design/INSPIRATION.md` — **read the RuneScape entry, it is new and it
is the largest on the list** — then `design/STORY.md`, `PLAN.md`,
`README.md`, `SESSIONS.md`.

**Session 7's handoff especially.** It shipped the story's whole
architecture and one system, and it left this session two things:
a seam that is already open, and a decision it does not have to make.

Six lands hold the bar: THE COMMON, the Brim south face, the Brim
interior, CASTLE GREYWEATHER, LONGSHORE, THE WIDE BLUE. **None of them
may regress.** This session touches no geometry at all — but a land's
VOICE is part of what a land IS, and that is precisely why the score
was moved ahead of the five lands still to be built.

---

## The standing rule, which applies here too

> **The medium is the STYLE. It is never the SUBJECT.**

WORLD-SYSTEMS §9 already lost one idea to this rule — *"the music is
playing in the room where the page is"* — and it was retired the same
day it was proposed, in the one system where it would have been hardest
to take back out. Do not re-propose it. **Nothing about the paper, the
pen, the desk or the room.**

---

## What you are inheriting

Session 6 opened two seams and Session 7 built the story that decides
the third. **You are not designing the score's architecture. §9 is it.**

- **`Audio.setMoodIntensity` is already called**, twice a second and
  only when the number has moved (§9 move 4 ✓). Standing still is 0.45,
  flat out is 1.35. **The mixer is already told how hard the player is
  going.** Do not re-plumb it; decide what to do with it.
- **`Audio.setHour` / `Audio.hour` are already correct** (§9 move 5 ✓).
  Today the hour thins the room tone after dark and lengthens the
  melody's gaps. **You do not have to re-open the day cycle**, and you
  must not: eight in the morning to four in the afternoon is
  bit-for-bit the shipped page and six verdicts depend on it.
- **Twelve moods already exist** in `Audio.MOODS`, each with a `scale`,
  a `gap` and a `level`. That is real — the melody genuinely wanders a
  different mode in every land — and it is **all played on the same
  instrument over the same room tone.** A player can cross a border
  blind and hear the footstep change. They cannot hear the *music*
  change. **That is the gap and it is the whole session.**
- **Two of the five voices are already written.** `bell-buoy` is struck
  metal (an inharmonic partial stack with a long tail) and `surge` is
  air (filtered noise with a moving resonant peak), both from Session 5.
  The music box is the third. **§9 says "the score session builds the
  other three" and its own arithmetic is off by one** — there are two
  left: **the plucked string** (Karplus–Strong: a noise burst into a
  short delay line with a lowpass in its feedback, about twenty lines,
  and it sounds *nothing* like a sine) and **the bowed/held voice** (a
  saw through a resonant lowpass with a slow attack, for the ceremonial
  lands). Fix the count in §9 while you are there.
- **And Session 7 killed one of §9's two open questions for you.**
  See "the source", below. It is decided. Do not re-litigate it.

---

## The job

### 0. SCOPE FIRST, AND BE HONEST ABOUT IT

Twelve instruments, twelve beds, crossfades, a mix that answers two
inputs, and a way to judge any of it — that is a lot, and one part of
it is genuinely novel work (item 4). The ladder rule is *a session may
swap scope up the ladder, never skip the gate.*

The shape: **build the two missing voices, give all twelve lands a
voice and a bed, make the border a crossfade, and then solve the
problem of how anybody knows whether it worked.** If you run out of
session, ship fewer lands' beds — never a shakier proof.

### 1. A LAND'S MUSIC IS ITS INSTRUMENT, NOT ITS SCALE

§9 move 1, and it is nine-tenths of the effect.

Five voices cover twelve lands with deliberate doubling. Build the two
that are missing, then **author the assignment as a table beside
`MOODS`** — instrument, register, and the reason, one line each. A land
whose voice you cannot justify in one line has not been given one.

Doubling is not a failure. *Two lands on the plucked string in
different registers is a family; twelve lands on twelve unrelated
instruments is a sound library.*

### 2. A BED PER LAND, AND IT IS THE QUIETEST THING IN THE MIX

§9 move 2. `startAmbient` is currently a single lowpass noise loop at
220Hz and **it is identical in the canyon and the office park.** It
should be per-land and it should be the thing you notice only when it
stops: the sea's hush, the pines' hush, the city's hum, the office
park's air handling, the canyon's near-silence with a long tail on
everything else.

### 3. A BORDER IS A CROSSFADE, NOT A CUT

§9 move 3. `setMood` already ramps the melody's level. The instrument
and the bed need an **equal-power** crossfade of three or four seconds,
so a border is a place you pass through rather than a switch you flip.

Nothing else about a border changes. The card, the footstep and the
mood all fire exactly as they do now.

### 4. AND THE HARD PART, WHICH IS NEW: **HOW DOES ANYBODY KNOW?**

**This is the first session in this project whose product cannot be
screenshotted, and you should treat that as the interesting problem
rather than as an excuse.**

Five sessions of contact sheets photograph the world. Session 6.1 found
that nobody had ever photographed the *chrome*, and it cost a player's
phone to notice. **Nobody has ever measured the sound**, and this
session ships almost nothing else.

So build the proof, the way `tools/check-terrain.mjs` is the proof for
the ground. Three parts, and the third one matters most:

- **`tools/check-audio.mjs` — render it offline and assert it.** An
  `OfflineAudioContext` renders deterministically in headless Chromium,
  with no audio device and no user gesture, faster than real time.
  Render each land's voice and bed to a buffer and assert what a
  listener would notice: that no two lands' spectra land in the same
  place, that the melody's level is where `MOODS` says, that a border
  crossfade is equal-power (the sum never dips or peaks), that the mix
  answers `setMoodIntensity` and `setHour` monotonically, and that
  nothing clips.
  **This has one architectural consequence and you should take it
  first: the instrument box has to be renderable offline**, which means
  a voice is a function that takes an `AudioContext` rather than one
  that closes over `this.ctx`. That refactor is the enabling move for
  the whole item and it is small if you do it before you write the two
  new voices, and horrible if you do it after.
- **SHOOT THE SOUND.** Plot each land's rendered buffer — waveform and
  spectrum — as one contact sheet, drawn with `src/engine/ink.ts`
  because everything in this project is drawn with it. **Twelve lands
  should be visibly twelve sounds.** If the sheet shows twelve nearly
  identical smears, you have shipped one instrument in twelve modes
  again, and you will be able to see it.
- **AND SAY PLAINLY THAT YOU CANNOT HEAR IT.** You cannot. A measured
  spectrum is not a judgement and a plot is not a listen. Render the
  twelve voices and the border crossings to **WAV files the owner can
  actually play**, put them somewhere the owner can get at them, and
  hand the ear gate to the owner. **A session that claims a sound is
  good is lying; a session that hands over the evidence is not.**

### 5. THE SOURCE — decided, by the story, and not yours to re-open

§9 parked "where the music comes from" until the story was picked. It
is picked and mapped, and it has settled the question:

- ***"somebody is playing it"* — one instrument, carried, moving around
  the world on its own schedule — IS DEAD.** `STORY.md` §8 rule 1:
  **nobody crosses a border but the walker.** A musician who moves land
  to land is the one thing this fiction cannot contain, and it would
  break the engine of the whole story in exchange for a nice touch.
- ***"the world plays it"* stands, and it is now the true option rather
  than merely the cheap one.** Each land's instrument is a thing that is
  actually there. **Brim's is the belfry and a market that finally
  opened.** Greyweather's is wind in a stone building with nobody in it.
  The office park's is two notes of hold music. The coast's is the sea.
  Nothing is scored — you are hearing where you are.

Both of those are already written into `WORLD-SYSTEMS.md` §9. Build to
them.

### 6. WHAT RUNESCAPE ADDS, AND WHAT IT WARNS YOU OFF

New on the list this session (`design/INSPIRATION.md`, and read the
whole entry — it settles interiors, the map, the endgame and a proposed
seventh content tier as well).

**Its soundtrack is the most-remembered thing about it after the map.**
Short, strange, per-area tracks on a handful of voices, and a player who
has not opened the game in a decade can name the area from four bars.
**Hearing it IS knowing where you are** — the map-as-record, in sound.
That is the bar for this session and it is a high one.

**And it names the thing to refuse, from the same game.** RuneScape
posts *"You have unlocked a new music track"* and keeps a music player
with a list in it, which turns a soundtrack into a collection with a
count — the exact thing Session 7 spent itself refusing
(`src/world/knowledge.ts`, and QUESTS §7). **A land's voice arrives
because you are standing there. Nothing announces it. Nothing lists
it. There is no track name anywhere in this game.**

---

## The constraint that will bite you, and it is not the one you expect

**`Audio.init()` needs a user gesture and the harness already handles
it; the OFFLINE renderer does not, and that is the whole reason item 4
is possible.** The trap is different: **an `OfflineAudioContext` renders
a graph, not a system.** Anything that reads `performance.now()`,
schedules off `setTimeout`, or waits on `ctx.currentTime` advancing in
real time will render silence and you will spend an hour deciding your
synth is broken. The melody's phrase scheduler is one of these. Render
*voices*, deterministically, from an explicit start time — and if you
want to prove the melody, drive its scheduler from a clock you pass in.

Two smaller ones, both already written down and both still true:

- **This sandbox renders at about 3.5 frames a second**, and App clamps
  `dt` at 0.05, so one second of wall clock is about a sixth of a second
  of game time. Anything timed against the game clock holds six times as
  long as it looks like it should.
- **A GLSL comment inside a JS template literal still may not contain a
  backtick.** Sessions 5 and 6 both did it.

---

## The gate

Three parts, and the shape is different from every previous session
because the product is.

1. **`node tools/check-audio.mjs` passes**, and it asserts the things a
   listener would notice rather than the things that are easy to
   measure.
2. **The art director on the SOUND SHEET** (the plotted voices) and on a
   full regression pass of the six protected lands at two hours
   (`HOUR=12`, `HOUR=19.6`, both viewports). The world did not change,
   so the second half should be boring, and if it is not, something
   ambient is drawing.
3. **The owner listens.** Hand over WAVs: twelve land voices, three
   border crossings, and one land at four hours of the day. **State in
   the log that the ear gate is the owner's and that you could not
   perform it.**

Iterate to WOWED on what you can judge. Log the verdicts verbatim in
`design/critiques/critique-score-1.md`.

---

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets and **zero audio assets** — every voice is synthesis;
nothing outside `Audio.ts` invents an instrument, exactly as nothing
outside `palette.ts` invents a colour; the whole graph stays a handful
of nodes; all marks via `src/engine/ink.ts`; `elevation.ts` is the only
authority on where the ground is; the camera only ever looks north; the
medium is the style and never the subject; **nobody crosses a border but
the walker**; 60fps mobile with DPR capped at 2; the chrome is shot too;
build green before every push; `node tools/check-terrain.mjs` before you
look at anything; the walker has two dots and nobody else has a face;
nothing reads as an array; **nothing is generated, ever**; no fifth
reward; no count, no list, no percentage, anywhere, for anything;
portrait is judged, not checked. End the session: pushed, `SESSIONS.md`
handoff updated, verdicts logged.

---

## Standing debts, carried forward — fix if convenient, do not derail

- **POI labels have no collision logic.** "THE CROSSROADS" prints across
  the signpost it names, and the signpost now has the story's hinge
  written on it. **Oldest visible defect in the game** and it wants its
  own slice.
- **The rowboat's first-meeting composition at THE RIVER MOUTH** is a
  lot of sand. Two gates have now passed it and pointedly not praised
  it.
- **Brim Square is full.** Session 7 fitted Marget in. The next authored
  thing in that plaza displaces something Session 3 earned.

## Two things the owner raised on 2026-08-30 — NOT this session's job

Both are written up properly. Do not start either one inside a score
session; do not let either one rot, either.

- **THE CAMERA'S BEARING** — *can the camera shift, on desktop and
  mobile, so the player can always see where they are headed?*
  (`WORLD-SYSTEMS` §2, rewritten, with the four candidates and the
  recommendation.) The complaint is exact: walking south you are walking
  backwards out of the frame, and the line runs north–south for four
  hundred and eighty units, so **Act III's whole walk is done facing
  away from it.** It is a FOUNDATIONS item by the ordering rule and it
  belongs BEFORE the five remaining lands. The number that decides the
  shape of any answer: **a standee is a flat cutout with a fixed
  rotation, so at 30° off-axis it is 87% as wide and at 45° it is 71%
  and the world reads as card.** Bounded yaw, not a free orbit.
- **A STORY GATE** (`QUALITY-BAR` §2). Every gate this project has ever
  run has judged **pictures**. THE LINE was mapped in one session and
  read by nobody. It is cheap, it needs no build, and it can run beside
  any session including this one **if there is room at the end and only
  then** — an adversarial read asking whether Act I teaches its three
  facts without stating them, whether the turn survives not being said,
  and whether the ending lands or is the shrug `STORY.md` §6 flagged in
  its own file.

## Four things are waiting on the owner, and none of them blocks you

Recorded so the next session does not re-decide them by accident:

1. **The premise line's rewrite** — *"there is no track here, and there
   is no track anywhere"* (`critique-story-1.md` has the defence).
2. **Two surviving similes**, kept on an assertion-versus-simile
   distinction: riverbend's *"practices its cursive"* and the tarn's
   *"black as the good ink"*. One-line changes if the ruling goes the
   other way.
3. **The STORY EDITOR**, proposed as a third standing critic
   (QUALITY-BAR §2, run once and logged).
4. **A seventh content tier, THE LOCAL RULE** (`QUESTS.md` §8), proposed
   off the RuneScape entry and explicitly not ratified.
