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
| 11 | **The dry lands** | SPLITROCK CANYON (a tear in the page) + THE BLEACH FLATS: corridor drama, the oasis as reward. |
| 12 | **The now** | MAPLE COURT + GREYLINE CITY + THE CUBICLE MILE: street rhythm, lit windows at dusk, the junction — and the 8:15 drawn into existence. |
| 13 | **Motion & life** | Systems pass: wind everywhere, sails and windmills turning, NPC routines, road encounters. (The score moved out of this session to 8 — see the ordering rule.) |
| 14 | **The juror** | Awwwards pass on the whole build: title, first minute, map, UI feel, mobile portrait, performance audit, then the full-gauntlet critique. |

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
  lot of sand. **Four** gates have now passed it and pointedly not
  praised it.
- **THE HARROW DOWNS' stooked field** and **THE PENWOOD's east arc**
  (Session 10, `critique-art-6`): both passed, neither praised. The
  sheaves recede but the field around them is thin; the east arc is a
  road through a wood and not a place.
- **The prompt on a very wide subject is still on the subject.** READ
  THE PROCLAMATION is legible on Greyweather's barbican and clear of
  anything with detail in it, but it is a compromise and Session 9 wrote
  it down as one (`critique-camera-1.md`, round 3).
- **Brim Square is full.** Session 7 fitted Marget in. The next authored
  thing in that plaza displaces something Session 3 earned.

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
