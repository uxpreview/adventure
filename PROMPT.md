# PROMPT — Session 23: INTERIORS

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
**`design/THE-FUN-PASS.md` in full** (the owner's brief; binding), §14
(the ladder: 23 is INTERIORS), `design/WORLD-SYSTEMS.md` §11 (the
roofless cutaway — camera first) and §6 (the content system, with the
sixth kind, `wear:`, added in Session 22), `design/QUALITY-BAR.md`
(the whole bar, and §3's law list, which has a clause on what the
walker may wear now), `design/STORY.md` §2 and §8, `design/THE-LINE.md`
§4 and §5, `design/critiques/critique-story-4.md` (the story gate's
fourth run: PASSED, NOT WOWED, two RECOMMENDED and the reason),
`design/THE-STRANGERS.md` (Part One now has S3 and S5 built; Part Two's
twenty errands are still one line each), `src/world/worn.ts`,
`src/world/things.ts`, `src/world/knowledge.ts`, `src/core/Audio.ts`
(`buildRain`, `rainDrops` — the rain as rebuilt), `PLAN.md`, `README.md`,
`SESSIONS.md`. **Play sheets first:** `design/play-sheets/session-22.md`,
`-21.md`, `-20.md`, `-19.md`, `-18.md`, `-17.md`, `-16.md` are what the
owner was handed; if they have played any of them, the verdict is in
`SESSIONS.md` above Session 22's entry and it governs this session. If
they have not, the sheets' questions are still open. **Sheet 22 §0**
(is the rain good now), **sheet 22 §7** (does the departure last; the
scarecrow's hat) and **sheet 18 §0** (the fifteen-second rule's
measure) are the owner's to answer.

---

## 0. WHAT SESSION 22 LEFT YOU

- **THE RAIN IS DROPS.** `Audio.ts` `buildRain` (a seeded buffer of
  raised-cosine impulses at two densities, crossfaded by intensity,
  under a bandpass around a kilohertz and a half; a low wash under a
  downpour) and `rainDrops` (audible drops, a damped sine each,
  scheduled half a second ahead by `setWeather`). Both are pure graph
  functions, so `render-wavs` writes `weather-rain-drizzle`, `-shower`
  and `weather-storm`, and `check-audio` §9 asserts the crest and the
  spectral centre a hiss cannot have. The owner's word for the old one
  was *horrible*; whether the new one is good is sheet 22 §0.
- **THE WORN THINGS.** `worn.ts`: `wear:<id>` is a sixth kind of
  knowledge, learned by a touch that takes a thing off the world at a
  visible permanent cost to its land; `worn.current` is the one slot;
  `Character.wear` draws it on the head or at the neck; the HUD's third
  button goes round what is earned and is hidden until the first is.
  Four exist: `the-crown` (Greyweather, after either door at the
  plinth; the king bare-headed in four drawings), `the-hat` (Longshore,
  caught at a run or picked up off the border; the hat never runs
  again), `the-lanyard` (the Cubicle Mile, after either door at the
  board; the easel bare), `the-helm` (on Longshore's foreshore under the
  point after `door:the-fleet-finished`; the bow man drawn without it).
  The harness has `wearing()`, `wearLabel()`, `pressWear()`, `worn`,
  `WORN`. `check-verbs` §13.
- **S5 · HOW DEEP is built.** Odd at (309, −204) on Splitrock's floor;
  `fact:odds-line`, `fact:the-oasis-a-hand-deep` (the south bank, a
  ring), `fact:the-line-did-not-reach` (the long water), `fact:how-deep`
  (the mark cut below the five, `deepMarkDecal`, and he is at it).
  `check-verbs` §14.
- **The timetable means nothing until the names do.** THE 8:15 STOP's
  note learns `fact:the-timetable` only with six of twelve `name:` ids
  held (`knownNames`, `NAMES_FOR_THE_LIST` in `civic.ts`).
- **Eight notes re-keyed** (`critique-story-4` Q1 lists them). Every
  note in the game has been read in its land's key once.
- **Six voices** (`crown-lift`, `hat-catch`, `lanyard-clip`,
  `helm-lift`, `line-out`, `chalk-cut`) in `render-wavs` under
  `the-worn-things` and `how-deep`.

## 1. THE JOB (`THE-FUN-PASS` §14, Session 23)

1. **INTERIORS** — `WORLD-SYSTEMS` §11, camera first. The roofless
   cutaway: one per MEMORY land to start (Marget's, Val's, the
   gatehouse), then the studio, the van, the longship. B2's rule holds
   inside: every wall is a drawing and a barrier.
2. **THE ERRANDS AS CARRY** (`THE-STRANGERS` Part Two), carried from
   22: the twenty need carry or touch and both exist; the can, the oar
   and the board are the pattern (a carriable with a home, a `hand`
   drawing, a place that takes it, a fact it writes). Build the ones
   whose lands are opened for interiors first.
3. **`critique-story-4` RECOMMENDED 1 and 2**: THE SHALLOWS in the
   frightening key; the helm's absence visible under Wren's other door.
4. **THE DEPARTURE, IF THE OWNER SAYS SO** — §2 below.
5. **The art gate** on every land an interior opens.
6. **The play sheet.**

## 2. THE LARGER DEPARTURE-PERMANENCE — written, not built

Unchanged from Session 21's prompt, and still the single thing between
the story gate's PASSED and its WOWED (`critique-story-4` Q4). If the
owner's answer is yes:

- **The rule.** After `fact:the-8-15-ran`, a person who got on is gone
  from their land — not drawn, at any hour, in any save — and their
  routine with them. The train writes `fact:left-from-<land>` as it
  pulls away with somebody aboard, and each land reads that one id
  every frame the way it reads `platform.land` now. One clause per
  land, twelve clauses.
- **What each land loses, and what stays.** Marget: the stall stays
  laid, open, with nobody behind it. Wick: the banners stay up and
  nobody changes them. Val: the porch light stays on with nobody in the
  house. Holt: the boat on the floor, the house dark at night. Amos: the
  lid off, the track growing over. Pye: the eighth pot and no rows.
  Brack: the round with nobody on it, and the goat. Wren: the bell not
  rung at noon. Nell: the cart turned north at a gate nobody leans on.
  The man: gone from the junction, the wear still curving round
  nothing. Dennis: the desk plate, the shelter light at dusk, nobody at
  the board. Joan: never leaves.
- **What it must not do.** Nothing says they left. Nothing counts them.
  Nobody remarks on an absence. The daily train still stops thirteen
  seconds at every platform and takes nobody.
- **Cost.** One session-half. If the answer is no, delete this section
  and record the no in `THE-LINE.md` §5 with the owner's words.

## 3. WHAT CONSTRAINS IT

1. **NOBODY CROSSES A BORDER BUT THE WALKER.** A worn thing is on the
   walker and is not a thing; it has no position and never had one.
2. **NOTHING SAYS WHICH DOOR WAS RIGHT**, and a worn thing is not a
   prize for one: none is gated on which door, every one costs its
   land, nothing counts them.
3. **NOBODY SAYS THE TURN.** `STORY.md` §8 rule 5, absolute.
4. **A NUMBER MAY RECORD AND MAY NEVER GRADE.** `knownNames` is read by
   the stop's note and by nothing else.
5. **A PROTECTED FRAMING MAY MOVE WHEN THE LAND INSIDE IT IS THE SCOPE**
   (`QUALITY-BAR` §3). Interiors will; say which and by how much.
6. **B2's rule stands**: every new building registers its footprint;
   nothing new puts the camera inside a drawing — and an interior is
   the first time the camera is meant to be inside one, which is why
   §11 says camera first.

## 4. THE GATES THAT ARE THE OWNER'S

1. **THE PLAY GATE** — sheets 16 to 22 may have come back.
2. **THE EAR GATE** — a hundred and nine WAVs in `out/sound/`, three of
   them the rain, unheard.
3. **THE FEEL GATE** — owed since 12.

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets and zero audio assets; every voice is synthesis and
nothing outside `Audio.ts` invents an instrument, exactly as nothing
outside `palette.ts` invents a colour; all marks via `src/engine/ink.ts`;
`elevation.ts` is the only authority on where the ground is; the
resting bearing is due north, walking does not turn the frame, and a
stopped walker is always in the shipped composition; the medium is the
style and never the subject; **nobody crosses a border but the walker —
and no thing does either, and no companion, and birds do**; 60fps
mobile with DPR capped at 2; the chrome is shot too; build green before
every push; the walker has two dots and nobody else has a face (the
owner's four animals excepted, on the owner's hand), **and the walker
may wear one thing, taken off the world at a cost**; nothing reads as
an array; nothing is generated, ever; no fifth reward; a number may
record where the player has been and may never grade what they did,
and the ending stays absolute; portrait is judged, not checked;
looking is the first verb and not the only one; a choice card is
allowed and a dialogue wheel is not; local stakes are allowed and a
villain is not; districts are allowed and more sheet is not; the world
may point the way and may never say the turn; a protected framing may
move when the land inside it is the scope, measured; every barrier is
a drawing, there are no invisible walls, and every building is a
barrier; a routine is a pure function of the hour, and the weather is
a pure function of the day and the hour; a sound with a place is a row
in `earshot.ts`, and no road is silent for fifteen seconds; every wait
has two doors, both visible before either is taken, and the ending
reads them. End the session: pushed, `SESSIONS.md` handoff updated,
verdicts logged, **play sheet written**.

## Standing debts, carried forward

- **THE LARGER DEPARTURE-PERMANENCE** — §2, the owner's yes or no.
- **THE ERRANDS AS CARRY** — Part Two's twenty, one line each still.
- **`critique-story-4` RECOMMENDED 1 and 2** — this session's.
- **THE SCARECROW'S HAT** — the obvious fifth worn thing, declined
  because the Downs is not a joke and its scarecrow stands in a
  protected framing; sheet 22 §7 asks the owner.
- **The king's road runs through Brim's fountain** (B2).
- **The rowboat's first-meeting composition at THE RIVER MOUTH** —
  fifteen gates have passed it.
- **THE HARROW DOWNS' stooked field**, **GREYLINE CITY's THE HOLLOW**.
- **Brim Square's market-day crowd.**
- **READ THE PROCLAMATION** and **THE 8:15 STOP's label** in the
  SKYLINE.
- **The fifteen-second rule's measure** — sheet 18 §0; the owner's.
- **The bicycle, the chair and the carries on the feel gate**;
  **`check-camera` on a bicycle**.
- **The lamplighter is a dim figure at dusk** — the owner's call.
- **A wash tint per district** — declined three times.
- **The Penwood and the Downs dip under 55 fps** on the owner's Mac.
- **Wick, Pye, Wren, the barista and the designers at dusk are small**:
  scale 1.15 if the owner cannot find them.
- **THE CART's label sits high** on Greyline's shop row.
- **The pavement's card and the tarn's card are skippable by standing
  still and by walking in** (both kept).
- **The barista's dog's paws fade in fifteen minutes.**
- **The can's water is not saved.**
- **Marget's board says nothing about the hour** under either clock
  door.
- **The hat's three runs are still registered events** after it is
  taken; `check-roads` walks a fresh page and never meets the case.
  Harmless; one `if` if it matters.

## Not this session's job

- **THE JUROR** — last.
