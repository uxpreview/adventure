# PROMPT — Session 15: THE FIRST HOUR

You are continuing INKLANDS in `uxpreview/adventure`. Read, in order:
`design/QUALITY-BAR.md` (binding), **`design/critiques/critique-story-2.md`
in full** (it is the only gate this project has ever failed and it is
one finding from being closeable), `design/THE-LINE.md` **§1**,
`design/THE-WAITS.md` **§1, §6, §8, §9 and §13**,
`design/THE-STRANGERS.md` **S1, S4 and S6**, then `PLAN.md`, `README.md`,
`SESSIONS.md`.

**Session 14's handoff first.** It built the ending. That is what makes
this session what it is.

---

## 0. THE ENDING EXISTS NOW, SO THE BEGINNING IS THE WEAKEST THING LEFT

Twelve lands hold a verdict. Act III is built, Act IV is built, and the
8:15 comes down the line and stops twelve times. Eight of the twelve
waits are authored end to end.

**Act I is one optional beat on one road.**

`critique-story-2.md` — the only gate this project has ever failed —
said so in its first finding, and nothing has touched it since:

> Everything downstream of *nobody can leave* and *you can* hangs on
> Nell stopping at the Brim border, which only happens to a player who
> walks north having met her. Two of the three facts, and the entire
> premise of the walker, are downstream of one optional, directional
> beat.

**MANDATORY 2 was closed by Session 14** (the 8:15 arrives already
carrying the lands above you). **MANDATORY 1 is yours.** Close it and
the story gate can be re-run, and **this project has never earned a
WOWED on its story.** That is the session.

**And the four remaining waits are all buildable today, on ground that
already holds a verdict, with every dependency they need already in the
source.** Session 14 was the one that made NELL possible: her fourth
name is the timetable in the Cubicle Mile, and until last session there
was no timetable to read.

---

## 1. THE JOB

### 1. THE CO-WALKER, AS A RULE OF THE WORLD

`critique-story-2` MANDATORY 1, verbatim:

> Make it a rule of the world rather than a scripted beat: **anybody the
> walker is travelling near stops at their own border**, on any road out
> of any land. Then whichever of the four names on the signpost the
> player picks, somebody walks with them and somebody stops, and I.7's
> second instance is a matter of time rather than of route. It is also
> cheaper than the scripted version and truer to `STORY.md` §8 rule 1,
> which is a law and not a set piece.

It is a SYSTEM, not a beat: an inhabitant who is near you when you set
off down a road falls in beside you, keeps station for as long as you
are both going the same way, **and stops dead at the edge of their own
rect** — and does not explain, and does not follow, and is there again
tomorrow. `THE-LINE` §1 rows I.3 and I.7 are the whole specification.
Twelve lands have standing people in them now; every one of them is a
teacher of fact two.

**What it must never become:** a companion, an escort quest, a thing
that talks, or a thing that gets in the frame. It is a person walking
beside you who stops when the ground under them runs out, and **the
player is the one who notices, on the second or third one.**

### 2. THE FOUR REMAINING WAITS, AND THEY NEED NO NEW LAND

Every one of these stands on ground that is already WOWED, and **every
resolving condition already exists in `knowledge.ts` or is learned by a
note that already ships.** Nothing here needs a rect opened.

| land | person | resolves on | the permanent change | source |
|---|---|---|---|---|
| **THE COMMON** | **NELL** | `fact:the-timetable` — the fourth name on the signpost, read off the board in the Cubicle Mile, **built last session** | the hay cart is loaded, and turned north. It does not leave | `THE-WAITS` §9 |
| **CASTLE GREYWEATHER** | **WICK** | Marget's cloth in Brim (`reason:brim` and/or a new `fact:` on the stall's dye) | a **fifth banner** on the avenue, in Brim's colours, in every later save | `THE-WAITS` §1 |
| **LONGSHORE** | **PYE** | `name:ocean` — the bell buoy, which nobody in Longshore has seen | an **eighth pot**, further out than the seven, on a bearing he has never rowed | `THE-WAITS` §6 |
| **THE WIDE BLUE** | **WREN** | `route:the-bar` — a hundred and eighty units of dry paper, walked | a **second mark** at the bar's far end. Two marks make a line | `THE-WAITS` §8 |

Read all four entries in full before you place anything. Three notes:

- **NELL IS ACT I'S CLASSROOM AND THE GATE HAS ALREADY WARNED YOU ABOUT
  HER.** I.2 asks a player to read *straighten → settle* on a standee
  with no face at the shipping camera. Session 7's gotcha, quoted back
  at you by the story gate: *a silent system still has to be visible —
  the map's registers needed THREE signals, not one, because the
  difference did not survive the scale.* Nell's straighten is currently
  one signal. **Assume it needs three** — the posture, the gate she is
  leaning on, and where her feet point — and **shoot it before you
  believe it.**
- **WICK'S FIFTH BANNER is the first time two lands are visible in one
  frame and neither of them crossed anything to do it.** It is worth
  more than it costs.
- **BRIM SQUARE IS FULL** (standing debt). Wick's dependency lives
  there. Read the cloth, do not add a stall.

### 3. THE THRESHOLD GOES BACK TO SEVEN

`knowledge.WAITS_FOR_THE_LINE` is **five** and the comment on it says
why: eight of twelve waits existed, and a threshold of seven against
eight would put somebody on almost every platform, and IV.3 is only an
ending because the platforms DIFFER. **Build the other four and it goes
to seven**, which is what `THE-LINE` §4.1 proposed. Change the constant
and the comment together, and re-shoot the ending at both states.

### 4. THE TWO RECOMMENDED FINDINGS, AND BOTH ARE CHEAP

- **RECOMMENDED 2 is about a thing Session 14 built and knowingly left
  open.** The Cubicle Mile's wait resolves on reading the board, full
  stop — so a player who walks east in their first ten minutes is handed
  the shape of the answer and spends eleven lands confirming a thesis
  instead of building one. The gate's own fix, and it is in-fiction
  rather than a lock: **a timetable is a list of place-names, and it
  should mean nothing until some of the names on it do.** Let
  `fact:the-timetable` require holding several lands' NAMES — which the
  map already tracks in three registers and which the player earns by
  having been places. Early it is a list of words; late it is the order
  of the world. **Nothing may announce the difference.**
- **RECOMMENDED 1**: four of the twelve waits carry reciprocity and eight
  say only *my answer is over there*. The cheapest pair to fix is
  LONGSHORE and THE WIDE BLUE, which are one relationship written from
  one side twice — **and you are building both of them this session.**
  If Wren's second mark is visibly the thing Pye was missing, the pair
  becomes reciprocal for no new content at all. Then update
  `THE-WAITS` §13, because §13 is the artifact the gate reads cold.

### 5. THE GAUNTLET, AND THIS TIME THE DIFF IS THE POINT

`check-terrain`, `check-audio`, `check-fields`, `check-camera`,
`check-sightline`, `diff-sheets`, `shoot-mobile`, and the art director
on both viewports.

**`diff-sheets` matters more this session than it has ever mattered.**
Every other land session worked in a rect nobody had judged. **You are
working inside four lands that hold verdicts** — the Common (which
carries the title framing and the first minute), Greyweather, Longshore
and the Wide Blue — and the co-walker rule touches *every land in the
world*. A framing may not move for a session's convenience. When one
moves because the land inside it was the scope, say which, by how much,
and what the verdict was awarded on.

### 6. THEN RE-RUN THE STORY GATE

It is in `QUALITY-BAR` §2, it needs no build, and it has returned NOT
YET exactly once. Run it as an **adversarial read**, not a review — *a
critic who is trying to find the shrug is worth ten who are trying to
enjoy it* — and log it as `critique-story-3.md`. It should now be able
to answer Q1 and Q3 with the systems in front of it rather than the
prose.

---

## 2. WHAT SESSION 14 LEFT YOU

- **`src/engine/Eight15.ts`** — the last mount and the ending's
  instrument. It runs `layout.THE_LINE`, stops twelve times, and it is
  not in the world until it has run. **It exports `platform`**, module
  scope, which is how a land knows not to draw its own person while
  they are standing on a platform — you will want the same shape for
  the co-walker, and for the same reason.
- **`layout.THE_LINE`, `LINE_ARC`, `lineAt`, `nearestOnLine`,
  `LINE_STOPS`, `LINE_STOP_S`** — the drawn line as one polyline,
  assembled from the roads rather than authored twice.
- **`knowledge.WAIT_ANSWERS`** — the only place in the source where the
  twelve are written down as twelve, with four entries missing on
  purpose. **Filling those four in is most of job 2's bookkeeping**, and
  a land with no entry has a platform that is always empty.
  `knowledge.answered(id)` and `answeredWaits()` are the readers, and
  `answeredWaits()` has exactly one caller and no path to a pixel.
- **`src/world/textures-office.ts`** — thirty drawings and the third
  rule (*every mark ruled, and every mark stops short*).
- **`check-terrain` has two new proofs**: the office park is the
  flattest ground in the world and no other land is as flat, and the
  line is continuous with all twelve stops on ground you can stand on.
- **`render-wavs.mjs` renders `Audio.event` now.** Fifty-three WAVs,
  thirty-four of them land voices that had never been heard by anybody.
  If you add a voice, it is in the pack for free.
- **The count law is amended** — see the short form below. It is not
  the law every prompt before this one repeated.

---

## 3. THREE THINGS THAT CONSTRAIN THE WHOLE SESSION

1. **NOBODY CROSSES A BORDER BUT THE WALKER.** It is the engine of the
   whole story and this session is the one that could break it by
   accident, because it is building a system whose entire job is to walk
   people down roads. The co-walker exists to make the border VISIBLE.
   The moment one of them steps over it, the game has retracted itself.
2. **NOTHING TAKES THE CONTROLS AND NOBODY EXPLAINS ANYTHING.**
   `THE-LINE` §3.4 and `STORY.md` §8 rule 5. Nell does not tell you she
   cannot leave. Wick does not tell you the king is dead. No note in any
   of these four lands gains a sentence that says what the wait is.
3. **THE FIRST MINUTE HOLDS A VERDICT FROM SESSION 2** and the title
   poster is one of `diff-sheets`' protected framings. The Common is
   where this session does its most delicate work and it is also the
   most-shot land in the game.

---

## 4. THE GATES THAT ARE THE OWNER'S, AND ONE DECISION THAT IS ALSO THEIRS

`QUALITY-BAR` §2, and Session 12 is the whole argument for taking this
seriously:

> **A system whose gate has not been run is not done. It is SHIPPED AND
> UNJUDGED, and those are two different words.**

1. **THE EAR GATE.** `node tools/render-wavs.mjs` writes fifty-three
   files to `out/sound/` now — twelve lands, three borders, four hours,
   and **thirty-four land voices that had never been rendered to
   anything a person could play.** Nobody has heard this game.
2. **THE FEEL GATE**, owed again since Session 12 closed the camera.
3. **AND ONE DESIGN DECISION IS THE OWNER'S AND IT IS THE LARGEST THING
   LEFT IN THE STORY.** When the 8:15's doors close, the people who got
   on are back where they stand tomorrow. Making the departure permanent
   is one clause per land — `Eight15.ts` already exports `platform` and
   every routine is already gated on the hour and on knowledge — but it
   re-opens the authored routine of seven lands that hold verdicts, and
   it changes what Val's porch light MEANS. `THE-LINE` §5 does not
   require it. **Do not decide it in a land builder.** Put it to the
   owner as a question with the cost written down.
4. **AND ONE THING HAS NOW BEEN DEFERRED THREE TIMES AND SHOULD STOP
   BEING DEFERRED.** `WORLD-SYSTEMS` §4 promises every quadrant a mount
   and the wilds' is **THE PAPER PLANE**. Sessions 10, 11, 13 and 14 all
   judged it below the line, in writing, with the brief unchanged each
   time. Four sessions is not an accident, it is a verdict nobody has
   written down. **Either it gets a session of its own, or it is retired
   in `WORLD-SYSTEMS` §4 with the reason in it.** Ask.

---

## Law (short form — QUALITY-BAR.md is the long form)

Zero image assets and zero audio assets; every voice is synthesis and
nothing outside `Audio.ts` invents an instrument, exactly as nothing
outside `palette.ts` invents a colour; all marks via `src/engine/ink.ts`;
`elevation.ts` is the only authority on where the ground is; **the
resting bearing is due north, walking does not turn the frame, and a
stopped walker is always in the shipped composition**; the medium is the
style and never the subject; **nobody crosses a border but the walker**;
60fps mobile with DPR capped at 2; the chrome is shot too, on the
desktop as well as the phone; build green before every push; the walker
has two dots and nobody else has a face; nothing reads as an array;
nothing is generated, ever; no fifth reward; **a number may record where
the player has been and may never grade what they did** — amended by the
owner 2026-08-31, executed Session 14, `QUESTS.md` §7.1 has the argument,
and **the ending is out of scope and stays absolute: nothing counts the
platforms**; portrait is judged, not checked. End the session: pushed,
`SESSIONS.md` handoff updated, verdicts logged.

## Standing debts, carried forward

They live in `PLAN.md` too, because this file is overwritten every
session.

- **THE ENDING HAS NO CONSEQUENCE THAT LASTS** — §4.3 above, and it is
  the owner's.
- **The rowboat's first-meeting composition at THE RIVER MOUTH.** Seven
  gates have passed it and pointedly not praised it, and `route:the-river`
  is what resolves HOLT — so that boat is the front door of a wait.
  **And this session is in Longshore anyway.**
- **THE HARROW DOWNS' stooked field**, **THE PENWOOD's east arc**, **THE
  BLEACH FLATS' `WHERE THE ROAD STOPS`** and **GREYLINE CITY's THE
  HOLLOW**: all passed, none praised. The last one is a fold too shallow
  for the terrain to draw and too deep to ignore, and the fix belongs to
  `elevation.ts` rather than to a land.
- **Holt's lit window** is one warm pixel at forty units. It is the only
  lit window in the east half of the world and it deserves a glow.
- **Brim Square is full.** The next authored thing in that plaza
  displaces something Session 3 earned — **and Wick's dependency is in
  it.**
- **READ THE PROCLAMATION** on Greyweather's barbican is a compromise
  (`critique-camera-1.md`, round 3, noted-not-blocking) — **and so is
  THE 8:15 STOP's label** (`critique-art-9.md`), for the same reason and
  in the same system. Two now. Whoever next opens the SKYLINE should
  take both.

## Not this session's job, and recorded so nobody re-derives them

- **The four un-numbered sessions** `PLAN.md` sizes at the end —
  interiors (the roofless cutaway, `WORLD-SYSTEMS` §11), weather,
  inhabitants-and-routine, and one authoring pass for the story's
  evidence — are what takes this from six hours to twelve. The
  co-walker is the first brick of the third of them and the rest is not
  yours.
- **THE JUROR** (`PLAN.md` row 17): the Awwwards pass on the whole build
  — title, first minute, one full land crossing, the map. It wants a
  game whose first hour works, which is why it is after this one and not
  before it.
- **A land may be improved and may not be regressed.** If a framing in
  the Common, Greyweather, Longshore or the Wide Blue moves, it moves
  because the land inside it was the scope, and you say so with a number.
