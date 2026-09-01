# PLAN — the session ladder

Session 1 built the sheet, the engine, and a scatter draft of all twelve
lands. Every session from here builds it out or up under
`design/QUALITY-BAR.md`, and `design/WORLD-SYSTEMS.md` is the standing
plan for everything that is not a land.

**The ordering rule (owner decision, 2026-08-28):** *systems that change
how a land is authored must land before the lands are authored.*
Elevation, the camera, traversal and time all do. Building six more
lands flat and then adding elevation means re-opening six lands — so the
ladder was re-cut after Session 3 to put the foundations first.

**The same rule moved THE SCORE forward** (2026-08-29): a land's VOICE
is part of authoring the land, so per-land music belongs ahead of the
five lands still to be built, not in the polish pass at the end. It sat
at Session 11; it is Session 8. Nothing else moved, and the story stays
at Session 7 where the owner put it.

**And one standing rule governs everything from here** (owner
direction, 2026-08-29): *the medium is the style, never the subject.*
No story about the paper, the pen or the drawing. Every candidate
DIRECTION.md carried before that date was one, and all of them are
retired; the chosen story is **THE 8:15** (`design/STORY.md`).

| # | Session | Scope |
|---|---------|-------|
| 2 | **The first minute** ✓ 2026-08-28 | THE COMMON + the title framing + the south face of THE KINGDOM OF BRIM. Gate to WOWED (`critique-art-1.md`). |
| 3 | **The old world** ✓ 2026-08-28 | CASTLE GREYWEATHER + THE KINGDOM interior. The flagship keep walk. Gate to WOWED (`critique-art-2.md`). |
| 4 | **The paper has a shape** ✓ 2026-08-28 | **Foundations.** Terrain elevation (crease / curl / buckle / tear / what's under the sheet) in `elevation.ts`, routed through the build context; a fold DRAWN rather than shaded; the camera redesigned around it; footprints, collision and the character lifted; steep made impassable. Portrait made a gated viewport. The margins inheritance audit executed. Greyweather rebuilt on a real ridge. Gate to WOWED (`critique-art-3.md`). |
| 5 | **The coast** ✓ 2026-08-29 | LONGSHORE + THE WIDE BLUE, the first lands authored *with* elevation. THE HOLDFAST (a headland the tear went round, authored as a polygon so its faces are planar), THE CUT (a ledge graded out of the page — the only way up), SHELTER COVE, and THE SANDBAR, which is what makes open water a land you can walk. Four new audio voices and two new instruments. Gate to WOWED (`critique-art-4.md`). |
| 6 | **Traversal & time** ✓ 2026-08-29 | **Foundations.** Sprint as INK WEIGHT (one continuous scalar: speed, stride, the print's ink, the step's level and the score's intensity are all readouts of it, and the middle of its range is the shipped mark). Roads that CARRY, authored per road and *measured* — the king's road / main street / commuter spur chain carries hardest, because STORY §4 makes it one road under twelve names. THE ROWBOAT, the first mount: found at the river mouth, left where you leave it, the river turned from a wall into the only east–west road in the world, and the open sea authored to refuse. And THE DAY CYCLE — forty minutes, graded in one place, with eight in the morning to four in the afternoon bit-for-bit the shipped page, plus Brim's lamps, its windows and two fires at Greyweather's gate. Gate to WOWED (`critique-art-5.md`). See `design/specs/traversal.md`. |
| 7 | **The stories** ✓ 2026-08-30 | THE LINE mapped beat by beat with Act III's standing place solved and **THE ENDING SETTLED** (`design/THE-LINE.md`); the twelve WAITS, each with its person, its places, its TURN and its visible permanent change (`design/THE-WAITS.md`); the eight STRANGERS and the errand / encounter / unmarked inventories (`design/THE-STRANGERS.md`). **KNOWLEDGE** built as the content system (`src/world/knowledge.ts` — a NAME, a FACT, a ROUTE, a REASON, and no count anywhere), the **MAP MADE THE RECORD** in three registers with the line inked once you have walked it, and **BRIM'S WAIT AUTHORED END TO END**: Marget, her routine off the clock, the belfry's two hands, and a market that opens and stays open. Plus the voice pass — **24 of 34 notes**, the premise line included. Gate to WOWED (`critique-story-1.md`). From here every land session ships places **and** its wait **and** its named inhabitant. |
| 8 | **The score** ✓ 2026-08-30 | Five synthesised instruments over twelve lands, doubled by FAMILY (music box, plucked string — Karplus–Strong, rendered rather than wired — bowed voice, struck metal, air), each land's assignment authored with its register and its one-line reason; a BED per land, and it is the quietest thing in the mix; a border that is a three-and-a-half second EQUAL-POWER crossfade of both the room and the instrument; and a mix that answers the walk and the hour. **And the proof, which was the hard half:** `check-audio.mjs` renders the score offline and asserts it, `verify-score.mjs` proves the wiring in the running game, `shoot-sound.mjs` draws it in ink, and `render-wavs.mjs` hands the ear gate to the owner — because it is the first product in this project that cannot be screenshotted. Gate to WOWED (`critique-score-1.md`). See `WORLD-SYSTEMS.md` §9. |
| 9 | **The bearing** ✓ 2026-08-30 | **Foundations, and the last of them.** The camera answers TRAVEL, in two components: the part that CROSSES the frame turns it (26° on desktop, 12° in portrait, the envelope authored off the standee table), and the part that comes AT THE LENS opens the ground at the walker's feet (the astern terms) — because a bounded yaw cannot help the walk south and `WORLD-SYSTEMS` §2 was wrong to say it could. Plus the PEEK (a gesture, never a state) and a lead capped per rig. **And the proof, which was half the session:** `tools/diff-sheets.mjs` — a regression is a diff and not an opinion — standing on a harness that pins all four of the game's clocks so two shots of one framing are one picture, and `tools/check-camera.mjs`, which asserts the envelope, the continuity and the walk south in units of page. **And the oldest visible defect closed:** THE SKYLINE, so a name is written over the thing it names instead of across it. Gate to WOWED (`critique-camera-1.md`). |
| 10 | **Farm & forest** ✓ 2026-08-30 | THE HARROW DOWNS + THE PENWOOD, and the first land session that could prove the page had not moved while it worked. **THE HARROW** authored into `elevation.ts` (the land is named for a thing that rakes a field into parallel lines, and it is now the ground), the mill rise, and the tarn's bowl. **THE PENWOOD HAS ONE ROAD AND IT IS A CIRCLE** — BRACK'S ROUND, forty-two units about the water, with the track from Brim running in and stopping at it: `THE-WAITS` §7's turn told entirely in a polyline, said by the map and by nothing else. Eleven authored FIELDS as polygons, one state each, hedged along the grain; four authored stands of pine with the voids between them doing as much work as the trees; THE FORD (`layout.FORDS` — the bed rises, the water does not fall, so `route:the-river` survives). **Both waits end to end:** JOAN HARROW's second setting, put away every evening and laid every morning until you sit down, and BRACK's quarter turn. Six ambient voices and one authored silence. Gate to WOWED (`critique-art-6.md`). See `design/specs/harrow-downs.md` and `design/specs/the-penwood.md`. |
| 11 | **The dry lands** ✓ 2026-08-31 | SPLITROCK CANYON + THE BLEACH FLATS, and the session that MOVED A LANDFORM. Session 4's tear was cut at x = 338, six units from the foot of the world's curled east margin, and the trail that is the only way into that land never came within thirty units of it; it is at x = 300 now, in the middle of its own rect, with the river's source moved with it, the trail re-laid, and the depth tuned so `check-terrain` still prints **floor −10.8** — because `THE-STRANGERS` S5 is an errand about that number. **THE ONLY ROAD IN SPLITROCK IS A RIVERBED**: the trail rounds the head of the river (there is no bridge on this water), drops down the mouth, and runs a hundred and twelve units north along the floor of the tear itself, every point of it `tearX(z)` sampled. **HOLT's** four chalk marks are the only horizontal marks in a land drawn entirely in verticals and their heights are the boat, the trestles, the shed's ridge and the lip; the fifth is above the lip and behind it is his house. **AMOS** carries water forty units UPHILL both ways every night, on a track that is not a road; the gutter runs downhill from the cistern and nothing mentions it. Plus **`fact:the-fold`**, authored end to end for the first time — the design's own dependency, missing from the source since Session 7. Gate to WOWED (`critique-art-7.md`). See `design/specs/splitrock-canyon.md` and `design/specs/the-bleach-flats.md`. |
| 12 | **The hands and the eye** ✓ 2026-08-31 | **Foundations, re-opened, and not by choice.** THE FEEL GATE — owed since Session 9 — was run by the owner and **returned NOT YET while all six of `check-camera`'s claims stayed green**, because every one of them is about WHERE the camera ends up and none about the journey between two of those places. Measured at the tick, the frame swung **51.2° at 34.7°/s** for one change of mind about which way to walk. **The two components separate perfectly:** the yaw is 100% of the rotation and 12% of the gain it was built for (3.2 units of page on top of 27 the pinned rig already had); the astern is 100% of the walk south and rotates nothing. So **the automatic yaw comes off both rigs and the envelope survives whole as THE PEEK'S** — rotation in this game is a thing the player asks for — and `asternEase` slows so the rig can never give ground faster than the walker covers it. **The crossing component leans the WALKER now**, at the one place in the picture that is never cropped. Plus: the phone's stick gated on `pointerType` and click-drag-to-walk removed from the desktop with the argument written down; the run taught ONCE, at the moment it becomes worth having, because **the trail could not teach it — the prints are laid behind the walker and the frame's bottom edge is three and a half units behind them**. `check-camera` asserts a RATE now and not only a place; `shoot-mobile` shoots five rigs including the desktop and its joystick step is an assertion; and `tools/pw.mjs` unhard-codes the browser path so the gates run on the owner's machine at all. See `design/specs/camera.md` §0 and `design/specs/controls.md`. |
| 13 | **The now** ✓ 2026-08-31 | MAPLE COURT + GREYLINE CITY, and the first land session judged through a camera that does not lean. **THE LINE'S SIGHTLINE IS ASSERTED NOW AND NOT TRUSTED** (`tools/check-sightline.mjs`): the shipped draft broke `THE-LINE` §3.2 twice — a signpost five units off the axis and thirty street trees on a scatter whose only bound was the road's own paint — and neither would have failed a check or shown in a contact sheet. **THE END OF THE SURVEY** built and left unlettered: the street thins south until there are two plots with kerbs, dropped kerbs and driveways and no houses, and then gravel, and then three pegs. **MAPLE COURT is drawn in closed shapes and GREYLINE CITY in marks that leave the frame**, which is the SPLITROCK/BLEACH FLATS pairing done for the two lands whose subject is the present day. **VAL's porch light never goes fully out**; the hedge is cut back open on `name:castle` and stays cut. **THE MAN AT THE JUNCTION costs four seconds of standing still** — the one permanent change in the game with no knowledge gate — and the pavement worn round him is a drawing, not a note. **S3, THE ELEVEN UNITS, is built at both ends**: June's latch plate is worn bright, and once you have stopped for him she is at the fence and stays there. Plus the keep vista's missing far bound, found from a land it had never been seen from. Gate to WOWED (`critique-art-8.md`). See `design/specs/maple-court.md` and `design/specs/greyline-city.md`. |
| 14 | **The 8:15** ✓ 2026-09-01 | THE CUBICLE MILE — **the last scatter draft in the world** — its wait, and the mount, and the mount is the ending of the game. **THE THIRD RULE**: Maple Court's marks close and Greyline's leave the frame, so the third present-day land takes the third thing a line can do — **every mark ruled, and every mark stopping short of the one it was going to meet**, which is what a promise looks like drawn. **Every roofline in the land at the same height** (a second horizon three units above the real one, with one building breaking it because it was phase two) and **nothing touching the top of the frame at all**, which is the opposite of Greyline in the one measurement the camera cares about. **The only land in the world that authors NO ground**: the office park is flat to 0.45 units across 110 × 116 against 15.8 anywhere else, and `check-terrain` asserts both numbers so no later session sprinkles a hill on it — what recedes instead is PAINT. **THE 8:15 IS BUILT** (`THE-LINE` §4): `layout.THE_LINE` assembled from the three roads that already carry the flag so it cannot drift from the road the player walked; twelve stops in the surveyors' order, and the twelve are a SURVEY's twelve entries — the places the surveyors were due, each noted against the land it was to serve — so nobody crosses a border and there is exactly one shelter in the world; it starts on `route:the-line` plus five of the twelve waits and nothing anywhere shows the number; **Joan Harrow's platform is always empty**; **it arrives already carrying the lands above you**, which is `critique-story-2`'s second mandatory finding closed exactly as asked; and it is drawn front-on down the king's road and broadside at every stop, because *a train you are watching is going somewhere and a train you are in is a room*. Plus DENNIS and the survey schedule and the shelter's light; `THE-STRANGERS` S8 built at both ends for one clause and one id; **the count law amended with the owner's words in it** (`QUALITY-BAR` §3, `QUESTS` §7.1); and **the ear gate rebuilt** — the booth renders `Audio.event` now, so thirty-four land voices that had never been heard by anybody are in the owner's listening pack. Gate to WOWED (`critique-art-9.md`). See `design/specs/the-cubicle-mile.md`. |
| 15 | **The mount, and the wilds' reward** | **THE PAPER PLANE** (`WORLD-SYSTEMS` §4), **deferred in writing for the THIRD time** — Session 11 wrote the brief, Session 13 was over-scoped, and Session 14 was one land, one wait, a MOUNT THAT IS ALSO THE ENDING OF THE GAME, a law amendment and a rebuilt ear gate. The brief has not changed and is below. It goes to 16, or to a session of its own. |
| 16 | **Motion & life** | Systems pass: wind everywhere, sails and windmills turning, NPC routines, road encounters. (The score moved out of this session to 8 — see the ordering rule.) |
| 17 | **The juror** | Awwwards pass on the whole build: title, first minute, map, UI feel, mobile portrait, performance audit, then the full-gauntlet critique. |

**AND THEN THE OWNER PLAYED IT, AND THE LADDER WAS RE-CUT AGAIN**
(2026-08-31, after Session 11 merged). **THE FEEL GATE — owed since
Session 9 and listed in `QUALITY-BAR.md` §2 as one of the two gates no
tool in this repository can run — was run, and it returned NOT YET.**
The desktop camera makes the owner feel sick; the phone's joystick
appears on the desktop under a mouse; the run cannot be found on a
keyboard. All three reproduced against the merged build.

**That displaces the lands, and it displaces them by this file's own
law.** The ordering rule at the top of this document says *systems that
change how a land is authored must land before the lands are authored*,
and **the camera is the most load-bearing example of it in the file**:
every composition in this game is framed through it, and THE SHOT of all
eight built lands was chosen by looking down it. Three more lands built
on a camera that has to change is three lands re-opened, which is
exactly the mistake the ordering rule was written after Session 3 to
prevent.

So **Session 12 is THE HANDS AND THE EYE**, THE NOW moves to 13, THE
8:15 to 14, and everything below shifts. If the owner would rather have
the lands first, swap them back — but the camera fix ships before three
more lands are judged through it.

**AND THE SPLIT SESSION 11 RECOMMENDED IS TAKEN**, for the reason it
gave: Session 12-as-written was three lands, three waits, three named
inhabitants, THE LINE's riskiest un-shot framing and a mount, against
every other land session's two-and-two.

**SESSION 12 WAS THREE LANDS AND SHOULD BE SPLIT, AND SESSION 11 IS THE
SESSION THAT NOTICED, WHICH IS WHAT THE LADDER ASKED FOR.**

Session 10 and Session 11 were each two lands and two waits, and both of
them spent a full third of their budget on the gate rather than on the
building — Session 11 ran five rounds and threw away a whole placement
plan in the middle of them. Session 12 as written is **three lands, three
waits, three named inhabitants, THE LINE's riskiest un-shot framing
(§3.2), and the 8:15 drawn into existence**, which is a MOUNT and the
payoff of the entire story. That is not two sessions' work wearing one
number; it is closer to three.

The split this ladder recommends, and the reason for the cut:

- **13 — THE NOW.** MAPLE COURT and GREYLINE CITY. Two lands, two waits,
  the shape every land session since 10 has held. §3.2's rim composition
  is shot FIRST, not last, because Maple Court's houses, trees, cars and
  hedges are the only things that can break it.
- **14 — THE 8:15.** THE CUBICLE MILE, its wait, and the mount. The
  reward for finishing that land is that **you draw the 8:15 into
  existence and it arrives**, and `THE-LINE.md` §5 is settled on it. A
  railway ruled across the one quadrant drawn with a straightedge is the
  best payoff this project has and it should not be built in the last
  fifth of a session that has already built three lands.

**THE PAPER PLANE IS DEFERRED, IN WRITING, AND THIS IS THE WRITING.**
`WORLD-SYSTEMS` §4 gives every quadrant a mount and the wilds' is the
paper plane, *launched from height, refuses being steered, mostly.*
Session 10 took the wilds' northern half and did not take it; Session 11
took the wilds' eastern half, which contains **the two best launch
heights in the world** — Splitrock's east rim and the curled margin
above it — and did not take it either. It is now overdue by two
sessions and this ladder says so out loud rather than letting it slip a
third time silently.

**The reason it was deferred:** Session 11's scope was two lands, two
waits, two named inhabitants, a MOVED LANDFORM (a layout-wide audit
across elevation, the road web, the river, the map and two protected
framings), and one piece of missing content-system plumbing the design
had been assuming since Session 7. A mount is a traversal system with a
launch, a flight model, a refusal rule and a camera — the rowboat was
half of Session 6 — and the bar is explicit that **a session that cannot
meet it ships less scope, never a lower bar.**

**The brief it is handed with**, so the next session does not re-derive
it: it launches from the east lip of the tear or from the curled rim
(both are authored ground now and both hold about eight units of drop
into open air); it refuses being steered *mostly*, which means the
player has one input and it is not a rudder; it is found in the world
and left in the world; and the one thing it must NOT do is trivialise
the walk down and back round the canyon's mouth, which is the geography
lesson SPLITROCK teaches by making you walk it. **It goes to Session
14 or to Session 16 (Motion & life), whichever the owner prefers — but
it does not go to Session 13, which is already over-scoped.**

**FIVE LAND SESSIONS NOW RUN IN A ROW WITH NOTHING STRUCTURAL LEFT TO
INTERRUPT THEM.** Session 9 took the last foundations item on the board;
everything below it shifted by one, and from Session 10 on every land
session ships its places **and** its wait **and** its named inhabitant.
**Session 10 was the first of them and the shape held**: two lands, two
waits, two named inhabitants, one gate, one number.

**This ladder does not reach the owner's target yet, and it should say
so.** The target is now HOURS of play, not a short walk
(`design/WORLD-SYSTEMS.md` §0). Sessions 2–14 build a world that is
complete, beautiful and roughly four to six hours deep. Getting to
twelve-plus needs about five more, and they are the ones DIRECTION.md
sizes: **interiors** (they multiply the map without expanding the
sheet), **inhabitants and routine** (§5 — the cheapest texture per byte
in any world), **weather** (§7 — it multiplies every land again, the way
time does), and **one authoring pass for the story's evidence** across
all twelve lands. They are deliberately NOT numbered here: the story
pick at Session 7 decides what they contain, and putting numbers on them
before that is planning fiction.

**And RuneScape is now on the list** (owner, 2026-08-30 —
`design/INSPIRATION.md`, the largest entry on it). It changes the sizing
of exactly one un-numbered session and settles its model: **interiors**
are the roofless cutaway, three or four objects per room, and a camera
problem before an art problem (`WORLD-SYSTEMS` §11). It also puts one
question to the owner — a **seventh content tier, THE LOCAL RULE**
(`QUESTS.md` §8, proposed, not ratified).

**Session 7 has now itemised what they contain**, so the sizing above
is no longer an estimate: `design/THE-WAITS.md` (twelve waits, four of
which stand entirely on ground that is already built),
`design/THE-STRANGERS.md` (eight strangers, ~20 errands, ~28
encounters, 31 unmarked) and `design/THE-LINE.md` (the four acts, and
the ending) are the authoring queue. Numbers still wait on the owner.

**One thing the owner raised on 2026-08-30 is still open, and one is
now built:**

- **THE CAMERA'S BEARING** — **BUILT, Session 9** (`WORLD-SYSTEMS` §2).
  Taken before the five remaining lands, as the ordering rule required.
  **The one thing a later session should know about it:** the standing
  recommendation in §2 — a bounded yaw easing toward travel — was right
  about east and west and **wrong about south**, which is the case it
  was written for. A camera that trails the walker on the +Z side is
  still on the +Z side after a twenty-six-degree yaw; southward travel
  is travel AT THE LENS and no bounded rotation puts a lens behind
  itself. What answers it is a RETREAT AND A DROP, not a turn. §2
  records both the recommendation and the correction, on purpose.
- **THE FEEL GATE ON THE CAMERA** — **RUN, 2026-08-31, AND IT RETURNED
  NOT YET.** Session 9 shipped a bearing it could measure and could not
  judge and said so in its own log; three sessions later the owner
  played it and could not use it. The measured behaviour, driven round a
  normal circuit from the spawn: the frame swings **forty-three degrees**
  for one change of mind about which way to walk, at up to **twenty
  degrees a second**, while the camera dollies **eight units** in and
  out. `check-camera.mjs` is green on all of that, because it asserts
  the envelope's SIZE and never its RATE. **CLOSED BY SESSION 12**, and
  the real figures were worse than the ones above, because that circuit
  was sampled every third of a second and the averaging hid half of it:
  **51.2° of swing at 34.7°/s.** The automatic yaw is gone from both
  rigs, the envelope survives as the peek's, and `check-camera` asserts
  three rates now — walking may not turn the frame at all, a held peek
  is bounded at 45°/s and a reversed one at 80, and the rig may never
  give ground faster than the walker covers it. **The feel gate itself
  is owed again, and it is still the owner's.**

- **A STORY GATE** (`QUALITY-BAR` §2). **Run once, beside Session 8,
  and it returned NOT YET** (`design/critiques/critique-story-2.md`).
  The spine is sound and the ending is not a shrug — but Act I's second
  and third facts have a single optional teacher between them, and the
  likeliest single ending in the game is a train stopping at an empty
  platform, because the default witness sees exactly one of its twelve
  stops. Both fixes are cheap and neither re-opens `THE-LINE.md` §5;
  both are authoring notes for the sessions that build Acts I and IV.
  **What is still the owner's:** whether this critic becomes standing,
  and whether its NOT YET blocks those acts or annotates them.

**STANDING DEBTS, and they are written here because they have been
carried in PROMPT.md alone and PROMPT.md is overwritten every session**
(recorded Session 8). None of them is urgent; all of them are real, and
each has now survived at least two sessions being handed forward in a
file that does not persist.

- ~~**POI labels have no collision logic.**~~ **CLOSED, Session 9**, in
  the session that was already perturbing exactly that relationship —
  a turning camera moves every label relative to the thing it labels, so
  it was the cheapest it was ever going to be. THE SKYLINE: every
  standee records its top into a four-unit grid as it is built, so a
  name is written above the tallest thing under it rather than 3.4 units
  over the dirt; plus a screen-space pass in which labels never land on
  each other, on the prompt or on the chrome, the farther one goes UP
  and never sideways, and a name with nowhere legible to go is not
  written at all.
- **The rowboat's first-meeting composition at THE RIVER MOUTH** is a
  lot of sand. **Six** gates have now passed it and pointedly not
  praised it, and `route:the-river` is what resolves HOLT, so that boat
  is the front door of a wait.
- **THE HARROW DOWNS' stooked field** and **THE PENWOOD's east arc**
  (Session 10, `critique-art-6`): both passed, neither praised. The
  sheaves recede but the field around them is thin; the east arc is a
  road through a wood and not a place.
- **THE BLEACH FLATS' `WHERE THE ROAD STOPS`** (Session 11,
  `critique-art-7`): passed, not praised. Four hundred units of the
  world's longest road end at two posts and some cracked ground, and the
  frame is honest emptiness rather than composed emptiness. It is the
  one place in either of Session 11's lands that is there because the
  land needed a sixth place.
- **The prompt on a very wide subject is still on the subject.** READ
  THE PROCLAMATION is legible on Greyweather's barbican and clear of
  anything with detail in it, but it is a compromise and Session 9 wrote
  it down as one (`critique-camera-1.md`, round 3).
- **Brim Square is full.** Session 7 fitted Marget in. The next authored
  thing in that plaza displaces something Session 3 earned.
- **THE ENDING DOES NOT YET HAVE A CONSEQUENCE THAT LASTS** (Session
  14). The 8:15 stops twelve times and somebody gets on at every land
  whose wait you answered — and while its doors are open at a land's
  stop that land does not draw its own person, because nobody may be in
  two places at once (`Eight15.ts` exports `platform` for exactly that).
  **When the doors shut they are back where they stand.** Making the
  departure permanent is one clause per land — every routine is already
  gated on the hour and on knowledge — but it re-opens the authored
  routine of SEVEN lands that hold verdicts, changes what Val's porch
  light means, and `THE-LINE.md` §5 does not require it. It is the
  owner's call and it is the single largest thing left in the story.
- **THE 8:15 STOP's label prints across the building behind it**
  (Session 14, `critique-art-9`, noted-not-blocking). The skyline writes
  a name above the tallest thing under it; the shelter is 4.8 units, and
  a block twenty-five units further north is higher on screen. Same
  compromise class as READ THE PROCLAMATION, and it belongs to whoever
  next opens the skyline rather than to a land.
- **THE HOLLOW** (Session 13, `critique-art-8`): passed, not praised.
  The city's crease is the only landform in GREYLINE CITY, and its
  gradient is under the terrain's own hatching threshold — so the land
  had to hatch its own fold with decals and stand walls at the toe of
  it. It works and it is not beautiful, and the general problem (a fold
  too shallow to draw and too deep to ignore) belongs to whichever
  session next opens `elevation.ts`.
- **A COUNT IS PRINTED ON THE MAP** (`src/ui/map.ts:246`), and it has
  been since Session 1: *"N of 12 lands walked — N strides of ink."*
  Session 12 found the contradiction with the law's short form (*no
  count, no list, no percentage, anywhere, for anything*) and did not
  fix it, because the map holds a WOWED. Session 13 put it to the owner
  as asked, and **the owner did not pick an option — they challenged the
  law itself**, 2026-08-31:

  > *"I don't understand why that law exists. Progression, collection,
  > and advancements are part of what makes games fun."*

  **So the count stays, nothing was changed, and the open question is
  now bigger than the map.** It is not "should this line print a
  number", it is **"does INKLANDS have progression the player can see,
  and if so what shape is it"** — which is `QUESTS.md` §7 and
  `WORLD-SYSTEMS` §6 re-opened by the person the ladder answers to. The
  argument each way, so the next session does not have to reconstruct
  it:

  | for the law | against it |
  |---|---|
  | the law came from a sizing argument, not a taste one: **a collection caps at about two hours** — the player learns nothing doing the ninth one they did not know at the third — and the target is now HOURS of play (`WORLD-SYSTEMS` §0) | a count is not a collection. A number that says *you have walked eleven of these* is a **record of where you have been**, and this game already keeps one: the map, in three registers |
  | the world's own rule is *no UI where the world can say it*, and the map already says it — an inked line is the ninth land drawn differently, which is a progress bar you can read at a glance | **nothing in this game ever tells you you are doing well**, and eleven sessions of design have quietly assumed that is a virtue without ever testing it on a player. The one person who has played it says it is not |
  | Act III's whole beat is the map drawing the line as ONE line once you have walked it — a reward that is a change in a drawing rather than a number going up | that beat is exactly progression, and it works, which is an argument that MORE of it would work rather than less |

  **CLOSED, SESSION 14, AND THE LAW WAS AMENDED RATHER THAN ENFORCED.**
  The owner challenged the rule, and the owner is who this ladder
  answers to, so the rule changed — in `QUALITY-BAR.md` §3 and
  `QUESTS.md` §7.1, with their words written into both:

  > **A NUMBER MAY RECORD WHERE THE PLAYER HAS BEEN. A NUMBER MAY NEVER
  > GRADE WHAT THEY DID.**

  The argument for the amendment, and it is the left column above
  turning out to be about the wrong thing: the law came from a SIZING
  argument (*a collection caps at about two hours*), which is an
  argument against **collections** and not against **numbers**, and it
  was written as the second. This game already keeps a record of where
  you have been and makes Act III's whole beat out of it, so arguing
  that the inked line is fine and the sentence under it is a violation
  was the law protecting its wording rather than its reason. The map's
  count stays. A completion percentage, a checklist, a count of the
  twelve waits, a score, a grade, or any number that pops up to say you
  did a thing: refused exactly as before. **And the ending is out of
  scope and stays absolute** — `THE-LINE.md` §4.2 is settled, nothing
  counts the platforms, and no amendment to a UI law reaches it.

Rules of the ladder:

- A session may swap scope up the ladder, never skip the gate.
- Improvements to already-WOWED lands are welcome; regressions are not.
- Mounts arrive with their quadrant's land session (WORLD-SYSTEMS §4).
- Blots/caves stay parked until the story gives them a reason (§ audit).
- Every session ends: build green, pushed, SESSIONS.md updated,
  critique logged in design/critiques/.
- **Elevation is authored, not sprinkled.** A land session that wants
  ground it does not have edits `src/world/elevation.ts` in the sheet's
  own vocabulary (§1) and re-runs `node tools/check-terrain.mjs`. No
  other file may invent a height.
- **Both viewports, every sheet.** `tools/shoot-lib.mjs` does it for
  free; there is no excuse left for judging landscape only.
- **The camera's RESTING bearing is due north, and that decides LAYOUT.**
  A thing the player walks ALONG runs north–south; a thing they LOOK at
  is north of where they stand. Session 5 lost rounds to a boardwalk laid
  east–west and a regatta staged west of its viewpoint. Check the
  bearing before placing, not after.
  **AND SESSION 9 DID NOT CHANGE THIS, WHICH IS THE THING THE NEXT LAND
  SESSION WILL ASSUME IT DID.** The camera turns now, and it turns 26°
  on desktop and 12° in portrait, only while the walker is MOVING, and
  it is at exactly zero the moment they stop — by contract, asserted in
  `tools/check-camera.mjs`. Every composition in this game is still
  judged due north, a place staged east of its viewpoint is still
  sixty-four degrees out of frame, and the envelope cannot grow because
  past 35° a paper cutout stops reading as paper. **Nothing licenses a
  land to be laid out east–west.**
- **A protected land is unregressed when `node tools/diff-sheets.mjs`
  says so**, not when a session says so (Session 9). It builds a base
  git ref and the working tree and counts the pixels that moved, with
  every clock in the game pinned so the comparison means something.
- **THE LINE'S SIGHTLINE IS A PROTECTED CORRIDOR** (Session 7,
  `design/THE-LINE.md` §3.2). Act III is a two-hundred-unit look north
  up an empty straight road from the world's south rim, so **nothing
  tall may stand within about eight units of x = −45 between z = 120 and
  z = 278.** Maple Court's houses, trees, cars and hedges go beside main
  street, never on the king's road's own axis. Session 5 lost two rounds
  to a boardwalk laid east–west; this is the same mistake available one
  more time, in the one composition that cannot afford it.
- **Author landforms with PLANAR FACES.** The terrain draws a cliff in
  strokes down its fall line, and a doubly-curved landform has no
  constant fall line to draw down — it comes out as a thumb print. Paper
  tears in straight runs and turns at corners; use that. *(A dish IS
  allowed where nothing on it comes near the hatching threshold — the
  tarn's bowl in Session 10 falls three and a half units over
  twenty-six, which is a fifth of the limit, and there is no fall line
  for the shader to draw down. Say so in the code when you do it.)*
- **AND EVERY TERM IN `elevation.ts` IS BOUNDED ON ALL FOUR SIDES.**
  Session 10's harrow shipped with `smoothstep(96, 130, x)` and no east
  bound, which is 1 at x = 370: a corrugation authored for one land ran
  clean across two others and out onto the world's curled rim, and eight
  per cent of a protected framing moved in a land the session never
  opened. `diff-sheets.mjs` found it. Nothing else would have.
- **AUTHOR THE GROUND FIRST AND THE PROPS SECOND** (Session 10). The
  harrow took twenty minutes and it is why both of that session's lands
  compose: it gives the camera something to recede along before a single
  drawing is placed.
- **AND A LANDFORM IN THE WRONG PLACE MAY BE MOVED** (Session 11). The
  tear was authored at x = 338 in Session 4 and the land named for it was
  built round the fact that it was somewhere else. Moving it is a
  layout-wide audit — elevation, the road web, the river's source, the
  reachability proof, two protected framings and the map — and it took a
  morning and it was the right call. **What may not move is a NUMBER
  somebody else's content stands on**: `check-terrain` prints the tear's
  floor at −10.8 and `THE-STRANGERS` S5 is an errand about that figure,
  so the amplitude was re-tuned until it printed −10.8 again in its new
  position.
- **NOTHING STANDS ON A SCARP, AND THAT INCLUDES THE THING THE SCARP IS
  MADE OF** (Session 11). A canyon's walls are drawn by the terrain,
  which hatches down the fall line and does it better than a cutout can.
  Round 1 of that session's world sheet stood wall panels up both faces
  at half their height and built a tunnel with the ends bricked up.
- **AND `stroke()` ROUNDS EVERY CORNER YOU GIVE IT.** It draws
  quadratics through the midpoints of its points, which is right for a
  hedge, a hull and a tree, and turns any polygon of straight runs into
  a lozenge. Session 11's first texture sheet was a canyon full of domes
  and a cistern like an egg. Both new texture files carry a `hardPoly()`
  that draws an edge as an edge; **paper does not tear along a curve is
  a rule about the DRAWING as much as about the height field.**
