# SESSIONS — the handoff log

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
